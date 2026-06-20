-- CreateEnum
CREATE TYPE "ModerationActor" AS ENUM ('ai', 'human');

-- CreateTable
CREATE TABLE "moderation_logs" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "decision" "ReviewStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "decidedBy" "ModerationActor" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "moderation_logs" ADD CONSTRAINT "moderation_logs_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
