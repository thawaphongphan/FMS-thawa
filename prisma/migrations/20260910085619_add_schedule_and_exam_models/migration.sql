-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('MIDTERM', 'FINAL');

-- CreateTable
CREATE TABLE "academic_terms" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "term" INTEGER NOT NULL,
    "name_th" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "academic_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_schedules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "section" VARCHAR(50) NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "room" VARCHAR(100) NOT NULL,
    "building" VARCHAR(100),
    "instructor_id" UUID,
    "instructor_name" VARCHAR(255),
    "curriculum_id" UUID,
    "target_year" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_schedules" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "term_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "section" VARCHAR(50) NOT NULL DEFAULT 'ทุกกลุ่ม',
    "exam_type" "ExamType" NOT NULL,
    "exam_date" DATE NOT NULL,
    "start_time" VARCHAR(10) NOT NULL,
    "end_time" VARCHAR(10) NOT NULL,
    "room" VARCHAR(100) NOT NULL,
    "seat_range" VARCHAR(100),
    "invigilator_id" UUID,
    "invigilator_name" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "exam_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academic_terms_tenant_id_is_current_idx" ON "academic_terms"("tenant_id", "is_current");

-- CreateIndex
CREATE UNIQUE INDEX "academic_terms_tenant_id_year_term_key" ON "academic_terms"("tenant_id", "year", "term");

-- CreateIndex
CREATE INDEX "class_schedules_tenant_id_term_id_idx" ON "class_schedules"("tenant_id", "term_id");

-- CreateIndex
CREATE INDEX "class_schedules_course_id_idx" ON "class_schedules"("course_id");

-- CreateIndex
CREATE INDEX "class_schedules_instructor_id_idx" ON "class_schedules"("instructor_id");

-- CreateIndex
CREATE INDEX "class_schedules_curriculum_id_idx" ON "class_schedules"("curriculum_id");

-- CreateIndex
CREATE INDEX "exam_schedules_tenant_id_term_id_exam_type_idx" ON "exam_schedules"("tenant_id", "term_id", "exam_type");

-- CreateIndex
CREATE INDEX "exam_schedules_course_id_idx" ON "exam_schedules"("course_id");

-- CreateIndex
CREATE INDEX "exam_schedules_invigilator_id_idx" ON "exam_schedules"("invigilator_id");

-- AddForeignKey
ALTER TABLE "academic_terms" ADD CONSTRAINT "academic_terms_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "academic_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "staff_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "academic_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_invigilator_id_fkey" FOREIGN KEY ("invigilator_id") REFERENCES "staff_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
