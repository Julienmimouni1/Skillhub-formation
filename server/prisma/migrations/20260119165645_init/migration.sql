-- AlterTable
ALTER TABLE "User" ADD COLUMN "last_annual_review" DATETIME;

-- CreateTable
CREATE TABLE "AnnualReview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "manager_id" INTEGER,
    "review_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "previous_goals_summary" TEXT,
    "new_goals" TEXT,
    "competencies_review" TEXT,
    "collaborator_comment" TEXT,
    "manager_comment" TEXT,
    "rh_comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "AnnualReview_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AnnualReview_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserSkill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "UserSkill_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserSkill_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "Skill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CourseToSkills" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CourseToSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "Skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CourseToSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "TrainingCourse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrainingRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "objectives" TEXT,
    "prerequisites" TEXT,
    "user_id" INTEGER NOT NULL,
    "manager_id" INTEGER,
    "department_id" INTEGER NOT NULL,
    "provider_id" INTEGER,
    "course_id" INTEGER,
    "cost" DECIMAL NOT NULL,
    "cost_type" TEXT NOT NULL DEFAULT 'HT',
    "funding_type" TEXT NOT NULL DEFAULT 'COMPANY',
    "co_funding_company_amount" DECIMAL,
    "co_funding_personal_amount" DECIMAL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "type" TEXT NOT NULL DEFAULT 'PLAN_DEV',
    "start_date" DATETIME,
    "end_date" DATETIME,
    "actual_start_date" DATETIME,
    "actual_end_date" DATETIME,
    "availability_period" TEXT,
    "duration_days" DECIMAL,
    "priority" TEXT,
    "personal_investment" TEXT,
    "manager_expectations" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "campaign_id" INTEGER,
    CONSTRAINT "TrainingRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingRequest_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TrainingRequest_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingRequest_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TrainingRequest_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "TrainingCourse" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TrainingRequest_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TrainingRequest" ("actual_end_date", "actual_start_date", "availability_period", "campaign_id", "co_funding_company_amount", "co_funding_personal_amount", "cost", "cost_type", "created_at", "department_id", "description", "duration_days", "end_date", "funding_type", "id", "manager_expectations", "manager_id", "objectives", "prerequisites", "provider_id", "start_date", "status", "title", "type", "updated_at", "user_id") SELECT "actual_end_date", "actual_start_date", "availability_period", "campaign_id", "co_funding_company_amount", "co_funding_personal_amount", "cost", "cost_type", "created_at", "department_id", "description", "duration_days", "end_date", "funding_type", "id", "manager_expectations", "manager_id", "objectives", "prerequisites", "provider_id", "start_date", "status", "title", "type", "updated_at", "user_id" FROM "TrainingRequest";
DROP TABLE "TrainingRequest";
ALTER TABLE "new_TrainingRequest" RENAME TO "TrainingRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "AnnualReview_user_id_year_key" ON "AnnualReview"("user_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkill_user_id_skill_id_key" ON "UserSkill"("user_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "_CourseToSkills_AB_unique" ON "_CourseToSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_CourseToSkills_B_index" ON "_CourseToSkills"("B");
