-- CreateTable
CREATE TABLE "TrainingCourse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "external_id" TEXT NOT NULL,
    "provider_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "target_audience" TEXT,
    "duration_hours" INTEGER,
    "duration_days" DECIMAL,
    "cost" DECIMAL,
    "rncp_code" TEXT,
    "is_cpf_eligible" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "last_synced_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "TrainingCourse_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "Provider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ManagerEvaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "request_id" INTEGER NOT NULL,
    "alignment_strategy" INTEGER NOT NULL,
    "competence_gap" INTEGER NOT NULL,
    "operational_impact" INTEGER NOT NULL,
    "roe_expectation" INTEGER NOT NULL,
    "content_relevance" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ManagerEvaluation_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "TrainingRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingCourse_external_id_key" ON "TrainingCourse"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "ManagerEvaluation_request_id_key" ON "ManagerEvaluation"("request_id");
