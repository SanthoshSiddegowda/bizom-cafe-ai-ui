import { RoomServiceClient } from 'livekit-server-sdk'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event).catch(() => ({}))
  const roomName = body?.roomName ?? getQuery(event).roomName

  if (!roomName || typeof roomName !== 'string') {
    throw createError({ statusCode: 400, message: 'roomName is required' })
  }

  const roomService = new RoomServiceClient(
    config.public.livekitUrl as string,
    config.livekitApiKey as string,
    config.livekitApiSecret as string
  )

  await roomService.deleteRoom(roomName)

  return { ok: true, room: roomName }
})
