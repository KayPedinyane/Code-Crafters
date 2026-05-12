import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ApplicantHome from "./ApplicantHome";

// ─── Mocks ────────────────────────────────────────────────────────────────────

// Firebase auth
const mockUnsubscribe = jest.fn();
jest.mock("../firebase", () => ({ auth: {} }));
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn(),
}));

// React Router navigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Utility data
jest.mock("../utils/nqfData", () => ({
  NQF_LEVELS: [
    { value: "NQF 4" },
    { value: "NQF 6" },
  ],
  SECTORS: ["ICT", "Engineering", "Finance"],
}));

jest.mock("../utils/saLocations", () => ({
  ALL_CITIES: ["Johannesburg", "Cape Town", "Durban"],
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

import { onAuthStateChanged } from "firebase/auth";

const MOCK_USER = {
  email: "test@example.com",
  displayName: "Test User",
};

const MOCK_JOBS = [
  {
    id: 1,
    title: "ICT Learnership",
    sector: "ICT",
    nqf_level: "NQF 4",
    location: "Johannesburg",
    type: "Learnership",
    stipend: "R3000/month",
    duration: "12 months",
    closing_date: "2026-12-31",
    company_name: "TechCorp",
  },
  {
    id: 2,
    title: "Engineering Internship",
    sector: "Engineering",
    nqf_level: "NQF 6",
    location: "Cape Town",
    type: "Internship",
    stipend: "R5000/month",
    duration: "6 months",
    closing_date: "2026-09-30",
    company_name: "BuildCo",
  },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    message: "🎯 New opportunity: ICT Learnership",
    is_read: false,
    created_at: "2026-05-01T10:00:00Z",
  },
  {
    id: 2,
    message: "⏰ Reminder: closes soon",
    is_read: true,
    created_at: "2026-05-02T10:00:00Z",
  },
];

const MOCK_APPLICATIONS = [
  {
    id: 10,
    title: "ICT Learnership",
    sector: "ICT",
    nqf_level: "NQF 4",
    location: "Johannesburg",
    type: "Learnership",
    stipend: "R3000/month",
    duration: "12 months",
    closing_date: "2026-12-31",
    status: "Pending",
    applied_at: "2026-04-01T09:00:00Z",
    company_name: "TechCorp",
  },
  {
    id: 11,
    title: "Engineering Internship",
    sector: "Engineering",
    nqf_level: "NQF 6",
    location: "Cape Town",
    type: "Internship",
    stipend: "R5000/month",
    duration: "6 months",
    closing_date: "2026-09-30",
    status: "Accepted",
    applied_at: "2026-04-05T09:00:00Z",
    company_name: "BuildCo",
  },
];

/** Sets up fetch mock to handle all API routes */
function setupFetchMock({
  profile = { full_name: "Test User" },
  jobs = MOCK_JOBS,
  notifications = MOCK_NOTIFICATIONS,
  applications = MOCK_APPLICATIONS,
} = {}) {
  global.fetch = jest.fn((url) => {
    if (url.includes("/profile/")) {
      return Promise.resolve({ json: () => Promise.resolve(profile) });
    }
    if (url.includes("/notifications/") && url.includes("/read")) {
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }
    if (url.includes("/notifications/")) {
      return Promise.resolve({ json: () => Promise.resolve(notifications) });
    }
    if (url.includes("/notifications") && !url.includes("/")) {
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }
    if (url.includes("/applications/")) {
      return Promise.resolve({ json: () => Promise.resolve(applications) });
    }
    if (url.includes("/opportunities")) {
      return Promise.resolve({ json: () => Promise.resolve(jobs) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
}

/** Renders component inside MemoryRouter with optional search params */
function renderComponent(search = "") {
  return render(
    <MemoryRouter initialEntries={[`/applicant${search}`]}>
      <Routes>
        <Route path="/applicant" element={<ApplicantHome />} />
      </Routes>
    </MemoryRouter>
  );
}

/** Fires the onAuthStateChanged callback with a user or null */
function triggerAuth(user) {
  const cb = onAuthStateChanged.mock.calls[0][1];
  act(() => cb(user));
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  onAuthStateChanged.mockImplementation((_auth, cb) => {
    // don't auto-trigger; tests call triggerAuth manually
    return mockUnsubscribe;
  });
  setupFetchMock();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ApplicantHome — authentication", () => {
  test("redirects to / when user is not authenticated", async () => {
    renderComponent();
    triggerAuth(null);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });

  test("does not redirect when user is authenticated", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(mockNavigate).not.toHaveBeenCalledWith("/")
    );
  });

  test("unsubscribes from auth on unmount", () => {
    const { unmount } = renderComponent();
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

describe("ApplicantHome — header & branding", () => {
  test("renders SkillsBridgeSA logo", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument()
    );
  });

  test("shows Opportunities nav link (active by default)", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(screen.geAllByText("Opportunities").length).toBeGreaterThan(0)
    );
  });

  test("shows My Applications nav link", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(screen.getByText("My Applications")).toBeInTheDocument()
    );
  });
});

describe("ApplicantHome — profile chip", () => {
  test("displays displayName from profile", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(screen.getByText("Test User")).toBeInTheDocument()
    );
  });

  test("falls back to email prefix when no profile name", async () => {
    setupFetchMock({ profile: { error: "not found" } });
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(
        screen.getByText((_, el) =>
          el?.textContent === "test" || el?.textContent?.startsWith("test")
        )
      ).toBeInTheDocument()
    );
  });

  test("opens profile popup on chip click", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("Test User"));
    const chips = screen.getAllByText("Test User");
    fireEvent.click(chips[0]);
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  test("navigates to /edit-profile when Edit is clicked", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("Test User"));
    fireEvent.click(screen.getAllByText("Test User")[0]);
    fireEvent.click(screen.getByText("Edit"));
    expect(mockNavigate).toHaveBeenCalledWith("/edit-profile");
  });

  test("sign out calls auth.signOut and navigates to /", async () => {
    const { auth } = require("../firebase");
    auth.signOut = jest.fn(() => Promise.resolve());
    window.confirm = jest.fn(() => true);

    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("Test User"));
    fireEvent.click(screen.getAllByText("Test User")[0]);
    fireEvent.click(screen.getByText("Sign out"));
    await waitFor(() => expect(auth.signOut).toHaveBeenCalled());
  });

  test("sign out cancelled — does not navigate", async () => {
    window.confirm = jest.fn(() => false);
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("Test User"));
    fireEvent.click(screen.getAllByText("Test User")[0]);
    fireEvent.click(screen.getByText("Sign out"));
    expect(mockNavigate).not.toHaveBeenCalledWith("/");
  });
});

