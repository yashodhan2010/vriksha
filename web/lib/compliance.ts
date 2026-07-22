export const standardMarketRiskWarning =
  "Investment in securities market are subject to market risks. Read all the related documents carefully before investing.";

export const standardSebiDisclaimer =
  "Registration granted by SEBI, enlistment with BSE and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors.";

export const raProfile = {
  brandName: "Vriksha",
  logoText: "Vriksha",
  researchAnalysts: ["Prathmesh Jaiprakash Gupta"],
  sebiRegistrationNumber: "INH000027788",
  registeredOffice: {
    address:
      "701 & 702, Floor-7, Sunset (Padmavati) CHS, Eknath Buwa Hatiskar Marg, Hatiskarwadi NR Tel Exchange, Prabhadevi, Mumbai, Maharashtra - 400025",
    telephone: "+91 9930521527",
    email: "gupta.prathmesh@yahoo.in"
  },
  complianceOfficer: {
    name: "Prathmesh Jaiprakash Gupta",
    telephone: "+91 9930521527",
    email: "gupta.prathmesh@yahoo.in"
  },
  grievanceOfficer: {
    name: "Prathmesh Jaiprakash Gupta",
    telephone: "+91 9930521527",
    email: "gupta.prathmesh@yahoo.in"
  }
};

export const sebiContacts = {
  headOffice: {
    name: "SEBI Head Office",
    address: "SEBI Bhavan, Plot No. C4-A, G Block, Bandra-Kurla Complex, Bandra East, Mumbai - 400051, Maharashtra",
    telephone: "+91-22-26449000 / +91-22-40459000",
    tollFreeInvestorHelpline: "1800 22 7575",
    website: "https://www.sebi.gov.in/contact-us.html"
  },
  localOffice: {
    name: "SEBI Mumbai Office",
    address: "SEBI Bhavan, Plot No. C4-A, G Block, Bandra-Kurla Complex, Bandra East, Mumbai - 400051, Maharashtra",
    telephone: "+91-22-26449000 / +91-22-40459000",
    website: "https://www.sebi.gov.in/contact-us.html"
  },
  scores: {
    name: "SEBI SCORES",
    website: "https://scores.sebi.gov.in/"
  },
  odr: {
    name: "SMART ODR",
    website: "https://smartodr.in/"
  },
  physicalComplaints: {
    name: "Office of Investor Assistance and Education",
    address:
      "Securities and Exchange Board of India, NBCC Complex, Office Tower-1, 8th Floor, Plate B, East Kidwai Nagar, New Delhi - 110023"
  }
};

export const grievanceSteps = [
  "If a client is not satisfied with the services and wants to lodge a complaint, the client should first contact the Research Analyst representative or consultant by telephone or email.",
  "Complaints may be raised by phone at +91 9930521527 or by email at gupta.prathmesh@yahoo.in.",
  "The Research Analyst will try to resolve the complaint within 21 days of receipt of the grievance.",
  "If the client is still not satisfied, the client may escalate to Prathmesh Jaiprakash Gupta, Principal Officer, at gupta.prathmesh@yahoo.in with complete details.",
  "If the grievance remains unresolved, the investor may lodge the grievance with SEBI through SCORES 2.0.",
  "If the investor is not satisfied with the resolution provided through the support or SCORES platform, the investor may access the SMART ODR platform for online conciliation or arbitration."
];

export const escalationMatrix = [
  {
    level: "Level 1",
    owner: "Customer Care - Prathmesh Jaiprakash Gupta",
    contact: `${raProfile.registeredOffice.telephone} / ${raProfile.registeredOffice.email}`,
    timeline: "Mon-Fri, 09:00 AM - 05:00 PM"
  },
  {
    level: "Level 2",
    owner: "Compliance Officer - Prathmesh Jaiprakash Gupta",
    contact: `${raProfile.complianceOfficer.telephone} / ${raProfile.complianceOfficer.email}`,
    timeline: "Formal grievance review within 21 working days"
  },
  {
    level: "Level 3",
    owner: "Principal Officer - Prathmesh Jaiprakash Gupta",
    contact: `${raProfile.registeredOffice.telephone} / ${raProfile.registeredOffice.email}`,
    timeline: "Principal officer escalation"
  },
  {
    level: "Level 4",
    owner: "SEBI SCORES",
    contact: sebiContacts.scores.website,
    timeline: "Regulatory grievance platform"
  }
];

export const complaintsDisclosure = [
  {
    month: "July 2026",
    received: 0,
    resolved: 0,
    pending: 0,
    scoresReceived: 0,
    scoresResolved: 0,
    lastUpdated: "To be updated by 2026-08-07"
  }
];

export const investorCharterItems = [
  "Vision: Invest with knowledge and safety.",
  "Mission: Every investor should be able to invest in suitable investment products based on their needs, manage and monitor investments to meet goals, access reports, and enjoy financial wellness.",
  "Publish research reports based on the research activities of the Research Analyst and provide an independent, unbiased view on securities.",
  "Offer unbiased recommendations while disclosing financial interests in recommended securities.",
  "Provide research recommendations based on analysis of publicly available information and known observations.",
  "Conduct audit annually.",
  "Maintain records of interactions with clients and prospective clients where conversation related to research services has taken place.",
  "Respect data privacy rights of clients and protect confidential information from unauthorized use.",
  "Treat all clients with honesty and integrity.",
  "Do not provide funds for investment to the Research Analyst and do not share trading, demat, or bank login credentials."
];

export const generalDisclosures = [
  "Prathmesh Jaiprakash Gupta is registered with SEBI as an Individual Research Analyst vide registration number INH000027788 on June 04, 2026.",
  "Prathmesh Jaiprakash Gupta has registered office at 701 & 702, Floor-7, Sunset (Padmavati) CHS, Eknath Buwa Hatiskar Marg, Hatiskarwadi NR Tel Exchange, Prabhadevi, Mumbai, Maharashtra - 400025.",
  "There are no outstanding litigations or disciplinary history against Prathmesh Jaiprakash Gupta as per the disclosure documents provided.",
  "Prathmesh Jaiprakash Gupta is not affiliated with any other intermediaries and does not receive brokerage or commission from any third party.",
  "Prathmesh Jaiprakash Gupta or associates have not received compensation from companies covered by Research Analyst during the past twelve months.",
  "Prathmesh Jaiprakash Gupta may use Artificial Intelligence tools for providing research services.",
  "Model portfolios are research products and do not constitute trade execution.",
  "Backtested performance is based on historical data, assumptions, and methodology constraints.",
  "Actual investor returns may differ due to execution price, fees, taxes, liquidity, slippage, and timing.",
  "No strategy can guarantee future performance or assure returns.",
  "Subscribers are responsible for evaluating suitability, risk appetite, and independent decision-making."
];
