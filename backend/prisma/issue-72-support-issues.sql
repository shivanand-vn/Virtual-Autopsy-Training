-- ============================================================
-- Issue #72 — Support Issue Backend Integration
-- Database Change Script (PostgreSQL / Supabase)
--
-- Objects created:
--   1. Enum:  "SupportIssueStatus"  (PENDING, SOLVED)
--   2. Table: "support_issues"       (9 columns + PK)
--   3. FK:    support_issues.userId → users.id (CASCADE)
--
-- This script is additive only — no existing tables, columns,
-- enums, or data are modified or dropped.
--
-- Review checklist before executing:
--   [ ] Confirm the "users" table exists with column "id" TEXT
--   [ ] Confirm no "SupportIssueStatus" enum already exists
--   [ ] Confirm no "support_issues" table already exists
--   [ ] Run in a transaction so it can be rolled back on error
-- ============================================================

BEGIN;

-- 1. Create the status enum
CREATE TYPE "SupportIssueStatus" AS ENUM ('PENDING', 'SOLVED');

-- 2. Create the support_issues table
CREATE TABLE "support_issues" (
    "id"               TEXT                  NOT NULL,
    "userId"           TEXT                  NOT NULL,
    "studentName"      TEXT                  NOT NULL,
    "studentEmail"     TEXT                  NOT NULL,
    "category"         TEXT                  NOT NULL,
    "description"      TEXT                  NOT NULL,
    "screenshotBase64" TEXT,
    "status"           "SupportIssueStatus"  NOT NULL DEFAULT 'PENDING',
    "submittedAt"      TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt"       TIMESTAMP(3),

    CONSTRAINT "support_issues_pkey" PRIMARY KEY ("id")
);

-- 3. Add foreign key: userId → users.id with CASCADE delete
ALTER TABLE "support_issues"
    ADD CONSTRAINT "support_issues_userId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES "users"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

COMMIT;
