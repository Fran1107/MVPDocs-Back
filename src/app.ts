import express, { type Application } from 'express'
import { corsMiddleware } from './config/cors.js'
import { connectDB } from './config/db.js'
import TagRouter from './routes/TagRouter.js'

connectDB()
const app: Application = express()

app.use(corsMiddleware())
app.use(express.json())

app.get('/api', (req, res) => {
    res.send('Respuesta desde el servidor')
})

app.use('/api/tags', TagRouter);

export default app