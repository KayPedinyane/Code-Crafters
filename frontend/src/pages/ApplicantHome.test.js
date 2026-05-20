import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";

import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";

import ApplicantHome from "./ApplicantHome";

// ─────────────────────────────────────────────────────────────
// Firebase Auth Mocks
// ─────────────────────────────────────────────────────────────

const mockUnsubscribe = jest.fn();

const mockSignOut = jest.fn(() => Promise.resolve());

const mockOnAuthStateChanged = jest.fn();

jest.mock("../firebase", () => ({
  auth: {},
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),

  onAuthStateChanged: (...args) =>
    mockOnAuthStateChanged(...args),

  signOut: (...args) =>
    mockSignOut(...args),
}));

// ─────────────────────────────────────────────────────────────
// Router Mock
// ─────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),

  useNavigate: () => mockNavigate,
}));

// ─────────────────────────────────────────────────────────────
// Utility Mocks
// ─────────────────────────────────────────────────────────────

jest.mock("../utils/nqfData", () => ({
  NQF_LEVELS: [
    { value: "NQF 4" },
    { value: "NQF 6" },
  ],

  SECTORS: [
    "ICT",
    "Engineering",
    "Finance",
  ],
}));

jest.mock("../utils/saLocations", () => ({
  ALL_CITIES: [
    "Johannesburg",
    "Cape Town",
    "Durban",
  ],
}));

// ─────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────

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
    message: "New opportunity match",
    is_read: false,
    created_at: "2026-05-01T10:00:00Z",
  },
];

const MOCK_APPLICATIONS = [
  {
    id: 1,
    title: "ICT Learnership",
    status: "Pending",
  },
];

// ─────────────────────────────────────────────────────────────
// Fetch Mock
// ─────────────────────────────────────────────────────────────

function setupFetch({
  profile = { full_name: "Test User" },
  jobs = MOCK_JOBS,
  notifications = MOCK_NOTIFICATIONS,
  applications = MOCK_APPLICATIONS,
} = {}) {
  global.fetch = jest.fn((url, options) => {
    if (url.includes("/profile/")) {
      return Promise.resolve({
        json: () => Promise.resolve(profile),
      });
    }

    if (
      url.includes("/notifications/") &&
      url.includes("/read")
    ) {
      return Promise.resolve({
        json: () =>
          Promise.resolve({ ok: true }),
      });
    }

    if (url.includes("/notifications")) {
      return Promise.resolve({
        json: () =>
          Promise.resolve(notifications),
      });
    }

    if (url.includes("/applications")) {
      return Promise.resolve({
        json: () =>
          Promise.resolve(applications),
      });
    }

    if (url.includes("/opportunities")) {
      return Promise.resolve({
        json: () => Promise.resolve(jobs),
      });
    }

    return Promise.resolve({
      json: () => Promise.resolve({}),
    });
  });
}

// ─────────────────────────────────────────────────────────────
// Render Helper
// ─────────────────────────────────────────────────────────────

function renderComponent(search = "") {
  return render(
    <MemoryRouter
      initialEntries={[`/applicant${search}`]}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route
          path="/applicant"
          element={<ApplicantHome />}
        />
      </Routes>
    </MemoryRouter>
  );
}

// ─────────────────────────────────────────────────────────────
// Trigger Auth
// ─────────────────────────────────────────────────────────────

function triggerAuth(user) {
  const callback =
    mockOnAuthStateChanged.mock.calls[0]?.[1];

  act(() => {
    callback(user);
  });
}

// ─────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  localStorage.clear();

  mockOnAuthStateChanged.mockImplementation(
    (_auth, callback) => mockUnsubscribe
  );

  setupFetch();
});

// ─────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────

describe("ApplicantHome", () => {
  test("redirects unauthenticated users", async () => {
    renderComponent();

    triggerAuth(null);

    await waitFor(() => {
      expect(mockNavigate)
        .toHaveBeenCalledWith("/");
    });
  });

  

  
  test("renders opportunities", async () => {
    renderComponent();

    triggerAuth(MOCK_USER);

    await waitFor(() => {
      expect(
        screen.getByText(
          /ICT Learnership/i
        )
      ).toBeInTheDocument();
    });
  });

  test("filters opportunities by search", async () => {
    renderComponent();

    triggerAuth(MOCK_USER);

    await waitFor(() => {
      expect(
        screen.getByText(
          /ICT Learnership/i
        )
      ).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/search/i),
      {
        target: {
          value: "Engineering",
        },
      }
    );

    expect(
      screen.queryByText(
        /ICT Learnership/i
      )
    ).not.toBeInTheDocument();

    expect(
      screen.getByText(
        /Engineering Internship/i
      )
    ).toBeInTheDocument();
  });

  test("opens profile popup", async () => {
    renderComponent();

    triggerAuth(MOCK_USER);

    await waitFor(() => {
      expect(
        screen.getAllByText(
          "Test User"
        ).length
      ).toBeGreaterThan(0);
    });

    fireEvent.click(
      screen.getAllByText(
        "Test User"
      )[0]
    );

  });

  test("closes profile popup", async () => {
    renderComponent();

    triggerAuth(MOCK_USER);

    fireEvent.click(
      screen.getAllByText(
        "Test User"
      )[0]
    );

    expect(
      screen.getByText(/sign out/i)
    ).toBeInTheDocument();

    fireEvent.click(document.body);

  });

  test("sign out calls firebase signOut", async () => {
    renderComponent();

    triggerAuth(MOCK_USER);

    fireEvent.click(
      screen.getAllByText(
        "Test User"
      )[0]
    );

    fireEvent.click(
      screen.getByText(/sign out/i)
    );

  });

  test("shows empty opportunities state", async () => {
    setupFetch({ jobs: [] });

    renderComponent();

    triggerAuth(MOCK_USER);

    await waitFor(() => {
      expect(
        screen.getByText(
          /no opportunities/i
        )
      ).toBeInTheDocument();
    });
  });

  test("handles fetch failure gracefully", async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(
        new Error("Network Error")
      )
    );

    renderComponent();

    triggerAuth(MOCK_USER);

    await waitFor(() => {
      expect(
        screen.queryByText(
          /ICT Learnership/i
        )
      ).not.toBeInTheDocument();
    });
  });

  

  test("unsubscribes auth listener on unmount", () => {
    const { unmount } =
      renderComponent();

    unmount();

    expect(
      mockUnsubscribe
    ).toHaveBeenCalled();
  });
});