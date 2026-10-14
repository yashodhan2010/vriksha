import { redirect } from "next/navigation";
export const metadata = { title: "Audit report" };

export default function AuditReportPage() {
  redirect("/compliance#audit-report");
}