describe("ApplicantHome — notifications", () => {
  test("renders notification bell", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(screen.getByText("🔔")).toBeInTheDocument()
    );
  });

  test("shows unread badge count", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(screen.getByText("1")).toBeInTheDocument()
    );
  });

  test("opens notification dropdown on bell click", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("🔔"));
    fireEvent.click(screen.getByText("🔔").closest(".notif-bell") || screen.getByText("🔔"));
    await waitFor(() =>
      expect(screen.getByText("Notifications")).toBeInTheDocument()
    );
  });

  test("mark all read button calls PATCH for unread notifications", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("🔔"));
    fireEvent.click(screen.getByText("🔔").closest(".notif-bell") || screen.getByText("🔔"));
    await waitFor(() => screen.getByText("Mark all read"));
    fireEvent.click(screen.getByText("Mark all read"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/notifications/1/read"),
        expect.objectContaining({ method: "PATCH" })
      )
    );
  });

  test("badge shows 9+ when unread count > 9", async () => {
    const manyNotifs = Array.from({ length: 11 }, (_, i) => ({
      id: i + 1,
      message: `Notif ${i + 1}`,
      is_read: false,
      created_at: "2026-05-01T10:00:00Z",
    }));
    setupFetchMock({ notifications: manyNotifs });
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(screen.getByText("9+")).toBeInTheDocument()
    );
  });

  test("shows empty state when no notifications", async () => {
    setupFetchMock({ notifications: [] });
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("🔔"));
    fireEvent.click(screen.getByText("🔔").closest(".notif-bell") || screen.getByText("🔔"));
    await waitFor(() =>
      expect(screen.getByText("No notifications yet")).toBeInTheDocument()
    );
  });
});

