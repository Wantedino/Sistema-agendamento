require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

app.use(cors())
app.use(express.json())

// Rotas
app.use('/api/auth', require('./routes/auth'))
app.use('/api/services', require('./routes/services'))
app.use('/api/appointments', require('./routes/appointments'))
app.use('/api/public', require('./routes/public'))

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB conectado')
    app.listen(process.env.PORT, () => {
      console.log(`Servidor rodando na porta ${process.env.PORT}`)
    })
  })
  .catch(err => {
    console.error('Erro ao conectar MongoDB:', err.message)
    process.exit(1)
  })
