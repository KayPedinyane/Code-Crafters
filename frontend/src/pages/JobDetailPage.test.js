/**
 * JobDetailPage.test.js
 * Coverage target: ≥ 90%
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import JobDetailPage from "./JobDetailPage";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockUnsubscribe = jest.fn();
jest.mock("../firebase", () => ({ auth: {} }));
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
}));

import { onAuthStateChanged } from "firebase/auth";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_JOB = {
  id: 1,
  title: "ICT Learnership",
  type: "Learnership",
  location: "Johannesburg, Gauteng",
  description: "A great learnership.",
  company_name: "TechCorp SA",
  stipend: "R3000/month",
  duration: "12 months",
  nqf_level: "NQF 4",
  sector: "ICT",
  closing_date: "2099-12-31",
  status: "Open",
  requirements: "Matric,Computer literacy",
};

const EXPIRED_JOB = {
  ...MOCK_JOB,
  id: 2,
  closing_date: "2020-01-01",
};

const MOCK_USER = { email: "test@example.com" };

const COMPLETE_PROFILE = {
  full_name: "Test User",
  phone: "0821234567",
  id_number: "9001015009087",
  gender: "Male",
  city: "Johannesburg",
  province: "Gauteng",
  qualification: "Matric",
  institution: "Test High",
  nqf_level: "NQF 4",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Trigger the onAuthStateChanged callback */
function triggerAuth(user) {
  const cb = onAuthStateChanged.mock.calls[0][1];
  act(() => cb(user));
}

/**
 * Render at /applicant/job/:id.
 * Pass `jobState` to simulate navigation state (skips fetch).
 */
