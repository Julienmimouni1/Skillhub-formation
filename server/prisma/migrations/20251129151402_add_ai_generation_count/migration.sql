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
    "scheduled_review_date" DATETIME,
    "blockers" TEXT,
    "ai_generation_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ApplicationPlan_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "TrainingRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ApplicationPlan" ("blockers", "confidence_level", "created_at", "feedback", "id", "impact_rating", "key_takeaways", "progress", "request_id", "scheduled_review_date", "updated_at") SELECT "blockers", "confidence_level", "created_at", "feedback", "id", "impact_rating", "key_takeaways", "progress", "request_id", "scheduled_review_date", "updated_at" FROM "ApplicationPlan";
DROP TABLE "ApplicationPlan";
ALTER TABLE "new_ApplicationPlan" RENAME TO "ApplicationPlan";
CREATE UNIQUE INDEX "ApplicationPlan_request_id_key" ON "ApplicationPlan"("request_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
