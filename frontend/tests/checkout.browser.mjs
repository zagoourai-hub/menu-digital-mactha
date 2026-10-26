// Playwright MCP runs this function body; no project-local Playwright dependency is needed.
export default async function testCheckout(browserPage) {
  const baseUrl = "http://localhost:3102"
  const artifacts =
    "D:/Project/project/Web/Web Service/Menu-digital/frontend/test-results/checkout/"
  const assert = {
    equal(actual, expected, message) {
      if (actual !== expected)
        throw new Error(
          message ??
            `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
        )
    },
    ok(value, message) {
      if (!value) throw new Error(message ?? "Expected a truthy value")
    },
    match(value, pattern) {
      if (!pattern.test(value))
        throw new Error(`Expected text matching ${pattern}`)
    },
    deepEqual(actual, expected, message) {
      this.equal(JSON.stringify(actual), JSON.stringify(expected), message)
    },
  }
  const report = {
    baseUrl,
    checkedAt: new Date().toISOString(),
    checks: [],
    consoleErrors: [],
    pageErrors: [],
    failedResponses: [],
  }
  // A dedicated test port isolates this cart from the user's existing application cart.
  const page = browserPage
  await page.bringToFront()
  await page.setViewportSize({ width: 1440, height: 1000 })
  page.setDefaultTimeout(15000)
  page.on("console", (message) => {
    if (message.type() === "error")
      report.consoleErrors.push({
        text: message.text(),
        url: message.location().url,
      })
  })
  page.on("pageerror", (error) => report.pageErrors.push(error.message))
  page.on("response", (response) => {
    if (response.status() >= 400)
      report.failedResponses.push({
        url: response.url(),
        status: response.status(),
      })
  })
  page.on("requestfailed", (request) => {
    if (request.failure()?.errorText !== "net::ERR_ABORTED")
      report.failedResponses.push({
        url: request.url(),
        error: request.failure()?.errorText,
      })
  })
  const record = (name) => report.checks.push({ name, result: "PASS" })
  try {
    const menuResponsePromise = page.waitForResponse(
      (response) => response.url() === `${baseUrl}/api/menus`
    )
    await page.goto(baseUrl)
    const menuResponse = await menuResponsePromise
    assert.equal(menuResponse.status(), 200)
    const menu = await menuResponse.json()
    await page.getByRole("tab", { name: "Semua", exact: true }).waitFor()
    assert.ok(
      menu.produk.length > 0,
      "Menu fixture must contain published products"
    )
    assert.equal(
      await page.getByRole("button", { name: /^Tambah / }).count(),
      menu.produk.length
    )
    record("Landing loads published menu from the real HTTP API")

    await page.getByRole("tab", { name: "Signature", exact: true }).click()
    assert.equal(
      await page
        .getByRole("tab", { name: "Signature", exact: true })
        .getAttribute("aria-selected"),
      "true"
    )
    assert.equal(
      await page.getByRole("button", { name: /^Tambah / }).count(),
      1
    )
    assert.equal(
      await page
        .getByRole("button", {
          name: "Tambah Brown Sugar Signature",
          exact: true,
        })
        .count(),
      1
    )
    await page.getByRole("tab", { name: "Semua", exact: true }).click()
    assert.equal(
      await page.getByRole("button", { name: /^Tambah / }).count(),
      menu.produk.length
    )
    record("Category filtering changes visible products and All restores them")

    await page
      .getByRole("button", {
        name: "Tambah Brown Sugar Signature",
        exact: true,
      })
      .click()
    await page
      .getByRole("button", { name: "1 item dalam pesanan", exact: true })
      .click()
    const dialog = page.getByRole("dialog")
    await dialog.waitFor({ state: "visible" })
    assert.match(await dialog.innerText(), /Brown Sugar Signature/)
    assert.match(await dialog.innerText(), /18\.000/)
    await dialog
      .getByRole("button", {
        name: "Tambah Brown Sugar Signature",
        exact: true,
      })
      .click()
    assert.match(await dialog.innerText(), /36\.000/)
    await dialog.getByRole("link", { name: "Checkout", exact: true }).click()
    await page.waitForURL(`${baseUrl}/checkout`)
    assert.match(await page.locator("aside").innerText(), /36\.000/)
    record("Add menu, increase quantity, and checkout show the correct total")

    await page.reload()
    await page
      .getByRole("button", { name: "2 item dalam pesanan", exact: true })
      .waitFor()
    assert.match(await page.locator("aside").innerText(), /36\.000/)
    const pay = page.getByRole("button", {
      name: "Bayar dengan Midtrans",
      exact: true,
    })
    assert.equal(await pay.isEnabled(), true)
    await pay.click()
    assert.equal(
      await page
        .locator('[name="customerName"]')
        .evaluate((element) => element.validity.valueMissing),
      true
    )
    record("Cart survives reload and empty customer name blocks checkout")

    await page
      .getByRole("textbox", { name: "Nama pemesan" })
      .fill("Playwright Test")
    await page.getByRole("textbox", { name: "Nomor WhatsApp" }).fill("abc")
    await pay.click()
    assert.equal(
      await page
        .locator('[name="phone"]')
        .evaluate((element) => element.validity.patternMismatch),
      true
    )
    await page
      .getByRole("textbox", { name: "Nomor WhatsApp" })
      .fill("081234567890")
    assert.equal(
      await page
        .locator('[name="phone"]')
        .evaluate((element) => element.validity.valid),
      true
    )
    await page.getByRole("radio", { name: /Transfer Bank/ }).check()
    assert.equal(
      await page.locator('[name="paymentMethod"][value="bank"]').isChecked(),
      true
    )
    await page.getByRole("radio", { name: /QRIS/ }).check()
    assert.equal(
      await page.locator('[name="paymentMethod"][value="cash"]').isDisabled(),
      true
    )
    record(
      "Phone validation and payment method selection work; cash stays disabled"
    )

    await page.getByRole("textbox", { name: "Nomor WhatsApp" }).fill("")
    await page
      .getByRole("textbox", { name: "Catatan untuk Barista" })
      .fill("Browser validation only")
    const paymentResponsePromise = page.waitForResponse(
      (response) =>
        response.url() === `${baseUrl}/api/payment` &&
        response.request().method() === "POST"
    )
    await pay.click()
    const paymentResponse = await paymentResponsePromise
    const paymentBody = await paymentResponse.json()
    report.payment = { status: paymentResponse.status(), response: paymentBody }
    if (paymentResponse.ok()) {
      assert.ok(paymentBody.redirectUrl || paymentBody.statusUrl)
      record("Valid checkout returns a payment destination")
    } else {
      await page
        .getByRole("alert")
        .filter({ hasText: paymentBody.error })
        .waitFor()
      assert.equal(await pay.isEnabled(), true)
      report.checks.push({
        name: "Real payment creation",
        result: "BLOCKED",
        detail: `HTTP ${paymentResponse.status()}: ${paymentBody.error}`,
      })
      record("Failed payment displays an error and re-enables the button")
    }
    await page.screenshot({
      path: `${artifacts}desktop.png`,
      fullPage: true,
      animations: "disabled",
    })

    await page.setViewportSize({ width: 390, height: 844 })
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      ),
      true,
      "Checkout must not overflow mobile viewport"
    )
    await page.screenshot({
      path: `${artifacts}mobile.png`,
      fullPage: true,
      animations: "disabled",
    })
    record("Mobile checkout fits a 390px viewport")

    await page.goto(
      `${baseUrl}/payment/MATCHA-00000000-0000-4000-8000-000000000000`
    )
    await page
      .getByRole("alert")
      .filter({ hasText: "Status pesanan belum dapat dimuat" })
      .waitFor()
    assert.equal(
      await page.getByRole("button", { name: "Periksa lagi" }).isEnabled(),
      true
    )
    record("Unknown order displays a recoverable status error")
    assert.deepEqual(report.pageErrors, [], "No uncaught browser errors")
    const unexpectedResponses = report.failedResponses.filter(
      (response) =>
        !(
          response.url === `${baseUrl}/api/payment` && response.status === 503
        ) &&
        !(
          response.url.endsWith(
            "/api/payment/MATCHA-00000000-0000-4000-8000-000000000000"
          ) && response.status === 404
        )
    )
    assert.deepEqual(
      unexpectedResponses,
      [],
      "No unexpected failed HTTP requests"
    )
    const unexpectedConsole = report.consoleErrors.filter(
      (entry) => !entry.url.includes("/api/payment")
    )
    assert.deepEqual(
      unexpectedConsole,
      [],
      "No unexpected browser console errors"
    )
    record("No uncaught JavaScript errors or unexpected failed requests")
    return report
  } catch (error) {
    report.failure = { message: error.message, stack: error.stack }
    await page
      .screenshot({ path: `${artifacts}failure.png`, fullPage: true })
      .catch(() => {})
    return report
  }
}
