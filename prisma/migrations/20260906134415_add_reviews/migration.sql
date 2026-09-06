-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "AiTriageStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'WON', 'LOST', 'INVOICED', 'PAID');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "aiSummary" TEXT,
    "aiEstimateLow" DOUBLE PRECISION,
    "aiEstimateHigh" DOUBLE PRECISION,
    "aiDraftProposal" TEXT,
    "aiTriageStatus" "AiTriageStatus" NOT NULL DEFAULT 'PENDING',
    "ipHash" TEXT,
    "turnstileVerified" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailedQuote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "quoteNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "projectAddress" TEXT,
    "projectType" TEXT NOT NULL DEFAULT 'General Tiling',
    "scopeDescription" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "areaM2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wastagePercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "tileLengthMm" DOUBLE PRECISION DEFAULT 600,
    "tileWidthMm" DOUBLE PRECISION DEFAULT 600,
    "tileThicknessMm" DOUBLE PRECISION DEFAULT 10,
    "groutJointMm" DOUBLE PRECISION DEFAULT 2,
    "trowelSizeMm" DOUBLE PRECISION DEFAULT 10,
    "isWetArea" BOOLEAN NOT NULL DEFAULT false,
    "tilesNeededM2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tilesBoxCount" INTEGER DEFAULT 0,
    "adhesiveBags" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "groutKg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "siliconeTubes" INTEGER NOT NULL DEFAULT 0,
    "waterproofingLitres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "primerLitres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clipsCount" INTEGER NOT NULL DEFAULT 0,
    "materialCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "labourDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "labourDayRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "labourCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "markupPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "profitMarginPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossProfit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotalExGst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalIncGst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "proposalText" TEXT,
    "depositRequired" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DetailedQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'MATERIAL',
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'item',
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetTransaction" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT,
    "type" "TransactionType" NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "amount" DOUBLE PRECISION NOT NULL,
    "gstAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isTaxDeductible" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,
    "paymentMethod" TEXT DEFAULT 'BANK_TRANSFER',
    "isPersonal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adhesiveCoveragePerBag" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "adhesiveBagCost" DOUBLE PRECISION NOT NULL DEFAULT 35.0,
    "groutCostPerKg" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
    "siliconeCostPerTube" DOUBLE PRECISION NOT NULL DEFAULT 18.0,
    "waterproofingCostPerLitre" DOUBLE PRECISION NOT NULL DEFAULT 22.0,
    "defaultDayRate" DOUBLE PRECISION NOT NULL DEFAULT 650.0,
    "defaultWastagePercent" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL,
    "intent" TEXT NOT NULL DEFAULT 'call',
    "referrer" TEXT,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "starRating" INTEGER NOT NULL,
    "reviewText" TEXT NOT NULL,
    "projectType" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DetailedQuote_quoteNumber_key" ON "DetailedQuote"("quoteNumber");

-- CreateIndex
CREATE INDEX "DetailedQuote_status_idx" ON "DetailedQuote"("status");

-- CreateIndex
CREATE INDEX "DetailedQuote_createdAt_idx" ON "DetailedQuote"("createdAt");

-- CreateIndex
CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");

-- CreateIndex
CREATE INDEX "BudgetTransaction_type_idx" ON "BudgetTransaction"("type");

-- CreateIndex
CREATE INDEX "BudgetTransaction_category_idx" ON "BudgetTransaction"("category");

-- CreateIndex
CREATE INDEX "BudgetTransaction_date_idx" ON "BudgetTransaction"("date");

-- CreateIndex
CREATE INDEX "BudgetTransaction_quoteId_idx" ON "BudgetTransaction"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialPreset_name_key" ON "MaterialPreset"("name");

-- CreateIndex
CREATE INDEX "CallLog_createdAt_idx" ON "CallLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- AddForeignKey
ALTER TABLE "DetailedQuote" ADD CONSTRAINT "DetailedQuote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "DetailedQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetTransaction" ADD CONSTRAINT "BudgetTransaction_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "DetailedQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
