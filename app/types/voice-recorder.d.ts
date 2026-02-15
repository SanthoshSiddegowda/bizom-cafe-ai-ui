export interface VoiceRecorderOptions {
  onRecordingComplete?: (audioBlob: Blob) => void
  onError?: (error: Error) => void
  audioConstraints?: MediaTrackConstraints
}

export interface RecordingState {
  isRecording: boolean
  isProcessing: boolean
  elapsedTime: number
  error: string | null
}
