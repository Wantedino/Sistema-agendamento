const router = require('express').Router()
const auth = require('../middleware/auth')
const Service = require('../models/Service')

// GET /api/services
router.get('/', auth, async (req, res) => {
  const services = await Service.find({ userId: req.userId, active: true })
  res.json(services)
})

// POST /api/services
router.post('/', auth, async (req, res) => {
  try {
    const { name, duration, price } = req.body
    const service = await Service.create({ userId: req.userId, name, duration, price })
    res.status(201).json(service)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// PUT /api/services/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    )
    if (!service) return res.status(404).json({ message: 'Serviço não encontrado' })
    res.json(service)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// DELETE /api/services/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Service.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { active: false }
    )
    res.json({ message: 'Serviço removido' })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

module.exports = router
