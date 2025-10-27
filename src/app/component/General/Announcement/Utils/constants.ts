// Constants.ts on AddPosts

export const collegeitems = [
  {
    value: "cea",
    label: "Engineering and Architecture (CEA)",
    selectedPlaceholder: "CEA",
  },
  {
    value: "cba",
    label: "Business Administration (CBA)",
    selectedPlaceholder: "CBA",
  },
  {
    value: "cas",
    label: "Arts and Sciences (CAS)",
    selectedPlaceholder: "CAS",
  },
  {
    value: "ccs",
    label: "Computer Studies (CCS)",
    selectedPlaceholder: "CCS",
  },
  { value: "coed", label: "Education (COED)", selectedPlaceholder: "COED" },
  { value: "con", label: "Nursing (CON)", selectedPlaceholder: "CON" },
  {
    value: "chtm",
    label: "Hospitality and Tourism Management (CHTM)",
    selectedPlaceholder: "CHTM",
  },
  { value: "claw", label: "Law (CLAW)", selectedPlaceholder: "CLAW" },
  { value: "cah", label: "Allied Health (CAH)", selectedPlaceholder: "CAH" },
  {
    value: "cit",
    label: "Industrial Technology (CIT)",
    selectedPlaceholder: "CIT",
  },
  { value: "cagr", label: "Agriculture (CAGR)", selectedPlaceholder: "CAGR" },
];

// AnnouncementPageContent/constants.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const supabase = createClientComponentClient();

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