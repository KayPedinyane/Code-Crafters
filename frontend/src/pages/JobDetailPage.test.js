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

// ─── Firebase mocks ───────────────────────────────────────────
const mockUnsubscribe = jest.fn();
const mockOnAuthStateChanged = jest.fn();

jest.mock("../firebase", () => ({ auth: {} }));
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

// ─── Router mock ──────────────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ─── Mock data ────────────────────────────────────────────────
const MOCK_JOB = {
  id: 1,
  title: "ICT Learnership",
  opportunity_type: "Learnership",
  sector: "ICT",
  nqf_level: "NQF 4",
  location: "Johannesburg",
  stipend: "R3000/month",
  duration: "12 months",
  closing_date: "2030-12-31",
  company_name: "TechCorp",
  description: "A great learnership opportunity.",
  requirements: "Matric, Passion for ICT",
  status: "Open",
};

const EXPIRED_JOB = {
  ...MOCK_JOB,
  id: 2,
  title: "Expired Opportunity",
  closing_date: "2020-01-01",
};

const MOCK_PROFILE = {
  full_name: "Test User",
  phone: "0821234567",
  id_number: "0001014800086",
  gender: "Male",
  city: "Johannesburg",
  province: "Gauteng",
  qualification: "Matric",
  institution: "UJ",
  nqf_level: "NQF 4",
};

// ─── Fetch setup ──────────────────────────────────────────────
function setupFetch({
  jobs = [MOCK_JOB],
  profile = MOCK_PROFILE,
  applyStatus = 201,
  alreadyApplied = false,
} = {}) {
  global.fetch = jest.fn((url, options) => {
    if (url.includes("/profile/")) {
      return Promise.resolve({ json: () => Promise.resolve(profile), ok: true, status: 200 });
    }
    if (url.includes("/applications") && options?.method === "POST") {
      if (alreadyApplied) {
        return Promise.resolve({ json: () => Promise.resolve({ message: "already applied" }), status: 409, ok: false });
      }
      return Promise.resolve({ json: () => Promise.resolve({ id: 99 }), status: 201, ok: true });
    }
    if (url.includes("/notifications") && options?.method === "POST") {
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }), ok: true });
    }
    if (url.includes("/opportunities")) {
      return Promise.resolve({ json: () => Promise.resolve(jobs), ok: true });
    }
    return Promise.resolve({ json: () => Promise.resolve({}), ok: true });
  });
}

