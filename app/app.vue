<template>
  <div class="app-layout">
    <ClientOnly>
      <div class="split-panel split-panel-left">
        <header class="left-header" role="banner">
          <img src="/bizom.png" alt="Bizom - Powered by Real Intelligence" class="left-header-logo" />
        </header>
        <VoiceRecorder
          :key="`voice-${livekitSandboxId}-${livekitTokenUrl}-${livekitAgentName}`"
          :sandbox-id="livekitSandboxId"
          :token-endpoint="livekitTokenUrl"
          :agent-name="livekitAgentName"
        />
      </div>
      <div class="split-panel split-panel-right">
        <div class="right-panel-inner">
          <section class="todays-menu" aria-label="Today's menu">
            <h2 class="todays-menu-title">Today's Menu</h2>
            <div class="todays-menu-content">
              <div
                v-for="(items, category) in menuByCategory"
                :key="category"
                class="todays-menu-category"
              >
                <h3 class="todays-menu-category-title">{{ category }}</h3>
                <p class="todays-menu-category-items">{{ items.join(', ') }}</p>
              </div>
            </div>
          </section>
          <div class="rio-image-wrap">
            <p class="rio-caption">Your feedback helps us cook better!</p>
            <img
              src="/rio.png"
              alt="Bizom RIO"
              class="rio-image"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const showSettings = ref(false)
const livekitSandboxId = ref(config.public.livekitSandboxId as string)
const livekitTokenUrl = ref(config.public.livekitTokenUrl as string)
const livekitAgentName = ref(config.public.livekitAgentName as string)

// Today's menu – Bytes with Bites style; replace with API when available
const menuByCategory = ref<Record<string, string[]>>({
  BREAKFAST: ['Set dosa and sambar'],
  LUNCH: ['Roti', 'Rice', 'Dal fry', 'Aloo gobhi', 'Baigan bharta', 'Salad'],
  SNACKS: ['Maggi'],
})


useHead({
  title: 'Voice Feedback - Bizom Cafe AI',
  meta: [
    {
      name: 'description',
      content: 'Record your voice with our simple and intuitive voice feedback'
    }
  ]
})

</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#__nuxt {
  height: 100vh;
  overflow: hidden;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: row;
  height: 100%;
  min-height: 100vh;
}

.split-panel {
  min-width: 0;
}

.split-panel-left {
  flex: 0 0 70%;
  position: relative;
  overflow: hidden;
}

.left-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 0.75rem 1.25rem;
}

.left-header-logo {
  height: 10vh;
  width: auto;
  display: block;
  object-fit: contain;
}

.split-panel-right {
  flex: 0 0 30%;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: auto;
}

.right-panel-inner {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 24px 28px;
  gap: 28px;
}

/* Premium card-style menu */
.todays-menu {
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  padding: 22px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.todays-menu-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.25rem 0;
  letter-spacing: -0.02em;
}

.todays-menu-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.todays-menu-category {
  margin: 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.todays-menu-category:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.todays-menu-category-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.4rem 0;
  letter-spacing: 0.02em;
}

.todays-menu-category-items {
  font-size: 1rem;
  font-weight: 400;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.rio-image-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  flex: 1;
  min-height: 0;
  margin-top: auto;
}

.rio-caption {
  font-size: 1rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.625rem 1rem;
  border-radius: 12px;
  margin: 0 0 0.75rem 0;
  max-width: 90%;
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.rio-image {
  max-width: 15vw;
  max-height: 25vh;
  width: auto;
  height: auto;
  object-fit: contain;
}

.loading-text {
  font-size: 1.2rem;
  color: #424242;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}
</style>
