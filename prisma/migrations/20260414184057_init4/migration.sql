/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `OrderItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "isDeleted";
