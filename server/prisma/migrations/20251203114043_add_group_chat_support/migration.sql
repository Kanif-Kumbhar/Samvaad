-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "receiverId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "groupAvatar" TEXT,
ADD COLUMN     "groupName" TEXT,
ADD COLUMN     "isGroup" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "participants" ADD COLUMN     "role" "ParticipantRole" NOT NULL DEFAULT 'MEMBER';

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
