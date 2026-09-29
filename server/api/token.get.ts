import { AccessToken, RoomAgentDispatch, RoomConfiguration } from 'livekit-server-sdk';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  
  // 1. Get room name from request
  const { roomName } = getQuery(event);

  if (!roomName) {
    throw createError({ statusCode: 400, message: 'roomName is required' });
  }

  // 2. Create the token
  const at = new AccessToken(
    config.livekitApiKey, 
    config.livekitApiSecret, 
    {
      identity: `bizom-user-${Math.random().toString(36).slice(2, 7)}`,
    }
  );

  // 3. Set permissions (Join the room and talk)
  at.addGrant({ 
    roomJoin: true, 
    room: roomName as string, 
    canPublish: true, 
    canSubscribe: true 
  });

  // 4. Dispatch the cafe agent into this room. It uses explicit dispatch
  //    (agent_name="bizom-cafe"), so without this no agent ever joins.
  at.roomConfig = new RoomConfiguration({
    agents: [new RoomAgentDispatch({ agentName: 'bizom-cafe' })],
  });

  // 5. Send the JWT token to the frontend
  return {
    serverUrl: config.public.livekitUrl,
    token: await at.toJwt(),
  };
});