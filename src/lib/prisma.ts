import { PrismaClient as PrismaClientSqlite } from '../../prisma/generated/client-sqlite'
import { PrismaClient as PrismaClientMongo } from '../../prisma/generated/client-mongodb'

export const prismaSqlite = new PrismaClientSqlite({
  log: ['query'],
})

export const prismaMongoDb = new PrismaClientMongo({
  log: ['query'],
})