describe("ApplicantHome — opportunities view", () => {
  test("renders hero section", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(
        screen.getByText((_, el) => !!el?.textContent?.match(/Find Your.*Learnership/i))
      ).toBeInTheDocument()
    );
  });

  test("renders job cards after fetch", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(screen.getByText("ICT Learnership")).toBeInTheDocument()
    );
    expect(screen.getByText("Engineering Internship")).toBeInTheDocument();
  });

  test("shows loading state initially", () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // never resolves
    renderComponent();
    triggerAuth(MOCK_USER);
    expect(screen.getByText("Loading opportunities...")).toBeInTheDocument();
  });

  test("shows empty state when no jobs match filters", async () => {
    setupFetchMock({ jobs: [] });
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(
        screen.getByText("No opportunities match your filters")
      ).toBeInTheDocument()
    );
  });

  test("renders results count", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(
        screen.getByText((_, el) => el?.textContent?.includes("Showing"))
      ).toBeInTheDocument()
    );
  });

  test("filter by sector hides non-matching jobs", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("ICT Learnership"));

    const selects = document.querySelectorAll("select");
    // First select is sector
    fireEvent.change(selects[0], { target: { name: "sector", value: "ICT" } });

    await waitFor(() =>
      expect(screen.queryByText("Engineering Internship")).not.toBeInTheDocument()
    );
    expect(screen.getByText("ICT Learnership")).toBeInTheDocument();
  });

  test("clear filters button appears when filters are active", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("ICT Learnership"));

    const selects = document.querySelectorAll("select");
    fireEvent.change(selects[0], { target: { name: "sector", value: "ICT" } });
    await waitFor(() =>
      expect(screen.getByText(/✕ Clear filters/)).toBeInTheDocument()
    );
  });

  test("clear filters resets all filters", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("ICT Learnership"));

    const selects = document.querySelectorAll("select");
    fireEvent.change(selects[0], { target: { name: "sector", value: "ICT" } });
    await waitFor(() => screen.getByText(/✕ Clear filters/));
    fireEvent.click(screen.getByText(/✕ Clear filters/));

    await waitFor(() =>
      expect(screen.getByText("Engineering Internship")).toBeInTheDocument()
    );
  });

  test("clicking job card navigates to job detail page", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("ICT Learnership"));
    fireEvent.click(screen.getByText("ICT Learnership").closest(".job-card"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/applicant/job/1",
      expect.objectContaining({ state: { job: MOCK_JOBS[0] } })
    );
  });

  test("respects search query param from URL", async () => {
    renderComponent("?search=Engineering");
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(screen.getByText("Engineering Internship")).toBeInTheDocument()
    );
    expect(screen.queryByText("ICT Learnership")).not.toBeInTheDocument();
  });

  test("respects location query param from URL", async () => {
    renderComponent("?location=Cape Town");
    triggerAuth(MOCK_USER);
    await waitFor(() =>
      expect(screen.getByText("Engineering Internship")).toBeInTheDocument()
    );
    expect(screen.queryByText("ICT Learnership")).not.toBeInTheDocument();
  });

  test("clear all filters button in empty state works", async () => {
    setupFetchMock({ jobs: [] });
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("Clear all filters"));
    fireEvent.click(screen.getByText("Clear all filters"));
    // Should not throw; filters reset to empty
  });
});