// ─── Render helpers ───────────────────────────────────────────
function renderWithJob(job = MOCK_JOB) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: `/job/${job.id}`, state: { job } }]}>
      <Routes>
        <Route path="/job/:id" element={<JobDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderWithoutState(id = "1") {
  return render(
    <MemoryRouter initialEntries={[`/job/${id}`]}>
      <Routes>
        <Route path="/job/:id" element={<JobDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function triggerAuth(user) {
  const cb = mockOnAuthStateChanged.mock.calls[0]?.[1];
  act(() => cb(user));
}

// ─── Setup ────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  mockOnAuthStateChanged.mockImplementation((_auth, cb) => mockUnsubscribe);
  setupFetch();
  window.scrollTo = jest.fn();
});

// ─── Tests ────────────────────────────────────────────────────

describe("JobDetailPage — rendering", () => {
  test("renders job title from location state", () => {
    renderWithJob();
    expect(screen.getByText("ICT Learnership")).toBeInTheDocument();
  });

  test("renders SkillsBridgeSA branding", () => {
    renderWithJob();
    expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument();
  });

  test("renders job description", () => {
    renderWithJob();
    expect(screen.getByText(/A great learnership opportunity/i)).toBeInTheDocument();
  });

  test("renders requirements list", () => {
    renderWithJob();
    expect(screen.getByText(/Matric/)).toBeInTheDocument();
    expect(screen.getByText(/Passion for ICT/)).toBeInTheDocument();
  });

  
  test("shows Apply Now button for open opportunity", () => {
    renderWithJob();
    expect(screen.getByText("Apply Now")).toBeInTheDocument();
  });

  test("shows Applications Closed for expired opportunity", () => {
    renderWithJob(EXPIRED_JOB);
    expect(screen.getByText("Applications Closed")).toBeInTheDocument();
  });

  

  

  test("renders What to expect timeline", () => {
    renderWithJob();
    expect(screen.getByText("Apply")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Shortlisting")).toBeInTheDocument();
    expect(screen.getByText("Placement")).toBeInTheDocument();
  });

  test("renders application tips", () => {
    renderWithJob();
    expect(screen.getByText(/Application tips/i)).toBeInTheDocument();
  });
});

describe("JobDetailPage — fetching job by ID", () => {
  test("shows loading spinner when no state passed", () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // never resolves
    renderWithoutState("1");
    expect(screen.getByText(/Loading opportunity/i)).toBeInTheDocument();
  });

  test("fetches and renders job when no location state", async () => {
    renderWithoutState("1");
    await waitFor(() =>
      expect(screen.getByText("ICT Learnership")).toBeInTheDocument()
    );
  });

  test("shows not-found UI when job ID doesn't match", async () => {
    renderWithoutState("999");
    await waitFor(() =>
      expect(screen.getByText(/Opportunity not found/i)).toBeInTheDocument()
    );
  });

  test("not-found back button navigates to /applicant", async () => {
    renderWithoutState("999");
    await waitFor(() => screen.getByText(/Back to listings/i));
    fireEvent.click(screen.getByText(/Back to listings/i));
    expect(mockNavigate).toHaveBeenCalledWith("/applicant");
  });

  test("shows not-found on fetch failure", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));
    renderWithoutState("1");
    await waitFor(() =>
      expect(screen.getByText(/Opportunity not found/i)).toBeInTheDocument()
    );
  });
});

describe("JobDetailPage — closing countdown banner", () => {
  test("shows countdown banner when closing in ≤5 days", () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    const soonJob = { ...MOCK_JOB, closing_date: soon.toISOString().split("T")[0] };
    renderWithJob(soonJob);
    expect(screen.getByText(/closes in/i)).toBeInTheDocument();
  });

  test("does not show countdown banner when closing is far away", () => {
    renderWithJob(); // closing 2030-12-31
    expect(screen.queryByText(/closes in/i)).not.toBeInTheDocument();
  });
});

describe("JobDetailPage — save", () => {
  test("redirects unauthenticated user to /login on save", () => {
    renderWithJob();
    triggerAuth(null);
    fireEvent.click(screen.getByText(/Save/i));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("saves job and toggles to Saved for authenticated user", async () => {
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    fireEvent.click(screen.getByText(/🏷 Save/));
    await waitFor(() =>
      expect(screen.getByText(/🔖 Saved/)).toBeInTheDocument()
    );
  });

  test("unsaves a saved job", async () => {
    localStorage.setItem("saved_jobs_test@example.com", JSON.stringify([1]));
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    await waitFor(() => screen.getByText(/🔖 Saved/));
    fireEvent.click(screen.getByText(/🔖 Saved/));
    await waitFor(() =>
      expect(screen.getByText(/🏷 Save/)).toBeInTheDocument()
    );
  });

  test("initialises as saved when job is in localStorage", async () => {
    localStorage.setItem("saved_jobs_test@example.com", JSON.stringify([1]));
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    await waitFor(() =>
      expect(screen.getByText(/🔖 Saved/)).toBeInTheDocument()
    );
  });
});

describe("JobDetailPage — share", () => {
  test("copies URL to clipboard and shows toast when navigator.share unavailable", async () => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn(() => Promise.resolve()) },
    });
    renderWithJob();
    fireEvent.click(screen.getByText(/Share/));
    await waitFor(() =>
      expect(screen.getByText(/Link copied to clipboard/i)).toBeInTheDocument()
    );
  });

  test("calls navigator.share when available", async () => {
    const mockShare = jest.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "share", { value: mockShare, configurable: true });
    renderWithJob();
    fireEvent.click(screen.getByText(/Share/));
    expect(mockShare).toHaveBeenCalled();
  });
});

