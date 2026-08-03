import Link from "next/link";
import { raProfile, standardMarketRiskWarning, standardSebiDisclaimer } from "@/lib/compliance";

export function RegistrationDisclosureBlock({
  className = "",
  suitability = "NA",
  targetInvestor = "NA"
}: {
  className?: string;
  suitability?: string;
  targetInvestor?: string;
}) {
  return (
    <section className={`card p-5 text-sm leading-6 text-ink/70 ${className}`}>
      <p className="font-semibold text-ink">
        Vriksha Research · SEBI-registered Research Analyst · Registration No. {raProfile.sebiRegistrationNumber}
      </p>
      <p className="mt-2">{standardMarketRiskWarning}</p>
      <p className="mt-2">{standardSebiDisclaimer}</p>
      <p className="mt-3">
        Suitability: <strong className="text-ink">{suitability}</strong> · Target investor: <strong className="text-ink">{targetInvestor}</strong>
      </p>
      <p className="mt-3">
        Grievance Officer: {raProfile.grievanceOfficer.name}, SEBI-registered Research Analyst
        (Registration No. {raProfile.sebiRegistrationNumber}). Contact: {raProfile.grievanceOfficer.email} / {raProfile.grievanceOfficer.telephone}.
      </p>
      <p className="mt-2">
        Investor grievances may be lodged on{" "}
        <Link href="https://scores.sebi.gov.in" className="font-medium text-pine hover:text-ink">
          SEBI SCORES
        </Link>
        {" "}or through the{" "}
        <Link href="https://smartodr.in" className="font-medium text-pine hover:text-ink">
          SMART ODR
        </Link>
        {" "}platform.
      </p>
    </section>
  );
}
