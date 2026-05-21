// ── NQF Data sourced from SAQA (South African Qualifications Authority) ──
// Source: https://www.saqa.org.za
// The NQF is defined by the National Qualifications Framework Act (67 of 2008)

export const NQF_LEVELS = [
    { value: "NQF 1", label: "NQF Level 1", description: "General Certificate" },
    { value: "NQF 2", label: "NQF Level 2", description: "Elementary Certificate" },
    { value: "NQF 3", label: "NQF Level 3", description: "Intermediate Certificate" },
    { value: "NQF 4", label: "NQF Level 4", description: "National Certificate (Matric equivalent)" },
    { value: "NQF 5", label: "NQF Level 5", description: "Higher Certificate / Advanced National Certificate" },
    { value: "NQF 6", label: "NQF Level 6", description: "Diploma / Advanced Certificate" },
    { value: "NQF 7", label: "NQF Level 7", description: "Bachelor's Degree / Advanced Diploma" },
    { value: "NQF 8", label: "NQF Level 8", description: "Honours Degree / Postgraduate Diploma" },
    { value: "NQF 9", label: "NQF Level 9", description: "Master's Degree" },
    { value: "NQF 10", label: "NQF Level 10", description: "Doctoral Degree" },
];

// ── SAQA Registered Qualification Types ──
export const QUALIFICATION_TYPES = [
    { value: "Grade 12 / Matric", nqf: "NQF 4", type: "National Senior Certificate" },
    { value: "Higher Certificate", nqf: "NQF 5", type: "Higher Certificate" },
    { value: "Advanced Certificate", nqf: "NQF 6", type: "Advanced Certificate" },
    { value: "Diploma", nqf: "NQF 6", type: "Diploma" },
    { value: "Advanced Diploma", nqf: "NQF 7", type: "Advanced Diploma" },
    { value: "Bachelor's Degree", nqf: "NQF 7", type: "Bachelor Degree" },
    { value: "Postgraduate Diploma", nqf: "NQF 8", type: "Postgraduate Diploma" },
    { value: "Honours Degree", nqf: "NQF 8", type: "Bachelor Honours Degree" },
    { value: "Master's Degree", nqf: "NQF 9", type: "Master Degree" },
    { value: "Doctoral Degree", nqf: "NQF 10", type: "Doctoral Degree" },
];

// ── SETA-aligned Sectors ──
export const SECTORS = [
  "Agriculture",
  "Banking",
  "Chemical Industries",
  "Construction",
  "Education & Training",
  "Energy & Water",
  "Finance & Accounting",
  "Food & Beverages",
  "Healthcare",
  "ICT & Media",
  "Insurance",
  "Local Government",
  "Manufacturing & Engineering",
  "Mining & Minerals",
  "Public Service",
  "Safety & Security",
  "Services",
  "Tourism & Hospitality",
  "Transport",
  "Wholesale & Retail",
  "Fibre Processing & Manufacturing",
];