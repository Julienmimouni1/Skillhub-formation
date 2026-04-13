-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "department_id" INTEGER NOT NULL,
    "legal_entity" TEXT,
    "division" TEXT,
    "year" INTEGER NOT NULL DEFAULT 2025,
    "amount" DECIMAL NOT NULL DEFAULT 0.00,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "BudgetLine_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
