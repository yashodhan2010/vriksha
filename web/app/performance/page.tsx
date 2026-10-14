import { redirect } from "next/navigation";
export const metadata = { title: "Performance" };

export default function PerformancePage() {
  redirect("/strategies");
}
