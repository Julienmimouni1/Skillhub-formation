-- AlterTable
ALTER TABLE "ApplicationPlan" ADD COLUMN "blockers" TEXT;
ALTER TABLE "ApplicationPlan" ADD COLUMN "confidence_level" INTEGER;
ALTER TABLE "ApplicationPlan" ADD COLUMN "impact_rating" INTEGER;
ALTER TABLE "ApplicationPlan" ADD COLUMN "key_takeaways" TEXT;
ALTER TABLE "ApplicationPlan" ADD COLUMN "scheduled_review_date" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActionItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plan_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "deadline" DATETIME,
    "priority" TEXT DEFAULT 'MEDIUM',
    "resources_needed" TEXT,
    "outcome" TEXT,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ActionItem_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "ApplicationPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActionItem" ("created_at", "deadline", "id", "plan_id", "status", "title", "updated_at") SELECT "created_at", "deadline", "id", "plan_id", "status", "title", "updated_at" FROM "ActionItem";
DROP TABLE "ActionItem";
ALTER TABLE "new_ActionItem" RENAME TO "ActionItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