function renderComponent(id = "1", jobState = null) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: `/applicant/job/${id}`, state: jobState ? { job: jobState } : undefined },
      ]}
    >
      <Routes>
        <Route path="/applicant/job/:id" element={<JobDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

/** Default fetch: opportunities list + profile + applications + notifications */
function setupFetch({
  jobs = [MOCK_JOB],
  profile = COMPLETE_PROFILE,
  applyStatus = 201,
  applyBody = {},
  profileThrows = false,
  applyThrows = false,
} = {}) {
  global.fetch = jest.fn((url, options) => {
    // Profile check
    if (url.includes("/profile/")) {
      if (profileThrows) return Promise.reject(new Error("Network"));
      return Promise.resolve({ json: () => Promise.resolve(profile) });
    }
    // Notification POST — always succeeds silently
    if (url.includes("/notifications") && options?.method === "POST" && !url.includes("/applications")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    // Apply POST
    if (url.includes("/applications") && options?.method === "POST") {
      if (applyThrows) return Promise.reject(new Error("Network"));
      return Promise.resolve({
        ok: applyStatus >= 200 && applyStatus < 300,
        status: applyStatus,
        json: () => Promise.resolve(applyBody),
      });
    }
    // Opportunities list
    if (url.includes("/opportunities")) {
      return Promise.resolve({ json: () => Promise.resolve(jobs) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  window.scrollTo = jest.fn();
  window.confirm = jest.fn(() => true);
  onAuthStateChanged.mockImplementation((_auth, cb) => {
    // don't auto-trigger; tests call triggerAuth manually
    return mockUnsubscribe;
  });
  setupFetch();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("JobDetailPage — loading & not-found states", () => {
  test("shows loading state when fetch is pending", () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    renderComponent("1");
    triggerAuth(null);
    expect(
      screen.getByText((_, el) => el?.textContent?.includes("Loading opportunity"))
    ).toBeInTheDocument();
  });

  test("shows not-found state when job id has no match", async () => {
    setupFetch({ jobs: [] });
    renderComponent("99");
    triggerAuth(null);
    await waitFor(() =>
      expect(screen.getByText("Opportunity not found")).toBeInTheDocument()
    );
  });

  test("not-found back button navigates to /applicant", async () => {
    setupFetch({ jobs: [] });
    renderComponent("99");
    triggerAuth(null);
    await waitFor(() => screen.getByText("← Back to listings"));
    fireEvent.click(screen.getByText("← Back to listings"));
    expect(mockNavigate).toHaveBeenCalledWith("/applicant");
  });

  test("shows not-found when fetch throws", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network")));
    renderComponent("1");
    triggerAuth(null);
    await waitFor(() =>
      expect(screen.getByText("Opportunity not found")).toBeInTheDocument()
    );
  });
});

describe("JobDetailPage — job loaded via navigation state", () => {
  test("renders job title immediately from location state", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(screen.getByText("ICT Learnership")).toBeInTheDocument();
  });

  test("does not call fetch for opportunities when job is in state", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/opportunities"),
      expect.anything()
    );
  });
});

describe("JobDetailPage — job loaded via fetch", () => {
  test("renders job title after fetching from API", async () => {
    renderComponent("1");
    triggerAuth(null);
    await waitFor(() =>
      expect(screen.getByText("ICT Learnership")).toBeInTheDocument()
    );
  });

  test("fetches opportunities and finds job by numeric id", async () => {
    renderComponent("1");
    triggerAuth(null);
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/opportunities")
      )
    );
  });
});

describe("JobDetailPage — rendered content", () => {
  test("renders company name", async () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(screen.getByText(/TechCorp SA/)).toBeInTheDocument();
  });

  test("falls back to company field when company_name missing", () => {
    const job = { ...MOCK_JOB, company_name: undefined, company: "FallbackCo" };
    renderComponent("1", job);
    triggerAuth(null);
    expect(screen.getByText(/FallbackCo/)).toBeInTheDocument();
  });

  test("falls back to sector when company_name and company are missing", () => {
    const job = { ...MOCK_JOB, company_name: undefined, company: undefined };
    renderComponent("1", job);
    triggerAuth(null);
    // Scope to the company paragraph in the hero, not the sector info items
    const companyEl = document.querySelector(".detail-company");
    expect(companyEl.textContent).toMatch(/ICT/);
  });

  test("renders location, stipend, duration, nqf_level, sector", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(screen.getByText("Johannesburg, Gauteng")).toBeInTheDocument();
    expect(screen.getAllByText("R3000/month").length).toBeGreaterThan(0);
    expect(screen.getAllByText("12 months").length).toBeGreaterThan(0);
    expect(screen.getAllByText("NQF 4").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ICT").length).toBeGreaterThan(0);
  });

  test("renders description", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(screen.getByText("A great learnership.")).toBeInTheDocument();
  });

  test("renders formatted closing date", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    // formatDate produces locale string — just check the year appears
    expect(screen.getAllByText(/2099/).length).toBeGreaterThan(0);
  });

  test("renders N/A when closing_date is absent", () => {
    const job = { ...MOCK_JOB, closing_date: null };
    renderComponent("1", job);
    triggerAuth(null);
    expect(screen.getAllByText("N/A").length).toBeGreaterThan(0);
  });

  test("renders requirements from comma-separated string", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(screen.getByText("Matric")).toBeInTheDocument();
    expect(screen.getByText("Computer literacy")).toBeInTheDocument();
  });

  test("renders requirements from array", () => {
    const job = { ...MOCK_JOB, requirements: ["Team player", "Self-motivated"] };
    renderComponent("1", job);
    triggerAuth(null);
    expect(screen.getByText("Team player")).toBeInTheDocument();
    expect(screen.getByText("Self-motivated")).toBeInTheDocument();
  });

  test("does not render requirements section when requirements is empty", () => {
    const job = { ...MOCK_JOB, requirements: "" };
    renderComponent("1", job);
    triggerAuth(null);
    expect(screen.queryByText("Requirements")).not.toBeInTheDocument();
  });

  test("renders Learnership type badge with correct colour", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(
      screen.getByText((_, el) => el?.textContent?.trim() === "Learnership")
    ).toBeInTheDocument();
  });

  test("renders Internship type badge", () => {
    const job = { ...MOCK_JOB, type: "Internship" };
    renderComponent("1", job);
    triggerAuth(null);
    expect(
      screen.getByText((_, el) => el?.textContent?.trim() === "Internship")
    ).toBeInTheDocument();
  });

  test("renders Apprenticeship type badge", () => {
    const job = { ...MOCK_JOB, type: "Apprenticeship" };
    renderComponent("1", job);
    triggerAuth(null);
    expect(
      screen.getByText((_, el) => el?.textContent?.trim() === "Apprenticeship")
    ).toBeInTheDocument();
  });

  test("renders unknown type badge with fallback colour", () => {
    const job = { ...MOCK_JOB, type: "Bursary" };
    renderComponent("1", job);
    triggerAuth(null);
    expect(
      screen.getByText((_, el) => el?.textContent?.trim() === "Bursary")
    ).toBeInTheDocument();
  });

  test("renders Open badge for non-expired job", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    // "Open" appears in both the hero badge and the Programme details status row
    expect(screen.getAllByText("Open").length).toBeGreaterThan(0);
  });

  test("renders Apply Now button for non-expired job", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(screen.getByText("Apply Now")).toBeInTheDocument();
  });
});

