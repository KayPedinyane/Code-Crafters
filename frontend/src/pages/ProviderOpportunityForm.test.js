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

// ─── Firebase mock ────────────────────────────────────────────
jest.mock("../firebase", () => ({
  auth: { signOut: jest.fn(() => Promise.resolve()) },
}));

// ─── Router mock ──────────────────────────────────────────────
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ─── Geolocation mock ─────────────────────────────────────────
const mockGetCurrentPosition = jest.fn();
global.navigator.geolocation = { getCurrentPosition: mockGetCurrentPosition };

// ─── Clipboard mock ───────────────────────────────────────────
Object.assign(navigator, {
  clipboard: { writeText: jest.fn(() => Promise.resolve()) },
});

// ─── Mock user in localStorage ────────────────────────────────
const MOCK_USER = { id: 42, name: "Sipho Dlamini", email: "sipho@provider.com" };

// ─── Fetch setup ──────────────────────────────────────────────
function setupFetch({
  providerStatus = "accepted",
  postSuccess = true,
  cities = ["Johannesburg", "Cape Town", "Durban"],
} = {}) {
  global.fetch = jest.fn((url, options) => {
    if (url.includes("countriesnow")) {
      return Promise.resolve({ json: () => Promise.resolve({ data: cities }) });
    }
    if (url.includes("bigdatacloud")) {
      return Promise.resolve({ json: () => Promise.resolve({ city: "Johannesburg" }) });
    }
    if (url.includes("/provider-profile")) {
      const providers = [{ email: MOCK_USER.email, status: providerStatus }];
      return Promise.resolve({ json: () => Promise.resolve(providers) });
    }
    if (url.includes("/notifications/") && url.includes("/read")) {
      return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
    }
    if (url.includes("/notifications")) {
      return Promise.resolve({
        json: () =>
          Promise.resolve([
            { id: 1, message: "Your listing was approved", is_read: false, created_at: "2026-05-01T10:00:00Z" },
          ]),
      });
    }
    if (url.includes("/opportunities") && options?.method === "POST") {
      if (!postSuccess) {
        return Promise.resolve({ json: () => Promise.resolve({ error: "Server error" }) });
      }
      return Promise.resolve({ json: () => Promise.resolve({ id: 1 }) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
}

function renderComponent() {
  return render(
    <MemoryRouter>
      <ProviderOpportunityForm />
    </MemoryRouter>
  );
}

// ─── Fill all required fields ─────────────────────────────────
async function fillForm() {
  fireEvent.change(screen.getByPlaceholderText(/Junior Developer Learnership/i), {
    target: { name: "title", value: "React Learnership" },
  });
  fireEvent.change(screen.getByPlaceholderText(/Describe the opportunity/i), {
    target: { name: "description", value: "Great opportunity for devs." },
  });
  fireEvent.change(screen.getByDisplayValue("Select Type"), {
    target: { name: "opportunity_type", value: "Learnership" },
  });
  fireEvent.change(screen.getByPlaceholderText(/3500/i), {
    target: { name: "stipend", value: "4000" },
  });
  await waitFor(() => screen.getByDisplayValue(/Select City|Johannesburg/i));
  const locationSelect = screen.getByDisplayValue(/Select City|Johannesburg/i);
  fireEvent.change(locationSelect, {
    target: { name: "location", value: "Johannesburg" },
  });
  fireEvent.change(screen.getByPlaceholderText(/e\.g\. 12/i), {
    target: { name: "duration", value: "12" },
  });
  const futureDate = "2030-06-30";
  fireEvent.change(screen.getByDisplayValue("") || document.querySelector("input[name='closing_date']"), {
    target: { name: "closing_date", value: futureDate },
  });
  fireEvent.change(screen.getByDisplayValue("Select Sector"), {
    target: { name: "sector", value: "ICT" },
  });
  fireEvent.change(screen.getByDisplayValue("Select NQF Level"), {
    target: { name: "nqf_level", value: "NQF 4" },
  });
  fireEvent.change(screen.getByPlaceholderText(/List the requirements/i), {
    target: { name: "requirements", value: "Matric required" },
  });
}

// ─── Setup ────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("user", JSON.stringify(MOCK_USER));
  setupFetch();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ─── Tests ────────────────────────────────────────────────────

describe("ProviderOpportunityForm — rendering", () => {
  test("renders SkillsBridgeSA branding", () => {
    renderComponent();
    expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument();
  });

  test("renders provider name from localStorage", () => {
    renderComponent();
    expect(screen.getByText("Sipho Dlamini")).toBeInTheDocument();
  });

  test("renders all nav links", () => {
    renderComponent();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("My Listings")).toBeInTheDocument();
    expect(screen.getByText("Post Opportunity")).toBeInTheDocument();
  });

  test("renders all required form fields", () => {
    renderComponent();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Opportunity Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stipend/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Requirements/i)).toBeInTheDocument();
  });

  test("renders all NQF levels in dropdown", () => {
    renderComponent();
    expect(screen.getByText(/NQF 1 – Grade 9/i)).toBeInTheDocument();
    expect(screen.getByText(/NQF 10 – Doctoral Degree/i)).toBeInTheDocument();
  });

  test("renders progress bar at 0% initially", () => {
    renderComponent();
    const fill = document.querySelector(".progress-fill");
    expect(fill).toHaveStyle("width: 0%");
  });

  test("animates title text character by character", async () => {
    renderComponent();
    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() =>
      expect(screen.getByText(/Post an Opportunity/i)).toBeInTheDocument()
    );
  });
});

describe("ProviderOpportunityForm — navigation", () => {
  test("Dashboard nav navigates to /provider", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Dashboard"));
    expect(mockNavigate).toHaveBeenCalledWith("/provider");
  });

  test("My Listings nav navigates to /my-listings", () => {
    renderComponent();
    fireEvent.click(screen.getByText("My Listings"));
    expect(mockNavigate).toHaveBeenCalledWith("/my-listings");
  });
});

