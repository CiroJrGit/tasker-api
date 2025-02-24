import { FastifyInstance } from 'fastify'
import { prismaMongoDb } from '../lib/prisma'
import { z } from 'zod'
import { Notes } from '../types'

export async function notesRoute(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/notes', async (request) => {
    const notes = await prismaMongoDb.note.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return notes.map((note: Notes) => {
      return {
        id: note.id,
        title: note.title,
        content: note.content,
        color: note.color,
        deleted: note.deleted,
      }
    })
  })

  app.get('/notes/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const note = await prismaMongoDb.note.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (note.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    return note
  })

  app.post('/notes', async (request) => {
    const bodySchema = z.object({
      title: z.string(),
      color: z.string(),
    })

    const { title, color } = bodySchema.parse(request.body)

    const note = await prismaMongoDb.note.create({
      data: {
        userId: request.user.sub,
        title,
        content: '',
        color,
      },
    })

    return note.id
  })

  app.put('/notes/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      title: z.string(),
      color: z.string(),
      deleted: z.boolean(),
    })

    const { title, color, deleted } = bodySchema.parse(request.body)

    let note = await prismaMongoDb.note.findFirstOrThrow({
      where: {
        id,
      },
    })

    if (note.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    note = await prismaMongoDb.note.update({
      where: {
        id,
      },
      data: {
        title,
        color,
        deleted,
      },
    })

    return note
  })

  app.delete('/notes/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const note = await prismaMongoDb.note.findFirstOrThrow({
      where: {
        id,
      },
    })

    if (note.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    await prismaMongoDb.note.delete({
      where: {
        id,
      },
    })
  })
}
