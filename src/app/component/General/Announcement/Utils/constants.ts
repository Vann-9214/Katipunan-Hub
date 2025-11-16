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
// keys are the program slugs you provided (e.g. "bs-computer-science")
// values are the college codes used in your Combobox (e.g. "ccs", "cea", "cba")
export const programToCollege: Record<string, string> = {
  // Business / Accountancy
  "bs-accountancy": "cba",
  bsba: "cba",
  bsoa: "cba",

  // Arts & Sciences
  "ba-english": "cas",
  "ba-political-science": "cas",
  "bs-psychology": "cas",
  "bs-biology": "cas",
  "bs-mathematics": "cas",

  // Computer / IT / CCS
  "bs-computer-science": "ccs",
  "bs-information-technology": "ccs",

  // Engineering (CEA)
  "bs-computer-engineering": "cea",
  bsee: "cea",
  bsie: "cea",
  bsce: "cea",
  bsme: "cea",
  bsmining: "cea",
  "bs-chemeng": "cea",
  bsece: "cea",
  "bs-architecture": "cea",

  // Education
  beed: "coed",
  bsed: "coed",

  // Nursing / Allied
  bsn: "con",
  midwifery: "con",

  // Hospitality & Tourism
  "bs-hrm": "chtm",
  bstm: "chtm",

  // Industrial Technology
  cit: "cit",

  // Agriculture
  "bs-agriculture": "cagr",
  // add more if needed
};
// ----------------------