describe("ApplicantHome — My Applications view", () => {
  async function switchToApplications() {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("My Applications"));
    fireEvent.click(screen.getByText("My Applications"));
  }

  test("switches to applications view on nav click", async () => {
    await switchToApplications();
    await waitFor(() =>
      expect(screen.getByText(/Your Applications/)).toBeInTheDocument()
    );
  });

  test("shows applications after fetch", async () => {
    await switchToApplications();
    await waitFor(() =>
      expect(screen.getByText("ICT Learnership")).toBeInTheDocument()
    );
  });

  test("shows loading state for applications", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/applications/")) return new Promise(() => {});
      if (url.includes("/opportunities"))
        return Promise.resolve({ json: () => Promise.resolve(MOCK_JOBS) });
      if (url.includes("/notifications/"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      if (url.includes("/profile/"))
        return Promise.resolve({ json: () => Promise.resolve({ full_name: "Test User" }) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("My Applications"));
    fireEvent.click(screen.getByText("My Applications"));
    await waitFor(() =>
      expect(screen.getByText("Loading your applications...")).toBeInTheDocument()
    );
  });

  test("shows empty state when no applications", async () => {
    setupFetchMock({ applications: [] });
    await switchToApplications();
    await waitFor(() =>
      expect(screen.getByText("No applications yet")).toBeInTheDocument()
    );
  });

  test("Browse Opportunities button switches view back", async () => {
    setupFetchMock({ applications: [] });
    await switchToApplications();
    await waitFor(() => screen.getByText("Browse Opportunities"));
    fireEvent.click(screen.getByText("Browse Opportunities"));
    await waitFor(() =>
      expect(
        screen.getByText((_, el) => el?.textContent?.match(/Find Your.*Learnership/i))
      ).toBeInTheDocument()
    );
  });

  test("status filter pills filter applications", async () => {
    await switchToApplications();
    await waitFor(() => screen.getByText("ICT Learnership"));
    fireEvent.click(screen.getByRole("button", { name: "Accepted" }));
    await waitFor(() =>
      expect(screen.queryByText("ICT Learnership")).not.toBeInTheDocument()
    );
    expect(screen.getByText("Engineering Internship")).toBeInTheDocument();
  });

  test("clear status filter shows all applications", async () => {
    await switchToApplications();
    await waitFor(() => screen.getByText("ICT Learnership"));
    fireEvent.click(screen.getByRole("button", { name: "Accepted" }));
    await waitFor(() => screen.getByText(/✕ Clear/));
    fireEvent.click(screen.getByText(/✕ Clear/));
    await waitFor(() =>
      expect(screen.getByText("ICT Learnership")).toBeInTheDocument()
    );
  });

  test("shows no-match empty state with Show all button", async () => {
  setupFetchMock({
    applications: [{ ...MOCK_APPLICATIONS[0], status: "Pending" }],
  });
  await switchToApplications();
  await waitFor(() => screen.getByText("ICT Learnership"));
  fireEvent.click(screen.getByRole("button", { name: "Accepted" }));
  await waitFor(() =>
    expect(screen.getByText("Show all")).toBeInTheDocument()
  );
  fireEvent.click(screen.getByText("Show all"));
  await waitFor(() =>
    expect(screen.getByText("ICT Learnership")).toBeInTheDocument()
  );
});

  test("renders application stats in hero", async () => {
    await switchToApplications();
    await waitFor(() =>
      expect(screen.getByText("Applied")).toBeInTheDocument()
    );
    expect(screen.getAllByText(/Shortlisted|Accepted/).length).toBeGreaterThan(0);
  });
});

describe("ApplicantHome — nav badge", () => {
  test("shows application count badge in nav when applications exist", async () => {
    renderComponent();
    triggerAuth(MOCK_USER);
    await waitFor(() => screen.getByText("My Applications"));
    fireEvent.click(screen.getByText("My Applications"));
    await waitFor(() => screen.getByText("ICT Learnership"));
    const badge = document.querySelector(".nav-badge");
    expect(badge).toHaveTextContent("2");
  });
});
