import { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma, prismaMongo } from '../lib/prisma';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

function ImageURLGerator(fileName: string, request: FastifyRequest): string {
  const fullUrl = request.protocol.concat('://').concat(request.hostname);
  return new URL(`/uploads/${fileName}`, fullUrl).toString();
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const bodySchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    });

    const { id, name, email } = bodySchema.parse(request.body);

    await prisma.user.create({
      data: {
        id,
        name,
        email,
      },
    });

    await prismaMongo.user.create({
      data: {
        id,
      },
    });

    const defaultImages = [
      // {
      //   id: randomUUID(),
      //   imageURL: ImageURLGerator('architecture-dark' + '.jpg', request),
      //   userId: id,
      //   selected: false,
      // },
      // {
      //   id: randomUUID(),
      //   imageURL: ImageURLGerator('architecture-light' + '.jpg', request),
      //   userId: id,
      //   selected: false,
      // },
      {
        id: randomUUID(),
        imageURL: ImageURLGerator('office-dark' + '.jpg', request),
        userId: id,
        selected: false,
      },
      {
        id: randomUUID(),
        imageURL: ImageURLGerator('office-light' + '.jpg', request),
        userId: id,
        selected: false,
      },
      {
        id: randomUUID(),
        imageURL: ImageURLGerator('gradient-dark' + '.jpg', request),
        userId: id,
        selected: true,
      },
      {
        id: randomUUID(),
        imageURL: ImageURLGerator('gradient-light' + '.jpg', request),
        userId: id,
        selected: false,
      },
      {
        id: '0000-0000-0000-01',
        imageURL: '',
        userId: id,
        selected: false,
      },
    ];

    await prismaMongo.background.createMany({
      data: defaultImages,
    });

    const token = app.jwt.sign(
      {
        name,
        email,
      },
      {
        sub: id,
        expiresIn: '30 days',
      },
    );

    return {
      token,
    };
  });

  app.get('/authenticate/:id', async (request) => {
    const paramsSchema = z.object({
      id: z.string(),
    });

    const { id } = paramsSchema.parse(request.params);

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });

    const { name, email } = user;

    const token = app.jwt.sign(
      {
        name,
        email,
      },
      {
        sub: user.id,
        expiresIn: '30 days',
      },
    );

    return {
      token,
    };
  });
}
