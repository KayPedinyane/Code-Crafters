// Profile validation and completeness checking

export const validatePersonal = (personal) => {
  const required = {
    fullName: "Full Name",
    phone:    "Phone Number",
    idNumber: "ID Number",
    gender:   "Gender",
    city:     "City",
    province: "Province",
  };
  const errors = {};
  Object.keys(required).forEach((field) => {
    if (!personal[field] || personal[field].trim() === "") {
      errors[field] = `${required[field]} is required`;
    }
  });
  return errors;
};

export const validateEducation = (education) => {
  const required = {
    highestQualification: "Qualification",
    institution:          "Institution",
    nqfLevel:             "NQF Level",
  };
  const errors = {};
  Object.keys(required).forEach((field) => {
    if (!education[field] || education[field].trim() === "") {
      errors[field] = `${required[field]} is required`;
    }
  });
  return errors;
};

export const checkMissingFields = (profileData) => {
  const missing = [];
  const REQUIRED_FIELDS = {
    full_name: "Full Name",
    phone:     "Phone Number",
    id_number: "ID Number",
    gender:    "Gender",
    city:      "City",
    province:  "Province",
  };
  const REQUIRED_EDUCATION = {
    qualification: "Highest Qualification",
    institution:   "Institution",
    nqf_level:     "NQF Level",
  };

  Object.entries(REQUIRED_FIELDS).forEach(([field, label]) => {
    if (!profileData[field] || profileData[field].toString().trim() === "") {
      missing.push(label);
    }
  });
  Object.entries(REQUIRED_EDUCATION).forEach(([field, label]) => {
    if (!profileData[field] || profileData[field].toString().trim() === "") {
      missing.push(label);
    }
  });
  return missing;
};