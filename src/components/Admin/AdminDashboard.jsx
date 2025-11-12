import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { 
  Users, CheckCircle, XCircle, Clock, Download,
  LogOut, UserPlus, Mail, MessageCircle, Trash2, Edit3
} from 'lucide-react'
import axios from 'axios'

const AdminDashboard = () => {
  const [rsvps, setRsvps] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      navigate('/admin/login')
    } else {
      loadRSVPs()
    }
  }, [navigate])

  const loadRSVPs = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/rsvps')
      setRsvps(response.data.rsvps || [])
      console.log('✅ Dados carregados do backend')
    } catch (error) {
      console.log('⚠️ Backend não disponível, usando dados locais')
      const mockData = [
        {
          id: 1,
          name: 'João Silva',
          email: 'joao@email.com',
          attendance: 'confirmed',
          guests: 2,
          message: 'Estarei com minha esposa e filho',
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          name: 'Maria Santos',
          email: 'maria@email.com',
          attendance: 'confirmed',
          guests: 1,
          message: '',
          timestamp: '2024-01-15T11:15:00Z'
        },
        {
          id: 3,
          name: 'Pedro Costa',
          email: 'pedro@email.com',
          attendance: 'declined',
          guests: 0,
          message: 'Não poderei comparecer devido a compromissos',
          timestamp: '2024-01-14T09:45:00Z'
        }
      ]
      
      const localRSVPs = localStorage.getItem('rsvps')
      if (localRSVPs) {
        const parsedRSVPs = JSON.parse(localRSVPs)
        setRsvps(parsedRSVPs)
      } else {
        setRsvps(mockData)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const handleDeleteRSVP = async (rsvpId, rsvpName) => {
    if (!window.confirm(`Tem certeza que deseja excluir a confirmação de ${rsvpName}?`)) {
      return
    }

    setDeletingId(rsvpId)

    try {
      const response = await axios.delete(`http://localhost:3001/api/admin/rsvps/${rsvpId}`)
      
      if (response.data.success) {
        setRsvps(prev => prev.filter(rsvp => rsvp.id !== rsvpId))
        console.log('✅ RSVP excluído:', response.data.deletedRSVP.name)
        alert(`Confirmação de ${response.data.deletedRSVP.name} excluída com sucesso!`)
      }
    } catch (error) {
      console.error('Erro ao excluir RSVP:', error)
      alert('Erro ao excluir confirmação: ' + (error.response?.data?.error || error.message))
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditRSVP = (rsvp) => {
    alert(`Editar ${rsvp.name} - Em desenvolvimento`)
  }

  const exportToCSV = () => {
    const headers = ['Nome', 'E-mail', 'Status', 'Acompanhantes', 'Mensagem', 'Data']
    const csvData = rsvps.map(rsvp => [
      rsvp.name,
      rsvp.email,
      rsvp.attendance === 'confirmed' ? 'Confirmado' : 'Não Confirmado',
      rsvp.guests,
      rsvp.message,
      new Date(rsvp.timestamp).toLocaleDateString('pt-BR')
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'confirmacoes-evento.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const confirmedCount = rsvps.filter(r => r.attendance === 'confirmed').length
  const declinedCount = rsvps.filter(r => r.attendance === 'declined').length
  const totalGuests = rsvps
    .filter(r => r.attendance === 'confirmed')
    .reduce((sum, r) => sum + r.guests, 0)
  const totalPeople = confirmedCount + totalGuests

  const attendanceData = [
    { name: 'Confirmados', value: confirmedCount },
    { name: 'Não Confirmados', value: declinedCount }
  ]

  const COLORS = ['#10b981', '#ef4444']

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-primary-500" />
                <div>
                <h1 className="text-xl font-bold text-gray-900">Painel do Aniversário</h1>
                <p className="text-sm text-gray-600">Ana 18 anos - 05/01/2025</p>
                </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmados</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Não Confirmados</p>
                <p className="text-2xl font-bold text-gray-900">{declinedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Pessoas</p>
                <p className="text-2xl font-bold text-gray-900">{totalPeople}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Acompanhantes</p>
                <p className="text-2xl font-bold text-gray-900">{totalGuests}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Distribuição de Confirmações
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmações ao Longo do Tempo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="confirmados" fill="#10b981" name="Confirmados" />
                <Bar dataKey="recusados" fill="#ef4444" name="Recusados" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Lista de Confirmações ({rsvps.length})
              </h3>
              <button
                onClick={exportToCSV}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acompanhantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {rsvp.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{rsvp.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rsvp.attendance === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {rsvp.attendance === 'confirmed' ? 'Confirmado' : 'Não Confirmado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rsvp.guests}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      {rsvp.message ? (
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 text-gray-400 mr-1" />
                          <span title={rsvp.message} className="truncate">
                            {rsvp.message.length > 50 
                              ? `${rsvp.message.substring(0, 50)}...` 
                              : rsvp.message
                            }
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(rsvp.timestamp).toLocaleDateString('pt-BR')}
                      <br/>
                      <span className="text-gray-500 text-xs">
                        {new Date(rsvp.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditRSVP(rsvp)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteRSVP(rsvp.id, rsvp.name)}
                          disabled={deletingId === rsvp.id}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400 transition-colors"
                          title="Excluir"
                        >
                          {deletingId === rsvp.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {rsvps.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Nenhuma confirmação encontrada</p>
                <p className="text-gray-400 text-sm mt-2">
                  As confirmações aparecerão aqui quando os convidados preencherem o formulário.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard