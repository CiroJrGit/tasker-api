import { FastifyInstance } from 'fastify'
import { prismaMongoDb } from '../lib/prisma'
import { z } from 'zod'
import { Task } from '../types'

export async function tasksRoute(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/tasks/:taskListId', async (request) => {
    const paramsSchema = z.object({
      taskListId: z.string(),
    })

    const { taskListId } = paramsSchema.parse(request.params)

    const tasks = await prismaMongoDb.task.findMany({
      where: {
        taskListId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return tasks.map((task: Task) => {
      return {
        id: task.id,
        desc: task.desc,
        completed: task.completed,
      }
    })
  })

  app.post('/tasks', async (request) => {
    const bodySchema = z.object({
      desc: z.string(),
      taskListId: z.string(),
    })

    const { desc, taskListId } = bodySchema.parse(request.body)

    const task = await prismaMongoDb.task.create({
      data: {
        desc,
        taskListId,
      },
    })

    return task
  })

  app.put('/tasks/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      desc: z.string(),
    })

    const { desc } = bodySchema.parse(request.body)

    let task = await prismaMongoDb.task.findFirstOrThrow({
      where: {
        id,
      },
    })

    task = await prismaMongoDb.task.update({
      where: {
        id,
      },
      data: {
        desc,
      },
    })

    return task
  })

  app.put('/tasks/:id/toggle', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      completed: z.boolean(),
    })

    const { completed } = bodySchema.parse(request.body)

    let task = await prismaMongoDb.task.findFirstOrThrow({
      where: {
        id,
      },
    })

    if (task.completed === completed) return
    else {
      task = await prismaMongoDb.task.update({
        where: {
          id,
        },
        data: {
          completed,
        },
      })
    }

    return task
  })

  app.delete('/tasks/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    await prismaMongoDb.task.findFirstOrThrow({
      where: {
        id,
      },
    })

    await prismaMongoDb.task.delete({
      where: {
        id,
      },
    })
  })

  app.delete('/tasks/:id/all', async (request) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(request.params)

    await prismaMongoDb.task.findMany({
      where: {
        taskListId: id,
      },
    })

    await prismaMongoDb.task.deleteMany({
      where: {
        taskListId: id,
      },
    })
  })
}
