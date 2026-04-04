const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  duration: { type: Number, required: true }, // minutos
  price: { type: Number, required: true },
  active: { type: Boolean, default: true },
})

module.exports = mongoose.model('Service', serviceSchema)
