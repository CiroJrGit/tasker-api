import { FastifyInstance } from 'fastify';
import { prismaMongo } from '../lib/prisma';
import { z } from 'zod';

export async function uploadsRoute(app: FastifyInstance) {
  app.addHook('preHandler', async (request) => {
    await request.jwtVerify();
  });

  app.get('/backgrounds', async (request) => {
    const backgrounds = await prismaMongo.background.findMany({
      where: {
        userId: request.user.sub,
      },
    });

    return backgrounds.map((background) => {
      return {
        id: background.id,
        userId: background.userId,
        imageURL: background.imageURL,
        selected: background.selected,
      };
    });
  });
}
