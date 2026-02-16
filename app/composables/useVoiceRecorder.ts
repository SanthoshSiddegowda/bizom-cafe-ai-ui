import {
  Room,
  RoomEvent,
  Track,
} from 'livekit-client'

export interface UseVoiceRecorderReturn {
  isRecording: Readonly<Ref<boolean>>
  isProcessing: Readonly<Ref<boolean>>
  isPlaying: Readonly<Ref<boolean>>
  isConnected: Readonly<Ref<boolean>>
  elapsedTime: Readonly<Ref<number>>
  formattedTime: ComputedRef<string>
  error: Readonly<Ref<string | null>>
  toggleRecording: () => Promise<void>
  startRecording: () => Promise<void>
  stopRecording: () => void
  disconnect: () => Promise<void>
}

export interface UseVoiceRecorderOptions {
  /** Your Nuxt API endpoint to get a token. Defaults to /api/token */
  tokenEndpoint?: string
  /** Name of the room to join. Must match what the Python agent is listening to. */
  roomName?: string
  /** Element id for agent audio playback. */
  audioOutputElementId?: string
}

export const useVoiceRecorder = (options: UseVoiceRecorderOptions = {}): UseVoiceRecorderReturn => {
  const { public: { livekitTokenUrl = '/api/token' } } = useRuntimeConfig()
  
  const tokenEndpoint = options.tokenEndpoint ?? livekitTokenUrl
  const audioOutputElementId = options.audioOutputElementId ?? 'audio_output_component_id'

  const isRecording = ref(false)
  const isProcessing = ref(false)
  const isPlaying = ref(false)
  const isConnected = ref(false)
  const elapsedTime = ref(0)
  const error = ref<string | null>(null)

  let timerInterval: ReturnType<typeof setInterval> | null = null
  let room: Room | null = null
  /** Per-call room name: from options or generated (bizom-cafe-<id>) */
  let currentRoomName = ''

  const formattedTime = computed(() => `${elapsedTime.value}s`)

  const attachAgentTrack = (track: Track) => {
    const el = document.getElementById(audioOutputElementId) as HTMLAudioElement
    if (el) {
      track.attach(el)
      isPlaying.value = true
    }
  }

  const detachAgentTrack = (track: Track) => {
    const el = document.getElementById(audioOutputElementId) as HTMLAudioElement
    if (el) {
      track.detach(el)
      isPlaying.value = false
    }
  }

  const generateRoomName = (): string => {
    if (options.roomName) return options.roomName
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
    return `bizom-cafe-${id}`
  }

  const getToken = async () => {
    try {
      const data = await $fetch<{ serverUrl: string, token: string }>('/api/token', {
        params: { roomName: currentRoomName }
      })
      
      return {
        serverUrl: data.serverUrl, 
        participantToken: data.token // Map 'token' to 'participantToken'
      }
    } catch (err) {
      console.error('Token fetch failed:', err)
      throw new Error('Could not fetch token from local API')
    }
  }

  const startRecording = async (): Promise<void> => {
    if (isProcessing.value || isRecording.value) return

    try {
      isProcessing.value = true
      error.value = null

      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser')
      }

      currentRoomName = generateRoomName()
      const { serverUrl, participantToken } = await getToken()

      room = new Room({
        adaptiveStream: true,
        dynacast: true,
      })

      // Setup Event Listeners
      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          attachAgentTrack(track)
        }
      })

      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        detachAgentTrack(track)
      })

      room.on(RoomEvent.Disconnected, () => {
        cleanup()
      })

      // Connect to the room
      await room.connect(serverUrl, participantToken)
      isConnected.value = true

      // Enable microphone and start recording state
      await room.localParticipant.setMicrophoneEnabled(true)
      isRecording.value = true
      
      elapsedTime.value = 0
      timerInterval = setInterval(() => {
        elapsedTime.value++
      }, 1000)

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Connection failed'
      console.error('LiveKit Error:', err)
      disconnect()
    } finally {
      isProcessing.value = false
    }
  }

  const cleanup = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    isConnected.value = false
    isRecording.value = false
    isPlaying.value = false
    room = null
  }

  const stopRecording = (): void => {
    if (room?.localParticipant) {
      room.localParticipant.setMicrophoneEnabled(false)
    }
    isRecording.value = false
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  const disconnect = async (): Promise<void> => {
    if (room) {
      await room.disconnect(true)
      if (currentRoomName) {
        try {
          await $fetch('/api/room/delete', {
            method: 'POST',
            body: { roomName: currentRoomName },
          })
        } catch (_) {
          // Room may already be gone; ignore
        }
      }
      cleanup()
    } else {
      cleanup()
    }
  }

  const toggleRecording = async (): Promise<void> => {
    if (isRecording.value) {
      await disconnect()
    } else {
      await startRecording()
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isRecording: readonly(isRecording),
    isProcessing: readonly(isProcessing),
    isPlaying: readonly(isPlaying),
    isConnected: readonly(isConnected),
    elapsedTime: readonly(elapsedTime),
    formattedTime,
    error: readonly(error),
    toggleRecording,
    startRecording,
    stopRecording,
    disconnect,
  }
}