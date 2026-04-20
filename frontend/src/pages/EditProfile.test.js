import { validatePersonal, validateEducation } from "../utils/profileUtils";

describe("validatePersonal", () => {
    test("returns no errors when all fields filled", () => {
        const personal = { fullName: "Mlungisi Mahlangu", phone: "0711234567", idNumber: "0001015000080", gender: "Male", city: "Johannesburg", province: "Gauteng" };
        expect(Object.keys(validatePersonal(personal)).length).toBe(0);
    });

    test("returns error when fullName missing", () => {
        const personal = { fullName: "", phone: "071", idNumber: "123", gender: "Male", city: "JHB", province: "Gauteng" };
        expect(validatePersonal(personal).fullName).toBe("Full Name is required");
    });

    test("returns error when phone missing", () => {
        const personal = { fullName: "Test", phone: "", idNumber: "123", gender: "Male", city: "JHB", province: "Gauteng" };
        expect(validatePersonal(personal).phone).toBe("Phone Number is required");
    });

    test("returns error when gender missing", () => {
        const personal = { fullName: "Test", phone: "071", idNumber: "123", gender: "", city: "JHB", province: "Gauteng" };
        expect(validatePersonal(personal).gender).toBe("Gender is required");
    });

    test("returns multiple errors when all fields empty", () => {
        const personal = { fullName: "", phone: "", idNumber: "", gender: "", city: "", province: "" };
        expect(Object.keys(validatePersonal(personal)).length).toBe(6);
    });

    test("returns error when city missing", () => {
        const personal = { fullName: "Test", phone: "071", idNumber: "123", gender: "Male", city: "", province: "Gauteng" };
        expect(validatePersonal(personal).city).toBe("City is required");
    });
});

describe("validateEducation", () => {
    test("returns no errors when all fields filled", () => {
        const education = { highestQualification: "Diploma", institution: "UJ", nqfLevel: "NQF 6" };
        expect(Object.keys(validateEducation(education)).length).toBe(0);
    });

    test("returns error when qualification missing", () => {
        const education = { highestQualification: "", institution: "UJ", nqfLevel: "NQF 6" };
        expect(validateEducation(education).highestQualification).toBe("Qualification is required");
    });

    test("returns error when institution missing", () => {
        const education = { highestQualification: "Diploma", institution: "", nqfLevel: "NQF 6" };
        expect(validateEducation(education).institution).toBe("Institution is required");
    });

    test("returns multiple errors when all education fields empty", () => {
        const education = { highestQualification: "", institution: "", nqfLevel: "" };
        expect(Object.keys(validateEducation(education)).length).toBe(3);
    });
});