import { FastifyInstance } from 'fastify'
import { prismaSqlite } from '../lib/prisma'
// import cloudinary from '../lib/cloudinary.js'
import { z } from 'zod'

export async function backgroundsRoute(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify()
  })

  app.get('/backgrounds', async (request, reply) => {
    try {
      const user = await prismaSqlite.user.findUniqueOrThrow({
        where: {
          id: request.user.sub,
        },
      })

      const DEFAULT_BACKGROUNDS = [
        process.env.DEFAULT_BACKGROUND_DARK1,
        process.env.DEFAULT_BACKGROUND_LIGHT1,
        process.env.DEFAULT_BACKGROUND_DARK2,
        process.env.DEFAULT_BACKGROUND_LIGHT2,
      ]

      const backgrounds = {
        defaultBackgrounds: DEFAULT_BACKGROUNDS,
        defaultSystemCard: process.env.DEFAULT_BACKGROUND_DEFAULT,
        selectedBackground: user?.backgroundUrl || 'default-system',
      }

      reply.status(200).send(backgrounds)
    } catch (error) {
      reply.status(500).send({ error: 'Failed to fetch backgrounds' })
    }
  })

  app.put('/background', async (request, reply) => {
    try {
      const bodySchema = z.object({
        image: z.string(),
      })

      const { image } = bodySchema.parse(request.body)

      await prismaSqlite.user.update({
        where: {
          id: request.user.sub,
        },
        data: {
          backgroundUrl: image,
        },
      })

      reply.status(200).send()
    } catch (error) {
      console.log(error)
      reply.status(500).send({ error: 'Failed to update backgrounds' })
    }
  })

  // app.post('/background', async (request, reply) => {
  //   const bodySchema = z.object({
  //     imageUrl: z.string(),
  //   })

  //   const { imageUrl } = bodySchema.parse(request.body)

  //   try {
  //     let user = await prismaSqlite.user.findFirstOrThrow({
  //       where: {
  //         id: request.user.sub,
  //       },
  //     })

  //     if (user.id !== request.user.sub) {
  //       return reply.status(401).send()
  //     }

  //     await cloudinary.uploader.upload(imageUrl, {
  //       upload_preset: 'tasker-preset',
  //       public_id: `${user.id}-bg`,
  //       allowed_formats: ['png', 'jpg', 'jpeg', 'svg', 'ico', 'jfif', 'webp'],
  //     })

  //     user = await prismaSqlite.user.update({
  //       where: {
  //         id: request.user.sub,
  //       },
  //       data: {
  //         backgroundUrl: imageUrl,
  //       },
  //     })

  //     reply.status(200).send(imageUrl)
  //   } catch (error) {
  //     if (!imageUrl) {
  //       return reply.status(400).send({ error: 'Failed to update background' })
  //     }
  //   }
  // })
}
