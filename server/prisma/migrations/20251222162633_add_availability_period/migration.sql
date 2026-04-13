-- AlterTable
ALTER TABLE "TrainingRequest" ADD COLUMN "availability_period" TEXT;
ALTER TABLE "TrainingRequest" ADD COLUMN "objectives" TEXT;
ALTER TABLE "TrainingRequest" ADD COLUMN "prerequisites" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "contract_type" TEXT;
ALTER TABLE "User" ADD COLUMN "gender" TEXT;
ALTER TABLE "User" ADD COLUMN "hired_at" DATETIME;
ALTER TABLE "User" ADD COLUMN "job_category" TEXT;
ALTER TABLE "User" ADD COLUMN "last_professional_interview" DATETIME;

-- CreateTable
CREATE TABLE "TrainingProposal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "user_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingProposal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingProposalVote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "proposal_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingProposalVote_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "TrainingProposal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingProposalVote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserCertification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "issuing_org" TEXT,
    "obtained_at" DATETIME NOT NULL,
    "expires_at" DATETIME,
    "document_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "UserCertification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApplicationPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "request_id" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "key_takeaways" TEXT,
    "confidence_level" INTEGER,
    "impact_rating" INTEGER,
    "impact_score" INTEGER NOT NULL DEFAULT 0,
    "scheduled_review_date" DATETIME,
    "application_rate" INTEGER,
    "behavior_changes" TEXT,
    "kpis" TEXT,
    "roi_qualitative" TEXT,
    "blockers" TEXT,
    "ai_generation_count" INTEGER NOT NULL DEFAULT 0,
    "manager_review_comment" TEXT,
    "manager_reviewed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ApplicationPlan_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "TrainingRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ApplicationPlan" ("ai_generation_count", "application_rate", "behavior_changes", "blockers", "confidence_level", "created_at", "feedback", "id", "impact_rating", "key_takeaways", "kpis", "manager_review_comment", "manager_reviewed_at", "progress", "request_id", "roi_qualitative", "scheduled_review_date", "updated_at") SELECT "ai_generation_count", "application_rate", "behavior_changes", "blockers", "confidence_level", "created_at", "feedback", "id", "impact_rating", "key_takeaways", "kpis", "manager_review_comment", "manager_reviewed_at", "progress", "request_id", "roi_qualitative", "scheduled_review_date", "updated_at" FROM "ApplicationPlan";
DROP TABLE "ApplicationPlan";
ALTER TABLE "new_ApplicationPlan" RENAME TO "ApplicationPlan";
CREATE UNIQUE INDEX "ApplicationPlan_request_id_key" ON "ApplicationPlan"("request_id");
CREATE TABLE "new_Document" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "request_id" INTEGER,
    "course_id" INTEGER,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "mimetype" TEXT,
    "file_size_kb" INTEGER,
    "document_type" TEXT NOT NULL,
    "uploaded_by_user_id" INTEGER,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "TrainingRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "TrainingCourse" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Document_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Document" ("document_type", "file_name", "file_path", "file_size_kb", "id", "mimetype", "request_id", "uploaded_at", "uploaded_by_user_id") SELECT "document_type", "file_name", "file_path", "file_size_kb", "id", "mimetype", "request_id", "uploaded_at", "uploaded_by_user_id" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE TABLE "new_TrainingCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "external_id" TEXT NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "prerequisites" TEXT,
    "target_audience" TEXT,
    "duration_hours" INTEGER,
    "duration_days" DECIMAL,
    "cost" DECIMAL,
    "rncp_code" TEXT,
    "is_cpf_eligible" BOOLEAN NOT NULL DEFAULT false,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "last_synced_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "TrainingCourse_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TrainingCourse" ("cost", "created_at", "description", "duration_days", "duration_hours", "external_id", "id", "is_cpf_eligible", "last_synced_at", "objective", "provider_id", "rncp_code", "target_audience", "title", "updated_at", "url") SELECT "cost", "created_at", "description", "duration_days", "duration_hours", "external_id", "id", "is_cpf_eligible", "last_synced_at", "objective", "provider_id", "rncp_code", "target_audience", "title", "updated_at", "url" FROM "TrainingCourse";
DROP TABLE "TrainingCourse";
ALTER TABLE "new_TrainingCourse" RENAME TO "TrainingCourse";
CREATE UNIQUE INDEX "TrainingCourse_external_id_key" ON "TrainingCourse"("external_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TrainingProposalVote_proposal_id_user_id_key" ON "TrainingProposalVote"("proposal_id", "user_id");
