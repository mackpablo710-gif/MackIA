import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import businessRoutes from './routes/business'
import brandsRoutes from './routes/brands'
import creditsRoutes from './routes/credits'
import libraryRoutes from './routes/library'
import analysisRoutes from './routes/generate/analysis'
import campaignsRoutes from './routes/generate/campaigns'
import postsRoutes from './routes/generate/posts'
import imagesRoutes from './routes/generate/images'
import designsRoutes from './routes/generate/designs'
import videosRoutes from './routes/generate/videos'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(helmet())
app.use(cors({
  origin: (origin, cb) => {
    // Allow any localhost port (5173, 5174, 5175, etc.) + configured frontend URL
    const allowed = process.env.FRONTEND_URL ?? ''
    if (!origin || origin.startsWith('http://localhost:') || origin === allowed) {
      cb(null, true)
    } else {
      cb(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

const limiter = rateLimit({ windowMs: 60_000, max: 200 })
const aiLimiter = rateLimit({ windowMs: 60_000, max: 60 })
app.use('/api', limiter)
app.use('/api/v1/generate', aiLimiter)

app.get('/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }))

app.use('/api/v1/business', businessRoutes)
app.use('/api/v1/brands', brandsRoutes)
app.use('/api/v1/credits', creditsRoutes)
app.use('/api/v1/library', libraryRoutes)
app.use('/api/v1/generate', analysisRoutes)
app.use('/api/v1/generate/campaigns', campaignsRoutes)
app.use('/api/v1/generate', postsRoutes)
app.use('/api/v1/generate/images', imagesRoutes)
app.use('/api/v1/generate/images', designsRoutes)
app.use('/api/v1/generate/videos', videosRoutes)

app.listen(PORT, () => {
  console.log(`🚀 AdGenius API running on http://localhost:${PORT}`)
})

export default app
