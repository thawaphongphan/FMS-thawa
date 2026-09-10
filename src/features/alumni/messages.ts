export const messages = {
  "alumni.nav": { th: "ศิษย์เก่า", en: "Alumni" },
  "alumni.title": { th: "ทำเนียบศิษย์เก่าและเรื่องราวความสำเร็จ", en: "Alumni Directory & Success Stories" },
  "alumni.subtitle": { th: "เครือข่ายบัณฑิตศิษย์เก่า ความภาคภูมิใจ และเส้นทางสู่ความสำเร็จในสายอาชีพ", en: "Our alumni network, achievements, and inspirational career pathways." },
  "alumni.adminTitle": { th: "จัดการข้อมูลศิษย์เก่า", en: "Alumni Management" },
  "alumni.adminSubtitle": { th: "เพิ่ม แก้ไข ข้อมูลบัณฑิตที่สำเร็จการศึกษา และจัดการศิษย์เก่าดีเด่น", en: "Manage graduated student profiles, employment records, and featured alumni." },

  // Tabs
  "alumni.tabSpotlight": { th: "ศิษย์เก่าดีเด่น (Spotlight)", en: "Alumni Spotlight" },
  "alumni.tabDirectory": { th: "ทำเนียบศิษย์เก่า", en: "Alumni Directory" },
  "alumni.tabRegister": { th: "แจ้งอัปเดตข้อมูลศิษย์เก่า", en: "Update Alumni Profile" },

  // Fields
  "alumni.studentId": { th: "รหัสนิสิต", en: "Student ID" },
  "alumni.name": { th: "ชื่อ - นามสกุล", en: "Full Name" },
  "alumni.nameTh": { th: "ชื่อ-นามสกุล (ไทย)", en: "Name (Thai)" },
  "alumni.nameEn": { th: "ชื่อ-นามสกุล (English)", en: "Name (English)" },
  "alumni.curriculum": { th: "สาขาวิชา / หลักสูตร", en: "Curriculum / Program" },
  "alumni.graduationYear": { th: "ปีที่สำเร็จการศึกษา (พ.ศ.)", en: "Graduation Year (B.E.)" },
  "alumni.generation": { th: "รุ่นที่", en: "Generation / Class" },
  "alumni.employmentStatus": { th: "สถานะการทำงาน", en: "Employment Status" },
  "alumni.status.EMPLOYED": { th: "มีงานทำ / ทำงานประจำ", en: "Employed" },
  "alumni.status.STUDYING": { th: "ศึกษาต่อระดับสูงขึ้น", en: "Pursuing Higher Education" },
  "alumni.status.ENTREPRENEUR": { th: "ประกอบธุรกิจส่วนตัว / สตาร์ทอัพ", en: "Entrepreneur / Founder" },
  "alumni.status.JOB_SEEKING": { th: "กำลังหางาน / เตรียมตัว", en: "Seeking Employment" },
  "alumni.status.OTHER": { th: "อื่นๆ", en: "Other" },
  "alumni.jobTitle": { th: "ตำแหน่งงาน", en: "Job Title" },
  "alumni.company": { th: "สถานที่ทำงาน / องค์กร", en: "Company / Organization" },
  "alumni.industry": { th: "กลุ่มอุตสาหกรรม", en: "Industry" },
  "alumni.salaryRange": { th: "ช่วงเงินเดือน", en: "Salary Range" },
  "alumni.email": { th: "อีเมลติดต่อ", en: "Email" },
  "alumni.phone": { th: "เบอร์โทรศัพท์", en: "Phone Number" },
  "alumni.linkedin": { th: "LinkedIn Profile", en: "LinkedIn" },
  "alumni.featured": { th: "ศิษย์เก่าดีเด่น", en: "Featured Alumni" },
  "alumni.story": { th: "เรื่องราวความสำเร็จ / ข้อคิด", en: "Success Story & Advice" },

  // Filters & Actions
  "alumni.searchPlaceholder": { th: "ค้นหารหัสนิสิต, ชื่อ, บริษัท, ตำแหน่งงาน...", en: "Search student ID, name, company, job title..." },
  "alumni.allYears": { th: "ทุกปีที่จบ", en: "All Graduation Years" },
  "alumni.allCurricula": { th: "ทุกหลักสูตร", en: "All Curricula" },
  "alumni.allStatuses": { th: "ทุกสถานะ", en: "All Statuses" },
  "alumni.addAlumni": { th: "เพิ่มข้อมูลศิษย์เก่า", en: "Add Alumni" },
  "alumni.editAlumni": { th: "แก้ไขข้อมูลศิษย์เก่า", en: "Edit Alumni" },
  "alumni.deleteAlumni": { th: "ลบข้อมูลศิษย์เก่า", en: "Delete Alumni" },
  "alumni.deleteConfirm": { th: "คุณต้องการลบข้อมูลศิษย์เก่าท่านนี้ใช่หรือไม่?", en: "Are you sure you want to delete this alumni record?" },
  "alumni.saveSuccess": { th: "บันทึกข้อมูลศิษย์เก่าเรียบร้อยแล้ว", en: "Alumni record saved successfully" },
  "alumni.deleteSuccess": { th: "ลบข้อมูลศิษย์เก่าเรียบร้อยแล้ว", en: "Alumni record deleted successfully" },
  "alumni.empty": { th: "ไม่พบข้อมูลศิษย์เก่าตามเงื่อนไขที่เลือก", en: "No alumni found matching your criteria" },

  // Roles & Perms
  "roles.module.alumni": { th: "ข้อมูลศิษย์เก่า", en: "Alumni Information" },
  "perm.alumni:read": { th: "ดูข้อมูลศิษย์เก่า", en: "View alumni records" },
  "perm.alumni:manage": { th: "จัดการข้อมูลศิษย์เก่า", en: "Manage alumni records" },
} as const;
