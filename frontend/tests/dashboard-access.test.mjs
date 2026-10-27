import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { DatabaseSync } from "node:sqlite"
import { mock, test } from "node:test"

test("dashboard permissions and paid order workflow", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "matcha-dashboard-"))
  process.env.DATABASE_URL = `file:${join(directory, "test.db")}`
  const db = new DatabaseSync(join(directory, "test.db"))
  for (const name of readdirSync("prisma/migrations")
    .filter((name) => /^\d/.test(name))
    .sort()) {
    if (name === "20261027160100_normalize_employee_roles") {
      db.exec(`INSERT INTO "user" ("id", "name", "email", "role", "updatedAt") VALUES
        ('legacy', 'Employee', 'legacy@example.test', 'USER', CURRENT_TIMESTAMP),
        ('owner', 'Owner', 'owner@example.test', 'admin', CURRENT_TIMESTAMP)`)
    }
    db.exec(
      readFileSync(resolve("prisma/migrations", name, "migration.sql"), "utf8")
    )
  }
  assert.equal(
    db.prepare('SELECT role FROM "user" WHERE id = ?').get("legacy").role,
    "user"
  )
  assert.equal(
    db.prepare('SELECT role FROM "user" WHERE id = ?').get("owner").role,
    "admin"
  )
  db.close()
  mock.module("next/headers", {
    namedExports: {
      headers: async () => new Headers(),
      cookies: async () => ({ getAll: () => [], set() {} }),
    },
  })
  mock.module("next/navigation", {
    namedExports: {
      redirect: (path) => {
        throw new Error(`redirect:${path}`)
      },
    },
  })
  mock.module("next/cache", { namedExports: { revalidatePath() {} } })
  const { auth } = await import("../lib/auth/auth.ts")
  const { prisma } = await import("../lib/prisma/prisma.ts")
  let role = null
  mock.method(auth.api, "getSession", async (options) => {
    assert.equal(options.query.disableCookieCache, true)
    return role === null ? null : { user: { id: "staff", role } }
  })
  const { requireStaff, requireAdmin } =
    await import("../lib/auth/permissions.ts")
  const { createProduct, updateProduct, deleteProduct } =
    await import("../app/dashboard/menu/actions.ts")
  const { updateOrderStatus } =
    await import("../app/dashboard/orders/actions.ts")
  const { createEmployee } = await import("../app/dashboard/staff/actions.ts")
  t.after(async () => {
    mock.restoreAll()
    await prisma.$disconnect()
    rmSync(directory, { recursive: true, force: true })
  })
  const category = await prisma.category.create({
    data: { name: "Test", slug: "test" },
  })
  const values = {
    name: "Test Tea",
    judul: "Tea",
    price: 18000,
    categoryId: category.id,
    desk: "Tea",
    imgUrl: "",
    published: true,
  }
  const requestStatus = (orderId, nextStatus) => {
    const data = new FormData()
    data.set("orderId", orderId)
    data.set("nextStatus", nextStatus)
    return updateOrderStatus({ error: null }, data)
  }
  const makeOrder = (status) =>
    prisma.order.create({
      data: {
        id: `MATCHA-${randomUUID()}`,
        checkoutKey: randomUUID(),
        requestHash: "test",
        customerName: "Test",
        phone: "",
        note: "",
        method: "qris",
        total: 18000,
        status,
      },
    })
  const employeeData = new FormData()
  employeeData.set("name", "Employee")
  employeeData.set("email", "employee@example.test")
  employeeData.set("password", "Fixture-password-123!")
  employeeData.set("role", "admin")

  await t.test(
    "anonymous and unknown roles cannot access staff or mutate products",
    async () => {
      for (const value of [null, "owner", "ADMIN"]) {
        role = value
        const expected = value === null ? /redirect:\/login/ : /redirect:\/$/
        await assert.rejects(requireStaff(), expected)
        await assert.rejects(createProduct(values), expected)
        await assert.rejects(updateProduct(1, values), expected)
        await assert.rejects(deleteProduct(1), expected)
        await assert.rejects(
          createEmployee({ error: null, success: false }, employeeData),
          expected
        )
        await assert.rejects(
          requestStatus(`MATCHA-${randomUUID()}`, "PROCESSING"),
          expected
        )
      }
      assert.equal(await prisma.produk.count(), 0)
    }
  )
  await t.test(
    "employees can access orders but direct product mutations are rejected",
    async () => {
      role = "user"
      await requireStaff()
      await assert.rejects(requireAdmin(), /redirect:\/dashboard\/orders/)
      await assert.rejects(
        createProduct(values),
        /redirect:\/dashboard\/orders/
      )
      await assert.rejects(
        updateProduct(1, values),
        /redirect:\/dashboard\/orders/
      )
      await assert.rejects(deleteProduct(1), /redirect:\/dashboard\/orders/)
      await assert.rejects(
        createEmployee({ error: null, success: false }, employeeData),
        /redirect:\/dashboard\/orders/
      )
      assert.equal(await prisma.produk.count(), 0)
    }
  )
  await t.test(
    "public signup is disabled and employee creation always uses the employee role",
    async () => {
      await assert.rejects(
        auth.api.signUpEmail({
          body: {
            name: "Public Signup",
            email: "public@example.test",
            password: "Fixture-password-123!",
            role: "admin",
          },
        }),
        (error) => error.body?.code === "EMAIL_PASSWORD_SIGN_UP_DISABLED"
      )
      role = "admin"
      const create = mock.method(auth.api, "createUser", async ({ body }) => {
        assert.equal(body.role, "user")
        assert.equal(body.email, "employee@example.test")
        return { user: { id: "new-employee", role: "user" } }
      })
      assert.deepEqual(
        await createEmployee({ error: null, success: false }, employeeData),
        { error: null, success: true }
      )
      assert.equal(create.mock.callCount(), 1)
      create.mock.restore()
    }
  )
  await t.test(
    "owners can create, edit and delete products with validation",
    async () => {
      role = "admin"
      await requireAdmin()
      assert.ok((await createProduct({ ...values, price: -1 })).error)
      await assert.rejects(createProduct(values), /redirect:.*created/)
      const product = await prisma.produk.findUniqueOrThrow({
        where: { name: values.name },
      })
      await assert.rejects(
        updateProduct(product.id, { ...values, price: 19000 }),
        /redirect:.*updated/
      )
      assert.equal(
        (await prisma.produk.findUniqueOrThrow({ where: { id: product.id } }))
          .price,
        19000
      )
      await assert.rejects(deleteProduct(product.id), /redirect:.*deleted/)
      assert.equal(await prisma.produk.count(), 0)
    }
  )
  await t.test(
    "employees cannot change payment status, skip stages or process unpaid/refunded orders",
    async () => {
      role = "user"
      for (const status of [
        "PENDING_PAYMENT",
        "FAILED",
        "EXPIRED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
      ]) {
        const order = await makeOrder(status)
        assert.ok((await requestStatus(order.id, "PROCESSING")).error)
        assert.equal(
          (await prisma.order.findUniqueOrThrow({ where: { id: order.id } }))
            .status,
          status
        )
      }
      const paid = await makeOrder("PAID")
      assert.ok((await requestStatus(paid.id, "PAID")).error)
      assert.ok((await requestStatus(paid.id, "READY")).error)
      assert.ok((await requestStatus("invalid", "PROCESSING")).error)
      for (const nextStatus of ["PROCESSING", "READY", "COMPLETED"]) {
        assert.equal((await requestStatus(paid.id, nextStatus)).error, null)
        assert.ok((await requestStatus(paid.id, nextStatus)).error)
      }
      const completed = await prisma.order.findUniqueOrThrow({
        where: { id: paid.id },
      })
      assert.equal(completed.status, "PAID")
      assert.equal(completed.fulfillmentStatus, "COMPLETED")
      assert.ok((await requestStatus(paid.id, "PROCESSING")).error)
      assert.equal(await prisma.paymentEvent.count(), 0)
    }
  )
  await t.test(
    "owners can process orders and concurrent clicks advance only once",
    async () => {
      role = "admin"
      const paid = await makeOrder("PAID")
      const results = await Promise.all([
        requestStatus(paid.id, "PROCESSING"),
        requestStatus(paid.id, "PROCESSING"),
      ])
      assert.equal(results.filter((result) => result.error === null).length, 1)
      assert.equal(
        (await prisma.order.findUniqueOrThrow({ where: { id: paid.id } }))
          .fulfillmentStatus,
        "PROCESSING"
      )
    }
  )
})
