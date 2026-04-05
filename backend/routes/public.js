const router = require('express').Router()
const Service = require('../models/Service')
const Appointment = require('../models/Appointment')
const mongoose = require('mongoose')

// GET /api/public/:userId/services
router.get('/:userId/services', async (req, res) => {
  try {
    const { userId } = req.params
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId inválido' })
    }
    const services = await Service.find({
      userId: new mongoose.Types.ObjectId(userId),
      active: true,
    })
    res.json(services)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/public/:userId/slots?serviceId=...&date=YYYY-MM-DD
router.get('/:userId/slots', async (req, res) => {
  try {
    const { userId } = req.params
    const { serviceId, date } = req.query

    if (!serviceId || !date) {
      return res.status(400).json({ message: 'serviceId e date são obrigatórios' })
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId inválido' })
    }

    const service = await Service.findById(serviceId)
    if (!service) return res.status(404).json({ message: 'Serviço não encontrado' })

    // Gera slots das 08:00 às 18:00 com base na duração do serviço
    const slots = []
    let current = 8 * 60
    while (current + service.duration <= 18 * 60) {
      const h = String(Math.floor(current / 60)).padStart(2, '0')
      const m = String(current % 60).padStart(2, '0')
      slots.push(`${h}:${m}`)
      current += service.duration
    }

    // Busca horários já ocupados — date é string YYYY-MM-DD, comparação direta
    const booked = await Appointment.find({
      userId: new mongoose.Types.ObjectId(userId),
      date,
      status: { $ne: 'cancelled' },
    }).select('time')

    const bookedTimes = new Set(booked.map(a => a.time))

    res.json(slots.map(time => ({ time, available: !bookedTimes.has(time) })))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
