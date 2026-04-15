/*
  Warnings:

  - The values [EDITOR,READER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.

*/
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "UserRole_new"
  USING (
    CASE
      WHEN "role" = 'ADMIN' THEN 'ADMIN'::"UserRole_new"
      ELSE 'USER'::"UserRole_new"
    END
  );
ALTER TABLE "ProjectUser"
  ALTER COLUMN "role" TYPE "UserRole_new"
  USING (
    CASE
      WHEN "role" = 'ADMIN' THEN 'ADMIN'::"UserRole_new"
      ELSE 'USER'::"UserRole_new"
    END
  );
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";