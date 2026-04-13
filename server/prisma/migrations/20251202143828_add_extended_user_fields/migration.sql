-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'collaborateur',
    "department_id" INTEGER,
    "manager_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "employee_id" TEXT,
    "legal_entity" TEXT,
    "division" TEXT,
    "birth_date" DATETIME,
    "job_title" TEXT,
    "assigned_rh_id" INTEGER,
    CONSTRAINT "User_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_assigned_rh_id_fkey" FOREIGN KEY ("assigned_rh_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("created_at", "department_id", "email", "first_name", "id", "is_active", "last_name", "manager_id", "password_hash", "role", "updated_at") SELECT "created_at", "department_id", "email", "first_name", "id", "is_active", "last_name", "manager_id", "password_hash", "role", "updated_at" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_employee_id_key" ON "User"("employee_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
