import { create } from "zustand"
import { persist } from "zustand/middleware"

export type OrderProduct = {
  id: number
  name: string
  price: number
  imgUrl?: string | null
}

type OrderItem = OrderProduct & { quantity: number }

type OrderStore = {
  items: OrderItem[]
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
      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id)

          if (!existing) {
            return { items: [...state.items, { ...product, quantity: 1 }] }
          }

          return {
            items: state.items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          }
        }),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.id === id ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        })),
    }),
    {
      name: "matcha-yuk-order",
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
      merge: (persisted, current) => {
        if (
          typeof persisted !== "object" ||
          persisted === null ||
          !("items" in persisted) ||
          !Array.isArray(persisted.items)
        )
          return current

        // shortcut: saved prices can age; verify them against Prisma before live payment.
        return {
          ...current,
          items: persisted.items.filter(isOrderItem),
        }
      },
    }
  )
)
