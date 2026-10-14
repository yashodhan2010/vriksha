import { redirect } from "next/navigation";
export const metadata = { title: "Grievance redressal" };

export default function ComplaintsPage() {
  redirect("/compliance#complaints-disclosure");
}
