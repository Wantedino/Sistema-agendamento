const router = require('express').Router()
const auth = require('../middleware/auth')
const Appointment = require('../models/Appointment')

// GET /api/reports?month=4&year=2026
router.get('/', auth, async (req, res) => {
  try {
    const month = parseInt(req.query.month)
    const year = parseInt(req.query.year)

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ message: 'month (1-12) e year são obrigatórios' })
    }

    // Monta prefixo YYYY-MM para comparar com o campo date (string)
    const prefix = `${year}-${String(month).padStart(2, '0')}`

    const appointments = await Appointment.find({
      userId: req.userId,
      date: { $regex: `^${prefix}` },
    }).populate('serviceId', 'name price')

    // Totais por status
    const byStatus = { confirmed: 0, pending: 0, cancelled: 0 }
    appointments.forEach(a => {
      if (byStatus[a.status] !== undefined) byStatus[a.status]++
    })

    // Receita: soma dos serviços confirmados
    const confirmed = appointments.filter(a => a.status === 'confirmed')
    const revenue = confirmed.reduce((sum, a) => sum + (a.serviceId?.price || 0), 0)
    const avgTicket = confirmed.length > 0 ? revenue / confirmed.length : 0

    // Receita agrupada por dia
    const revenueByDay = {}
    confirmed.forEach(a => {
      const day = parseInt(a.date.split('-')[2], 10)
      revenueByDay[day] = (revenueByDay[day] || 0) + (a.serviceId?.price || 0)
    })
    const revenueByDayArray = Object.entries(revenueByDay)
      .map(([day, value]) => ({ day: parseInt(day), value }))
      .sort((a, b) => a.day - b.day)

    // Ranking de serviços mais agendados
    const serviceCount = {}
    appointments.forEach(a => {
      if (!a.serviceId) return
      const id = a.serviceId._id.toString()
      if (!serviceCount[id]) serviceCount[id] = { name: a.serviceId.name, count: 0 }
      serviceCount[id].count++
    })
    const topServices = Object.values(serviceCount)
      .sort((a, b) => b.count - a.count)

    res.json({
      period: { month, year },
      total: appointments.length,
      byStatus,
      revenue: parseFloat(revenue.toFixed(2)),
      avgTicket: parseFloat(avgTicket.toFixed(2)),
      revenueByDay: revenueByDayArray,
      topServices,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
