import { FastifyInstance } from 'fastify'
import { prismaMongoDb } from '../lib/prisma'
import { z } from 'zod'
import { TaskList } from '../types'

export async function tasklistsRoute(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/tasklists', async (request) => {
    const tasklists = await prismaMongoDb.taskList.findMany({
      where: {
        userId: request.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return tasklists.map((tasklist: TaskList) => {
      return {
        id: tasklist.id,
        title: tasklist.title,
        color: tasklist.color,
        deleted: tasklist.deleted,
      }
    })
  })

  app.get('/tasklists/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const tasklist = await prismaMongoDb.taskList.findUniqueOrThrow({
      where: {
        id,
      },
    })

    if (tasklist.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    return tasklist
  })

  app.post('/tasklists', async (request) => {
    const bodySchema = z.object({
      title: z.string(),
      color: z.string(),
    })

    const { title, color } = bodySchema.parse(request.body)

    const tasklist = await prismaMongoDb.taskList.create({
      data: {
        userId: request.user.sub,
        title,
        color,
      },
    })

    return tasklist.id
  })

  app.put('/tasklists/:id', async (request, reply) => {
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

    let tasklist = await prismaMongoDb.taskList.findFirstOrThrow({
      where: {
        id,
      },
    })

    if (tasklist.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    tasklist = await prismaMongoDb.taskList.update({
      where: {
        id,
      },
      data: {
        title,
        color,
        deleted,
      },
    })

    return tasklist
  })

  app.delete('/tasklists/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const tasklist = await prismaMongoDb.taskList.findFirstOrThrow({
      where: {
        id,
      },
    })

    if (tasklist.userId !== request.user.sub) {
      return reply.status(401).send()
    }

    await prismaMongoDb.taskList.delete({
      where: {
        id,
      },
    })
  })
}
