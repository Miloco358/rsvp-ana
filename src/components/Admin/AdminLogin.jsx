import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: 'admin@evento.com',
    password: 'senha123'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking')
  const navigate = useNavigate()

  React.useEffect(() => {
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/health')
      if (response.data.status === 'OK') {
        setBackendStatus('online')
      }
    } catch (error) {
      setBackendStatus('offline')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('🔐 Tentando login no backend...')
      
      const response = await axios.post('http://localhost:3001/api/admin/login', {
        email: credentials.email,
        password: credentials.password
      }, {
        timeout: 5000
      })

      console.log('✅ Resposta do backend:', response.data)

      if (response.data.success) {
        localStorage.setItem('adminAuthenticated', 'true')
        localStorage.setItem('adminUser', JSON.stringify(response.data.user))
        localStorage.setItem('adminToken', response.data.token)
        
        console.log('🚀 Redirecionando para dashboard...')
        navigate('/admin/dashboard')
      } else {
        alert('Login falhou: ' + (response.data.error || 'Credenciais inválidas'))
      }

    } catch (error) {
      console.error('❌ Erro completo:', error)
      
      if (error.code === 'ECONNABORTED') {
        alert('Timeout: Backend não respondeu a tempo')
      } else if (error.response) {
        console.log('📊 Status:', error.response.status)
        console.log('📦 Data:', error.response.data)
        alert(`Erro ${error.response.status}: ${error.response.data.error || 'Credenciais inválidas'}`)
      } else if (error.request) {
        console.log('🚫 Não houve resposta do servidor')
        alert('Backend não respondeu. Verifique se está rodando na porta 3001.')
      } else {
        console.log('⚙️ Erro de configuração:', error.message)
        alert('Erro de configuração: ' + error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    localStorage.setItem('adminAuthenticated', 'true')
    localStorage.setItem('adminUser', JSON.stringify({
      name: 'Administrador Demo',
      email: 'admin@evento.com'
    }))
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-primary-500 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Área da aniversariante</h1>
            <p className="text-gray-600 mt-2">Ana, faça login para acompanhar sua confirmações</p>
          </div>

          <div className={`mb-6 p-4 rounded-lg ${
            backendStatus === 'online' ? 'bg-green-50 border border-green-200' : 
            backendStatus === 'offline' ? 'bg-red-50 border border-red-200' : 
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center justify-center">
              {backendStatus === 'online' ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : backendStatus === 'offline' ? (
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
              ) : (
                <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full mr-2"></div>
              )}
              <span className={`text-sm font-medium ${
                backendStatus === 'online' ? 'text-green-700' : 
                backendStatus === 'offline' ? 'text-red-700' : 
                'text-yellow-700'
              }`}>
                Backend: {backendStatus === 'online' ? 'Online ✅' : 
                         backendStatus === 'offline' ? 'Offline ❌' : 
                         'Verificando...'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 mr-2" />
                E-mail
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                required
                className="input-field"
                placeholder="admin@evento.com"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Lock className="h-4 w-4 mr-2" />
                Senha
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
                className="input-field"
                placeholder="senha123"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || backendStatus === 'offline'}
              className="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Conectando...
                </>
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>

          <button
            onClick={handleDemoLogin}
            className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Entrar com Modo Demo
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin