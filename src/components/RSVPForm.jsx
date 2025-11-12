import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, XCircle, User, Mail, Users, MessageSquare } from 'lucide-react'
import axios from 'axios'

const RSVPForm = () => {
  const { eventId } = useParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    attendance: '',
    guests: 0,
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Por favor, informe seu nome')
      return
    }
    
    if (!formData.email.trim()) {
      setError('Por favor, informe seu e-mail')
      return
    }
    
    if (!formData.attendance) {
      setError('Por favor, selecione se irá comparecer')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:3001/api/rsvp', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        attendance: formData.attendance,
        guests: parseInt(formData.guests) || 0,
        message: formData.message.trim(),
        eventId: eventId || 'aniversario-ana-18'
      })

      if (response.data.success) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Erro detalhado:', error)
      
      if (error.response) {
        setError(error.response.data.error || `Erro: ${error.response.status}`)
      } else if (error.request) {
        setError('Servidor não respondeu. Verifique se o backend está rodando.')
      } else {
        setError('Erro: ' + error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Confirmação Enviada!
          </h2>
          <p className="text-gray-600 mb-6">
            Obrigado <strong>{formData.name}</strong> por confirmar sua presença no aniversário de 18 anos da Ana! 
            {formData.attendance === 'confirmed' 
              ? ' Estamos ansiosos para celebrar com você este momento especial! 🎉'
              : ' Sentiremos sua falta neste dia tão importante!'
            }
          </p>
          <a
            href="/"
            className="btn-primary inline-block"
          >
            Voltar para a Página Inicial
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirmar Presença
          </h1>
          <p className="text-gray-600">
            Aniversário de 18 anos da Ana
          </p>
          <p className="text-sm text-pink-600 mt-1">
            05 de Janeiro de 2025 • 19:00
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 mr-2" />
              Nome Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Seu nome completo"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 mr-2" />
              E-mail *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="seu@email.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              Você comparecerá à festa? *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, attendance: 'confirmed' }))}
                disabled={isSubmitting}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.attendance === 'confirmed'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-600 hover:border-green-500 disabled:opacity-50'
                }`}
              >
                <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                <span>Confirmado</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, attendance: 'declined' }))}
                disabled={isSubmitting}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  formData.attendance === 'declined'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 text-gray-600 hover:border-red-500 disabled:opacity-50'
                }`}
              >
                <XCircle className="h-6 w-6 mx-auto mb-2" />
                <span>Não Poderei</span>
              </button>
            </div>
          </div>

          {formData.attendance === 'confirmed' && (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Users className="h-4 w-4 mr-2" />
                Número de Acompanhantes
              </label>
              <select
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                className="input-field"
                disabled={isSubmitting}
              >
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>
                    {num} acompanhante{num !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              {formData.guests > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Total de pessoas: {1 + parseInt(formData.guests)}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensagem para a Ana (Opcional)
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="input-field"
              placeholder="Deixe uma mensagem especial para a aniversariante..."
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            disabled={!formData.attendance || isSubmitting}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              'Confirmar Presença na Festa'
            )}
          </button>
        </form>

        {/* Nota importante */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 text-center">
            💖 Sua confirmação ajuda a Ana a planejar uma festa ainda mais especial!
          </p>
        </div>
      </div>
    </div>
  )
}

export default RSVPForm