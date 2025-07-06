-- CreateTable
CREATE TABLE "GoogleSheetConnection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "formType" TEXT NOT NULL,
    "lastSync" TIMESTAMP(3),
    "autoSync" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'connected',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleSheetConnection_pkey" PRIMARY KEY ("id")
);
