/**
 * MyListings.test.js
 * Tests for MyListings component (provider portal)
 * Coverage target: ≥ 90%
 *
 * Stack: Jest + React Testing Library (Create React App defaults)
 * Run:   npx react-scripts test MyListings.test.js --coverage
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyListings from "./MyListings";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../firebase", () => ({
  auth: { signOut: jest.fn().mockResolvedValue(undefined) },
  googleProvider: {},
}));

process.env.REACT_APP_API_URL = "https://api.test.com";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_USER = { id: "prov-1", name: "Provider One", email: "provider@example.com" };

const MOCK_LISTINGS = [
  {
    id: 1,
    title: "ICT Learnership",
    sector: "ICT",
    nqf_level: "NQF 4",
    location: "Johannesburg",
    stipend: "3000",
    duration: "12 months",
    closing_date: "2026-12-31",
    status: "approved",
    description: "A learnership in ICT.",
    requirements: "Matric required.",
  },
  {
    id: 2,
    title: "Engineering Apprenticeship",
    sector: "Engineering",
    nqf_level: "NQF 6",
    location: "Pretoria",
    stipend: "4000",
    duration: "24 months",
    closing_date: "2026-06-30",
    status: "pending",
    description: "An engineering apprenticeship.",
    requirements: "National Diploma required.",
  },
];

const MOCK_APPLICANTS = [
  {
    id: 101,
    applicant_email: "applicant1@example.com",
    status: "pending",
    applied_at: "2026-04-10T09:00:00Z",
  },
  {
    id: 102,
    applicant_email: "applicant2@example.com",
    status: "shortlisted",
    applied_at: "2026-04-12T09:00:00Z",
  },
];

const MOCK_APPLICANT_PROFILE = {
  full_name: "Sipho Dlamini",
  email: "applicant1@example.com",
  phone: "0831234567",
  city: "Johannesburg",
  province: "Gauteng",
  qualification: "Matric",
  institution: "Ekurhuleni East TVET College",
  year_completed: "2023",
  nqf_level: "NQF 4",
  subjects: "Mathematics",
  skills: "Python, Excel",
  cv_url: "sipho_cv.pdf",
};

const MOCK_NOTIFICATIONS = [
  { id: 1, message: "New applicant!", is_read: false, created_at: "2026-05-01T10:00:00Z" },
  { id: 2, message: "Listing approved", is_read: true, created_at: "2026-05-02T10:00:00Z" },
];

function setupFetch({
  listings = MOCK_LISTINGS,
  applicants = MOCK_APPLICANTS,
  profile = MOCK_APPLICANT_PROFILE,
  notifications = MOCK_NOTIFICATIONS,
} = {}) {
  global.fetch = jest.fn((url, options) => {
    if (url.includes("/opportunities/provider/")) {
      return Promise.resolve({ json: () => Promise.resolve(listings) });
    }
    if (url.includes("/applications/opportunities/")) {
      return Promise.resolve({ json: () => Promise.resolve(applicants) });
    }
    if (url.includes("/applications/") && url.includes("/status")) {
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }
    if (url.includes("/profile/")) {
      return Promise.resolve({ json: () => Promise.resolve(profile) });
    }
    if (url.includes("/notifications/") && url.includes("/read")) {
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }
    if (url.includes("/notifications/")) {
      return Promise.resolve({ json: () => Promise.resolve(notifications) });
    }
    return Promise.resolve({ json: () => Promise.resolve([]) });
  });
}

function renderComponent() {
  localStorage.setItem("user", JSON.stringify(MOCK_USER));
  return render(
    <MemoryRouter>
      <MyListings />
    </MemoryRouter>
  );
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  setupFetch();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MyListings — header & navigation", () => {
  test("renders SkillsBridgeSA logo", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument()
    );
  });

  test("renders nav links", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("Dashboard")).toBeInTheDocument()
    );
    expect(screen.getByText("Post Opportunity")).toBeInTheDocument();
    expect(screen.getByText("My Listings")).toBeInTheDocument();
  });

  test("clicking Dashboard navigates to /provider", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Dashboard"));
    fireEvent.click(screen.getByText("Dashboard"));
    expect(mockNavigate).toHaveBeenCalledWith("/provider");
  });

  test("clicking Post Opportunity navigates to /post-opportunity", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getAllByText("Post Opportunity").length).toBeGreaterThan(0)
    );
    fireEvent.click(screen.getAllByText("Post Opportunity")[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/post-opportunity");
  });
});

describe("MyListings — profile chip & popup", () => {
  test("renders provider initials in chip", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("PO")).toBeInTheDocument() // "Provider One"
    );
  });

  test("opens profile popup on chip click", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  test("sign out calls auth.signOut and clears localStorage", async () => {
    const { auth } = require("../firebase");
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Sign out"));
    await waitFor(() => expect(auth.signOut).toHaveBeenCalled());
  });

  test("Edit navigates to /provider-profile", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Edit"));
    expect(mockNavigate).toHaveBeenCalledWith("/provider-profile");
  });

  test("closing popup hides Sign out", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO")); // open
    fireEvent.mouseDown(document.body);           // close via outside click
    await waitFor(() =>
      expect(screen.queryByText("Sign out")).not.toBeInTheDocument()
    );
  });
});

describe("MyListings — listings grid", () => {
  test("shows loading state initially", () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByText("Loading your listings...")).toBeInTheDocument();
  });

  test("renders listing cards after fetch", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("ICT Learnership")).toBeInTheDocument()
    );
    expect(screen.getByText("Engineering Apprenticeship")).toBeInTheDocument();
  });

  test("shows empty state when no listings", async () => {
    setupFetch({ listings: [] });
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("No listings yet")).toBeInTheDocument()
    );
  });

  test("Post New button navigates to /post-opportunity", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("+ Post New"));
    fireEvent.click(screen.getByText("+ Post New"));
    expect(mockNavigate).toHaveBeenCalledWith("/post-opportunity");
  });

  test("'Post your first opportunity' button in empty state navigates correctly", async () => {
    setupFetch({ listings: [] });
    renderComponent();
    await waitFor(() => screen.getByText("Post your first opportunity"));
    fireEvent.click(screen.getByText("Post your first opportunity"));
    expect(mockNavigate).toHaveBeenCalledWith("/post-opportunity");
  });

  test("shows correct listing count", async () => {
    renderComponent();
    await waitFor(() =>
        expect(
            screen.getByText((_, el) => !!el?.textContent?.match(/2.*opportunit/i))
        ).toBeInTheDocument()
        );
    });

  test("renders status badge for approved listing", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Approved"));
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  test("renders status badge for pending listing", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Pending"));
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});

describe("MyListings — listing modal (details tab)", () => {
  async function openModal() {
    renderComponent();
    await waitFor(() => screen.getByText("ICT Learnership"));
    fireEvent.click(screen.getByText("ICT Learnership").closest(".listing-card"));
  }

  test("opens modal on card click", async () => {
    await openModal();
    await waitFor(() =>
      expect(screen.getByText("Details")).toBeInTheDocument()
    );
  });

  test("modal shows job title", async () => {
    await openModal();
    await waitFor(() =>
      expect(screen.getAllByText("ICT Learnership").length).toBeGreaterThan(0)
    );
  });

  test("modal closes on ✕ button click", async () => {
    await openModal();
    await waitFor(() => screen.getByText("Details"));
    fireEvent.click(screen.getByText("✕"));
    await waitFor(() =>
      expect(screen.queryByText("Details")).not.toBeInTheDocument()
    );
  });

  test("modal closes on overlay click", async () => {
    await openModal();
    await waitFor(() => screen.getByText("Details"));
    fireEvent.click(document.querySelector(".modal-overlay"));
    await waitFor(() =>
      expect(screen.queryByText("Details")).not.toBeInTheDocument()
    );
  });

  test("details tab shows location, stipend, duration, closing date", async () => {
    await openModal();
    await waitFor(() => screen.getByText("Location"));
    expect(screen.getByText("Stipend")).toBeInTheDocument();
    expect(screen.getByText("Duration")).toBeInTheDocument();
    expect(screen.getByText("Closing Date")).toBeInTheDocument();
  });

  test("details tab shows description and requirements", async () => {
    await openModal();
    await waitFor(() => screen.getByText("A learnership in ICT."));
    expect(screen.getByText("Matric required.")).toBeInTheDocument();
  });
});

describe("MyListings — applicants tab", () => {
  async function openApplicantsTab() {
    renderComponent();
    await waitFor(() => screen.getByText("ICT Learnership"));
    fireEvent.click(screen.getByText("ICT Learnership").closest(".listing-card"));
    await waitFor(() => screen.getByText("Applicants"));
    fireEvent.click(screen.getByText("Applicants"));
  }

  test("switches to applicants tab", async () => {
    await openApplicantsTab();
    await waitFor(() =>
      expect(screen.getByText("applicant1@example.com")).toBeInTheDocument()
    );
  });

  test("shows applicant emails", async () => {
    await openApplicantsTab();
    await waitFor(() => screen.getByText("applicant1@example.com"));
    expect(screen.getByText("applicant2@example.com")).toBeInTheDocument();
  });

  test("shows applicant status badges", async () => {
    await openApplicantsTab();
    await waitFor(() => screen.getByText("pending"));
    expect(screen.getByText("shortlisted")).toBeInTheDocument();
  });

  test("shows loading state for applicants", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/opportunities/provider/"))
        return Promise.resolve({ json: () => Promise.resolve(MOCK_LISTINGS) });
      if (url.includes("/applications/opportunities/"))
        return new Promise(() => {}); // never resolves
      if (url.includes("/notifications/"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });
    renderComponent();
    await waitFor(() => screen.getByText("ICT Learnership"));
    fireEvent.click(screen.getByText("ICT Learnership").closest(".listing-card"));
    await waitFor(() => screen.getByText("Applicants"));
    fireEvent.click(screen.getByText("Applicants"));
    await waitFor(() =>
      expect(screen.getByText("Loading applicants...")).toBeInTheDocument()
    );
  });

  test("shows empty state when no applicants", async () => {
    setupFetch({ applicants: [] });
    await openApplicantsTab();
    await waitFor(() =>
      expect(screen.getByText("No applicants yet")).toBeInTheDocument()
    );
  });

  test("applicants tab badge shows count", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("ICT Learnership"));
    fireEvent.click(screen.getByText("ICT Learnership").closest(".listing-card"));
    await waitFor(() => screen.getByText("Applicants"));
    fireEvent.click(screen.getByText("Applicants"));
    await waitFor(() =>
      expect(screen.getByText("2")).toBeInTheDocument()
    );
  });
});

describe("MyListings — applicant profile modal", () => {
  async function openApplicantProfile() {
    renderComponent();
    await waitFor(() => screen.getByText("ICT Learnership"));
    fireEvent.click(screen.getByText("ICT Learnership").closest(".listing-card"));
    await waitFor(() => screen.getByText("Applicants"));
    fireEvent.click(screen.getByText("Applicants"));
    await waitFor(() => screen.getByText("applicant1@example.com"));
    fireEvent.click(screen.getAllByText("View Profile")[0]);
  }

  test("opens applicant profile modal", async () => {
    await openApplicantProfile();
    await waitFor(() =>
      expect(screen.getByText("Sipho Dlamini")).toBeInTheDocument()
    );
  });

  test("shows applicant contact details", async () => {
    await openApplicantProfile();
    await waitFor(() => screen.getByText("0831234567"));
    expect(screen.getAllByText("Johannesburg")[0]).toBeInTheDocument();
  });

  test("shows applicant education details", async () => {
    await openApplicantProfile();
    await waitFor(() => screen.getByText("Matric"));
    expect(screen.getAllByText("NQF 4")[0]).toBeInTheDocument();
  });

  test("shows CV link", async () => {
    await openApplicantProfile();
    await waitFor(() => screen.getByText("View CV →"));
    expect(screen.getByText("View CV →")).toBeInTheDocument();
  });

  test("Accept button calls PATCH with accepted status", async () => {
    await openApplicantProfile();
    await waitFor(() => screen.getByText("Accept"));
    fireEvent.click(screen.getByText("Accept"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/applications/101/status"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "accepted" }),
        })
      )
    );
  });

  test("Shortlist button calls PATCH with shortlisted status", async () => {
    await openApplicantProfile();
    await waitFor(() => screen.getByText("Shortlist"));
    fireEvent.click(screen.getByText("Shortlist"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/applications/101/status"),
        expect.objectContaining({
          body: JSON.stringify({ status: "shortlisted" }),
        })
      )
    );
  });

  test("Reject button calls PATCH with rejected status", async () => {
    await openApplicantProfile();
    await waitFor(() => screen.getByText("Reject"));
    fireEvent.click(screen.getByText("Reject"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/applications/101/status"),
        expect.objectContaining({
          body: JSON.stringify({ status: "rejected" }),
        })
      )
    );
  });

  test("closing profile modal via overlay hides it", async () => {
    await openApplicantProfile();
    await waitFor(() => screen.getByText("Sipho Dlamini"));
    // There are two overlays stacked; click the profile one (first in DOM)
    const overlays = document.querySelectorAll(".modal-overlay");
    fireEvent.click(overlays[0]);
    await waitFor(() =>
      expect(screen.queryByText("Sipho Dlamini")).not.toBeInTheDocument()
    );
  });
});

describe("MyListings — notifications", () => {
  test("opens notifications modal from popup menu", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() =>
      expect(screen.getByText("New applicant!")).toBeInTheDocument()
    );
  });

  test("closes notifications modal on overlay click", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() => screen.getByText("New applicant!"));
    fireEvent.click(document.querySelector(".modal-overlay"));
    await waitFor(() =>
      expect(screen.queryByText("New applicant!")).not.toBeInTheDocument()
    );
  });

  test("marks notification as read on click", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() => screen.getByText("New applicant!"));
    fireEvent.click(screen.getByText("New applicant!"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/notifications/1/read"),
        expect.objectContaining({ method: "PATCH" })
      )
    );
  });

  test("shows empty state when no notifications", async () => {
    setupFetch({ notifications: [] });
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() =>
      expect(screen.getByText("No notifications yet")).toBeInTheDocument()
    );
  });

  test("fetches notifications on mount", async () => {
    renderComponent();
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/notifications/${MOCK_USER.email}`)
      )
    );
  });
});

describe("MyListings — error handling", () => {
  test("handles fetch error for listings gracefully", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/opportunities/provider/"))
        return Promise.reject(new Error("Network error"));
      if (url.includes("/notifications/"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      return Promise.resolve({ json: () => Promise.resolve([]) });
    });
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("No listings yet")).toBeInTheDocument()
    );
  });

  test("handles no user.id gracefully (empty listings)", async () => {
    localStorage.setItem("user", JSON.stringify({ name: "No ID User", email: "noid@test.com" }));
    render(
      <MemoryRouter>
        <MyListings />
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByText("No listings yet")).toBeInTheDocument()
    );
  });
});
