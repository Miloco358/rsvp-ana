import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Configuração do ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS mais permissivo
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Adicione esta linha também:
app.options('*', cors()); // Para preflight requests

app.use(express.json());

// Simulação de banco de dados em memória
let rsvps = [];
let events = [
  {
    id: 'aniversario-ana-18',
    name: 'Aniversário de 18 anos da Ana',
    date: '2025-01-05T19:00:00',
    location: 'Salão de Festas Espaço Elegante',
    description: 'Uma celebração especial pelos 18 anos da Ana! Venha fazer parte deste momento inesquecível cheio de alegria, música e boas energias.'
  }
];

// ==================== ROTAS PÚBLICAS ====================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Backend RSVP funcionando perfeitamente!',
    version: '1.0.0'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend está funcionando! 🎉',
    timestamp: new Date().toISOString(),
    rsvpsCount: rsvps.length,
    eventsCount: events.length
  });
});

// Obter informações do evento
app.get('/api/events/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Estatísticas do evento
    const eventRSVPs = rsvps.filter(r => r.eventId === eventId);
    const confirmedCount = eventRSVPs.filter(r => r.attendance === 'confirmed').length;
    const declinedCount = eventRSVPs.filter(r => r.attendance === 'declined').length;
    const totalGuests = eventRSVPs
      .filter(r => r.attendance === 'confirmed')
      .reduce((sum, r) => sum + r.guests, 0);

    res.json({
      ...event,
      stats: {
        totalResponses: eventRSVPs.length,
        confirmed: confirmedCount,
        declined: declinedCount,
        totalGuests: totalGuests,
        totalPeople: confirmedCount + totalGuests
      }
    });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar todos os eventos
app.get('/api/events', (req, res) => {
  try {
    res.json(events);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Enviar confirmação de presença (RSVP)
app.post('/api/rsvp', (req, res) => {
  console.log('📨 Recebendo RSVP:', req.body);
  
  try {
    const { name, email, attendance, guests, message, eventId } = req.body;

    // Validações
    if (!name || !email || !attendance) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios faltando: nome, email, attendance' 
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Verificar se o evento existe
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    // Verificar se já existe RSVP para este email no evento
    const existingRSVP = rsvps.find(r => 
      r.email.toLowerCase() === email.toLowerCase() && r.eventId === eventId
    );

    if (existingRSVP) {
      return res.status(409).json({ 
        error: 'Já existe uma confirmação para este email neste evento',
        existingRSVP: {
          id: existingRSVP.id,
          name: existingRSVP.name,
          attendance: existingRSVP.attendance
        }
      });
    }

    // Criar novo RSVP
    const newRSVP = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      attendance,
      guests: attendance === 'confirmed' ? Math.max(0, parseInt(guests) || 0) : 0,
      message: (message || '').trim(),
      eventId: eventId || 'evento-exemplo',
      timestamp: new Date().toISOString(),
      ip: req.ip
    };

    rsvps.push(newRSVP);
    
    console.log('✅ Nova confirmação recebida:', {
      id: newRSVP.id,
      name: newRSVP.name,
      email: newRSVP.email,
      attendance: newRSVP.attendance,
      guests: newRSVP.guests,
      event: event.name
    });

    res.status(201).json({ 
      success: true, 
      message: 'Confirmação registrada com sucesso!',
      rsvp: {
        id: newRSVP.id,
        name: newRSVP.name,
        attendance: newRSVP.attendance,
        guests: newRSVP.guests
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar RSVP:', error);
    res.status(500).json({ error: 'Erro interno ao processar confirmação: ' + error.message });
  }
});

// Listar todas as confirmações (para debug)
app.get('/api/rsvps', (req, res) => {
  try {
    res.json({
      rsvps: rsvps,
      total: rsvps.length,
      confirmed: rsvps.filter(r => r.attendance === 'confirmed').length,
      declined: rsvps.filter(r => r.attendance === 'declined').length
    });
  } catch (error) {
    console.error('Erro ao listar RSVPs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ==================== ROTAS ADMIN ====================

// Login do administrador (simulado)
app.post('/api/admin/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Tentativa de login:', { email, password });

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Credenciais fixas para demo
    if (email === 'admin@evento.com' && password === 'senha123') {
      console.log('✅ Login bem-sucedido para:', email);
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        user: {
          id: 'admin-1',
          name: 'Administrador',
          email: 'admin@evento.com'
        },
        token: 'admin-token-demo'
      });
    } else {
      console.log('❌ Login falhou para:', email);
      res.status(401).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
    }

  } catch (error) {
    console.error('❌ Erro no login admin:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno no servidor' 
    });
  }
});

// Obter estatísticas (protegido)
app.get('/api/admin/stats', (req, res) => {
  try {
    const totalRSVPs = rsvps.length;
    const confirmedRSVPs = rsvps.filter(r => r.attendance === 'confirmed').length;
    const declinedRSVPs = rsvps.filter(r => r.attendance === 'declined').length;
    const totalGuests = rsvps
      .filter(r => r.attendance === 'confirmed')
      .reduce((sum, r) => sum + r.guests, 0);

    res.json({
      overall: {
        totalRSVPs,
        confirmed: confirmedRSVPs,
        declined: declinedRSVPs,
        totalGuests,
        totalPeople: confirmedRSVPs + totalGuests,
        confirmationRate: totalRSVPs > 0 ? (confirmedRSVPs / totalRSVPs * 100).toFixed(1) : 0
      },
      byEvent: events.map(event => {
        const eventRSVPs = rsvps.filter(r => r.eventId === event.id);
        const confirmed = eventRSVPs.filter(r => r.attendance === 'confirmed').length;
        const guests = eventRSVPs
          .filter(r => r.attendance === 'confirmed')
          .reduce((sum, r) => sum + r.guests, 0);

        return {
          eventId: event.id,
          eventName: event.name,
          total: eventRSVPs.length,
          confirmed: confirmed,
          declined: eventRSVPs.length - confirmed,
          totalGuests: guests,
          totalPeople: confirmed + guests
        };
      })
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno ao buscar estatísticas' });
  }
});

// Reset para dados de exemplo
app.post('/api/admin/reset-demo', (req, res) => {
  try {
    rsvps = [
      {
        id: uuidv4(),
        name: 'João Silva',
        email: 'joao@email.com',
        attendance: 'confirmed',
        guests: 2,
        message: 'Estarei com minha esposa e filho',
        eventId: 'evento-exemplo',
        timestamp: new Date('2024-01-15T10:30:00Z').toISOString()
      },
      {
        id: uuidv4(),
        name: 'Maria Santos',
        email: 'maria@email.com',
        attendance: 'confirmed',
        guests: 1,
        message: '',
        eventId: 'evento-exemplo',
        timestamp: new Date('2024-01-15T11:15:00Z').toISOString()
      },
      {
        id: uuidv4(),
        name: 'Pedro Costa',
        email: 'pedro@email.com',
        attendance: 'declined',
        guests: 0,
        message: 'Não poderei comparecer devido a compromissos',
        eventId: 'evento-exemplo',
        timestamp: new Date('2024-01-14T09:45:00Z').toISOString()
      }
    ];

    console.log('🔄 Dados de demonstração restaurados');

    res.json({
      success: true,
      message: 'Dados de demonstração restaurados',
      rsvpsCount: rsvps.length
    });

  } catch (error) {
    console.error('Erro ao restaurar dados demo:', error);
    res.status(500).json({ error: 'Erro interno ao restaurar dados' });
  }
});

// ==================== MANIPULAÇÃO DE ERROS ====================

// Rota não encontrada
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Manipulador de erros global
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// ==================== ROTAS DE LIMPEZA ====================

// Limpar todos os dados
app.delete('/api/admin/clear-data', (req, res) => {
  try {
    const previousCount = rsvps.length;
    rsvps = [];
    
    console.log('🗑️ Todos os dados foram limpos. Removidos: ' + previousCount + ' RSVPs');
    
    res.json({
      success: true,
      message: 'Todos os dados foram limpos com sucesso!',
      cleared: previousCount,
      remaining: 0
    });

  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    res.status(500).json({ error: 'Erro interno ao limpar dados' });
  }
});

// Reset para dados de demonstração
app.post('/api/admin/reset-demo', (req, res) => {
  try {
    const previousCount = rsvps.length;
    
    // Dados de exemplo
    rsvps = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@email.com',
        attendance: 'confirmed',
        guests: 2,
        message: 'Estarei com minha esposa e filho',
        eventId: 'evento-exemplo',
        timestamp: new Date('2024-01-15T10:30:00Z').toISOString()
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@email.com',
        attendance: 'confirmed',
        guests: 1,
        message: '',
        eventId: 'evento-exemplo',
        timestamp: new Date('2024-01-15T11:15:00Z').toISOString()
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro@email.com',
        attendance: 'declined',
        guests: 0,
        message: 'Não poderei comparecer devido a compromissos',
        eventId: 'evento-exemplo',
        timestamp: new Date('2024-01-14T09:45:00Z').toISOString()
      }
    ];

    console.log('🔄 Dados resetados. Antigos: ' + previousCount + ', Novos: ' + rsvps.length);
    
    res.json({
      success: true,
      message: 'Dados de demonstração restaurados',
      cleared: previousCount,
      added: rsvps.length
    });

  } catch (error) {
    console.error('Erro ao resetar dados:', error);
    res.status(500).json({ error: 'Erro interno ao resetar dados' });
  }
});

// Deletar um RSVP específico
app.delete('/api/admin/rsvps/:rsvpId', (req, res) => {
  try {
    const { rsvpId } = req.params;
    const rsvpIndex = rsvps.findIndex(r => r.id === rsvpId);

    if (rsvpIndex === -1) {
      return res.status(404).json({ 
        success: false,
        error: 'Confirmação não encontrada' 
      });
    }

    const deletedRSVP = rsvps.splice(rsvpIndex, 1)[0];
    
    console.log('🗑️ RSVP deletado:', deletedRSVP.name);
    
    res.json({
      success: true,
      message: 'Confirmação deletada com sucesso',
      deletedRSVP: {
        id: deletedRSVP.id,
        name: deletedRSVP.name,
        email: deletedRSVP.email
      }
    });

  } catch (error) {
    console.error('Erro ao deletar RSVP:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno ao deletar confirmação' 
    });
  }
});

// ==================== ROTAS DE EXCLUSÃO ====================

// Deletar um RSVP específico
app.delete('/api/admin/rsvps/:rsvpId', (req, res) => {
  try {
    const { rsvpId } = req.params;
    const rsvpIndex = rsvps.findIndex(r => r.id === rsvpId);

    if (rsvpIndex === -1) {
      return res.status(404).json({ 
        success: false,
        error: 'Confirmação não encontrada' 
      });
    }

    const deletedRSVP = rsvps.splice(rsvpIndex, 1)[0];
    
    console.log('🗑️ RSVP deletado:', deletedRSVP.name);
    
    res.json({
      success: true,
      message: 'Confirmação deletada com sucesso',
      deletedRSVP: {
        id: deletedRSVP.id,
        name: deletedRSVP.name,
        email: deletedRSVP.email
      }
    });

  } catch (error) {
    console.error('Erro ao deletar RSVP:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno ao deletar confirmação' 
    });
  }
});

// Limpar todos os dados
app.delete('/api/admin/clear-data', (req, res) => {
  try {
    const previousCount = rsvps.length;
    rsvps = [];
    
    console.log('🗑️ Todos os dados foram limpos. Removidos: ' + previousCount + ' RSVPs');
    
    res.json({
      success: true,
      message: 'Todos os dados foram limpos com sucesso!',
      cleared: previousCount,
      remaining: 0
    });

  } catch (error) {
    console.error('Erro ao limpar dados:', error);
    res.status(500).json({ error: 'Erro interno ao limpar dados' });
  }
});

// ==================== INICIALIZAÇÃO DO SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`
🎉 SERVIDOR RSVP INICIADO COM SUCESSO!

📍 Porta: ${PORT}
🌐 URL: http://localhost:${PORT}
📊 Eventos carregados: ${events.length}
👤 Admin: admin@evento.com / senha123

✅ Endpoints disponíveis:
   GET  /api/health
   GET  /api/test  
   GET  /api/events
   GET  /api/events/:id
   POST /api/rsvp
   GET  /api/rsvps
   POST /api/admin/login
   GET  /api/admin/stats
   POST /api/admin/reset-demo

🚀 Frontend: http://localhost:5173
🔧 Backend: http://localhost:${PORT}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});