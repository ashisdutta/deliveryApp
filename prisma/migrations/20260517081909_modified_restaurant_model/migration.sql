-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "badge" TEXT NOT NULL DEFAULT 'Brunch fave',
ADD COLUMN     "eta" TEXT NOT NULL DEFAULT '25-35 min',
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "offer" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.0;
