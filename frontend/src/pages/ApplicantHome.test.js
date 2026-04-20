import { filterJobs } from "../utils/filterUtils";

const DUMMY_JOBS = [
    { id: 1, title: "IT Learnership", sector: "ICT", nqf_level: "NQF 4", location: "Johannesburg", type: "Learnership" },
    { id: 2, title: "Finance Internship", sector: "Finance", nqf_level: "NQF 6", location: "Sandton", type: "Internship" },
    { id: 3, title: "Engineering App", sector: "Engineering", nqf_level: "NQF 5", location: "Cape Town", type: "Apprenticeship" },
];

describe("Job filter logic", () => {
    test("returns all jobs when no filters applied", () => {
        const result = filterJobs(DUMMY_JOBS, { sector: "", nqfLevel: "", location: "", type: "" });
        expect(result.length).toBe(3);
    });

    test("filters by sector correctly", () => {
        const result = filterJobs(DUMMY_JOBS, { sector: "ICT", nqfLevel: "", location: "", type: "" });
        expect(result.length).toBe(1);
        expect(result[0].title).toBe("IT Learnership");
    });

    test("filters by NQF level correctly", () => {
        const result = filterJobs(DUMMY_JOBS, { sector: "", nqfLevel: "NQF 6", location: "", type: "" });
        expect(result.length).toBe(1);
        expect(result[0].sector).toBe("Finance");
    });

    test("filters by location correctly", () => {
        const result = filterJobs(DUMMY_JOBS, { sector: "", nqfLevel: "", location: "Cape Town", type: "" });
        expect(result.length).toBe(1);
        expect(result[0].title).toBe("Engineering App");
    });

    test("filters by type correctly", () => {
        const result = filterJobs(DUMMY_JOBS, { sector: "", nqfLevel: "", location: "", type: "Internship" });
        expect(result.length).toBe(1);
        expect(result[0].title).toBe("Finance Internship");
    });

    test("returns empty array when no jobs match", () => {
        const result = filterJobs(DUMMY_JOBS, { sector: "Healthcare", nqfLevel: "", location: "", type: "" });
        expect(result.length).toBe(0);
    });

    test("combines multiple filters correctly", () => {
        const result = filterJobs(DUMMY_JOBS, { sector: "ICT", nqfLevel: "NQF 4", location: "", type: "" });
        expect(result.length).toBe(1);
        expect(result[0].id).toBe(1);
    });
});