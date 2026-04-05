const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = new mongoose.Types.ObjectId(decoded.id)
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido' })
  }
}