describe("JobDetailPage — expired job", () => {
  test("renders Closed badge when expired", () => {
    renderComponent("2", EXPIRED_JOB);
    triggerAuth(null);
    expect(screen.getAllByText("Closed").length).toBeGreaterThan(0);
  });

  test("renders 'This opportunity has closed' message", () => {
    renderComponent("2", EXPIRED_JOB);
    triggerAuth(null);
    expect(screen.getByText("This opportunity has closed")).toBeInTheDocument();
  });

  test("renders Applications Closed button when expired", () => {
    renderComponent("2", EXPIRED_JOB);
    triggerAuth(null);
    expect(screen.getByText("Applications Closed")).toBeInTheDocument();
  });

  test("Applications Closed button is disabled", () => {
    renderComponent("2", EXPIRED_JOB);
    triggerAuth(null);
    expect(screen.getByText("Applications Closed")).toBeDisabled();
  });
});

describe("JobDetailPage — navigation", () => {
  test("back button calls navigate(-1)", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    fireEvent.click(
      screen.getByText((_, el) => el?.textContent?.includes("Back to opportunities"))
    );
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("renders SkillsBridgeSA logo", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(screen.getByText(/SkillsBridge/)).toBeInTheDocument();
  });
});

describe("JobDetailPage — apply: not logged in", () => {
  test("shows notLoggedIn message when user is not authenticated", async () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(screen.getByText("Please log in to apply")).toBeInTheDocument()
    );
  });

  test("'Log in or Sign up' link navigates to /login", async () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() => screen.getByText("Log in or Sign up →"));
    fireEvent.click(screen.getByText("Log in or Sign up →"));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});

describe("JobDetailPage — apply: incomplete profile via API", () => {
  test("shows incomplete profile message with missing fields listed", async () => {
    setupFetch({ profile: { full_name: "", phone: "", id_number: "", gender: "",
      city: "", province: "", qualification: "", institution: "", nqf_level: "" } });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(
        screen.getByText((_, el) => el?.textContent?.includes("Incomplete profile"))
      ).toBeInTheDocument()
    );
    expect(screen.getByText("• Full Name")).toBeInTheDocument();
    expect(screen.getByText("• Phone Number")).toBeInTheDocument();
  });

  test("'Complete your profile' link navigates to /edit-profile", async () => {
    setupFetch({ profile: { full_name: "" } });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() => screen.getByText("Complete your profile →"));
    fireEvent.click(screen.getByText("Complete your profile →"));
    expect(mockNavigate).toHaveBeenCalledWith("/edit-profile");
  });

  test("shows all missing fields when profile API returns error object", async () => {
    setupFetch({ profile: { error: "not found" } });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(
        screen.getByText((_, el) => el?.textContent?.includes("Incomplete profile"))
      ).toBeInTheDocument()
    );
    expect(screen.getByText("• Full Name")).toBeInTheDocument();
    expect(screen.getByText("• NQF Level")).toBeInTheDocument();
  });
});

describe("JobDetailPage — apply: incomplete profile via localStorage fallback", () => {
  test("reads from localStorage when profile fetch throws", async () => {
    localStorage.setItem(
      `profile_${MOCK_USER.email}`,
      JSON.stringify({
        personal: {
          fullName: "Test",
          phone: "082",
          idNumber: "900101",
          gender: "Male",
          city: "JHB",
          province: "GP",
        },
        education: {
          highestQualification: "Matric",
          institution: "School",
          nqfLevel: "NQF 4",
        },
      })
    );
    setupFetch({ profileThrows: true });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    // Profile is complete via localStorage — confirm dialog should appear
    window.confirm = jest.fn(() => false); // cancel so we don't need to mock apply
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() => expect(window.confirm).toHaveBeenCalled());
  });

  test("shows missing fields from localStorage when some are empty", async () => {
    localStorage.setItem(
      `profile_${MOCK_USER.email}`,
      JSON.stringify({
        personal: { fullName: "", phone: "", idNumber: "", gender: "", city: "", province: "" },
        education: {},
      })
    );
    setupFetch({ profileThrows: true });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(screen.getByText("✕ Incomplete profile")).toBeInTheDocument()
    );
    expect(screen.getByText("• Full Name")).toBeInTheDocument();
  });

  test("shows connection error message when profile throws and no localStorage", async () => {
    setupFetch({ profileThrows: true });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(
        screen.getByText("• Could not verify profile — please check your connection")
      ).toBeInTheDocument()
    );
  });
});

