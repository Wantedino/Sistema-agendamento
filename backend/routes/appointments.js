const router = require('express').Router()
const auth = require('../middleware/auth')
const Appointment = require('../models/Appointment')
const mongoose = require('mongoose')

// GET /api/appointments?date=YYYY-MM-DD
router.get('/', auth, async (req, res) => {
  try {
    const filter = { userId: req.userId }
    if (req.query.date) filter.date = req.query.date
    const appointments = await Appointment.find(filter)
      .populate('serviceId', 'name duration price')
      .sort({ time: 1 })
    res.json(appointments)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/appointments (público — sem auth)
router.post('/', async (req, res) => {
  try {
    const { userId, serviceId, clientName, clientPhone, date, time } = req.body

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId inválido' })
    }

    // Verifica conflito de horário
    const conflict = await Appointment.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date,
      time,
      status: { $ne: 'cancelled' },
    })
    if (conflict) return res.status(409).json({ message: 'Horário já ocupado' })

    const appointment = await Appointment.create({
      userId: new mongoose.Types.ObjectId(userId),
      serviceId,
      clientName,
      clientPhone,
      date,
      time,
    })
    res.status(201).json(appointment)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/appointments/:id/status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status: req.body.status },
      { new: true }
    )
    if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado' })
    res.json(appointment)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

module.exports = router
