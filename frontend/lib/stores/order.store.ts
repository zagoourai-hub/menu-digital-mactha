import { create } from "zustand"
import { persist } from "zustand/middleware"
import { z } from "zod"
import {
  MAX_ORDER_QUANTITY,
  paymentRequestSchema,
} from "@/lib/schemas/payment.schema"

export type OrderProduct = {
  id: number
  name: string
  price: number
  imgUrl?: string | null
}

type OrderItem = OrderProduct & { quantity: number }
type CheckoutItems = { id: number; quantity: number }[]
const checkoutsSchema = z.record(
  z.string().regex(/^MATCHA-[0-9a-f-]{36}$/),
  paymentRequestSchema.shape.items
)

type OrderStore = {
  items: OrderItem[]
  checkouts: Record<string, CheckoutItems>
  isCheckingOut: boolean
  setCheckingOut: (pending: boolean) => void
  recordCheckout: (orderId: string, items: CheckoutItems) => void
  completeCheckout: (orderId: string) => void
  addItem: (product: OrderProduct) => void
  setQuantity: (id: number, quantity: number) => void
}

function isOrderItem(value: unknown): value is OrderItem {
  if (typeof value !== "object" || value === null) return false
  if (!("id" in value && "name" in value && "price" in value)) return false
  if (!("quantity" in value)) return false

  return (
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.name === "string" &&
    value.name.length > 0 &&
    typeof value.price === "number" &&
    Number.isSafeInteger(value.price) &&
    value.price >= 0 &&
    typeof value.quantity === "number" &&
    Number.isSafeInteger(value.quantity) &&
    value.quantity > 0 &&
    (!("imgUrl" in value) ||
      value.imgUrl == null ||
      (typeof value.imgUrl === "string" && value.imgUrl.startsWith("/")))
  )
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      items: [],
      checkouts: {},
      isCheckingOut: false,
      setCheckingOut: (isCheckingOut) => set({ isCheckingOut }),
      recordCheckout: (orderId, items) =>
        set((state) => ({
          checkouts: {
            ...state.checkouts,
            [orderId]:
              state.checkouts[orderId] ??
              items.map(({ id, quantity }) => ({ id, quantity })),
          },
        })),
      completeCheckout: (orderId) =>
        set((state) => {
          const snapshot = state.checkouts[orderId]
          if (!snapshot) return state
          const paid = new Map(snapshot.map((item) => [item.id, item.quantity]))
          const checkouts = { ...state.checkouts }
          delete checkouts[orderId]
          return {
            checkouts,
            items: state.items
              .map((item) => ({
                ...item,
                quantity: item.quantity - (paid.get(item.id) ?? 0),
              }))
              .filter((item) => item.quantity > 0),
          }
        }),
      addItem: (product) =>
        set((state) => {
          if (state.isCheckingOut) return state
          const existing = state.items.find((item) => item.id === product.id)

          if (!existing) {
            return { items: [...state.items, { ...product, quantity: 1 }] }
          }

          return {
            items: state.items.map((item) =>
              item.id === product.id
                ? {
                    ...item,
                    quantity: Math.min(MAX_ORDER_QUANTITY, item.quantity + 1),
                  }
                : item
            ),
          }
        }),
      setQuantity: (id, quantity) =>
        set((state) => {
          if (state.isCheckingOut || !Number.isSafeInteger(quantity))
            return state
          return {
            items: state.items
              .map((item) =>
                item.id === id
                  ? {
                      ...item,
                      quantity: Math.min(MAX_ORDER_QUANTITY, quantity),
                    }
                  : item
              )
              .filter((item) => item.quantity > 0),
          }
        }),
    }),
    {
      name: "matcha-yuk-order",
      partialize: (state) => ({
        items: state.items,
        checkouts: state.checkouts,
      }),
      skipHydration: true,
      merge: (persisted, current) => {
        if (
          typeof persisted !== "object" ||
          persisted === null ||
          !("items" in persisted) ||
          !Array.isArray(persisted.items)
        )
          return current

        const checkouts = checkoutsSchema.safeParse(
          "checkouts" in persisted ? persisted.checkouts : {}
        )
        return {
          ...current,
          items: persisted.items.filter(isOrderItem).map((item) => ({
            ...item,
            quantity: Math.min(MAX_ORDER_QUANTITY, item.quantity),
          })),
          checkouts: checkouts.success ? checkouts.data : {},
        }
      },
    }
  )
)
