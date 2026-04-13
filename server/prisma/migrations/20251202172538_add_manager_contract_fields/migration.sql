-- AlterTable
ALTER TABLE "ApplicationPlan" ADD COLUMN "manager_review_comment" TEXT;
ALTER TABLE "ApplicationPlan" ADD COLUMN "manager_reviewed_at" DATETIME;

-- AlterTable
ALTER TABLE "TrainingRequest" ADD COLUMN "manager_expectations" TEXT;
