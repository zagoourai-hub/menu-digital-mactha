import assert from "node:assert/strict"
import { createHash, randomUUID } from "node:crypto"
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { DatabaseSync } from "node:sqlite"
import test from "node:test"
import { createRequire } from "node:module"

test("payment route and verified webhook with isolated SQLite and mocked Midtrans", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "matcha-payment-"))
  const databasePath = join(directory, "test.db")
  process.env.DATABASE_URL = `file:${databasePath}`
  process.env.MIDTRANS_SERVER_KEY = "SB-test-key"
  process.env.MIDTRANS_IS_PRODUCTION = "false"
  process.env.APP_URL = "http://localhost:3001"
  const database = new DatabaseSync(databasePath)
  const migrations = resolve("prisma/migrations")
  for (const name of readdirSync(migrations)
    .filter((name) => /^\d/.test(name))
    .sort()) {
    database.exec(readFileSync(join(migrations, name, "migration.sql"), "utf8"))
  }
  database.close()
  const { prisma } = await import("../lib/prisma/prisma.ts")
  const { POST: pay } = await import("../app/api/payment/route.ts")
  const { POST: webhook } = await import("../app/api/payment/webhook/route.ts")
  const { GET: status } = await import("../app/api/payment/[id]/route.ts")
  const { paymentStatus, canUpdatePayment } =
    await import("../lib/payment/midtrans.ts")
  const require = createRequire(import.meta.url)
  const HttpClient = require("midtrans-client/lib/httpClient.js")
  const originalRequest = HttpClient.prototype.request
  let snapCalls = 0
  let statusCalls = 0
  let failSnap = false
  let failStatus = false
  let confirmedStatus = "settlement"
  let confirmedAmount = "40000.00"
  let snapBody
  HttpClient.prototype.request = async function (method, serverKey, url, body) {
    assert.equal(serverKey, "SB-test-key")
    assert.equal(this.http_client.defaults.timeout, 10000)
    assert.equal(this.http_client.defaults.maxRedirects, 0)
    if (String(url).includes("snap/v1/transactions")) {
      assert.equal(method, "post")
      assert.equal(new URL(url).origin, "https://app.sandbox.midtrans.com")
      snapCalls++
      snapBody = body
      if (failSnap) throw new Error("timeout")
      return {
        token: "test-token",
        redirect_url: "https://app.sandbox.midtrans.com/snap/v2/test-token",
      }
    }
    assert.equal(method, "get")
    assert.equal(new URL(url).origin, "https://api.sandbox.midtrans.com")
    statusCalls++
    if (failStatus) throw new Error("provider unavailable")
    const orderId = decodeURIComponent(
      String(url).split("/v2/")[1].split("/status")[0]
    )
    return {
      order_id: orderId,
      transaction_id: "test-transaction",
      transaction_status: confirmedStatus,
      gross_amount: confirmedAmount,
    }
  }
  t.after(async () => {
    HttpClient.prototype.request = originalRequest
    await prisma.$disconnect()
    rmSync(directory, { recursive: true, force: true })
  })
  const category = await prisma.category.create({
    data: { name: "Test", slug: "test" },
  })
  const product = await prisma.produk.create({
    data: {
      name: "Matcha",
      judul: "Matcha",
      categoryId: category.id,
      price: 20000,
      published: true,
    },
  })
  const payload = {
    checkoutKey: randomUUID(),
    items: [{ id: product.id, quantity: 2 }],
    customerName: "Test",
    phone: "",
    note: "Less ice",
    method: "qris",
  }
  const request = (body, origin = "http://localhost:3001") =>
    new Request("http://localhost:3001/api/payment", {
      method: "POST",
      headers: { origin, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  const notification = (orderId, extra = {}) => {
    const body = {
      order_id: orderId,
      transaction_id: "test-transaction",
      transaction_status: "settlement",
      status_code: "200",
      gross_amount: "40000.00",
      ...extra,
    }
    body.signature_key = createHash("sha512")
      .update(
        `${body.order_id}${body.status_code}${body.gross_amount}SB-test-key`
      )
      .digest("hex")
    return body
  }
  const notify = (body) =>
    webhook(
      new Request("http://localhost:3001/api/payment/webhook", {
        method: "POST",
        body: JSON.stringify(body),
      })
    )

  await t.test(
    "reject origin, malformed/large body, duplicates, invalid quantity, unknown and unpublished products",
    async () => {
      assert.equal(
        (await pay(request(payload, "https://evil.test"))).status,
        403
      )
      assert.equal(
        (
          await pay(
            new Request("http://localhost:3001/api/payment", {
              method: "POST",
              headers: { origin: "http://localhost:3001" },
              body: "{",
            })
          )
        ).status,
        400
      )
      assert.equal(
        (await pay(request({ ...payload, note: "x".repeat(17000) }))).status,
        400
      )
      for (const items of [
        [{ id: product.id, quantity: 0 }],
        [payload.items[0], payload.items[0]],
        [{ id: 9999, quantity: 1 }],
      ]) {
        assert.equal((await pay(request({ ...payload, items }))).status, 400)
      }
      await prisma.produk.update({
        where: { id: product.id },
        data: { published: false },
      })
      assert.equal((await pay(request(payload))).status, 400)
      await prisma.produk.update({
        where: { id: product.id },
        data: { published: true },
      })
      assert.equal((await pay(request({ ...payload, price: 1 }))).status, 400)
      assert.equal(snapCalls, 0)
    }
  )

  let orderId
  await t.test(
    "create Snap from server prices, save snapshots and deduplicate retry",
    async () => {
      const response = await pay(request(payload))
      assert.equal(response.status, 201)
      orderId = (await response.json()).orderId
      assert.equal(snapBody.transaction_details.gross_amount, 40000)
      assert.deepEqual(snapBody.enabled_payments, ["other_qris"])
      const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true },
      })
      assert.equal(order.items[0].price, 20000)
      assert.equal(order.note, "Less ice")
      assert.equal((await pay(request(payload))).status, 200)
      assert.equal(snapCalls, 1)
      assert.equal(
        (await pay(request({ ...payload, note: "different" }))).status,
        409
      )
    }
  )

  await t.test(
    "reject invalid signature and mismatched amount before querying provider",
    async () => {
      const invalid = notification(orderId)
      invalid.signature_key = "0".repeat(128)
      assert.equal((await notify(invalid)).status, 403)
      assert.equal(
        (await notify(notification(orderId, { gross_amount: "1.00" }))).status,
        400
      )
      assert.equal(statusCalls, 0)
    }
  )

  await t.test(
    "forged status cannot mark paid; provider failure requests retry",
    async () => {
      confirmedStatus = "pending"
      assert.equal((await notify(notification(orderId))).status, 200)
      assert.equal(
        (await prisma.order.findUniqueOrThrow({ where: { id: orderId } }))
          .status,
        "PENDING_PAYMENT"
      )
      failStatus = true
      assert.equal((await notify(notification(orderId))).status, 503)
      failStatus = false
      confirmedAmount = "1.00"
      assert.equal((await notify(notification(orderId))).status, 400)
      confirmedAmount = "40000.00"
    }
  )

  await t.test(
    "verified settlement is atomic and duplicate or late pending does not regress paid",
    async () => {
      confirmedStatus = "settlement"
      assert.equal((await notify(notification(orderId))).status, 200)
      assert.equal((await notify(notification(orderId))).status, 200)
      confirmedStatus = "pending"
      assert.equal((await notify(notification(orderId))).status, 200)
      assert.equal(
        (await prisma.order.findUniqueOrThrow({ where: { id: orderId } }))
          .status,
        "PAID"
      )
      assert.equal(await prisma.paymentEvent.count({ where: { orderId } }), 1)
      const publicResponse = await status(
        new Request("http://localhost:3001"),
        { params: Promise.resolve({ id: orderId }) }
      )
      assert.deepEqual(Object.keys(await publicResponse.json()).sort(), [
        "id",
        "status",
        "total",
      ])
      assert.equal(publicResponse.headers.get("cache-control"), "no-store")
    }
  )

  await t.test(
    "refund is final and capture challenge is not paid",
    async () => {
      confirmedStatus = "refund"
      assert.equal((await notify(notification(orderId))).status, 200)
      confirmedStatus = "settlement"
      assert.equal((await notify(notification(orderId))).status, 200)
      assert.equal(
        (await prisma.order.findUniqueOrThrow({ where: { id: orderId } }))
          .status,
        "REFUNDED"
      )
      assert.equal(await prisma.paymentEvent.count({ where: { orderId } }), 2)
      assert.equal(
        paymentStatus({
          transaction_status: "capture",
          fraud_status: "challenge",
        }),
        "PENDING_PAYMENT"
      )
      assert.equal(
        paymentStatus({
          transaction_status: "capture",
          fraud_status: "accept",
        }),
        "PAID"
      )
      assert.equal(
        paymentStatus({
          transaction_status: "settlement",
          fraud_status: "deny",
        }),
        "FAILED"
      )
      assert.equal(canUpdatePayment("PAID", "EXPIRED"), false)
    }
  )

  await t.test(
    "ambiguous Snap timeout preserves order and retry cannot issue another charge",
    async () => {
      failSnap = true
      const next = { ...payload, checkoutKey: randomUUID() }
      const response = await pay(request(next))
      assert.equal(response.status, 502)
      assert.ok((await response.json()).statusUrl)
      const calls = snapCalls
      assert.equal((await pay(request(next))).status, 200)
      assert.equal(snapCalls, calls)
    }
  )

  await t.test("concurrent retries cannot create two charges", async () => {
    failSnap = false
    const next = { ...payload, checkoutKey: randomUUID() }
    const calls = snapCalls
    await Promise.all([pay(request(next)), pay(request(next))])
    assert.equal(
      await prisma.order.count({ where: { checkoutKey: next.checkoutKey } }),
      1
    )
    assert.equal(snapCalls, calls + 1)
  })

  await t.test(
    "persistent quota prevents excessive new Snap requests",
    async () => {
      await prisma.order.createMany({
        data: Array.from({ length: 30 }, () => ({
          id: `MATCHA-${randomUUID()}`,
          checkoutKey: randomUUID(),
          requestHash: "test",
          customerName: "Test",
          phone: "",
          note: "",
          method: "qris",
          total: 40000,
        })),
      })
      const calls = snapCalls
      assert.equal(
        (await pay(request({ ...payload, checkoutKey: randomUUID() }))).status,
        429
      )
      assert.equal(snapCalls, calls)
    }
  )
})
