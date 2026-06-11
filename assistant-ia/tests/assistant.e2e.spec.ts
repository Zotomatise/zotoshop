import { test, expect } from "@playwright/test"

// Tests de reference du WIDGET dans le storefront (port 8000).
test.describe("ZotoShop Assistant - widget", () => {
  test("ouverture et envoi d'un message", async ({ page }) => {
    await page.goto("/fr")
    await page.getByTestId("assistant-bubble").click()
    await expect(page.getByTestId("assistant-panel")).toBeVisible()

    await page.getByTestId("assistant-input").fill("Quels sont vos delais de livraison ?")
    await page.getByTestId("assistant-send").click()

    // une reponse du bot finit par apparaitre (au-dela du message d'accueil)
    await expect(page.getByTestId("assistant-message-bot").nth(1)).toBeVisible({ timeout: 30_000 })
    await expect(page.getByTestId("assistant-sources").first()).toBeVisible()
  })
})
