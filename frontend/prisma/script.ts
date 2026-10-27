import type {
  CategoryCreateManyInput,
  ProdukCreateManyInput,
} from "@/generated/prisma/models"
import { prisma } from "../lib/prisma/prisma"

async function main() {
  const categories: CategoryCreateManyInput[] = [
    { name: "Signature", slug: "signature", sortOrder: 1 },
    { name: "Milk Tea", slug: "milk-tea", sortOrder: 2 },
    { name: "Non-Coffee", slug: "non-coffee", sortOrder: 3 },
    { name: "Topping", slug: "topping", sortOrder: 4 },
    { name: "Original", slug: "original", sortOrder: 4 },
  ]

  const produk: (Omit<ProdukCreateManyInput, "categoryId"> & {
    category: string
  })[] = [
    {
      judul: "List Menu",
      name: "Brown Sugar Signature",
      price: 18000,
      category: "signature",
      desk: "Teh susu lembut dengan gula aren yang memberi rasa manis karamel khas.",
      imgUrl: "/assets/images/screen1.png",
    },

    {
      judul: "List Menu",
      name: "Mactha",
      desk: "Minuman matcha dengan rasa teh hijau khas yang lembut dan menyegarkan.",
      price: 15000,
      category: "milk-tea",
      imgUrl: "/assets/images/screen2.png",
    },

    {
      judul: "List Menu",
      name: "Original Tea",
      price: 16000,
      category: "original",
      desk: "Teh original dengan aroma harum dan rasa ringan yang menyegarkan.",
      imgUrl: "/assets/images/screen3.png",
    },

    {
      judul: "List Menu",
      name: "Matcha Latte",
      desk: "Matcha berpadu dengan susu lembut, menghasilkan rasa teh hijau yang creamy.",
      price: 17000,
      category: "non-coffee",
      imgUrl: "/assets/images/screen4.png",
    },

    {
      judul: "List Menu",
      name: "Thai Tea",
      desk: "Teh Thailand beraroma rempah dengan perpaduan susu dan rasa manis seimbang.",
      price: 18000,
      category: "milk-tea",
      imgUrl: "/assets/images/screen2.png",
    },

    {
      judul: "List Menu",
      name: "Taro Milk Tea",
      desk: "Taro berpadu dengan susu dalam minuman creamy dengan rasa manis lembut.",
      price: 18000,
      category: "milk-tea",
      imgUrl: "/assets/images/screen2.png",
    },
  ]
  // Create a new user with a post

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
      },
      create: category,
    })
  }

  const allCategories = await prisma.category.findMany()
  const categoryIdBySlug = new Map(allCategories.map((c) => [c.slug, c.id]))

  for (const product of produk) {
    const categoryId = categoryIdBySlug.get(product.category)

    if (!categoryId) {
      throw new Error(`Category not found: ${product.category}`)
    }

    const { category, ...data } = product

    await prisma.produk.upsert({
      where: { name: product.name },
      update: { desk: data.desk },
      create: {
        ...data,
        categoryId,
      },
    })
  }
  console.log("Seed Berhasil:", {
    categories: await prisma.category.count(),
    product: await prisma.produk.count(),
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
