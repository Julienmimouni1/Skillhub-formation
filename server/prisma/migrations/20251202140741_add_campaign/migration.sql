-- CreateTable
CREATE TABLE "Campaign" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "budget_target" DECIMAL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrainingRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "user_id" INTEGER NOT NULL,
    "manager_id" INTEGER,
    "department_id" INTEGER NOT NULL,
    "provider_id" INTEGER,
    "cost" DECIMAL NOT NULL,
    "cost_type" TEXT NOT NULL DEFAULT 'HT',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "type" TEXT NOT NULL DEFAULT 'PLAN_DEV',
    "start_date" DATETIME,
    "end_date" DATETIME,
    "actual_start_date" DATETIME,
    "actual_end_date" DATETIME,
    "duration_days" DECIMAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "campaign_id" INTEGER,
    CONSTRAINT "TrainingRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingRequest_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TrainingRequest_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TrainingRequest_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TrainingRequest_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TrainingRequest" ("actual_end_date", "actual_start_date", "cost", "cost_type", "created_at", "department_id", "description", "duration_days", "end_date", "id", "manager_id", "provider_id", "start_date", "status", "title", "type", "updated_at", "user_id") SELECT "actual_end_date", "actual_start_date", "cost", "cost_type", "created_at", "department_id", "description", "duration_days", "end_date", "id", "manager_id", "provider_id", "start_date", "status", "title", "type", "updated_at", "user_id" FROM "TrainingRequest";
DROP TABLE "TrainingRequest";
ALTER TABLE "new_TrainingRequest" RENAME TO "TrainingRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