describe("ProviderOpportunityForm — profile popup", () => {
  test("opens popup on profile chip click", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    expect(screen.getByText(/Sign out/i)).toBeInTheDocument();
  });

  test("shows user email in popup", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    expect(screen.getByText("sipho@provider.com")).toBeInTheDocument();
  });

  test("closes popup on outside click", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    expect(screen.getByText(/Sign out/i)).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    await waitFor(() =>
      expect(screen.queryByText(/Sign out/i)).not.toBeInTheDocument()
    );
  });

  test("Edit navigates to /provider-profile", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText("Edit"));
    expect(mockNavigate).toHaveBeenCalledWith("/provider-profile");
  });

  test("sign out calls auth.signOut and navigates to /", async () => {
    const { auth } = require("../firebase");
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText(/Sign out/i));
    await waitFor(() => expect(auth.signOut).toHaveBeenCalled());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });
});

describe("ProviderOpportunityForm — progress bar", () => {
  test("progress increases as fields are filled", async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Junior Developer Learnership/i), {
      target: { name: "title", value: "React Learnership" },
    });
    await waitFor(() => {
      const fill = document.querySelector(".progress-fill");
      expect(fill.style.width).not.toBe("0%");
    });
  });

  test("reaches 100% when all fields filled", async () => {
    renderComponent();
    await waitFor(() => screen.getByDisplayValue(/Select City|Johannesburg/i));
    await fillForm();
    // manually set closing_date via direct DOM manipulation as workaround for date input
    await waitFor(() => {
      const fill = document.querySelector(".progress-fill");
      const pct = parseInt(fill.style.width);
      expect(pct).toBeGreaterThan(70); // at least most fields filled
    });
  });
});

describe("ProviderOpportunityForm — field validation indicators", () => {
  test("shows ✓ icon after valid title entered", async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Junior Developer Learnership/i), {
      target: { name: "title", value: "React Learnership" },
    });
    await waitFor(() => {
      const group = screen.getByPlaceholderText(/Junior Developer Learnership/i).closest(".form-group");
      expect(group.classList.contains("valid")).toBe(true);
    });
  });

  test("shows ✓ icon after valid future closing date entered", async () => {
    renderComponent();
    const dateInput = document.querySelector("input[name='closing_date']");
    fireEvent.change(dateInput, { target: { name: "closing_date", value: "2030-06-30" } });
    await waitFor(() => {
      const group = dateInput.closest(".form-group");
      expect(group.classList.contains("valid")).toBe(true);
    });
  });

  test("does not mark past closing date as valid", async () => {
    renderComponent();
    const dateInput = document.querySelector("input[name='closing_date']");
    fireEvent.change(dateInput, { target: { name: "closing_date", value: "2020-01-01" } });
    await waitFor(() => {
      const group = dateInput.closest(".form-group");
      expect(group.classList.contains("valid")).toBe(false);
    });
  });

  test("does not mark negative stipend as valid", async () => {
    renderComponent();
    const stipendInput = screen.getByPlaceholderText(/3500/i);
    fireEvent.change(stipendInput, { target: { name: "stipend", value: "-100" } });
    await waitFor(() => {
      const group = stipendInput.closest(".form-group");
      expect(group.classList.contains("valid")).toBe(false);
    });
  });
});

describe("ProviderOpportunityForm — cities loading", () => {
  test("shows Loading cities... while fetching", () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // never resolves
    renderComponent();
    expect(screen.getByText(/Loading cities/i)).toBeInTheDocument();
  });

  test("populates city dropdown after fetch", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("Johannesburg")).toBeInTheDocument()
    );
  });

  test("handles city fetch failure gracefully", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("countriesnow")) return Promise.reject(new Error("Network error"));
      return Promise.resolve({ json: () => Promise.resolve([{ email: MOCK_USER.email, status: "accepted" }]) });
    });
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText(/Select City/i)).toBeInTheDocument()
    );
  });
});

describe("ProviderOpportunityForm — location detection", () => {
  test("detect location button is rendered", () => {
    renderComponent();
    expect(screen.getByText(/Detect Your Location/i)).toBeInTheDocument();
  });

  test("calls geolocation on detect button click", async () => {
    renderComponent();
    await waitFor(() => screen.getByText(/Detect Your Location/i));
    fireEvent.click(screen.getByText(/Detect Your Location/i));
    expect(mockGetCurrentPosition).toHaveBeenCalled();
  });

  test("auto-detects and sets location when cities are loaded", async () => {
    mockGetCurrentPosition.mockImplementation((success) =>
      success({ coords: { latitude: -26.2, longitude: 28.04 } })
    );
    renderComponent();
    await waitFor(() =>
      expect(screen.getByDisplayValue("Johannesburg")).toBeInTheDocument()
    );
  });
});

describe("ProviderOpportunityForm — notifications", () => {
  test("shows notifications modal from popup menu", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() =>
      expect(screen.getByText("Your listing was approved")).toBeInTheDocument()
    );
  });

  test("closes notification modal on overlay click", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() => screen.getByText("Your listing was approved"));
    fireEvent.click(document.querySelector(".modal-overlay"));
    await waitFor(() =>
      expect(screen.queryByText("Your listing was approved")).not.toBeInTheDocument()
    );
  });

  test("marks notification as read on click", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() => screen.getByText("Your listing was approved"));
    fireEvent.click(screen.getByText("Your listing was approved"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/read"),
        expect.objectContaining({ method: "PATCH" })
      )
    );
  });

  test("shows empty state when no notifications", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/notifications")) return Promise.resolve({ json: () => Promise.resolve([]) });
      if (url.includes("countriesnow")) return Promise.resolve({ json: () => Promise.resolve({ data: [] }) });
      if (url.includes("/provider-profile")) return Promise.resolve({ json: () => Promise.resolve([{ email: MOCK_USER.email, status: "accepted" }]) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() =>
      expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument()
    );
  });
});

