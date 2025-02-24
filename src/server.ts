import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { authRoutes } from './routes/auth'
import { tasksRoute } from './routes/tasks'
import { tasklistsRoute } from './routes/tasklists'
import { notesRoute } from './routes/notes'
import { backgroundsRoute } from './routes/backgrounds'

const app = fastify()

app.register(cors, {
  origin: true,
})

app.register(jwt, {
  secret: 'taskrwebtoken',
})

app.register(authRoutes)
app.register(tasksRoute)
app.register(tasklistsRoute)
app.register(notesRoute)
app.register(backgroundsRoute)

app.get('/hello', () => {
  return 'Hello World!'
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
