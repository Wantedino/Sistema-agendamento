const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body
    if (!name || !email || !password || !businessName) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' })
    }
    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'E-mail já cadastrado' })

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hash, businessName })
    const token = signToken(user)
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, businessName: user.businessName } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Credenciais inválidas' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Credenciais inválidas' })

    const token = signToken(user)
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, businessName: user.businessName } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
