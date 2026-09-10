-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ENROLLED', 'ON_LEAVE', 'GRADUATED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED', 'STUDYING', 'ENTREPRENEUR', 'JOB_SEEKING', 'OTHER');

-- CreateTable
CREATE TABLE "student_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "student_id" VARCHAR(50) NOT NULL,
    "title_th" VARCHAR(50) NOT NULL,
    "title_en" VARCHAR(50) NOT NULL,
    "first_name_th" VARCHAR(100) NOT NULL,
    "last_name_th" VARCHAR(100) NOT NULL,
    "first_name_en" VARCHAR(100) NOT NULL,
    "last_name_en" VARCHAR(100) NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "nationality" VARCHAR(100) NOT NULL DEFAULT 'ไทย',
    "ethnicity" VARCHAR(100) NOT NULL DEFAULT 'ไทย',
    "religion" VARCHAR(100),
    "domicile_region" VARCHAR(100),
    "curriculum_id" UUID NOT NULL,
    "degree_level" "DegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "admission_year" INTEGER NOT NULL,
    "current_year" INTEGER NOT NULL DEFAULT 1,
    "status" "StudentStatus" NOT NULL DEFAULT 'ENROLLED',
    "email" VARCHAR(255),
    "phone_number" VARCHAR(50),
    "avatar_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "student_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alumni_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "student_profile_id" UUID,
    "student_id" VARCHAR(50) NOT NULL,
    "title_th" VARCHAR(50) NOT NULL,
    "title_en" VARCHAR(50) NOT NULL,
    "first_name_th" VARCHAR(100) NOT NULL,
    "last_name_th" VARCHAR(100) NOT NULL,
    "first_name_en" VARCHAR(100) NOT NULL,
    "last_name_en" VARCHAR(100) NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "curriculum_id" UUID NOT NULL,
    "degree_level" "DegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "graduation_year" INTEGER NOT NULL,
    "generation" INTEGER,
    "gpa" DOUBLE PRECISION,
    "employment_status" "EmploymentStatus" NOT NULL DEFAULT 'EMPLOYED',
    "job_title" VARCHAR(255),
    "company" VARCHAR(255),
    "industry" VARCHAR(150),
    "salary_range" VARCHAR(100),
    "email" VARCHAR(255),
    "phone_number" VARCHAR(50),
    "linkedin_url" VARCHAR(500),
    "avatar_url" VARCHAR(500),
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_story_th" TEXT,
    "featured_story_en" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "alumni_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_profiles_tenant_id_status_idx" ON "student_profiles"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "student_profiles_tenant_id_gender_idx" ON "student_profiles"("tenant_id", "gender");

-- CreateIndex
CREATE INDEX "student_profiles_tenant_id_nationality_idx" ON "student_profiles"("tenant_id", "nationality");

-- CreateIndex
CREATE INDEX "student_profiles_tenant_id_admission_year_idx" ON "student_profiles"("tenant_id", "admission_year");

-- CreateIndex
CREATE INDEX "student_profiles_curriculum_id_idx" ON "student_profiles"("curriculum_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_profiles_tenant_id_student_id_key" ON "student_profiles"("tenant_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "alumni_profiles_student_profile_id_key" ON "alumni_profiles"("student_profile_id");

-- CreateIndex
CREATE INDEX "alumni_profiles_tenant_id_graduation_year_idx" ON "alumni_profiles"("tenant_id", "graduation_year");

-- CreateIndex
CREATE INDEX "alumni_profiles_tenant_id_employment_status_idx" ON "alumni_profiles"("tenant_id", "employment_status");

-- CreateIndex
CREATE INDEX "alumni_profiles_tenant_id_is_featured_idx" ON "alumni_profiles"("tenant_id", "is_featured");

-- CreateIndex
CREATE INDEX "alumni_profiles_curriculum_id_idx" ON "alumni_profiles"("curriculum_id");

-- CreateIndex
CREATE UNIQUE INDEX "alumni_profiles_tenant_id_student_id_key" ON "alumni_profiles"("tenant_id", "student_id");

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumni_profiles" ADD CONSTRAINT "alumni_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumni_profiles" ADD CONSTRAINT "alumni_profiles_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alumni_profiles" ADD CONSTRAINT "alumni_profiles_student_profile_id_fkey" FOREIGN KEY ("student_profile_id") REFERENCES "student_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
