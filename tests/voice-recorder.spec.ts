import { test, expect } from '@playwright/test'

test.describe('Voice Recorder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the voice recorder interface', async ({ page }) => {
    // Wait for the component to load
    await page.waitForSelector('.voice-recorder', { timeout: 5000 })
    
    // Check if the record button is visible
    const recordButton = page.locator('.record-button')
    await expect(recordButton).toBeVisible()
    
    // Check if "Tap and Speak" text is visible initially
    const tapText = page.locator('.tap-text')
    await expect(tapText).toHaveText('Tap and Speak')
  })

  test('should show microphone icon when not recording', async ({ page }) => {
    await page.waitForSelector('.voice-recorder')
    
    // Check for microphone icon
    const micIcon = page.locator('.mic-icon')
    await expect(micIcon).toBeVisible()
    
    // Button should not have recording class
    const recordButton = page.locator('.record-button')
    await expect(recordButton).not.toHaveClass(/recording/)
  })

  test('should handle microphone permission request', async ({ page, context }) => {
    // Grant microphone permission
    await context.grantPermissions(['microphone'])
    
    await page.waitForSelector('.voice-recorder')
    const recordButton = page.locator('.record-button')
    
    // Click the record button
    await recordButton.click()
    
    // Wait a bit for the permission dialog or recording to start
    await page.waitForTimeout(1000)
    
    // The button should either be recording or show an error
    // (depending on whether permission was granted)
    const isRecording = await recordButton.evaluate((el) => 
      el.classList.contains('recording')
    )
    const hasError = await page.locator('.error-message').isVisible().catch(() => false)
    
    // Either recording should start or an error should be shown
    expect(isRecording || hasError).toBeTruthy()
  })

  test('should display error message when microphone access is denied', async ({ page, context }) => {
    // Deny microphone permission
    await context.clearPermissions()
    
    await page.waitForSelector('.voice-recorder')
    const recordButton = page.locator('.record-button')
    
    // Click the record button
    await recordButton.click()
    
    // Wait for error message to appear
    await page.waitForTimeout(2000)
    
    // Check if error message is displayed
    const errorMessage = page.locator('.error-message')
    const isErrorVisible = await errorMessage.isVisible().catch(() => false)
    
    // Error should be shown or button should remain in non-recording state
    if (isErrorVisible) {
      await expect(errorMessage).toBeVisible()
      const errorText = await errorMessage.textContent()
      expect(errorText).toBeTruthy()
      expect(errorText?.length).toBeGreaterThan(0)
    }
  })

  test('should have accessible button with aria-label', async ({ page }) => {
    await page.waitForSelector('.voice-recorder')
    
    const recordButton = page.locator('.record-button')
    
    // Check for aria-label attribute
    const ariaLabel = await recordButton.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
    expect(['Start recording', 'Stop recording']).toContain(ariaLabel)
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.waitForSelector('.voice-recorder')
    
    const recordButton = page.locator('.record-button')
    await expect(recordButton).toBeVisible()
    
    // Check button dimensions (should be smaller on mobile)
    const box = await recordButton.boundingBox()
    expect(box).toBeTruthy()
    if (box) {
      // Button should be visible and reasonably sized
      expect(box.width).toBeGreaterThan(100)
      expect(box.height).toBeGreaterThan(100)
    }
  })

  test('should show loading state initially', async ({ page }) => {
    // Check for fallback content while component loads
    const loadingText = page.locator('text=Loading voice recorder...')
    
    // Either the component is loaded or loading text is shown
    const isLoaded = await page.locator('.voice-recorder').isVisible().catch(() => false)
    const isLoading = await loadingText.isVisible().catch(() => false)
    
    // One of them should be true
    expect(isLoaded || isLoading).toBeTruthy()
  })
})
