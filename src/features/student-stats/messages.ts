export const messages = {
  "stats.nav": { th: "สถิตินิสิต", en: "Student Statistics" },
  "stats.title": { th: "ระบบสถิติและข้อมูลเชิงวิเคราะห์ของนิสิต", en: "Student Demographics & Analytics Dashboard" },
  "stats.subtitle": { th: "ภาพรวมข้อมูลประชากรศาสตร์ สัดส่วนเพศ สัญชาติ เชื้อชาติ และแนวโน้มการศึกษาของคณะ", en: "Comprehensive insights into student demographics, gender ratios, nationalities, and academic trends." },
  "students.adminTitle": { th: "จัดการข้อมูลนิสิตและสถิติ", en: "Student Management & Statistics" },
  "students.adminSubtitle": { th: "เพิ่ม แก้ไข ค้นหาข้อมูลนิสิต และตรวจสอบสถิติเชิงลึกของคณะ", en: "Manage student profiles and monitor faculty demographic analytics." },

  // Key Metrics
  "stats.totalEnrolled": { th: "นิสิตที่กำลังศึกษาอยู่ทั้งหมด", en: "Total Enrolled Students" },
  "stats.totalAlumni": { th: "บัณฑิตสำเร็จการศึกษา", en: "Total Graduated Alumni" },
  "stats.employmentRate": { th: "อัตราการได้งานทำของบัณฑิต", en: "Graduate Employment Rate" },
  "stats.internationalCount": { th: "นิสิตต่างชาติ / นานาชาติ", en: "International Students" },

  // Chart Titles
  "stats.chartGender": { th: "สถิติสัดส่วนเพศ (ชาย / หญิง)", en: "Gender Distribution" },
  "stats.chartNationality": { th: "สถิติสัญชาติและเชื้อชาติ", en: "Nationality & Ethnicity Breakdown" },
  "stats.chartDegreeLevel": { th: "จำแนกตามระดับการศึกษา", en: "By Degree Level" },
  "stats.chartCurriculum": { th: "สถิตินิสิตแยกตามหลักสูตรและชั้นปี", en: "By Program & Cohort" },
  "stats.chartEmployment": { th: "ทิศทางการประกอบอาชีพของบัณฑิต", en: "Graduate Career Pathways" },

  // Fields & Enums
  "stats.male": { th: "ชาย", en: "Male" },
  "stats.female": { th: "หญิง", en: "Female" },
  "stats.otherGender": { th: "อื่นๆ", en: "Other" },
  "stats.thai": { th: "ไทย", en: "Thai" },
  "stats.international": { th: "ต่างชาติ", en: "International" },
  "stats.nationality": { th: "สัญชาติ", en: "Nationality" },
  "stats.ethnicity": { th: "เชื้อชาติ", en: "Ethnicity" },
  "stats.religion": { th: "ศาสนา", en: "Religion" },
  "stats.region": { th: "ภูมิลำเนา", en: "Domicile Region" },
  "stats.admissionYear": { th: "ปีที่เข้าศึกษา (พ.ศ.)", en: "Admission Year" },
  "stats.currentYear": { th: "ชั้นปีที่", en: "Current Year" },
  "stats.status": { th: "สถานะนิสิต", en: "Student Status" },
  "stats.status.ENROLLED": { th: "กำลังศึกษา", en: "Enrolled" },
  "stats.status.ON_LEAVE": { th: "พักการเรียน", en: "On Leave" },
  "stats.status.GRADUATED": { th: "สำเร็จการศึกษา", en: "Graduated" },
  "stats.status.DISMISSED": { th: "พ้นสภาพ", en: "Dismissed" },

  // Filters & Management
  "students.addStudent": { th: "เพิ่มข้อมูลนิสิต", en: "Add Student" },
  "students.editStudent": { th: "แก้ไขข้อมูลนิสิต", en: "Edit Student" },
  "students.deleteStudent": { th: "ลบข้อมูลนิสิต", en: "Delete Student" },
  "students.deleteConfirm": { th: "คุณต้องการลบข้อมูลนิสิตท่านนี้ใช่หรือไม่?", en: "Are you sure you want to delete this student profile?" },
  "students.saveSuccess": { th: "บันทึกข้อมูลนิสิตเรียบร้อยแล้ว", en: "Student record saved successfully" },
  "students.deleteSuccess": { th: "ลบข้อมูลนิสิตเรียบร้อยแล้ว", en: "Student record deleted successfully" },
  "students.empty": { th: "ไม่พบข้อมูลนิสิตตามเงื่อนไขที่เลือก", en: "No student records found" },

  // Roles & Perms
  "roles.module.students": { th: "ข้อมูลและสถิตินิสิต", en: "Student Information & Statistics" },
  "perm.students:read": { th: "ดูข้อมูลและสถิตินิสิต", en: "View student records & statistics" },
  "perm.students:manage": { th: "จัดการข้อมูลนิสิต", en: "Manage student profiles" },
} as const;
