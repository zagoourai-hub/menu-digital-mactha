import assert from "node:assert/strict"
import { beforeEach, test } from "node:test"

const memory = new Map()
globalThis.window = {
  localStorage: {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: (key) => memory.delete(key),
  },
}
const { useOrderStore } = await import("../lib/stores/order.store.ts")
const product = { id: 1, name: "Matcha", price: 18000 }
const second = { id: 2, name: "Tea", price: 15000 }
const firstOrder = "MATCHA-00000000-0000-4000-8000-000000000001"
const secondOrder = "MATCHA-00000000-0000-4000-8000-000000000002"
beforeEach(() => {
  memory.clear()
  useOrderStore.setState({ items: [], checkouts: {}, isCheckingOut: false })
})

test("all cart writers cap quantity at 99 and reject invalid numbers", () => {
  for (let i = 0; i < 100; i++) useOrderStore.getState().addItem(product)
  assert.equal(useOrderStore.getState().items[0].quantity, 99)
  useOrderStore.getState().setQuantity(1, 100)
  assert.equal(useOrderStore.getState().items[0].quantity, 99)
  for (const value of [NaN, Infinity, 1.5])
    useOrderStore.getState().setQuantity(1, value)
  assert.equal(useOrderStore.getState().items[0].quantity, 99)
  useOrderStore.getState().setQuantity(1, 0)
  assert.equal(useOrderStore.getState().items.length, 0)
})

test("pending checkout locks additions, quantity changes and removals in the shared store", () => {
  useOrderStore.getState().addItem(product)
  assert.equal(typeof useOrderStore.getState().setCheckingOut, "function")
  useOrderStore.getState().setCheckingOut(true)
  useOrderStore.getState().addItem(product)
  useOrderStore.getState().addItem(second)
  useOrderStore.getState().setQuantity(1, 5)
  useOrderStore.getState().setQuantity(1, 0)
  assert.deepEqual(useOrderStore.getState().items, [
    { ...product, quantity: 1 },
  ])
  useOrderStore.getState().setCheckingOut(false)
  useOrderStore.getState().addItem(product)
  assert.equal(useOrderStore.getState().items[0].quantity, 2)
})

test("paid checkout removes only purchased quantities, preserves new additions, and completes once", () => {
  useOrderStore.getState().addItem(product)
  useOrderStore.getState().setQuantity(1, 2)
  assert.equal(typeof useOrderStore.getState().recordCheckout, "function")
  useOrderStore.getState().recordCheckout(firstOrder, [{ id: 1, quantity: 2 }])
  useOrderStore.getState().setQuantity(1, 5)
  useOrderStore.getState().addItem(second)
  useOrderStore.getState().completeCheckout(firstOrder)
  const remaining = [
    { ...product, quantity: 3 },
    { ...second, quantity: 1 },
  ]
  assert.deepEqual(useOrderStore.getState().items, remaining)
  assert.equal(useOrderStore.getState().checkouts[firstOrder], undefined)
  useOrderStore.getState().completeCheckout(firstOrder)
  assert.deepEqual(useOrderStore.getState().items, remaining)
})

test("a fully paid cart becomes empty and a later completion cannot remove new items", () => {
  useOrderStore.getState().addItem(product)
  useOrderStore.getState().recordCheckout(firstOrder, [{ id: 1, quantity: 1 }])
  useOrderStore.getState().completeCheckout(firstOrder)
  assert.deepEqual(useOrderStore.getState().items, [])
  useOrderStore.getState().addItem(product)
  useOrderStore.getState().completeCheckout(firstOrder)
  assert.deepEqual(useOrderStore.getState().items, [{ ...product, quantity: 1 }])
})

test("snapshots survive rehydration and paid cleanup preserves another pending checkout", async () => {
  useOrderStore.getState().addItem(product)
  useOrderStore.getState().setQuantity(1, 4)
  assert.equal(typeof useOrderStore.getState().recordCheckout, "function")
  useOrderStore.getState().recordCheckout(firstOrder, [{ id: 1, quantity: 1 }])
  useOrderStore.getState().recordCheckout(secondOrder, [{ id: 1, quantity: 2 }])
  const saved = memory.get("matcha-yuk-order")
  useOrderStore.setState({ items: [], checkouts: {} })
  memory.set("matcha-yuk-order", saved)
  await useOrderStore.persist.rehydrate()
  useOrderStore.getState().completeCheckout(firstOrder)
  assert.equal(useOrderStore.getState().items[0].quantity, 3)
  assert.deepEqual(useOrderStore.getState().checkouts[secondOrder], [
    { id: 1, quantity: 2 },
  ])
  useOrderStore.getState().completeCheckout(secondOrder)
  assert.equal(useOrderStore.getState().items[0].quantity, 1)
})

test("old saved quantities are capped, corrupt checkout metadata is ignored, and locks are not persisted", async () => {
  memory.set(
    "matcha-yuk-order",
    JSON.stringify({
      state: {
        items: [{ ...product, quantity: 120 }],
        checkouts: { [firstOrder]: [{ id: 1, quantity: -1 }] },
      },
      version: 0,
    })
  )
  await useOrderStore.persist.rehydrate()
  assert.equal(useOrderStore.getState().items[0].quantity, 99)
  assert.deepEqual(useOrderStore.getState().checkouts, {})
  useOrderStore.getState().setCheckingOut(true)
  assert.equal(
    "isCheckingOut" in JSON.parse(memory.get("matcha-yuk-order")).state,
    false
  )
})
