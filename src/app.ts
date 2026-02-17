import express, { type Application } from 'express'
import { corsMiddleware } from './config/cors.js'
import { connectDB } from './config/db.js'
import projectRoutes from './routes/projectRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import quoteRoutes from './routes/quoteRoutes.js'
import tagRoutes from './routes/tagRoutes.js'

connectDB()
const app: Application = express()

app.use(corsMiddleware())
app.use(express.json())

app.use('/api/projects', projectRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/quotes', quoteRoutes)
app.use('/api/tags', tagRoutes)

app.get('/api', (req, res) => {
    res.send('Respuesta desde el servidor')
})

export default app