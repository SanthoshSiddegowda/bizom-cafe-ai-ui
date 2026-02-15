<template>
  <div class="voice-recorder-container">
    <audio
      :id="audioOutputElementId"
      autoplay
      style="display: none;"
      aria-hidden="true"
    />

    <div class="voice-recorder">
      <!-- Connection Status (LiveKit) -->
      <Transition name="fade">
        <div
          v-if="isConnected"
          class="connection-status"
          role="status"
          aria-live="polite"
        >
          <span class="connection-indicator"></span>
          <span class="connection-text">Connected</span>
        </div>
      </Transition>

      <!-- Recording Button -->
      <button
        :class="['record-button', { 'recording': isRecording }]"
        @click="handleToggle"
        :disabled="isProcessing || !!error"
        :aria-label="buttonAriaLabel"
        :aria-pressed="isRecording"
        type="button"
      >
        <Transition name="icon-fade" mode="out-in">
          <svg
            :key="isRecording ? 'stop' : 'mic'"
            :class="['icon', isRecording ? 'stop-icon' : 'mic-icon']"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <template v-if="!isRecording">
              <path
                d="M12 14C13.1 14 14 13.1 14 12V6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6V12C10 13.1 10.9 14 12 14Z"
                fill="currentColor"
              />
              <path
                d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10H7V12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12V10H19Z"
                fill="currentColor"
              />
              <path
                d="M11 22H13V20H11V22Z"
                fill="currentColor"
              />
            </template>
            <rect
              v-else
              x="6"
              y="6"
              width="12"
              height="12"
              rx="2"
              fill="currentColor"
            />
          </svg>
        </Transition>
      </button>

      <!-- Error Message -->
      <Transition name="fade-slide">
        <div
          v-if="error"
          class="error-message"
          role="alert"
          aria-live="assertive"
        >
          <span class="error-text">{{ error }}</span>
        </div>
      </Transition>

      <!-- Status Text (streaming only) -->
      <Transition name="fade" mode="out-in">
        <div
          v-if="isRecording"
          key="recording"
          class="status-text"
          role="status"
          aria-live="polite"
        >
          <p class="listening-text">
            {{ isConnected ? 'Connected — speak your feedback' : 'Connecting...' }}
          </p>
          <p class="timer-text" :aria-label="`Recording for ${formattedTime}`">
            {{ formattedTime }}
          </p>
        </div>
        <div
          v-else-if="!error && !isProcessing"
          key="idle"
          class="status-text"
        >
          <p class="tap-text">Tap the mic and tell us how it was!</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
interface VoiceRecorderProps {
  sandboxId?: string
  tokenEndpoint?: string
  agentName?: string
  audioOutputElementId?: string
}

const props = withDefaults(defineProps<VoiceRecorderProps>(), {
  sandboxId: '',
  tokenEndpoint: '',
  agentName: '',
  audioOutputElementId: 'audio_output_component_id'
})

const {
  isRecording,
  isProcessing,
  isConnected,
  elapsedTime,
  formattedTime,
  error,
  toggleRecording
} = useVoiceRecorder({
  sandboxId: props.sandboxId,
  tokenEndpoint: props.tokenEndpoint,
  agentName: props.agentName,
  audioOutputElementId: props.audioOutputElementId
})

// Computed properties for better reactivity
const buttonAriaLabel = computed(() => {
  if (isRecording.value) {
    return 'Stop recording'
  }
  if (error.value) {
    return 'Recording unavailable'
  }
  return 'Start recording'
})

// Handle toggle with error handling
const handleToggle = async () => {
  try {
    await toggleRecording()
  } catch (err) {
    console.error('Failed to toggle recording:', err)
  }
}
</script>

<style scoped>
.voice-recorder-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 2rem;
  overflow: hidden;
}

.voice-recorder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #e8f5e9;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #2e7d32;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.connection-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4caf50;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

.connection-text {
  font-weight: 500;
}

.record-button {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  background-color: #f8fafc;
  color: #475569;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02);
}

.record-button:hover:not(:disabled):not(.recording) {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.record-button:active:not(:disabled):not(.recording) {
  background-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.record-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.record-button.recording {
  background-color: #f44336;
  color: white;
  border: 1px solid #f44336;
}

.record-button.recording:hover:not(:disabled) {
  background-color: #f44336;
}

.icon {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.mic-icon {
  width: 80px;
  height: 80px;
  color: #2563eb;
}

.record-button.recording .mic-icon {
  color: white;
}

.stop-icon {
  width: 60px;
  height: 60px;
  color: white;
}

/* Icon transition animations */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: scale(0.8) rotate(-90deg);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(90deg);
}

.status-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.listening-text {
  font-size: 1.2rem;
  color: #424242;
  font-weight: 400;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.timer-text {
  font-size: 2.5rem;
  color: #424242;
  font-weight: 700;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.tap-text {
  font-size: 1.2rem;
  color: #424242;
  font-weight: 400;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  letter-spacing: 0.3px;
}

.error-message {
  color: #f44336;
  font-size: 1rem;
  text-align: center;
  padding: 1rem 1.5rem;
  background-color: #ffebee;
  border-radius: 8px;
  max-width: 400px;
  border: 1px solid rgba(244, 67, 54, 0.2);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.error-text {
  display: block;
}

/* Fade and slide transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

@media (max-width: 768px) {
  .record-button {
    width: 160px;
    height: 160px;
  }

  .mic-icon {
    width: 60px;
    height: 60px;
  }

  .stop-icon {
    width: 50px;
    height: 50px;
  }

  .timer-text {
    font-size: 2rem;
  }
}
</style>
