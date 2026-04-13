-- CreateTable
CREATE TABLE "ApplicationPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "request_id" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "feedback" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ApplicationPlan_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "TrainingRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "plan_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "deadline" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ActionItem_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "ApplicationPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationPlan_request_id_key" ON "ApplicationPlan"("request_id");
