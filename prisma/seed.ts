import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  // --- Seed หมวดหมู่ข่าว ---
  const catAcademic = await prisma.articleCategory.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "academic" } },
    update: {},
    create: { tenantId: core.tenantId, code: "academic", nameTh: "ข่าววิชาการและงานวิจัย", nameEn: "Academic & Research", orderIndex: 1 },
  });

  const catActivity = await prisma.articleCategory.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "activity" } },
    update: {},
    create: { tenantId: core.tenantId, code: "activity", nameTh: "กิจกรรมและโครงการ", nameEn: "Activities & Events", orderIndex: 2 },
  });

  const catAdmission = await prisma.articleCategory.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "admission" } },
    update: {},
    create: { tenantId: core.tenantId, code: "admission", nameTh: "การรับสมัครเข้าศึกษา", nameEn: "Admissions", orderIndex: 3 },
  });

  // --- Seed ข่าวประชาสัมพันธ์ ---
  await prisma.article.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "faculty-open-house-2026" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      categoryId: catActivity.id,
      slug: "faculty-open-house-2026",
      titleTh: "ขอเชิญร่วมงานเปิดบ้านวิชาการคณะ ประจำปีการศึกษา 2569 (Faculty Open House 2026)",
      titleEn: "Invitation to the Faculty Open House 2026",
      summaryTh: "เปิดโลกนวัตกรรมและการเรียนรู้ สัมผัสบรรยากาศห้องปฏิบัติการจริง พร้อมพูดคุยกับคณาจารย์และรุ่นพี่",
      summaryEn: "Explore innovation, experience modern laboratories, and meet faculty members and seniors.",
      contentTh: "คณะขอเชิญชวนนักเรียน นักศึกษา ผู้ปกครอง และผู้สนใจเข้าร่วมกิจกรรมเปิดบ้านวิชาการ เพื่อแนะนำหลักสูตรใหม่ด้านปัญญาประดิษฐ์และวิศวกรรมซอฟต์แวร์ ภายในงานมีกิจกรรม Workshop เสริมสร้างทักษะดิจิทัล และการประกวดโครงงานนวัตกรรมชิงทุนการศึกษา",
      contentEn: "The Faculty warmly invites prospective students and parents to our Open House, featuring presentations of our new AI and Software Engineering programs, interactive workshops, and project showcases.",
      coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      pinned: true,
      publishedAt: new Date(),
    },
  });

  await prisma.article.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "tcas-round-1-portfolio-2026" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      categoryId: catAdmission.id,
      slug: "tcas-round-1-portfolio-2026",
      titleTh: "เปิดรับสมัครนักศึกษาใหม่ระดับปริญญาตรี ประจำปี 2569 รอบ TCAS 1 Portfolio",
      titleEn: "Undergraduate Admission Open for Academic Year 2026 (TCAS Round 1 Portfolio)",
      summaryTh: "ยื่นแฟ้มสะสมผลงานเพื่อรับการคัดเลือกเข้าศึกษาต่อในหลักสูตรระดับปริญญาตรีทุกสาขาวิชา",
      summaryEn: "Submit your portfolio for admission into undergraduate programs across all departments.",
      contentTh: "ประกาศรับสมัครบุคคลเข้าศึกษาต่อระดับปริญญาตรี ประจำปีการศึกษา 2569 ผู้สมัครสามารถตรวจสอบคุณสมบัติเฉพาะสาขา และดาวน์โหลดเกณฑ์การพิจารณาแฟ้มสะสมผลงานได้แล้วตั้งแต่วันนี้ผ่านระบบรับสมัครออนไลน์",
      contentEn: "Applications are now open for undergraduate admission for Academic Year 2026. Prospective students can check program requirements and submit portfolios through our portal.",
      coverImageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      pinned: true,
      publishedAt: new Date(),
    },
  });

  await prisma.article.upsert({
    where: { tenantId_slug: { tenantId: core.tenantId, slug: "national-research-award-2026" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      categoryId: catAcademic.id,
      slug: "national-research-award-2026",
      titleTh: "ขอแสดงความยินดีกับคณาจารย์คณะที่ได้รับรางวัลนักวิจัยดีเด่น ประจำปี 2569",
      titleEn: "Congratulations to Faculty Members Receiving the 2026 National Outstanding Researcher Awards",
      summaryTh: "ผลงานวิจัยด้านระบบการแพทย์อัจฉริยะและการเกษตรแม่นยำสูงได้รับรางวัลเชิดชูเกียรติระดับประเทศ",
      summaryEn: "Research contributions in Smart Healthcare and Precision Agriculture have been recognized nationally.",
      contentTh: "คณะขอแสดงความยินดีอย่างยิ่งกับทีมวิจัยที่ได้รับรางวัลเชิดชูเกียรติระดับชาติ จากการคิดค้นและพัฒนานวัตกรรมแพลตฟอร์มปัญญาประดิษฐ์เพื่อช่วยการวินิจฉัยทางการแพทย์ ซึ่งสร้างผลกระทบเชิงบวกอย่างสูงแก่สังคมไทย",
      contentEn: "We celebrate our research team for receiving prestigious national accolades for their breakthrough AI medical diagnosis system, delivering significant positive social impact.",
      coverImageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      pinned: false,
      publishedAt: new Date(),
    },
  });

  // --- Seed ภาควิชา ---
  const deptCS = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "CS" } },
    update: {},
    create: { tenantId: core.tenantId, code: "CS", nameTh: "ภาควิชาวิทยาการคอมพิวเตอร์", nameEn: "Department of Computer Science", orderIndex: 1 },
  });

  const deptSE = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "SE" } },
    update: {},
    create: { tenantId: core.tenantId, code: "SE", nameTh: "ภาควิชาวิศวกรรมซอฟต์แวร์", nameEn: "Department of Software Engineering", orderIndex: 2 },
  });

  const deptDS = await prisma.department.upsert({
    where: { tenantId_code: { tenantId: core.tenantId, code: "DS" } },
    update: {},
    create: { tenantId: core.tenantId, code: "DS", nameTh: "ภาควิชาวิทยาการข้อมูลและปัญญาประดิษฐ์", nameEn: "Department of Data Science & AI", orderIndex: 3 },
  });

  // --- Seed บุคลากรและคณาจารย์ ---
  const staff1 = await prisma.staffProfile.findFirst({ where: { tenantId: core.tenantId, email: "dean@app.local" } });
  if (!staff1) {
    await prisma.staffProfile.create({
      data: {
        tenantId: core.tenantId,
        departmentId: deptCS.id,
        academicTitleTh: "ศ.ดร.",
        academicTitleEn: "Prof. Dr.",
        firstNameTh: "สมชาย",
        lastNameTh: "นพคุณ",
        firstNameEn: "Somchai",
        lastNameEn: "Noppakun",
        email: "dean@app.local",
        phoneNumber: "02-123-4501",
        officeRoom: "ตึก 1 ห้อง 401",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        adminPositionTh: "คณบดี",
        adminPositionEn: "Dean",
        bioTh: "ผู้เชี่ยวชาญด้านปัญญาประดิษฐ์ สถาปัตยกรรมระบบคลาวด์ และผู้นำการปฏิวัติดิจิทัลในสถาบันอุดมศึกษา",
        bioEn: "Expert in Artificial Intelligence, Cloud Architectures, and higher education digital transformation.",
        researchInterests: ["Artificial Intelligence", "Cloud Computing", "Distributed Systems"],
        educationHistory: [
          { degree: "Ph.D. in Computer Science", field: "AI & Machine Learning", institution: "Stanford University", year: "2010" },
          { degree: "M.S. in Computer Science", field: "Computer Engineering", institution: "Chulalongkorn University", year: "2005" },
        ],
        orderIndex: 1,
        status: "ACTIVE",
      },
    });
  }

  const staff2 = await prisma.staffProfile.findFirst({ where: { tenantId: core.tenantId, email: "vipada@app.local" } });
  if (!staff2) {
    await prisma.staffProfile.create({
      data: {
        tenantId: core.tenantId,
        departmentId: deptSE.id,
        academicTitleTh: "รศ.ดร.",
        academicTitleEn: "Assoc. Prof. Dr.",
        firstNameTh: "วิภาดา",
        lastNameTh: "วรรณศิลป์",
        firstNameEn: "Vipada",
        lastNameEn: "Wannasin",
        email: "vipada@app.local",
        phoneNumber: "02-123-4502",
        officeRoom: "ตึก 2 ห้อง 305",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        adminPositionTh: "รองคณบดีฝ่ายวิชาการ",
        adminPositionEn: "Associate Dean for Academic Affairs",
        bioTh: "นักวิจัยด้านวิศวกรรมซอฟต์แวร์ขั้นสูง สถาปัตยกรรม Microservices และกระบวนการพัฒนาซอฟต์แวร์แบบ Agile",
        bioEn: "Specialist in Advanced Software Engineering, Microservices Architecture, and Agile Methodologies.",
        researchInterests: ["Software Architecture", "Agile & DevOps", "Design Patterns"],
        educationHistory: [
          { degree: "Ph.D. in Software Engineering", field: "Software Systems", institution: "Imperial College London", year: "2014" },
          { degree: "B.Sc. in Computer Science", field: "Software Development", institution: "Mahidol University", year: "2008" },
        ],
        orderIndex: 2,
        status: "ACTIVE",
      },
    });
  }

  const staff3 = await prisma.staffProfile.findFirst({ where: { tenantId: core.tenantId, email: "thanapol@app.local" } });
  if (!staff3) {
    await prisma.staffProfile.create({
      data: {
        tenantId: core.tenantId,
        departmentId: deptDS.id,
        academicTitleTh: "ผศ.ดร.",
        academicTitleEn: "Asst. Prof. Dr.",
        firstNameTh: "ธนพล",
        lastNameTh: "รุ่งเรือง",
        firstNameEn: "Thanapol",
        lastNameEn: "Rungruang",
        email: "thanapol@app.local",
        phoneNumber: "02-123-4503",
        officeRoom: "ตึก 3 ห้อง 210",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        adminPositionTh: "หัวหน้าภาควิชาวิทยาการข้อมูล",
        adminPositionEn: "Head of Data Science Department",
        bioTh: "เชี่ยวชาญด้าน Big Data Analytics, Deep Learning และการประยุกต์ใช้โมเดลภาษาขนาดใหญ่ (LLMs)",
        bioEn: "Specialized in Big Data Analytics, Deep Learning, and Large Language Model applications.",
        researchInterests: ["Data Science", "Deep Learning", "Natural Language Processing"],
        educationHistory: [
          { degree: "Ph.D. in Data Science", field: "Machine Learning", institution: "University of Melbourne", year: "2018" },
        ],
        orderIndex: 3,
        status: "ACTIVE",
      },
    });
  }

  // --- Seed หลักสูตรการศึกษา ---
  await prisma.curriculum.upsert({
    where: { tenantId_programCode_revisedYear: { tenantId: core.tenantId, programCode: "CS-2569", revisedYear: 2569 } },
    update: {},
    create: {
      tenantId: core.tenantId,
      degreeLevel: "BACHELOR",
      programCode: "CS-2569",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Bachelor of Science Program in Computer Science",
      degreeTitleTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์) / วท.บ. (วิทยาการคอมพิวเตอร์)",
      degreeTitleEn: "Bachelor of Science (Computer Science) / B.Sc. (Computer Science)",
      totalCredits: 130,
      durationYears: 4,
      revisedYear: 2569,
      brochureUrl: "https://example.com/curriculum/cs-2569.pdf",
      isActive: true,
    },
  });

  await prisma.curriculum.upsert({
    where: { tenantId_programCode_revisedYear: { tenantId: core.tenantId, programCode: "SE-2568", revisedYear: 2568 } },
    update: {},
    create: {
      tenantId: core.tenantId,
      degreeLevel: "BACHELOR",
      programCode: "SE-2568",
      nameTh: "หลักสูตรวิศวกรรมศาสตรบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์",
      nameEn: "Bachelor of Engineering Program in Software Engineering",
      degreeTitleTh: "วิศวกรรมศาสตรบัณฑิต (วิศวกรรมซอฟต์แวร์) / วศ.บ. (วิศวกรรมซอฟต์แวร์)",
      degreeTitleEn: "Bachelor of Engineering (Software Engineering) / B.Eng. (Software Engineering)",
      totalCredits: 136,
      durationYears: 4,
      revisedYear: 2568,
      brochureUrl: "https://example.com/curriculum/se-2568.pdf",
      isActive: true,
    },
  });

  await prisma.curriculum.upsert({
    where: { tenantId_programCode_revisedYear: { tenantId: core.tenantId, programCode: "AI-2569", revisedYear: 2569 } },
    update: {},
    create: {
      tenantId: core.tenantId,
      degreeLevel: "MASTER",
      programCode: "AI-2569",
      nameTh: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาปัญญาประดิษฐ์และวิทยาการข้อมูล",
      nameEn: "Master of Science Program in Artificial Intelligence and Data Science",
      degreeTitleTh: "วิทยาศาสตรมหาบัณฑิต (ปัญญาประดิษฐ์และวิทยาการข้อมูล) / วท.ม. (ปัญญาประดิษฐ์และวิทยาการข้อมูล)",
      degreeTitleEn: "Master of Science (Artificial Intelligence and Data Science) / M.Sc. (Artificial Intelligence and Data Science)",
      totalCredits: 36,
      durationYears: 2,
      revisedYear: 2569,
      brochureUrl: "https://example.com/curriculum/ai-2569.pdf",
      isActive: true,
    },
  });

  await prisma.curriculum.upsert({
    where: { tenantId_programCode_revisedYear: { tenantId: core.tenantId, programCode: "CERT-FSW", revisedYear: 2569 } },
    update: {},
    create: {
      tenantId: core.tenantId,
      degreeLevel: "CERTIFICATE",
      programCode: "CERT-FSW",
      nameTh: "หลักสูตรประกาศนียบัตรการพัฒนาเว็บฟูลสแตกสมัยใหม่ (Full-Stack Web Development)",
      nameEn: "Certificate Program in Modern Full-Stack Web Development",
      degreeTitleTh: "ประกาศนียบัตรการพัฒนาเว็บฟูลสแตก",
      degreeTitleEn: "Certificate in Modern Full-Stack Web Development",
      totalCredits: 12,
      durationYears: 1,
      revisedYear: 2569,
      brochureUrl: "https://example.com/curriculum/cert-fsw.pdf",
      isActive: true,
    },
  });

  await prisma.curriculum.upsert({
    where: { tenantId_programCode_revisedYear: { tenantId: core.tenantId, programCode: "TRAIN-AI", revisedYear: 2569 } },
    update: {},
    create: {
      tenantId: core.tenantId,
      degreeLevel: "TRAINING",
      programCode: "TRAIN-AI",
      nameTh: "โครงการอบรมเชิงปฏิบัติการวิศวกรรมปัญญาประดิษฐ์และ Generative AI สำหรับองค์กร",
      nameEn: "Hands-on AI Engineering & Generative AI Workshop for Enterprise",
      degreeTitleTh: "วุฒิบัตรผ่านการอบรมวิศวกรรมปัญญาประดิษฐ์",
      degreeTitleEn: "Certificate of Completion in AI Engineering",
      totalCredits: 0,
      durationYears: 0,
      revisedYear: 2569,
      brochureUrl: "https://example.com/curriculum/train-ai.pdf",
      isActive: true,
    },
  });

  // --- Seed รายวิชา (Courses) ---
  const courseCS101 = await prisma.course.upsert({
    where: { tenantId_courseCode: { tenantId: core.tenantId, courseCode: "CS101" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      courseCode: "CS101",
      nameTh: "การเขียนโปรแกรมคอมพิวเตอร์พื้นฐาน",
      nameEn: "Fundamental Computer Programming",
      credits: "3(2-2-5)",
      descriptionTh: "แนวคิดพื้นฐานเกี่ยวกับการแก้ปัญหาด้วยคอมพิวเตอร์ ตัวแปร โครงสร้างควบคุม และการเขียนโปรแกรมเชิงโครงสร้าง",
      descriptionEn: "Fundamental concepts of problem-solving with computers, control structures, and structured programming.",
    },
  });

  const courseCS201 = await prisma.course.upsert({
    where: { tenantId_courseCode: { tenantId: core.tenantId, courseCode: "CS201" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      courseCode: "CS201",
      nameTh: "โครงสร้างข้อมูลและขั้นตอนวิธี",
      nameEn: "Data Structures and Algorithms",
      credits: "3(3-0-6)",
      descriptionTh: "โครงสร้างข้อมูลเชิงเส้นและไม่เชิงเส้น การค้นหา การเรียงลำดับ และการวิเคราะห์ความซับซ้อนของขั้นตอนวิธี",
      descriptionEn: "Linear and non-linear data structures, searching, sorting, and algorithm complexity analysis.",
    },
  });

  const courseSE211 = await prisma.course.upsert({
    where: { tenantId_courseCode: { tenantId: core.tenantId, courseCode: "SE211" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      courseCode: "SE211",
      nameTh: "วิศวกรรมความต้องการซอฟต์แวร์",
      nameEn: "Software Requirements Engineering",
      credits: "3(3-0-6)",
      descriptionTh: "กระบวนการสืบค้น วิเคราะห์ จัดทำข้อกำหนด และตรวจสอบความถูกต้องของความต้องการซอฟต์แวร์",
      descriptionEn: "Processes for eliciting, analyzing, documenting, and validating software requirements.",
    },
  });

  const courseSE312 = await prisma.course.upsert({
    where: { tenantId_courseCode: { tenantId: core.tenantId, courseCode: "SE312" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      courseCode: "SE312",
      nameTh: "สถาปัตยกรรมซอฟต์แวร์และการออกแบบ",
      nameEn: "Software Architecture and Design",
      credits: "3(3-0-6)",
      descriptionTh: "รูปแบบสถาปัตยกรรม การออกแบบเชิงวัตถุ Design Patterns และคุณภาพของระบบ",
      descriptionEn: "Architectural patterns, object-oriented design, design patterns, and system quality attributes.",
    },
  });

  const courseAI301 = await prisma.course.upsert({
    where: { tenantId_courseCode: { tenantId: core.tenantId, courseCode: "AI301" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      courseCode: "AI301",
      nameTh: "ปัญญาประดิษฐ์เบื้องต้น",
      nameEn: "Introduction to Artificial Intelligence",
      credits: "3(3-0-6)",
      descriptionTh: "ทฤษฎีพื้นฐานของ AI การค้นหาแบบฮิวริสติก Machine Learning เบื้องต้น และระบบผู้เชี่ยวชาญ",
      descriptionEn: "Fundamental theories of AI, heuristic search, introductory machine learning, and expert systems.",
    },
  });

  const courseDS202 = await prisma.course.upsert({
    where: { tenantId_courseCode: { tenantId: core.tenantId, courseCode: "DS202" } },
    update: {},
    create: {
      tenantId: core.tenantId,
      courseCode: "DS202",
      nameTh: "การจัดการฐานข้อมูลขั้นสูง",
      nameEn: "Advanced Database Management Systems",
      credits: "3(2-2-5)",
      descriptionTh: "การออกแบบฐานข้อมูลเชิงสัมพันธ์ การปรับปรุงประสิทธิภาพคิวรี NoSQL และการประมวลผลธุรกรรม",
      descriptionEn: "Relational database design, query optimization, NoSQL systems, and transaction processing.",
    },
  });

  // --- Seed ภาคการศึกษา (Academic Terms) ---
  const term1 = await prisma.academicTerm.upsert({
    where: { tenantId_year_term: { tenantId: core.tenantId, year: 2569, term: 1 } },
    update: { isCurrent: true },
    create: {
      tenantId: core.tenantId,
      year: 2569,
      term: 1,
      nameTh: "ภาคการศึกษาต้น 2569",
      nameEn: "First Semester 2026",
      startDate: new Date("2026-06-15"),
      endDate: new Date("2026-10-25"),
      isCurrent: true,
    },
  });

  await prisma.academicTerm.upsert({
    where: { tenantId_year_term: { tenantId: core.tenantId, year: 2569, term: 2 } },
    update: { isCurrent: false },
    create: {
      tenantId: core.tenantId,
      year: 2569,
      term: 2,
      nameTh: "ภาคการศึกษาปลาย 2569",
      nameEn: "Second Semester 2026",
      startDate: new Date("2026-11-15"),
      endDate: new Date("2027-03-25"),
      isCurrent: false,
    },
  });

  const staffDean = await prisma.staffProfile.findFirst({ where: { tenantId: core.tenantId, email: "dean@app.local" } });
  const staffVipada = await prisma.staffProfile.findFirst({ where: { tenantId: core.tenantId, email: "vipada@app.local" } });
  const staffThanapol = await prisma.staffProfile.findFirst({ where: { tenantId: core.tenantId, email: "thanapol@app.local" } });

  const currCS = await prisma.curriculum.findFirst({ where: { tenantId: core.tenantId, programCode: "CS-2569" } });
  const currSE = await prisma.curriculum.findFirst({ where: { tenantId: core.tenantId, programCode: "SE-2568" } });
  const currAI = await prisma.curriculum.findFirst({ where: { tenantId: core.tenantId, programCode: "AI-2569" } });

  // --- Seed ตารางเรียน/ตารางสอน (Class Schedules) ---
  const existingClassesCount = await prisma.classSchedule.count({ where: { tenantId: core.tenantId, termId: term1.id } });
  if (existingClassesCount === 0) {
    await prisma.classSchedule.createMany({
      data: [
        {
          tenantId: core.tenantId,
          termId: term1.id,
          courseId: courseCS101.id,
          section: "1",
          dayOfWeek: "MONDAY",
          startTime: "09:00",
          endTime: "12:00",
          room: "IT-401",
          building: "อาคารวิชาการ 1",
          instructorId: staffDean?.id,
          curriculumId: currCS?.id,
          targetYear: 1,
        },
        {
          tenantId: core.tenantId,
          termId: term1.id,
          courseId: courseCS201.id,
          section: "1",
          dayOfWeek: "TUESDAY",
          startTime: "13:00",
          endTime: "16:00",
          room: "Lab-2",
          building: "อาคารปฏิบัติการคอมพิวเตอร์",
          instructorId: staffDean?.id,
          curriculumId: currCS?.id,
          targetYear: 2,
        },
        {
          tenantId: core.tenantId,
          termId: term1.id,
          courseId: courseSE211.id,
          section: "1",
          dayOfWeek: "WEDNESDAY",
          startTime: "09:00",
          endTime: "12:00",
          room: "IT-305",
          building: "อาคารวิชาการ 2",
          instructorId: staffVipada?.id,
          curriculumId: currSE?.id,
          targetYear: 2,
        },
        {
          tenantId: core.tenantId,
          termId: term1.id,
          courseId: courseSE312.id,
          section: "1",
          dayOfWeek: "THURSDAY",
          startTime: "13:00",
          endTime: "16:00",
          room: "IT-305",
          building: "อาคารวิชาการ 2",
          instructorId: staffVipada?.id,
          curriculumId: currSE?.id,
          targetYear: 3,
        },
        {
          tenantId: core.tenantId,
          termId: term1.id,
          courseId: courseAI301.id,
          section: "1",
          dayOfWeek: "FRIDAY",
          startTime: "09:00",
          endTime: "12:00",
          room: "AI-Lab",
          building: "ศูนย์วิจัยปัญญาประดิษฐ์",
          instructorId: staffThanapol?.id,
          curriculumId: currAI?.id,
          targetYear: 3,
        },
        {
          tenantId: core.tenantId,
          termId: term1.id,
          courseId: courseDS202.id,
          section: "1",
          dayOfWeek: "FRIDAY",
          startTime: "13:00",
          endTime: "16:00",
          room: "Lab-3",
          building: "อาคารปฏิบัติการคอมพิวเตอร์",
          instructorId: staffThanapol?.id,
          targetYear: 2,
        },
      ],
    });
  }

  // --- Seed ตารางสอบ (Exam Schedules) ---
  const existingExamsCount = await prisma.examSchedule.count({ where: { tenantId: core.tenantId, termId: term1.id } });
  if (existingExamsCount === 0) {
    await prisma.examSchedule.createMany({
      data: [
        {
          tenantId: core.tenantId,
          termId: term1.id,
          courseId: courseCS101.id,
          section: "1",
          examType: "MIDTERM",
          examDate: new Date("2026-10-15"),
          startTime: "09:00",
          endTime: "12:00",
          room: "IT-Auditorium",
          seatRange: "ที่นั่ง 01-80",
          invigilatorId: staffDean?.id,
        },
        {
          tenantId: core.tenantId,
          termId: term1.id,
          courseId: courseCS201.id,
          section: "1",
          examType: "MIDTERM",
          examDate: new Date("2026-10-16"),
          startTime: "13:00",
          endTime: "16:00",
          room: "IT-401",
          seatRange: "ที่นั่ง 01-60",
          invigilatorId: staffDean?.id,
        },
        {
          tenantId: core.tenantId,
          termId: term1.id,
          courseId: courseSE211.id,
          section: "1",
          examType: "FINAL",
          examDate: new Date("2026-10-20"),
          startTime: "09:00",
          endTime: "12:00",
          room: "IT-305",
          seatRange: "ที่นั่ง 01-45",
          invigilatorId: staffVipada?.id,
        },
        {
          tenantId: core.tenantId,
          termId: term1.id,
          courseId: courseAI301.id,
          section: "1",
          examType: "FINAL",
          examDate: new Date("2026-10-22"),
          startTime: "09:00",
          endTime: "12:00",
          room: "AI-Lab",
          seatRange: "ที่นั่ง 01-35",
          invigilatorId: staffThanapol?.id,
        },
      ],
    });
  }

  // --- Seed ข้อมูลและสถิตินิสิต (Student Profiles & Demographics) ---
  const existingStudentsCount = await prisma.studentProfile.count({ where: { tenantId: core.tenantId } });
  if (existingStudentsCount === 0 && currCS && currSE && currAI) {
    await prisma.studentProfile.createMany({
      data: [
        // Year 1 (Admission 2568)
        {
          tenantId: core.tenantId,
          studentId: "68010001",
          titleTh: "นาย",
          titleEn: "Mr.",
          firstNameTh: "ชานนท์",
          lastNameTh: "วัฒนกุล",
          firstNameEn: "Chanon",
          lastNameEn: "Wattanakul",
          gender: "MALE",
          nationality: "ไทย",
          ethnicity: "ไทย",
          religion: "พุทธ",
          domicileRegion: "ภาคกลาง",
          curriculumId: currCS.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2568,
          currentYear: 1,
          status: "ENROLLED",
          email: "68010001@student.local",
        },
        {
          tenantId: core.tenantId,
          studentId: "68010002",
          titleTh: "นางสาว",
          titleEn: "Ms.",
          firstNameTh: "แพรวา",
          lastNameTh: "สิริโภคิน",
          firstNameEn: "Praewa",
          lastNameEn: "Siriphokin",
          gender: "FEMALE",
          nationality: "ไทย",
          ethnicity: "ไทย",
          religion: "พุทธ",
          domicileRegion: "ภาคเหนือ",
          curriculumId: currCS.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2568,
          currentYear: 1,
          status: "ENROLLED",
          email: "68010002@student.local",
        },
        {
          tenantId: core.tenantId,
          studentId: "68020001",
          titleTh: "นาย",
          titleEn: "Mr.",
          firstNameTh: "หลี่เหว่ย",
          lastNameTh: "หวัง",
          firstNameEn: "Liwei",
          lastNameEn: "Wang",
          gender: "MALE",
          nationality: "จีน",
          ethnicity: "จีน",
          religion: "ไม่ระบุ",
          domicileRegion: "ต่างประเทศ",
          curriculumId: currSE.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2568,
          currentYear: 1,
          status: "ENROLLED",
          email: "68020001@student.local",
        },
        {
          tenantId: core.tenantId,
          studentId: "68030001",
          titleTh: "นางสาว",
          titleEn: "Ms.",
          firstNameTh: "ไอโกะ",
          lastNameTh: "ทานากะ",
          firstNameEn: "Aiko",
          lastNameEn: "Tanaka",
          gender: "FEMALE",
          nationality: "ญี่ปุ่น",
          ethnicity: "ญี่ปุ่น",
          religion: "ชินโต",
          domicileRegion: "ต่างประเทศ",
          curriculumId: currAI.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2568,
          currentYear: 1,
          status: "ENROLLED",
          email: "68030001@student.local",
        },

        // Year 2 (Admission 2567)
        {
          tenantId: core.tenantId,
          studentId: "67010015",
          titleTh: "นาย",
          titleEn: "Mr.",
          firstNameTh: "กิตติพงษ์",
          lastNameTh: "เจริญสุข",
          firstNameEn: "Kittipong",
          lastNameEn: "Charoensuk",
          gender: "MALE",
          nationality: "ไทย",
          ethnicity: "ไทย",
          religion: "พุทธ",
          domicileRegion: "ภาคตะวันออกเฉียงเหนือ",
          curriculumId: currCS.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2567,
          currentYear: 2,
          status: "ENROLLED",
          email: "67010015@student.local",
        },
        {
          tenantId: core.tenantId,
          studentId: "67020023",
          titleTh: "นางสาว",
          titleEn: "Ms.",
          firstNameTh: "นภัสสร",
          lastNameTh: "เมธากุล",
          firstNameEn: "Napatsorn",
          lastNameEn: "Methakul",
          gender: "FEMALE",
          nationality: "ไทย",
          ethnicity: "ไทย",
          religion: "คริสต์",
          domicileRegion: "ภาคใต้",
          curriculumId: currSE.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2567,
          currentYear: 2,
          status: "ENROLLED",
          email: "67020023@student.local",
        },
        {
          tenantId: core.tenantId,
          studentId: "67030009",
          titleTh: "นาย",
          titleEn: "Mr.",
          firstNameTh: "อองมิน",
          lastNameTh: "ทวย",
          firstNameEn: "Aung Min",
          lastNameEn: "Htwe",
          gender: "MALE",
          nationality: "เมียนมา",
          ethnicity: "มอญ",
          religion: "พุทธ",
          domicileRegion: "ต่างประเทศ",
          curriculumId: currAI.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2567,
          currentYear: 2,
          status: "ENROLLED",
          email: "67030009@student.local",
        },

        // Year 3 (Admission 2566)
        {
          tenantId: core.tenantId,
          studentId: "66010045",
          titleTh: "นาย",
          titleEn: "Mr.",
          firstNameTh: "ภานุวัฒน์",
          lastNameTh: "ศิริชัย",
          firstNameEn: "Panuwat",
          lastNameEn: "Sirichai",
          gender: "MALE",
          nationality: "ไทย",
          ethnicity: "ไทย",
          religion: "พุทธ",
          domicileRegion: "ภาคกลาง",
          curriculumId: currCS.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2566,
          currentYear: 3,
          status: "ENROLLED",
          email: "66010045@student.local",
        },
        {
          tenantId: core.tenantId,
          studentId: "66020038",
          titleTh: "นางสาว",
          titleEn: "Ms.",
          firstNameTh: "ชุติมา",
          lastNameTh: "จงเจริญ",
          firstNameEn: "Chutima",
          lastNameEn: "Jongjaroen",
          gender: "FEMALE",
          nationality: "ไทย",
          ethnicity: "จีน",
          religion: "พุทธ",
          domicileRegion: "ภาคกลาง",
          curriculumId: currSE.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2566,
          currentYear: 3,
          status: "ENROLLED",
          email: "66020038@student.local",
        },
        {
          tenantId: core.tenantId,
          studentId: "66030012",
          titleTh: "นาย",
          titleEn: "Mr.",
          firstNameTh: "เจมส์",
          lastNameTh: "มิลเลอร์",
          firstNameEn: "James",
          lastNameEn: "Miller",
          gender: "OTHER",
          nationality: "อเมริกัน",
          ethnicity: "คอเคเซียน",
          religion: "ไม่ระบุ",
          domicileRegion: "ต่างประเทศ",
          curriculumId: currAI.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2566,
          currentYear: 3,
          status: "ENROLLED",
          email: "66030012@student.local",
        },

        // Year 4 (Admission 2565)
        {
          tenantId: core.tenantId,
          studentId: "65010088",
          titleTh: "นางสาว",
          titleEn: "Ms.",
          firstNameTh: "วริศรา",
          lastNameTh: "ปัญญาวงศ์",
          firstNameEn: "Varisara",
          lastNameEn: "Panyawong",
          gender: "FEMALE",
          nationality: "ไทย",
          ethnicity: "ไทย",
          religion: "พุทธ",
          domicileRegion: "ภาคเหนือ",
          curriculumId: currCS.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2565,
          currentYear: 4,
          status: "ENROLLED",
          email: "65010088@student.local",
        },
        {
          tenantId: core.tenantId,
          studentId: "65020077",
          titleTh: "นาย",
          titleEn: "Mr.",
          firstNameTh: "ธีรเดช",
          lastNameTh: "วงศ์สุวรรณ",
          firstNameEn: "Teeradej",
          lastNameEn: "Wongsuwan",
          gender: "MALE",
          nationality: "ไทย",
          ethnicity: "ไทย",
          religion: "อิสลาม",
          domicileRegion: "ภาคใต้",
          curriculumId: currSE.id,
          degreeLevel: "BACHELOR",
          admissionYear: 2565,
          currentYear: 4,
          status: "ON_LEAVE",
          email: "65020077@student.local",
        },
      ],
    });
  }

  // --- Seed ทำเนียบศิษย์เก่า (Alumni Profiles & Spotlights) ---
  const existingAlumniCount = await prisma.alumniProfile.count({ where: { tenantId: core.tenantId } });
  if (existingAlumniCount === 0 && currCS && currSE && currAI) {
    await prisma.alumniProfile.createMany({
      data: [
        {
          tenantId: core.tenantId,
          studentId: "61020019",
          titleTh: "นาย",
          titleEn: "Mr.",
          firstNameTh: "พิชญะ",
          lastNameTh: "ธีรเดช",
          firstNameEn: "Pichaya",
          lastNameEn: "Theeradej",
          gender: "MALE",
          curriculumId: currSE.id,
          degreeLevel: "BACHELOR",
          graduationYear: 2565,
          generation: 22,
          gpa: 3.88,
          employmentStatus: "EMPLOYED",
          jobTitle: "Lead Software Engineer",
          company: "Google (Thailand)",
          industry: "เทคโนโลยีสารสนเทศและซอฟต์แวร์",
          salaryRange: "150,000+ บาท",
          email: "pichaya.t@alumni.local",
          phoneNumber: "081-234-5678",
          linkedinUrl: "https://linkedin.com/in/pichaya-theeradej",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
          isFeatured: true,
          featuredStoryTh: "วิศวกรรมซอฟต์แวร์ที่นี่สอนให้คิดเป็นระบบและแก้ปัญหาจริง ทำให้ปรับตัวกับการทำงานในบริษัทระดับโลกได้อย่างมั่นใจ",
          featuredStoryEn: "The software engineering program here provided a rigorous foundation that prepared me to lead large-scale engineering teams globally.",
        },
        {
          tenantId: core.tenantId,
          studentId: "62030005",
          titleTh: "นางสาว",
          titleEn: "Ms.",
          firstNameTh: "กานต์ชนก",
          lastNameTh: "สิริกุล",
          firstNameEn: "Karnchanok",
          lastNameEn: "Sirikul",
          gender: "FEMALE",
          curriculumId: currAI.id,
          degreeLevel: "BACHELOR",
          graduationYear: 2566,
          generation: 23,
          gpa: 3.92,
          employmentStatus: "ENTREPRENEUR",
          jobTitle: "Co-Founder & CTO",
          company: "MedVision AI Startup",
          industry: "การแพทย์และสุขภาพดิจิทัล",
          salaryRange: "100,000 - 150,000 บาท",
          email: "karnchanok.s@alumni.local",
          phoneNumber: "089-876-5432",
          linkedinUrl: "https://linkedin.com/in/karnchanok-sirikul",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
          isFeatured: true,
          featuredStoryTh: "ความรู้ด้าน AI และคำปรึกษาจากอาจารย์ผู้เชี่ยวชาญ ช่วยผลักดันให้กล้าก้าวออกมาสร้างสตาร์ตอัปพัฒนาโมเดลคัดกรองโรคเพื่อคนไทย",
          featuredStoryEn: "World-class mentoring and hands-on AI projects empowered me to launch our health-tech startup right after graduation.",
        },
        {
          tenantId: core.tenantId,
          studentId: "62010042",
          titleTh: "นาย",
          titleEn: "Mr.",
          firstNameTh: "ธนกร",
          lastNameTh: "มุ่งมั่น",
          firstNameEn: "Thanakorn",
          lastNameEn: "Mungmun",
          gender: "MALE",
          curriculumId: currCS.id,
          degreeLevel: "BACHELOR",
          graduationYear: 2566,
          generation: 23,
          gpa: 3.65,
          employmentStatus: "EMPLOYED",
          jobTitle: "Senior AI Researcher",
          company: "SCB TechX",
          industry: "การเงินและธนาคารดิจิทัล (Fintech)",
          salaryRange: "80,000 - 120,000 บาท",
          email: "thanakorn.m@alumni.local",
          linkedinUrl: "https://linkedin.com/in/thanakorn-m",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
          isFeatured: true,
          featuredStoryTh: "หลักสูตรวิทยาการคอมพิวเตอร์มีความเข้มข้นทั้งเชิงทฤษฎีและการประยุกต์ใช้จริง ทำให้สร้างคุณค่าให้แก่องค์กรได้อย่างรวดเร็ว",
          featuredStoryEn: "The deep theoretical grounding in computer science gave me the upper hand in fintech research and algorithm design.",
        },
        {
          tenantId: core.tenantId,
          studentId: "60020088",
          titleTh: "นางสาว",
          titleEn: "Ms.",
          firstNameTh: "อลิสา",
          lastNameTh: "สัจจพรหม",
          firstNameEn: "Alisa",
          lastNameEn: "Sajjaprom",
          gender: "FEMALE",
          curriculumId: currSE.id,
          degreeLevel: "BACHELOR",
          graduationYear: 2564,
          generation: 21,
          gpa: 3.78,
          employmentStatus: "EMPLOYED",
          jobTitle: "Staff Software Architect",
          company: "Agoda",
          industry: "การท่องเที่ยวและการจองที่พักออนไลน์",
          salaryRange: "120,000 - 150,000 บาท",
          email: "alisa.s@alumni.local",
          linkedinUrl: "https://linkedin.com/in/alisa-sajjaprom",
          avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
          isFeatured: true,
          featuredStoryTh: "บรรยากาศการเรียนรู้ที่สนับสนุนการทดลองและการทำงานเป็นทีม คือกุญแจสำคัญที่ทำให้เติบโตในสายงานเทคโนโลยี",
          featuredStoryEn: "A culture of continuous learning and teamwork was the launchpad for my journey in leading travel platform architectures.",
        },
        {
          tenantId: core.tenantId,
          studentId: "63010011",
          titleTh: "นาย",
          titleEn: "Mr.",
          firstNameTh: "ณัฐดนัย",
          lastNameTh: "เลิศวิทย์",
          firstNameEn: "Natdanai",
          lastNameEn: "Lertwit",
          gender: "MALE",
          curriculumId: currCS.id,
          degreeLevel: "BACHELOR",
          graduationYear: 2567,
          generation: 24,
          gpa: 3.52,
          employmentStatus: "STUDYING",
          jobTitle: "ปริญญาโทสาขา Data Science",
          company: "มหาวิทยาลัยแห่งชาติสิงคโปร์ (NUS)",
          industry: "การศึกษาต่อระดับนานาชาติ",
          email: "natdanai.l@alumni.local",
          isFeatured: false,
        },
        {
          tenantId: core.tenantId,
          studentId: "63020055",
          titleTh: "นางสาว",
          titleEn: "Ms.",
          firstNameTh: "พัชราภรณ์",
          lastNameTh: "คงสมบูรณ์",
          firstNameEn: "Patcharaporn",
          lastNameEn: "Kongsomboon",
          gender: "FEMALE",
          curriculumId: currSE.id,
          degreeLevel: "BACHELOR",
          graduationYear: 2567,
          generation: 24,
          gpa: 3.45,
          employmentStatus: "EMPLOYED",
          jobTitle: "Frontend Developer",
          company: "LINE MAN Wongnai",
          industry: "อีคอมเมิร์ซและการจัดส่งอาหาร",
          salaryRange: "45,000 - 65,000 บาท",
          email: "patcharaporn.k@alumni.local",
          isFeatured: false,
        },
      ],
    });
  }

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
