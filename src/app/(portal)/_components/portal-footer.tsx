import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import { getLocale } from "@/shared/lib/i18n/server";

export async function PortalFooter() {
  const locale = await getLocale();

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Faculty Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-base text-foreground">
                {locale === "th" ? "คณะวิทยาการสารสนเทศ" : "Faculty of Informatics"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {locale === "th"
                ? "มุ่งผลิตบัณฑิตสู่ความเป็นเลิศด้านปัญญาประดิษฐ์ วิศวกรรมซอฟต์แวร์ และนวัตกรรมดิจิทัลระดับสากล เพื่อขับเคลื่อนเศรษฐกิจและสังคมแห่งอนาคต"
                : "Committed to academic excellence in Artificial Intelligence, Software Engineering, and digital innovation to empower future societies."}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {locale === "th" ? "ทางลัด" : "Quick Links"}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  {locale === "th" ? "หน้าแรก" : "Home"}
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-primary transition-colors">
                  {locale === "th" ? "ข่าวประชาสัมพันธ์" : "News & PR"}
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-primary transition-colors">
                  {locale === "th" ? "ทำเนียบคณาจารย์" : "Faculty Directory"}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  {locale === "th" ? "ระบบจัดการหลังบ้าน" : "Staff Console"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {locale === "th" ? "ติดต่อเรา" : "Contact Us"}
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{locale === "th" ? "อาคารเทคโนโลยีสารสนเทศ 123 ถ.มหาวิทยาลัย" : "IT Complex, 123 University Rd."}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>02-123-4500</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>contact@informatics.university.ac.th</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} Faculty of Informatics. All rights reserved.</p>
          <p>Built with VibeCore Modular Monolith Framework</p>
        </div>
      </div>
    </footer>
  );
}
