// Constants.ts on AddPosts

import {
  HardHat,
  Briefcase,
  FlaskConical,
  Laptop,
  GraduationCap,
  Stethoscope,
  Utensils,
  Scale,
  HeartPulse,
  Wrench,
  Sprout,
} from "lucide-react";

export const collegeitems = [
  {
    value: "cea",
    label: "Engineering and Architecture (CEA)",
    selectedPlaceholder: "Engineering and Architecture (CEA)",
    icon: HardHat,
  },
  {
    value: "cba",
    label: "Business Administration (CBA)",
    selectedPlaceholder: "Business Administration (CBA)",
    icon: Briefcase,
  },
  {
    value: "cas",
    label: "Arts and Sciences (CAS)",
    selectedPlaceholder: "Arts and Sciences (CAS)",
    icon: FlaskConical,
  },
  {
    value: "ccs",
    label: "Computer Studies (CCS)",
    selectedPlaceholder: "Computer Studies (CCS)",
    icon: Laptop,
  },
  {
    value: "coed",
    label: "Education (COED)",
    selectedPlaceholder: "Education (COED)",
    icon: GraduationCap,
  },
  {
    value: "con",
    label: "Nursing (CON)",
    selectedPlaceholder: "Nursing (CON)",
    icon: Stethoscope,
  },
  {
    value: "chtm",
    label: "Hospitality and Tourism Management (CHTM)",
    selectedPlaceholder: "Hospitality and Tourism Management (CHTM)",
    icon: Utensils,
  },
  {
    value: "claw",
    label: "Law (CLAW)",
    selectedPlaceholder: "Law (CLAW)",
    icon: Scale,
  },
  {
    value: "cah",
    label: "Allied Health (CAH)",
    selectedPlaceholder: "Allied Health (CAH)",
    icon: HeartPulse,
  },
  {
    value: "cit",
    label: "Industrial Technology (CIT)",
    selectedPlaceholder: "Industrial Technology (CIT)",
    icon: Wrench,
  },
  {
    value: "cagr",
    label: "Agriculture (CAGR)",
    selectedPlaceholder: "Agriculture (CAGR)",
    icon: Sprout,
  },
];

// AnnouncementPageContent/constants.ts

// small visibility constants for easy reuse
export const VISIBILITY = {
  GLOBAL: "global",
};

// ----------------------
// Program -> College map
// keys are the program slugs (user.course is usually lowercased before check)
// values are the college codes used in your Combobox (e.g. "ccs", "cea", "cba")
export const programToCollege: Record<string, string> = {
  // Business / Accountancy
  "accountancy": "cba",
  "business administration": "cba",
  "office administration": "cba",

  // Arts & Sciences
  "english": "cas",
  "political science": "cas",
  "psychology": "cas",
  "biology": "cas",
  "mathematics": "cas",

  // Computer / IT / CCS
  "computer science": "ccs",
  "information technology": "ccs",

  // Engineering (CEA)
  "computer engineering": "cea",
  "electrical engineering": "cea",
  "industrial engineering": "cea",
  "civil engineering": "cea",
  "mechanical engineering": "cea",
  "mining engineering": "cea",
  "chemical engineering": "cea",
  "electronics engineering": "cea",
  "architecture": "cea",

  // Education
  "elementary education": "coed",
  "secondary education": "coed",

  // Nursing / Allied
  "nursing": "con",
  "midwifery": "con",

  // Hospitality & Tourism
  "hotel and restaurant management": "chtm",
  "tourism management": "chtm",

  // Industrial Technology (General catch-all if needed)
  "cit": "cit",

  // Agriculture
  "agriculture": "cagr",
};
// ----------------------