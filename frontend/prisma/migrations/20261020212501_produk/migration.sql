/*
  Warnings:

  - You are about to drop the column `authorId` on the `Produk` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Produk` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Produk` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `Produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `judul` to the `Produk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Produk` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Produk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "desk" TEXT,
    "judul" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Produk_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Produk" ("desk", "id", "name", "published") SELECT "desk", "id", "name", "published" FROM "Produk";
DROP TABLE "Produk";
ALTER TABLE "new_Produk" RENAME TO "Produk";
CREATE UNIQUE INDEX "Produk_name_key" ON "Produk"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
