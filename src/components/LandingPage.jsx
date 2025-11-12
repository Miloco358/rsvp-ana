import React, { useState, useEffect } from 'react'
import { Calendar, Users, Clock, ArrowRight, Gift, Music, Camera } from 'lucide-react'

const LandingPage = () => {
  const [timeLeft, setTimeLeft] = useState({})

  // Data do aniversário - 05 de janeiro de 2025
  const eventDate = new Date('2025-01-05T19:00:00')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +eventDate - +new Date()
      let timeLeft = {}

      if (difference > 0) {
        timeLeft = {
          dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
          horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutos: Math.floor((difference / 1000 / 60) % 60),
          segundos: Math.floor((difference / 1000) % 60)
        }
      }

      return timeLeft
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const timerComponents = Object.keys(timeLeft).map(interval => (
    <div key={interval} className="text-center">
      <div className="bg-white rounded-lg p-4 shadow-lg border border-pink-200">
        <div className="text-2xl font-bold text-pink-600">
          {timeLeft[interval]}
        </div>
        <div className="text-sm text-gray-600 capitalize">{interval}</div>
      </div>
    </div>
  ))

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Gift className="h-8 w-8 text-pink-500" />
              <span className="text-xl font-bold text-gray-800">Aniversário Ana 18</span>
            </div>
            <a
              href="/admin/login"
              className="btn-secondary flex items-center space-x-2"
            >
              <span>Área da Aniversariante</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🎉 Ana 18 Anos 🎉
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Uma celebração especial de vida, amizade e novos começos!
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Contagem Regressiva para a Festa!
            </h2>
            <div className="flex justify-center space-x-4 mb-8">
              {timerComponents.length ? timerComponents : <span className="text-lg">A festa começou! 🎊</span>}
            </div>
          </div>

          {/* Event Details */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <Calendar className="h-12 w-12 text-pink-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Data</h3>
              <p className="text-gray-600">05 de Janeiro, 2025</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-pink-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Horário</h3>
              <p className="text-gray-600">19:00 - 02:00</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-pink-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Local</h3>
              <p className="text-gray-600">Salão Espaço Elegante</p>
            </div>
          </div>
          <a
            href="/rsvp/aniversario-ana-18"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-full inline-flex items-center space-x-2 shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <span>Confirmar Minha Presença</span>
            <ArrowRight className="h-5 w-5" />
          </a>

          {/* Important Note */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200 max-w-2xl mx-auto">
            <p className="text-sm text-yellow-800">
              💫 <strong>Importante:</strong> Sua confirmação nos ajuda a preparar tudo perfeito para este dia especial!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage