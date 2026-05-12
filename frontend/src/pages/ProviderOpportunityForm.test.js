/**
 * ProviderOpportunityForm.test.js
 * Tests for ProviderOpportunityForm component
 * Coverage target: ≥ 90%
 *
 * Stack: Jest + React Testing Library (Create React App defaults)
 * Run:   npx react-scripts test ProviderOpportunityForm.test.js --coverage
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProviderOpportunityForm from "./ProviderOpportunityForm";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../firebase", () => ({
  auth: { signOut: jest.fn().mockResolvedValue(undefined)},
    googleProvider: {}, 
}));

process.env.REACT_APP_API_URL = "https://api.test.com";

// Mock geolocation
const mockGetCurrentPosition = jest.fn();
global.navigator.geolocation = { getCurrentPosition: mockGetCurrentPosition };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: "prov-1",
  name: "Provider One",
  email: "provider@example.com",
};

const MOCK_CITIES = ["Cape Town", "Johannesburg", "Durban", "Pretoria"];

const MOCK_PROVIDERS_ACCEPTED = [
  { email: "provider@example.com", status: "accepted" },
];
const MOCK_PROVIDERS_PENDING = [
  { email: "provider@example.com", status: "pending" },
];
const MOCK_PROVIDERS_OTHER = [
  { email: "other@example.com", status: "accepted" },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, message: "Listing approved", is_read: false, created_at: "2026-05-01T10:00:00Z" },
];

function setupFetch({
  providers = MOCK_PROVIDERS_ACCEPTED,
  notifications = MOCK_NOTIFICATIONS,
  postSuccess = true,
} = {}) {
  global.fetch = jest.fn((url, options) => {
    // Cities API
    if (url.includes("countriesnow")) {
      return Promise.resolve({
        json: () => Promise.resolve({ data: MOCK_CITIES }),
      });
    }
    // Provider profiles
    if (url.includes("/provider-profile")) {
      return Promise.resolve({ json: () => Promise.resolve(providers) });
    }
    // Notifications read
    if (url.includes("/notifications/") && url.includes("/read")) {
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }
    // Notifications fetch
    if (url.includes("/notifications/")) {
      return Promise.resolve({ json: () => Promise.resolve(notifications) });
    }
    // Post opportunity
    if (url.includes("/opportunities") && options?.method === "POST") {
      if (postSuccess) {
        return Promise.resolve({ json: () => Promise.resolve({ id: 99, title: "Test" }) });
      }
      return Promise.resolve({
        json: () => Promise.resolve({ error: "Duplicate entry" }),
      });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
}

function renderComponent() {
  localStorage.setItem("user", JSON.stringify(MOCK_USER));
  return render(
    <MemoryRouter>
      <ProviderOpportunityForm />
    </MemoryRouter>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fills in all required form fields */
async function fillForm() {
  fireEvent.change(screen.getByLabelText("Title"), {
    target: { name: "title", value: "ICT Learnership" },
  });
  fireEvent.change(screen.getByLabelText("Description"), {
    target: { name: "description", value: "A great learnership." },
  });
  fireEvent.change(screen.getByLabelText(/Stipend/), {
    target: { name: "stipend", value: "R3000/month" },
  });
  fireEvent.change(screen.getByLabelText("Duration"), {
    target: { name: "duration", value: "12 months" },
  });
  fireEvent.change(screen.getByLabelText("Requirements"), {
    target: { name: "requirements", value: "Matric required." },
  });
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  mockGetCurrentPosition.mockReset();
  setupFetch();

  const { auth } = require("../firebase");
  auth.signOut = jest.fn().mockResolvedValue(undefined);
  
});

afterEach(() => {
  
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ProviderOpportunityForm — initial render", () => {
  test("renders the form", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByLabelText("Title")).toBeInTheDocument()
    );
  });

  test("renders SkillsBridgeSA logo", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument()
    );
  });

  test("renders animated hero title", async () => {
    renderComponent();
    // The typewriter effect starts; wait for at least one character
    await waitFor(() =>
      expect(screen.getByText(/Post an Opportunity/)).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  test("fetches city list on mount", async () => {
    renderComponent();
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("countriesnow"),
        expect.any(Object)
      )
    );
  });

  test("populates location dropdown with cities", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("Cape Town")).toBeInTheDocument()
    );
    expect(screen.getByText("Johannesburg")).toBeInTheDocument();
  });

  test("fetches provider profile status on mount", async () => {
    renderComponent();
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/provider-profile")
      )
    );
  });
});

describe("ProviderOpportunityForm — navigation", () => {
  test("clicking Dashboard navigates to /provider", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Dashboard"));
    fireEvent.click(screen.getByText("Dashboard"));
    expect(mockNavigate).toHaveBeenCalledWith("/provider");
  });

  test("clicking My Listings navigates to /my-listings", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("My Listings"));
    fireEvent.click(screen.getByText("My Listings"));
    expect(mockNavigate).toHaveBeenCalledWith("/my-listings");
  });
});

describe("ProviderOpportunityForm — profile chip & popup", () => {
  test("renders provider initials", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("PO")).toBeInTheDocument()
    );
  });

  test("opens popup on chip click", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  test("Edit navigates to /provider-profile", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Edit"));
    expect(mockNavigate).toHaveBeenCalledWith("/provider-profile");
  });

  test("sign out calls auth.signOut and clears localStorage", async () => {
    const { auth } = require("../firebase");
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Sign out"));
    await waitFor(() => expect(auth.signOut).toHaveBeenCalled());
  });

  test("popup closes on outside click", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO")); // open
    fireEvent.mouseDown(document.body);
    await waitFor(() =>
      expect(screen.queryByText("Sign out")).not.toBeInTheDocument()
    );
  });
});

describe("ProviderOpportunityForm — provider status", () => {
  test("submit button enabled when provider is accepted", async () => {
    renderComponent();
    await waitFor(() => 
        screen.getByRole("button", { name: "Post Opportunity" }));
    const btn = screen.getByRole("button", { name: "Post Opportunity" });
    expect(btn).not.toBeDisabled();
  });

  test("submit button disabled when provider is pending", async () => {
    setupFetch({ providers: MOCK_PROVIDERS_PENDING });
    renderComponent();
    await waitFor(() => screen.getByText("Pending Approval"));
    const btn = screen.getByText("Pending Approval");
    expect(btn).toBeDisabled();
  });

  test("shows pending message when non-accepted provider tries to submit", async () => {
    setupFetch({ providers: MOCK_PROVIDERS_PENDING });
    renderComponent();
    await waitFor(() => screen.getByText("Pending Approval"));
    fireEvent.submit(document.querySelector("form"));
    await waitFor(() =>
      expect(
        screen.getByText(/still pending approval/i)
      ).toBeInTheDocument()
    );
  });

  test("sets status to pending when provider email not found in list", async () => {
    setupFetch({ providers: MOCK_PROVIDERS_OTHER });
    renderComponent();
    await waitFor(() => screen.getByText("Pending Approval"));
    expect(screen.getByText("Pending Approval")).toBeDisabled();
  });

  test("handles provider-profile fetch error gracefully", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/provider-profile"))
        return Promise.reject(new Error("Network error"));
      if (url.includes("countriesnow"))
        return Promise.resolve({ json: () => Promise.resolve({ data: [] }) });
      if (url.includes("/notifications/"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    // Should not crash; button state may be null/pending
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Post Opportunity|Pending Approval/i })).toBeInTheDocument()
    );
  });
});

describe("ProviderOpportunityForm — form fields", () => {
  async function setup() {
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
  }

  test("title field updates on change", async () => {
    await setup();
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { name: "title", value: "New Learnership" },
    });
    expect(screen.getByLabelText("Title").value).toBe("New Learnership");
  });

  test("description field updates on change", async () => {
    await setup();
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { name: "description", value: "Details here." },
    });
    expect(screen.getByLabelText("Description").value).toBe("Details here.");
  });

  test("stipend field updates on change", async () => {
    await setup();
    fireEvent.change(screen.getByLabelText(/Stipend/), {
      target: { name: "stipend", value: "R4000/month" },
    });
    expect(screen.getByLabelText(/Stipend/).value).toBe("R4000/month");
  });

  test("location dropdown updates on change", async () => {
    await setup();
    await waitFor(() => screen.getByText("Cape Town"));
    const locationSelect = screen.getByLabelText("Location");
    fireEvent.change(locationSelect, {
      target: { name: "location", value: "Cape Town" },
    });
    expect(locationSelect.value).toBe("Cape Town");
  });

  test("duration field updates on change", async () => {
    await setup();
    fireEvent.change(screen.getByLabelText("Duration"), {
      target: { name: "duration", value: "6 months" },
    });
    expect(screen.getByLabelText("Duration").value).toBe("6 months");
  });

  test("closing_date field updates on change", async () => {
    await setup();
    fireEvent.change(screen.getByLabelText("Closing Date"), {
      target: { name: "closing_date", value: "2026-12-31" },
    });
    expect(screen.getByLabelText("Closing Date").value).toBe("2026-12-31");
  });

  test("sector dropdown updates on change", async () => {
    await setup();
    const sectorSelect = screen.getByLabelText("Sector");
    fireEvent.change(sectorSelect, {
      target: { name: "sector", value: "ICT" },
    });
    expect(sectorSelect.value).toBe("ICT");
  });

  test("NQF Level dropdown updates on change", async () => {
    await setup();
    const nqfSelect = screen.getByLabelText("NQF Level");
    fireEvent.change(nqfSelect, {
      target: { name: "nqf_level", value: "NQF 4" },
    });
    expect(nqfSelect.value).toBe("NQF 4");
  });

  test("requirements textarea updates on change", async () => {
    await setup();
    fireEvent.change(screen.getByLabelText("Requirements"), {
      target: { name: "requirements", value: "Matric required." },
    });
    expect(screen.getByLabelText("Requirements").value).toBe("Matric required.");
  });

  test("all NQF levels are rendered in dropdown", async () => {
    await setup();
    expect(screen.getByText("NQF 1 – Grade 9")).toBeInTheDocument();
    expect(screen.getByText("NQF 10 – Doctoral Degree")).toBeInTheDocument();
  });
});

describe("ProviderOpportunityForm — form submission", () => {
  async function setupAndFill() {
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    await fillForm();
  }

  test("submits form and shows success message", async () => {
    await setupAndFill();
    fireEvent.submit(document.querySelector("form"));
    await waitFor(() =>
      expect(
        screen.getByText("Opportunity posted successfully!")
      ).toBeInTheDocument()
    );
  });

  test("calls POST /opportunities with correct payload", async () => {
    await setupAndFill();
    fireEvent.submit(document.querySelector("form"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/opportunities"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("ICT Learnership"),
        })
      )
    );
  });

  test("payload includes provider_id from localStorage", async () => {
    await setupAndFill();
    fireEvent.submit(document.querySelector("form"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/opportunities"),
        expect.objectContaining({
          body: expect.stringContaining("prov-1"),
        })
      )
    );
  });

  test("shows error message when API returns error", async () => {
    setupFetch({ postSuccess: false });
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    await fillForm();
    fireEvent.submit(document.querySelector("form"));
    await waitFor(() =>
      expect(screen.getByText(/Error: Duplicate entry/)).toBeInTheDocument()
    );
  });

  test("shows generic error on fetch failure", async () => {
    global.fetch = jest.fn((url, options) => {
      if (url.includes("/provider-profile"))
        return Promise.resolve({ json: () => Promise.resolve(MOCK_PROVIDERS_ACCEPTED) });
      if (url.includes("countriesnow"))
        return Promise.resolve({ json: () => Promise.resolve({ data: MOCK_CITIES }) });
      if (url.includes("/notifications/"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      if (url.includes("/opportunities") && options?.method === "POST")
        return Promise.reject(new Error("Network error"));
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    await fillForm();
    fireEvent.submit(document.querySelector("form"));
    await waitFor(() =>
      expect(
        screen.getByText("Something went wrong, try again")
      ).toBeInTheDocument()
    );
  });
});

describe("ProviderOpportunityForm — geolocation", () => {
  test("Detect Location button is rendered", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("Detect Location")).toBeInTheDocument()
    );
  });

  test("clicking Detect Location calls navigator.geolocation.getCurrentPosition", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Detect Location"));
    fireEvent.click(screen.getByText("Detect Location"));
    expect(mockGetCurrentPosition).toHaveBeenCalled();
  });

  test("geolocation sets location when city matches dropdown", async () => {
    mockGetCurrentPosition.mockImplementationOnce((success) => {
      success({ coords: { latitude: -26.2041, longitude: 28.0473 } });
    });
    // Reverse geocode mock
    global.fetch = jest.fn((url) => {
      if (url.includes("bigdatacloud")) {
        return Promise.resolve({
          json: () => Promise.resolve({ city: "Johannesburg" }),
        });
      }
      if (url.includes("/provider-profile"))
        return Promise.resolve({ json: () => Promise.resolve(MOCK_PROVIDERS_ACCEPTED) });
      if (url.includes("countriesnow"))
        return Promise.resolve({ json: () => Promise.resolve({ data: MOCK_CITIES }) });
      if (url.includes("/notifications/"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });

    renderComponent();
    await waitFor(() => screen.getByText("Detect Location"));
    fireEvent.click(screen.getByText("Detect Location"));
    await waitFor(() => {
      const locationSelect = screen.getByLabelText("Location");
      expect(locationSelect.value).toBe("Johannesburg");
    });
  });

  test("geolocation uses locality when city is empty", async () => {
    mockGetCurrentPosition.mockImplementationOnce((success) => {
      success({ coords: { latitude: -33.9249, longitude: 18.4241 } });
    });
    global.fetch = jest.fn((url) => {
      if (url.includes("bigdatacloud")) {
        return Promise.resolve({
          json: () => Promise.resolve({ city: "", locality: "Cape Town" }),
        });
      }
      if (url.includes("/provider-profile"))
        return Promise.resolve({ json: () => Promise.resolve(MOCK_PROVIDERS_ACCEPTED) });
      if (url.includes("countriesnow"))
        return Promise.resolve({ json: () => Promise.resolve({ data: MOCK_CITIES }) });
      if (url.includes("/notifications/"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });

    renderComponent();
    await waitFor(() => screen.getByText("Detect Location"));
    fireEvent.click(screen.getByText("Detect Location"));
    await waitFor(() => {
      const locationSelect = screen.getByLabelText("Location");
      expect(locationSelect.value).toBe("Cape Town");
    });
  });

  test("does nothing when geolocation is unavailable", async () => {
    const originalGeo = global.navigator.geolocation;
    delete global.navigator.geolocation;
    renderComponent();
    await waitFor(() => screen.getByText("Detect Location"));
    // Should not throw
    fireEvent.click(screen.getByText("Detect Location"));
    global.navigator.geolocation = originalGeo;
  });
});

describe("ProviderOpportunityForm — notifications panel", () => {
  test("opens notifications modal from popup", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() =>
      expect(screen.getByText("Listing approved")).toBeInTheDocument()
    );
  });

  test("closes notifications modal on ✕ click", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() => screen.getByText("Listing approved"));
    fireEvent.click(screen.getByText("✕"));
    await waitFor(() =>
      expect(screen.queryByText("Listing approved")).not.toBeInTheDocument()
    );
  });

  test("clicking notification marks it as read", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() => screen.getByText("Listing approved"));
    fireEvent.click(screen.getByText("Listing approved"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/notifications/1/read"),
        expect.objectContaining({ method: "PATCH" })
      )
    );
  });

  test("shows no notifications message when list is empty", async () => {
    setupFetch({ notifications: [] });
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() =>
      expect(screen.getByText("No notifications yet")).toBeInTheDocument()
    );
  });

  test("closes notifications modal on overlay click", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("PO"));
    fireEvent.click(screen.getByText("PO"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() => screen.getByText("Listing approved"));
    fireEvent.click(document.querySelector(".modal-overlay"));
    await waitFor(() =>
      expect(screen.queryByText("Listing approved")).not.toBeInTheDocument()
    );
  });
});

describe("ProviderOpportunityForm — typewriter animation", () => {
  test("completes full title text after timers run", async () => {
    jest.useFakeTimers();
    renderComponent();
    act(() => jest.runAllTimers());
    jest.useRealTimers();
    await waitFor(() =>
      expect(screen.getByText(/Post an Opportunity/)).toBeInTheDocument()
    );
  });
});