describe("JobDetailPage — apply", () => {
  test("shows notLoggedIn message when unauthenticated user clicks Apply", async () => {
    renderWithJob();
    triggerAuth(null);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(screen.getByText(/Please log in to apply/i)).toBeInTheDocument()
    );
  });

  test("login link in notLoggedIn message navigates to /login", async () => {
    renderWithJob();
    triggerAuth(null);
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() => screen.getByText(/Log in or Sign up/i));
    fireEvent.click(screen.getByText(/Log in or Sign up/i));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("shows incomplete profile message when fields missing", async () => {
    setupFetch({ profile: { error: "not found" } });
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(screen.getByText(/Incomplete profile/i)).toBeInTheDocument()
    );
  });

  test("incomplete message lists missing fields", async () => {
    setupFetch({ profile: { error: "not found" } });
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(screen.getByText(/Full Name/)).toBeInTheDocument()
    );
  });

  test("incomplete profile link navigates to /edit-profile", async () => {
    setupFetch({ profile: { error: "not found" } });
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() => screen.getByText(/Complete your profile/i));
    fireEvent.click(screen.getByText(/Complete your profile/i));
    expect(mockNavigate).toHaveBeenCalledWith("/edit-profile");
  });

  test("falls back to localStorage profile when fetch fails", async () => {
    const localProfile = {
      personal: {
        fullName: "Local User", phone: "0821234567", idNumber: "0001014800086",
        gender: "Male", city: "JHB", province: "Gauteng",
      },
      education: {
        highestQualification: "Matric", institution: "UJ", nqfLevel: "NQF 4",
      },
    };
    localStorage.setItem("profile_test@example.com", JSON.stringify(localProfile));
    global.fetch = jest.fn((url, options) => {
      if (url.includes("/profile/")) return Promise.reject(new Error("Network error"));
      if (url.includes("/applications")) return Promise.resolve({ json: () => Promise.resolve({ id: 1 }), status: 201, ok: true });
      if (url.includes("/notifications")) return Promise.resolve({ json: () => Promise.resolve({}), ok: true });
      return Promise.resolve({ json: () => Promise.resolve({}), ok: true });
    });
    window.confirm = jest.fn(() => true);
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(screen.getByText(/Application submitted/i)).toBeInTheDocument()
    );
  });

  test("shows already applied message on 409 response", async () => {
    setupFetch({ alreadyApplied: true });
    window.confirm = jest.fn(() => true);
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(screen.getByText(/already applied/i)).toBeInTheDocument()
    );
  });

  test("shows error message on network failure during apply", async () => {
    setupFetch({ profile: MOCK_PROFILE });
    global.fetch = jest.fn((url, options) => {
      if (url.includes("/profile/")) return Promise.resolve({ json: () => Promise.resolve(MOCK_PROFILE), ok: true });
      if (url.includes("/applications")) return Promise.reject(new Error("Network error"));
      return Promise.resolve({ json: () => Promise.resolve({}), ok: true });
    });
    window.confirm = jest.fn(() => true);
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    );
  });

  test("cancelling confirm dialog does not submit application", async () => {
    window.confirm = jest.fn(() => false);
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() => expect(window.confirm).toHaveBeenCalled());
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/applications"),
      expect.objectContaining({ method: "POST" })
    );
  });

  test("successful apply shows success message and disables button", async () => {
    window.confirm = jest.fn(() => true);
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(screen.getByText(/Application submitted/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/Applied Successfully/)).toBeDisabled();
  });

  test("successful apply fires notification POST", async () => {
    window.confirm = jest.fn(() => true);
    renderWithJob();
    triggerAuth({ email: "test@example.com" });
    fireEvent.click(screen.getByText("Apply Now"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/notifications"),
        expect.objectContaining({ method: "POST" })
      )
    );
  });
});

describe("JobDetailPage — back button & navigation", () => {
  test("back button calls navigate(-1)", () => {
    renderWithJob();
    fireEvent.click(screen.getByText(/← Back to Opportunities/i));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});

describe("JobDetailPage — auth cleanup", () => {
  test("unsubscribes auth listener on unmount", () => {
    const { unmount } = renderWithJob();
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});