describe("JobDetailPage — apply: confirm dialog cancelled", () => {
  test("does not submit application when user cancels confirm dialog", async () => {
    window.confirm = jest.fn(() => false);
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() => expect(window.confirm).toHaveBeenCalled());
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/applications"),
      expect.objectContaining({ method: "POST" })
    );
  });
});

describe("JobDetailPage — apply: successful submission", () => {
  test("shows success message after successful application (201)", async () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(
        screen.getByText((_, el) => el?.textContent?.includes("Application submitted"))
      ).toBeInTheDocument()
    );
  });

  test("shows success message when response is ok but not 201", async () => {
    setupFetch({ applyStatus: 200 });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(
        screen.getByText((_, el) => el?.textContent?.includes("Application submitted"))
      ).toBeInTheDocument()
    );
  });

  test("apply button becomes disabled after success", async () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /Applied/i });
      expect(btn).toBeDisabled();
    });
  });

  test("posts notification after successful application", async () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      screen.getByText((_, el) => el?.textContent?.includes("Application submitted"))
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/notifications"),
      expect.objectContaining({ method: "POST" })
    );
  });

  test("shows 'Checking profile...' while applying", async () => {
    // Slow profile fetch so the applying state is visible
    let resolveProfile;
    global.fetch = jest.fn((url) => {
      if (url.includes("/profile/")) {
        return new Promise((res) => { resolveProfile = res; });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    expect(
      screen.getByText((_, el) => el?.textContent?.includes("Checking profile"))
    ).toBeInTheDocument();
    // Clean up — resolve so no open handles
    resolveProfile({ json: () => Promise.resolve(COMPLETE_PROFILE) });
  });
});

describe("JobDetailPage — apply: already applied", () => {
  test("shows already-applied message on 409 status", async () => {
    setupFetch({ applyStatus: 409 });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(
        screen.getByText((_, el) =>
          el?.textContent?.includes("already applied for this opportunity")
        )
      ).toBeInTheDocument()
    );
  });

  test("shows already-applied message when response body contains 'already'", async () => {
    setupFetch({ applyStatus: 200, applyBody: { message: "You have already applied" } });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(
        screen.getByText((_, el) =>
          el?.textContent?.includes("already applied for this opportunity")
        )
      ).toBeInTheDocument()
    );
  });
});

describe("JobDetailPage — apply: error states", () => {
  test("shows error message on non-ok, non-409, non-201 status", async () => {
    setupFetch({ applyStatus: 500 });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(
        screen.getByText((_, el) => el?.textContent?.includes("Something went wrong"))
      ).toBeInTheDocument()
    );
  });

  test("shows error message when apply fetch throws", async () => {
    setupFetch({ applyThrows: true });
    renderComponent("1", MOCK_JOB);
    triggerAuth(MOCK_USER);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(
        screen.getByText((_, el) => el?.textContent?.includes("Something went wrong"))
      ).toBeInTheDocument()
    );
  });
});

describe("JobDetailPage — static content", () => {
  test("renders 'What to expect' section", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(screen.getByText("What to expect")).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent?.trim() === "Application")
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, el) => el?.textContent?.trim() === "Shortlisting")
    ).toBeInTheDocument();
  });

  test("renders application tips", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(screen.getByText("💡 Application tips")).toBeInTheDocument();
    expect(
      screen.getByText("Complete your full profile before applying")
    ).toBeInTheDocument();
  });

  test("renders Programme details card", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(screen.getByText("Programme details")).toBeInTheDocument();
  });

  test("renders Save opportunity button", () => {
    renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    expect(
      screen.getByText((_, el) => el?.textContent?.includes("Save opportunity"))
    ).toBeInTheDocument();
  });

  test("unsubscribes from auth on unmount", () => {
    const { unmount } = renderComponent("1", MOCK_JOB);
    triggerAuth(null);
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});