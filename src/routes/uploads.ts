// import { FastifyInstance, FastifyRequest } from 'fastify'
// import { prismaSqlite } from '../lib/prisma'
// import { firestore } from '../lib/firebase'
// import { z } from 'zod'
// import fs from 'fs'
// import path from 'path'

// interface UploadRequest extends FastifyRequest {
//   file: () => Promise<{
//     file: NodeJS.ReadableStream
//     filename: string
//     mimetype: string
//   }>
// }

// export async function uploadsRoute(app: FastifyInstance) {
//   app.addHook('preHandler', async (request) => {
//     await request.jwtVerify()
//   })

//   app.post('/backgrounds/:id', async (request: UploadRequest, reply) => {
//     const { id } = request.params as { id: string }
//     const data = await request.file()

//     if (!data) {
//       return reply.status(400).send({ error: 'Nenhum arquivo enviado.' })
//     }

//     const { file, filename, mimetype } = data

//     const tempFilePath = path.join(__dirname, '..', 'uploads', filename)
//     const writeStream = fs.createWriteStream(tempFilePath)
//     file.pipe(writeStream)

//     writeStream.on('finish', async () => {
//       try {
//         // Ler o arquivo temporário
//         const fileBuffer = fs.readFileSync(tempFilePath)

//         // Upload da imagem para o Firestore
//         const userRef = firestore.collection('users').doc(id)
//         const backgroundsRef = userRef.collection('backgrounds')

//         await backgroundsRef.add({
//           url: `data:${mimetype};base64,${fileBuffer.toString('base64')}`,
//           isDefault: false, // Indica que não é um background padrão
//         })

//         // Excluir o arquivo temporário
//         fs.unlinkSync(tempFilePath)

//         reply.send({ message: 'Background adicionado com sucesso.' })
//       } catch (error) {
//         console.error(error)
//         reply.status(500).send({ error: 'Erro ao processar a imagem.' })
//       }
//     })

//     writeStream.on('error', (err) => {
//       console.error(err)
//       reply.status(500).send({ error: 'Erro ao salvar o arquivo.' })
//     })
//   })
// }
