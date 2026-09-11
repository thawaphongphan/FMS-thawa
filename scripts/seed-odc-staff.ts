import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { requireDatabaseUrl } from "../prisma/lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

async function seedOdcStaff() {
  console.log("Starting MCU Dhammaduta College staff import...");

  // 1. หา Tenant หลัก DEMO (วิทยาลัยพระธรรมทูต)
  const tenant = await prisma.tenant.findUnique({
    where: { code: "DEMO" },
  });

  if (!tenant) {
    throw new Error("Tenant DEMO not found!");
  }

  console.log(`Found tenant: ${tenant.nameTh} (${tenant.id})`);

  // 2. สร้าง/อัปเดต Departments สำหรับวิทยาลัยพระธรรมทูต
  const deptsData = [
    { code: "EXEC", nameTh: "คณะผู้บริหาร", nameEn: "Executive Board", orderIndex: 1 },
    { code: "OFFICE", nameTh: "สำนักงานวิทยาลัย", nameEn: "Office of the College", orderIndex: 2 },
    { code: "ACADEMIC", nameTh: "สำนักงานวิชาการ", nameEn: "Office of Academic Affairs", orderIndex: 3 },
    { code: "FACULTY", nameTh: "คณาจารย์ประจำ", nameEn: "Faculty Members", orderIndex: 4 },
  ];

  const deptMap = new Map<string, string>();
  for (const d of deptsData) {
    const dept = await prisma.department.upsert({
      where: { tenantId_code: { tenantId: tenant.id, code: d.code } },
      update: { nameTh: d.nameTh, nameEn: d.nameEn, orderIndex: d.orderIndex },
      create: { tenantId: tenant.id, code: d.code, nameTh: d.nameTh, nameEn: d.nameEn, orderIndex: d.orderIndex },
    });
    deptMap.set(d.code, dept.id);
  }

  // 3. ปลด Foreign Key จาก class_schedules และ exam_schedules ที่ชี้ไปยัง Staff เก่า
  await prisma.classSchedule.updateMany({
    where: { tenantId: tenant.id },
    data: { instructorId: null },
  });
  await prisma.examSchedule.updateMany({
    where: { tenantId: tenant.id },
    data: { invigilatorId: null },
  });

  // 4. ลบข้อมูล mock เดิม (เช่น สมชาย, วิภาดา, ธนพล) ของ DEMO
  const deletedOldStaff = await prisma.staffProfile.deleteMany({
    where: {
      tenantId: tenant.id,
      email: { in: ["dean@app.local", "vipada@app.local", "thanapol@app.local"] },
    },
  });
  console.log(`Removed ${deletedOldStaff.count} old mock staff profiles.`);

  // 5. ข้อมูลบุคลากรวิทยาลัยพระธรรมทูต 15 ท่าน
  const staffList = [
    {
      deptCode: "EXEC",
      academicTitleTh: "ศ.ดร.",
      academicTitleEn: "Prof. Dr.",
      firstNameTh: "พระพรหมวัชรธีราจารย์",
      lastNameTh: "(สมจินต์ สมฺมาปญฺโญ)",
      firstNameEn: "Phra Brahmavajiratherachan",
      lastNameEn: "(Somjin Sammapanno)",
      email: "rector@mcu.ac.th",
      phoneNumber: "035-248-000",
      officeRoom: "อาคาร มวก. 48 พรรษา",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2023/10/litestuser-1.png",
      adminPositionTh: "อธิการบดี",
      adminPositionEn: "Rector",
      bioTh: "อธิการบดี มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Rector of Mahachulalongkornrajavidyalaya University",
      researchInterests: ["พระพุทธศาสนาเถรวาท", "การเผยแผ่พระพุทธศาสนา", "ปรัชญาอินเดีย"],
      educationHistory: [
        { degree: "ป.ธ.9", field: "เปรียญธรรม 9 ประโยค", institution: "สำนักเรียนวัดปากน้ำ ภาษีเจริญ" },
        { degree: "Ph.D.", field: "Philosophy", institution: "Banaras Hindu University, India" },
      ],
      orderIndex: 1,
    },
    {
      deptCode: "EXEC",
      academicTitleTh: "ผศ.ดร.",
      academicTitleEn: "Asst. Prof. Dr.",
      firstNameTh: "พระสิทธิวัชรบัณฑิต",
      lastNameTh: "(วีรธมฺโม)",
      firstNameEn: "Phra Sitthivajarabundit",
      lastNameEn: "(Viradhammo)",
      email: "foreign@mcu.ac.th",
      phoneNumber: "035-248-000",
      officeRoom: "อาคาร มวก. 48 พรรษา",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2023/10/10-2.png",
      adminPositionTh: "รองอธิการบดีฝ่ายกิจการต่างประเทศ",
      adminPositionEn: "Vice Rector for Foreign Affairs",
      bioTh: "รองอธิการบดีฝ่ายกิจการต่างประเทศ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Vice Rector for Foreign Affairs, Mahachulalongkornrajavidyalaya University",
      researchInterests: ["กิจการต่างประเทศ", "พระธรรมทูตสายต่างประเทศ", "พระพุทธศาสนาร่วมสมัย"],
      educationHistory: [
        { degree: "พธ.ด.", field: "พระพุทธศาสนา", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
      ],
      orderIndex: 2,
    },
    {
      deptCode: "EXEC",
      academicTitleTh: "ผศ.ดร.",
      academicTitleEn: "Asst. Prof. Dr.",
      firstNameTh: "บุญมี",
      lastNameTh: "พรรษา",
      firstNameEn: "Boonmee",
      lastNameEn: "Pansa",
      email: "boonmee.pan@mcu.ac.th",
      phoneNumber: "035-248-000",
      officeRoom: "อาคาร มวก. 48 พรรษา",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2023/10/11.png",
      adminPositionTh: "ผู้ช่วยอธิการบดีฝ่ายกิจการต่างประเทศ",
      adminPositionEn: "Assistant to the Rector for Foreign Affairs",
      bioTh: "ผู้ช่วยอธิการบดีฝ่ายกิจการต่างประเทศ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Assistant to the Rector for Foreign Affairs, Mahachulalongkornrajavidyalaya University",
      researchInterests: ["การศึกษานานาชาติ", "ภาษาศาสตร์และการสื่อสาร", "ความสัมพันธ์ระหว่างประเทศ"],
      educationHistory: [
        { degree: "Ph.D.", field: "Linguistics", institution: "Delhi University, India" },
      ],
      orderIndex: 3,
    },
    {
      deptCode: "EXEC",
      academicTitleTh: "ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "พระครูสุตรัตนบัณฑิต",
      lastNameTh: "(ประยูร โชติวโร)",
      firstNameEn: "Phrakhrusutratanapundit",
      lastNameEn: "(Prayoon Chotavaro)",
      email: "prayoon.kham@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "ห้องผู้อำนวยการวิทยาลัยพระธรรมทูต",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2023/10/12.png",
      adminPositionTh: "ผู้อำนวยการวิทยาลัยพระธรรมทูต",
      adminPositionEn: "Director of Dhammaduta College",
      bioTh: "ผู้อำนวยการวิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Director of Dhammaduta College, Mahachulalongkornrajavidyalaya University",
      researchInterests: ["การบริหารงานพระธรรมทูต", "การเผยแผ่พระพุทธศาสนาระดับสากล", "ภาวะผู้นำทางพุทธศาสนา"],
      educationHistory: [
        { degree: "พธ.ด.", field: "การบริหารการศึกษา", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
        { degree: "พธ.ม.", field: "พระพุทธศาสนา", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
      ],
      orderIndex: 4,
    },
    {
      deptCode: "EXEC",
      academicTitleTh: "ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "พระครูใบฎีกาแสงเฮือง",
      lastNameTh: "นรินฺโท",
      firstNameEn: "Phrakhrubaidika Saenghuang",
      lastNameEn: "Narindo",
      email: "saenghuang@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "ห้องรองผู้อำนวยการฝ่ายบริหาร",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2023/10/13.png",
      adminPositionTh: "รองผู้อำนวยการฝ่ายบริหาร",
      adminPositionEn: "Deputy Director for Administration",
      bioTh: "รองผู้อำนวยการฝ่ายบริหาร วิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Deputy Director for Administration, Dhammaduta College",
      researchInterests: ["การบริหารกิจการสงฆ์", "การจัดองค์กรพระธรรมทูต", "การบริหารเชิงกลยุทธ์"],
      educationHistory: [
        { degree: "พธ.ด.", field: "พุทธบริหารการศึกษา", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
      ],
      orderIndex: 5,
    },
    {
      deptCode: "EXEC",
      academicTitleTh: "ผศ.ดร.",
      academicTitleEn: "Asst. Prof. Dr.",
      firstNameTh: "พระมหาไพฑูรย์",
      lastNameTh: "ปนฺตนนฺโท",
      firstNameEn: "Phramaha Paitoon",
      lastNameEn: "Pantanando",
      email: "paitoon.wan@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "ห้องรองผู้อำนวยการฝ่ายวิชาการ",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2025/03/ดีไซน์ที่ยังไม่ได้ตั้งชื่อ-1-scaled.jpg",
      adminPositionTh: "รองผู้อำนวยการฝ่ายวิชาการ",
      adminPositionEn: "Deputy Director for Academic Affairs",
      bioTh: "รองผู้อำนวยการฝ่ายวิชาการ วิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Deputy Director for Academic Affairs, Dhammaduta College",
      researchInterests: ["การพัฒนาหลักสูตรพระธรรมทูต", "วิชาการพระพุทธศาสนา", "การจัดการเรียนการสอนพระปริยัติธรรม"],
      educationHistory: [
        { degree: "พธ.ด.", field: "พระพุทธศาสนา", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
      ],
      orderIndex: 6,
    },
    {
      deptCode: "OFFICE",
      academicTitleTh: "",
      academicTitleEn: "",
      firstNameTh: "พระมหากฤษณ",
      lastNameTh: "กิตฺติภทฺโท",
      firstNameEn: "Phramaha Krisana",
      lastNameEn: "Kittiphattho",
      email: "kritsana.bao@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "สำนักงานวิทยาลัยพระธรรมทูต",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2023/10/19.png",
      adminPositionTh: "ผู้อำนวยการสำนักงานวิทยาลัย",
      adminPositionEn: "Director of College Office",
      bioTh: "ผู้อำนวยการสำนักงานวิทยาลัย วิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Director of College Office, Dhammaduta College",
      researchInterests: ["การบริหารสำนักงาน", "เทคโนโลยีสารสนเทศเพื่อการบริหาร", "งานสารบรรณและนโยบาย"],
      educationHistory: [
        { degree: "พธ.ม.", field: "พระพุทธศาสนา", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
      ],
      orderIndex: 7,
    },
    {
      deptCode: "ACADEMIC",
      academicTitleTh: "",
      academicTitleEn: "",
      firstNameTh: "พระมหาศักดิ์ชาย",
      lastNameTh: "โกวิโท",
      firstNameEn: "Phramaha Sakchai",
      lastNameEn: "Kovido",
      email: "sakchai.kov@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "สำนักงานวิชาการ วิทยาลัยพระธรรมทูต",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2023/10/16.png",
      adminPositionTh: "ผู้อำนวยการสำนักงานวิชาการ",
      adminPositionEn: "Director of Academic Office",
      bioTh: "ผู้อำนวยการสำนักงานวิชาการ วิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Director of Academic Office, Dhammaduta College",
      researchInterests: ["งานบริการวิชาการ", "การประกันคุณภาพการศึกษา", "การวิจัยทางพระพุทธศาสนา"],
      educationHistory: [
        { degree: "พธ.ม.", field: "พระพุทธศาสนา", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
      ],
      orderIndex: 8,
    },
    {
      deptCode: "FACULTY",
      academicTitleTh: "ผศ.ดร.",
      academicTitleEn: "Asst. Prof. Dr.",
      firstNameTh: "พระครูธรรมธรวรเดชา",
      lastNameTh: "อคฺคเตโช",
      firstNameEn: "Phrakhrudhammathorn Woradecha",
      lastNameEn: "Aggatecho",
      email: "wpa2546@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "ห้องพักคณาจารย์",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2023/10/รูป-700-×-700px-3.png",
      adminPositionTh: "อาจารย์ประจำ",
      adminPositionEn: "Lecturer",
      bioTh: "อาจารย์ประจำ วิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Lecturer, Dhammaduta College",
      researchInterests: ["พระพุทธศาสนากับการสื่อสาร", "จิตวิทยากับการเผยแผ่ธรรม", "คัมภีร์พระไตรปิฎก"],
      educationHistory: [
        { degree: "พธ.ด.", field: "พระพุทธศาสนา", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
      ],
      orderIndex: 9,
    },
    {
      deptCode: "FACULTY",
      academicTitleTh: "ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "พระครูสังฆกิจวิริยะ",
      lastNameTh: "(วิริยธโร)",
      firstNameEn: "Phrakhrusangkhakitviriya",
      lastNameEn: "(Viriyadharo)",
      email: "sangkhakit@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "ห้องพักคณาจารย์",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2024/01/22.png",
      adminPositionTh: "อาจารย์ประจำ",
      adminPositionEn: "Lecturer",
      bioTh: "อาจารย์ประจำ วิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Lecturer, Dhammaduta College",
      researchInterests: ["การฝึกอบรมวิปัสสนากรรมฐาน", "การเผยแผ่เชิงรุก", "พุทธจิตวิทยา"],
      educationHistory: [
        { degree: "พธ.ด.", field: "พระพุทธศาสนา", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
      ],
      orderIndex: 10,
    },
    {
      deptCode: "FACULTY",
      academicTitleTh: "ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "พระณัฐภัทร",
      lastNameTh: "กิจฺจกาโร",
      firstNameEn: "Phra Natthapat",
      lastNameEn: "Kiccakaro",
      email: "natthapat.kic@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "ห้องพักคณาจารย์",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2025/12/รูปบุคลากร-DC-4-scaled.jpg",
      adminPositionTh: "อาจารย์ประจำ",
      adminPositionEn: "Lecturer",
      bioTh: "อาจารย์ประจำ วิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Lecturer, Dhammaduta College",
      researchInterests: ["ภาษาอังกฤษเพื่อการเผยแผ่พระพุทธศาสนา", "ศาสนาเปรียบเทียบ", "การสื่อสารข้ามวัฒนธรรม"],
      educationHistory: [
        { degree: "พธ.ด.", field: "พระพุทธศาสนา", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
      ],
      orderIndex: 11,
    },
    {
      deptCode: "FACULTY",
      academicTitleTh: "ดร.",
      academicTitleEn: "Dr.",
      firstNameTh: "วิเชียร",
      lastNameTh: "สิงห์คิบุตร",
      firstNameEn: "Wichian",
      lastNameEn: "Singkhibut",
      email: "wichian.sin@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "ห้องพักคณาจารย์",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2025/12/รูปบุคลากร-DC-scaled.jpg",
      adminPositionTh: "อาจารย์ประจำ",
      adminPositionEn: "Lecturer",
      bioTh: "อาจารย์ประจำ วิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Lecturer, Dhammaduta College",
      researchInterests: ["การวิจัยทางสังคมศาสตร์และพระพุทธศาสนา", "สถิติและการวิเคราะห์ข้อมูล", "นวัตกรรมทางการศึกษา"],
      educationHistory: [
        { degree: "Ph.D.", field: "Education", institution: "Mahachulalongkornrajavidyalaya University" },
      ],
      orderIndex: 12,
    },
    {
      deptCode: "OFFICE",
      academicTitleTh: "",
      academicTitleEn: "",
      firstNameTh: "พระคำเสา",
      lastNameTh: "สุจิตฺโต",
      firstNameEn: "Phra Khamsao",
      lastNameEn: "Sucitto",
      email: "khamsao.suc@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "สำนักงานวิทยาลัยพระธรรมทูต",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2024/01/24.png",
      adminPositionTh: "นักวิเทศสัมพันธ์",
      adminPositionEn: "Foreign Relations Officer",
      bioTh: "นักวิเทศสัมพันธ์ สังกัดวิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Foreign Relations Officer, Dhammaduta College",
      researchInterests: ["การประสานงานระหว่างประเทศ", "ภาษาอังกฤษเพื่อการสื่อสาร", "พิธีการทูตทางศาสนา"],
      educationHistory: [
        { degree: "พธ.บ.", field: "ภาษาอังกฤษ", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
      ],
      orderIndex: 13,
    },
    {
      deptCode: "OFFICE",
      academicTitleTh: "",
      academicTitleEn: "",
      firstNameTh: "พระเทวพงศ์พันธ์",
      lastNameTh: "ตนฺติปาโล",
      firstNameEn: "Phra Thawaphongphan",
      lastNameEn: "Tantipalo",
      email: "thawaphongphan@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "สำนักงานวิทยาลัยพระธรรมทูต (เลขที่ 0132002)",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2025/12/รูปบุคลากร-DC-3-scaled.jpg",
      adminPositionTh: "นักวิชาการศึกษา",
      adminPositionEn: "Education Officer",
      bioTh: "นักวิชาการศึกษา สังกัดวิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "Education Officer, Dhammaduta College, Mahachulalongkornrajavidyalaya University",
      researchInterests: ["เทคโนโลยีการศึกษา", "การพัฒนาเว็บไซต์มาตรฐานภาครัฐ", "การจัดการข้อมูลและการศึกษา"],
      educationHistory: [
        { degree: "บธ.บ. (คอมพิวเตอร์ธุรกิจ)", field: "คอมพิวเตอร์ธุรกิจ", institution: "มหาวิทยาลัยเอเชียอาคเนย์", year: "2558" },
        { degree: "นักธรรมชั้นเอก", field: "ธรรมศึกษา", institution: "สำนักเรียนจังหวัดสมุทรสาคร", year: "2559" },
        { degree: "ประกาศนียบัตร (วิชาชีพครู)", field: "วิชาชีพครู", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย", year: "2566" },
      ],
      orderIndex: 14,
    },
    {
      deptCode: "OFFICE",
      academicTitleTh: "",
      academicTitleEn: "",
      firstNameTh: "พระมหาอนุรักษ์",
      lastNameTh: "สุนฺทรวิลาโส",
      firstNameEn: "Phramaha Anurak",
      lastNameEn: "Suntharavilaso",
      email: "anurak.sun@mcu.ac.th",
      phoneNumber: "035-248-065",
      officeRoom: "สำนักงานวิทยาลัยพระธรรมทูต",
      avatarUrl: "https://odc.mcu.ac.th/wp-content/uploads/2025/12/รูปบุคลากร-DC-1-scaled.jpg",
      adminPositionTh: "นักจัดการงานทั่วไป",
      adminPositionEn: "General Administration Officer",
      bioTh: "นักจัดการงานทั่วไป สังกัดวิทยาลัยพระธรรมทูต มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      bioEn: "General Administration Officer, Dhammaduta College",
      researchInterests: ["การบริหารงานทั่วไป", "พัสดุและอาคารสถานที่", "การจัดประชุมและพิธีการ"],
      educationHistory: [
        { degree: "พธ.บ.", field: "การจัดการเชิงพุทธ", institution: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย" },
      ],
      orderIndex: 15,
    },
  ];

  // 6. บันทึกบุคลากรทั้ง 15 ท่านลงในฐานข้อมูล
  const createdStaff = [];
  for (const item of staffList) {
    const departmentId = deptMap.get(item.deptCode)!;
    const existing = await prisma.staffProfile.findFirst({
      where: { tenantId: tenant.id, email: item.email },
    });

    if (existing) {
      const updated = await prisma.staffProfile.update({
        where: { id: existing.id },
        data: {
          departmentId,
          academicTitleTh: item.academicTitleTh,
          academicTitleEn: item.academicTitleEn,
          firstNameTh: item.firstNameTh,
          lastNameTh: item.lastNameTh,
          firstNameEn: item.firstNameEn,
          lastNameEn: item.lastNameEn,
          phoneNumber: item.phoneNumber,
          officeRoom: item.officeRoom,
          avatarUrl: item.avatarUrl,
          adminPositionTh: item.adminPositionTh,
          adminPositionEn: item.adminPositionEn,
          bioTh: item.bioTh,
          bioEn: item.bioEn,
          researchInterests: item.researchInterests,
          educationHistory: item.educationHistory,
          orderIndex: item.orderIndex,
          status: "ACTIVE",
        },
      });
      createdStaff.push(updated);
      console.log(`[Updated] ${item.orderIndex}. ${item.firstNameTh} ${item.lastNameTh} (${item.adminPositionTh})`);
    } else {
      const created = await prisma.staffProfile.create({
        data: {
          tenantId: tenant.id,
          departmentId,
          academicTitleTh: item.academicTitleTh,
          academicTitleEn: item.academicTitleEn,
          firstNameTh: item.firstNameTh,
          lastNameTh: item.lastNameTh,
          firstNameEn: item.firstNameEn,
          lastNameEn: item.lastNameEn,
          email: item.email,
          phoneNumber: item.phoneNumber,
          officeRoom: item.officeRoom,
          avatarUrl: item.avatarUrl,
          adminPositionTh: item.adminPositionTh,
          adminPositionEn: item.adminPositionEn,
          bioTh: item.bioTh,
          bioEn: item.bioEn,
          researchInterests: item.researchInterests,
          educationHistory: item.educationHistory,
          orderIndex: item.orderIndex,
          status: "ACTIVE",
        },
      });
      createdStaff.push(created);
      console.log(`[Created] ${item.orderIndex}. ${item.firstNameTh} ${item.lastNameTh} (${item.adminPositionTh})`);
    }
  }

  // 7. มอบหมายอาจารย์ให้กับตารางสอน/สอบตัวอย่าง (ถ้ามี)
  const lecturerStaff = createdStaff.find((s) => s.adminPositionTh === "อาจารย์ประจำ") ?? createdStaff[0];
  if (lecturerStaff) {
    await prisma.classSchedule.updateMany({
      where: { tenantId: tenant.id },
      data: { instructorId: lecturerStaff.id, instructorName: `${lecturerStaff.academicTitleTh} ${lecturerStaff.firstNameTh} ${lecturerStaff.lastNameTh}`.trim() },
    });
    await prisma.examSchedule.updateMany({
      where: { tenantId: tenant.id },
      data: { invigilatorId: lecturerStaff.id, invigilatorName: `${lecturerStaff.academicTitleTh} ${lecturerStaff.firstNameTh} ${lecturerStaff.lastNameTh}`.trim() },
    });
    console.log(`Assigned schedules to instructor: ${lecturerStaff.firstNameTh}`);
  }

  console.log(`Successfully imported all ${createdStaff.length} personnel profiles for ${tenant.nameTh}!`);
}

seedOdcStaff()
  .catch((e) => {
    console.error("Error seeding staff:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
