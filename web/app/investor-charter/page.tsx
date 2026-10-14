import { redirect } from "next/navigation";
export const metadata = { title: "Investor charter" };

export default function InvestorCharterPage() {
  redirect("/compliance#investor-charter");
}
