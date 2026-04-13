-- CreateTable
CREATE TABLE "PracticeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plan_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "skill_index" INTEGER,
    "mood" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticeLog_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "ApplicationPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