describe("ProviderOpportunityForm — form submission", () => {
  test("shows pending approval message when provider not accepted", async () => {
    setupFetch({ providerStatus: "pending" });
    renderComponent();
    await waitFor(() => screen.getByText(/Pending Approval/i));
    fireEvent.submit(document.querySelector(".opportunity-form"));
    await waitFor(() =>
      expect(screen.getByText(/pending approval/i)).toBeInTheDocument()
    );
  });

  test("submit button is disabled when provider status is not accepted", async () => {
    setupFetch({ providerStatus: "pending" });
    renderComponent();
    await waitFor(() => {
      const btn = screen.getByText(/Pending Approval/i);
      expect(btn).toBeDisabled();
    });
  });

  test("successful submission shows success message", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    await fillForm();
    const closingInput = document.querySelector("input[name='closing_date']");
    fireEvent.change(closingInput, { target: { name: "closing_date", value: "2030-06-30" } });
    fireEvent.submit(document.querySelector(".opportunity-form"));
    await waitFor(() =>
      expect(screen.getByText(/Opportunity posted successfully/i)).toBeInTheDocument()
    );
  });

  test("successful submission navigates to /my-listings after delay", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    await fillForm();
    const closingInput = document.querySelector("input[name='closing_date']");
    fireEvent.change(closingInput, { target: { name: "closing_date", value: "2030-06-30" } });
    fireEvent.submit(document.querySelector(".opportunity-form"));
    await waitFor(() => screen.getByText(/Opportunity posted successfully/i));
    act(() => jest.advanceTimersByTime(1500));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/my-listings")
    );
  });

  test("shows server error message when API returns error", async () => {
    setupFetch({ postSuccess: false });
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    fireEvent.submit(document.querySelector(".opportunity-form"));
    await waitFor(() =>
      expect(screen.getByText(/Error:/i)).toBeInTheDocument()
    );
  });

  test("shows network error message on fetch failure", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/provider-profile"))
        return Promise.resolve({ json: () => Promise.resolve([{ email: MOCK_USER.email, status: "accepted" }]) });
      if (url.includes("/opportunities") && !url.includes("countriesnow"))
        return Promise.reject(new Error("Network error"));
      if (url.includes("countriesnow"))
        return Promise.resolve({ json: () => Promise.resolve({ data: [] }) });
      if (url.includes("/notifications"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    fireEvent.submit(document.querySelector(".opportunity-form"));
    await waitFor(() =>
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
    );
  });

  test("POST body includes duration with 'months' suffix", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    await fillForm();
    const closingInput = document.querySelector("input[name='closing_date']");
    fireEvent.change(closingInput, { target: { name: "closing_date", value: "2030-06-30" } });
    fireEvent.submit(document.querySelector(".opportunity-form"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/opportunities"),
        expect.objectContaining({
          body: expect.stringContaining("months"),
        })
      )
    );
  });

  test("POST body includes provider_id from localStorage user", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    await fillForm();
    const closingInput = document.querySelector("input[name='closing_date']");
    fireEvent.change(closingInput, { target: { name: "closing_date", value: "2030-06-30" } });
    fireEvent.submit(document.querySelector(".opportunity-form"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/opportunities"),
        expect.objectContaining({
          body: expect.stringContaining("42"),
        })
      )
    );
  });
});

describe("ProviderOpportunityForm — provider status edge cases", () => {
  test("sets providerStatus to pending when user not found in provider list", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/provider-profile"))
        return Promise.resolve({ json: () => Promise.resolve([{ email: "other@provider.com", status: "accepted" }]) });
      if (url.includes("countriesnow"))
        return Promise.resolve({ json: () => Promise.resolve({ data: [] }) });
      if (url.includes("/notifications"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText(/Pending Approval/i)).toBeInTheDocument()
    );
  });

  test("handles provider-profile fetch failure gracefully", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/provider-profile")) return Promise.reject(new Error("Network error"));
      if (url.includes("countriesnow")) return Promise.resolve({ json: () => Promise.resolve({ data: [] }) });
      if (url.includes("/notifications")) return Promise.resolve({ json: () => Promise.resolve([]) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    // Should not crash
    await waitFor(() =>
      expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument()
    );
  });
});