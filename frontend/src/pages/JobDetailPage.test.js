import { formatDate } from "../utils/dateUtils";
import { checkMissingFields } from "../utils/profileUtils";

describe("formatDate", () => {
    test("returns N/A for null", () => { expect(formatDate(null)).toBe("N/A"); });
    test("returns N/A for undefined", () => { expect(formatDate(undefined)).toBe("N/A"); });
    test("returns N/A for empty string", () => { expect(formatDate("")).toBe("N/A"); });
    test("formats a valid date and contains year", () => {
        expect(formatDate("2026-06-30")).toContain("2026");
    });
    test("formats a valid date and contains day", () => {
        expect(formatDate("2026-06-30")).toContain("30");
    });
});

describe("checkMissingFields", () => {
    test("returns empty array for complete profile", () => {
        const profile = { full_name: "Mlungisi", phone: "071", id_number: "123", gender: "Male", city: "JHB", province: "Gauteng", qualification: "Diploma", institution: "UJ", nqf_level: "NQF 6" };
        expect(checkMissingFields(profile).length).toBe(0);
    });

    test("detects missing full_name", () => {
        const profile = { full_name: "", phone: "071", id_number: "123", gender: "Male", city: "JHB", province: "Gauteng", qualification: "Diploma", institution: "UJ", nqf_level: "NQF 6" };
        expect(checkMissingFields(profile)).toContain("Full Name");
    });

    test("detects all 9 missing fields for empty profile", () => {
        const profile = { full_name: "", phone: "", id_number: "", gender: "", city: "", province: "", qualification: "", institution: "", nqf_level: "" };
        expect(checkMissingFields(profile).length).toBe(9);
    });

    test("detects missing education fields only", () => {
        const profile = { full_name: "Test", phone: "071", id_number: "123", gender: "Male", city: "JHB", province: "Gauteng", qualification: "", institution: "", nqf_level: "" };
        expect(checkMissingFields(profile)).toContain("Highest Qualification");
        expect(checkMissingFields(profile)).toContain("NQF Level");
    });

    test("detects missing personal fields only", () => {
        const profile = { full_name: "", phone: "", id_number: "", gender: "", city: "", province: "", qualification: "Diploma", institution: "UJ", nqf_level: "NQF 6" };
        expect(checkMissingFields(profile)).toContain("Full Name");
        expect(checkMissingFields(profile)).toContain("Phone Number");
    });
});