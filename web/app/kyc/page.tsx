import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/access";

export default async function KycPage() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login?next=/dashboard");
}
