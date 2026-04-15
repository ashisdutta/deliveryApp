/*
  Warnings:

  - You are about to drop the column `deliverySnapshot` on the `Order` table. All the data in the column will be lost.
  - Added the required column `subTotal` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAmount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deliverySnapshot",
ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "subTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "taxAmount" DOUBLE PRECISION NOT NULL;
