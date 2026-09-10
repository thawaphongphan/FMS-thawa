import { getDefaultTenantId } from "@/shared/lib/portal-tenant";
import {
  listPublicAlumni,
  listFeaturedAlumni,
  listAlumniOptions,
} from "@/features/alumni/server";
import { AlumniView } from "./_components/alumni-view";

export const metadata = {
  title: "ทำเนียบศิษย์เก่า | Alumni Network",
  description: "เครือข่ายศิษย์เก่าและเรื่องราวความสำเร็จของบัณฑิต",
};

export default async function AlumniPortalPage() {
  const tenantId = await getDefaultTenantId();

  const [alumniList, featuredList, options] = await Promise.all([
    listPublicAlumni(tenantId),
    listFeaturedAlumni(tenantId),
    listAlumniOptions(tenantId),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <AlumniView
        alumniList={alumniList}
        featuredList={featuredList}
        curricula={options.curricula.map((c) => ({
          id: c.id,
          programCode: c.programCode,
          nameTh: c.nameTh,
        }))}
        graduationYears={options.graduationYears}
      />
    </div>
  );
}
