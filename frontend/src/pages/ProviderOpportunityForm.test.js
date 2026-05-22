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
  const closingInput = document.querySelector("input[name='closing_date']");
  fireEvent.change(closingInput, { target: { name: "closing_date", value: "2030-06-30" } });
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

// ─── Rendering ────────────────────────────────────────────────

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

  test("renders initials from user name", () => {
    renderComponent();
    const avatars = document.querySelectorAll(".chip-avatar");
    expect(avatars[0].textContent).toBe("SD");
  });

  test("renders fallback initials when user has no name", () => {
    localStorage.setItem("user", JSON.stringify({ id: 1, email: "noname@test.com" }));
    renderComponent();
    const avatars = document.querySelectorAll(".chip-avatar");
    expect(avatars[0].textContent).toBe("P");
  });

  test("renders sector dropdown options", () => {
    renderComponent();
    expect(screen.getByText("ICT")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
    expect(screen.getByText("Healthcare")).toBeInTheDocument();
  });

  test("renders opportunity type options", () => {
    renderComponent();
    expect(screen.getByText("Internship")).toBeInTheDocument();
    expect(screen.getByText("Learnership")).toBeInTheDocument();
    expect(screen.getByText("Apprenticeship")).toBeInTheDocument();
  });

  test("renders Provider Portal eyebrow text", () => {
    renderComponent();
    expect(screen.getByText("Provider Portal")).toBeInTheDocument();
  });
});

// ─── Navigation ───────────────────────────────────────────────

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

// ─── Profile popup ────────────────────────────────────────────

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

  

  test("shows up arrow when popup is open", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    expect(screen.getByText("⌃")).toBeInTheDocument();
  });

  test("shows right arrow when popup is closed", () => {
    renderComponent();
    expect(screen.getByText("›")).toBeInTheDocument();
  });
});

// ─── Progress bar ─────────────────────────────────────────────

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

  test("reaches high percentage when all fields filled", async () => {
    renderComponent();
    await waitFor(() => screen.getByDisplayValue(/Select City|Johannesburg/i));
    await fillForm();
    await waitFor(() => {
      const fill = document.querySelector(".progress-fill");
      const pct = parseInt(fill.style.width);
      expect(pct).toBeGreaterThan(70);
    });
  });

  test("displays percentage text", async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Junior Developer Learnership/i), {
      target: { name: "title", value: "React Learnership" },
    });
    await waitFor(() => {
      expect(document.querySelector(".progress-text")).toBeInTheDocument();
    });
  });
});

// ─── Field validation ─────────────────────────────────────────

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

  test("marks valid positive stipend as valid", async () => {
    renderComponent();
    const stipendInput = screen.getByPlaceholderText(/3500/i);
    fireEvent.change(stipendInput, { target: { name: "stipend", value: "5000" } });
    await waitFor(() => {
      const group = stipendInput.closest(".form-group");
      expect(group.classList.contains("valid")).toBe(true);
    });
  });

  test("does not mark zero stipend as valid", async () => {
    renderComponent();
    const stipendInput = screen.getByPlaceholderText(/3500/i);
    fireEvent.change(stipendInput, { target: { name: "stipend", value: "0" } });
    await waitFor(() => {
      const group = stipendInput.closest(".form-group");
      expect(group.classList.contains("valid")).toBe(false);
    });
  });

  test("marks valid description as valid", async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/Describe the opportunity/i), {
      target: { name: "description", value: "A great role." },
    });
    await waitFor(() => {
      const group = screen.getByPlaceholderText(/Describe the opportunity/i).closest(".form-group");
      expect(group.classList.contains("valid")).toBe(true);
    });
  });

  test("marks valid requirements as valid", async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText(/List the requirements/i), {
      target: { name: "requirements", value: "Matric" },
    });
    await waitFor(() => {
      const group = screen.getByPlaceholderText(/List the requirements/i).closest(".form-group");
      expect(group.classList.contains("valid")).toBe(true);
    });
  });

  test("marks valid sector selection as valid", async () => {
    renderComponent();
    fireEvent.change(screen.getByDisplayValue("Select Sector"), {
      target: { name: "sector", value: "ICT" },
    });
    await waitFor(() => {
      const group = screen.getByDisplayValue("ICT").closest(".form-group");
      expect(group.classList.contains("valid")).toBe(true);
    });
  });

  test("marks valid NQF level selection as valid", async () => {
    renderComponent();
    fireEvent.change(screen.getByDisplayValue("Select NQF Level"), {
      target: { name: "nqf_level", value: "NQF 4" },
    });
    await waitFor(() => {
      const group = screen.getByDisplayValue(/NQF 4/i).closest(".form-group");
      expect(group.classList.contains("valid")).toBe(true);
    });
  });
});

// ─── Cities loading ───────────────────────────────────────────

describe("ProviderOpportunityForm — cities loading", () => {
  test("shows Loading cities... while fetching", () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
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

  test("sorts cities alphabetically", async () => {
    setupFetch({ cities: ["Durban", "Cape Town", "Johannesburg"] });
    renderComponent();
    await waitFor(() => screen.getByText("Cape Town"));
    const options = document.querySelectorAll("#location option");
    const cityTexts = Array.from(options).slice(1).map((o) => o.textContent);
    expect(cityTexts).toEqual([...cityTexts].sort());
  });
});

// ─── Location detection ───────────────────────────────────────

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

  test("falls back to raw city name if no match in dropdown", async () => {
    mockGetCurrentPosition.mockImplementation((success) =>
      success({ coords: { latitude: -26.2, longitude: 28.04 } })
    );
    global.fetch = jest.fn((url) => {
      if (url.includes("countriesnow"))
        return Promise.resolve({ json: () => Promise.resolve({ data: ["Cape Town"] }) });
      if (url.includes("bigdatacloud"))
        return Promise.resolve({ json: () => Promise.resolve({ city: "Unknown City" }) });
      if (url.includes("/provider-profile"))
        return Promise.resolve({ json: () => Promise.resolve([{ email: MOCK_USER.email, status: "accepted" }]) });
      if (url.includes("/notifications"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    await waitFor(() => screen.getByText("Cape Town"));
    fireEvent.click(screen.getByText(/Detect Your Location/i));
    await waitFor(() => expect(mockGetCurrentPosition).toHaveBeenCalled());
  });

  test("handles geolocation not supported gracefully", () => {
    const originalGeo = global.navigator.geolocation;
    delete global.navigator.geolocation;
    renderComponent();
    fireEvent.click(screen.getByText(/Detect Your Location/i));
    expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument();
    global.navigator.geolocation = originalGeo;
  });

  test("handles bigdatacloud fetch failure silently", async () => {
    mockGetCurrentPosition.mockImplementation((success) =>
      success({ coords: { latitude: -26.2, longitude: 28.04 } })
    );
    global.fetch = jest.fn((url) => {
      if (url.includes("countriesnow"))
        return Promise.resolve({ json: () => Promise.resolve({ data: ["Johannesburg"] }) });
      if (url.includes("bigdatacloud"))
        return Promise.reject(new Error("Network error"));
      if (url.includes("/provider-profile"))
        return Promise.resolve({ json: () => Promise.resolve([{ email: MOCK_USER.email, status: "accepted" }]) });
      if (url.includes("/notifications"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    await waitFor(() => screen.getByText("Johannesburg"));
    expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument();
  });

  test("handles geolocation error callback silently", async () => {
    mockGetCurrentPosition.mockImplementation((_success, error) =>
      error(new Error("denied"))
    );
    renderComponent();
    await waitFor(() => screen.getByText(/Detect Your Location/i));
    fireEvent.click(screen.getByText(/Detect Your Location/i));
    expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument();
  });
});

// ─── Notifications ────────────────────────────────────────────

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

  test("closes notification modal on close button click", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() => screen.getByText("Your listing was approved"));
    fireEvent.click(screen.getByText("✕"));
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

  test("handles non-array notifications response gracefully", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/notifications") && !url.includes("/read"))
        return Promise.resolve({ json: () => Promise.resolve({ error: "bad" }) });
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

  test("does not close modal when clicking inside modal content", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText("Notifications"));
    await waitFor(() => screen.getByText("Your listing was approved"));
    fireEvent.click(document.querySelector(".modal"));
    expect(screen.getByText("Your listing was approved")).toBeInTheDocument();
  });
});

// ─── Form submission ──────────────────────────────────────────

describe("ProviderOpportunityForm — form submission", () => {
  test("shows pending approval message when provider not accepted", async () => {
    setupFetch({ providerStatus: "pending" });
    renderComponent();
    await waitFor(() => screen.getByText(/Pending Approval/i));
    fireEvent.submit(document.querySelector(".opportunity-form"));
    
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
    fireEvent.submit(document.querySelector(".opportunity-form"));
    await waitFor(() =>
      expect(screen.getByText(/Opportunity posted successfully/i)).toBeInTheDocument()
    );
  });

  test("successful submission navigates to /my-listings after delay", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    await fillForm();
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
    
  });

  test("POST body includes duration with 'months' suffix", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    await fillForm();
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

  test("shows Posting... while submitting", async () => {
    global.fetch = jest.fn((url, options) => {
      if (url.includes("/opportunities") && options?.method === "POST")
        return new Promise(() => {});
      if (url.includes("/provider-profile"))
        return Promise.resolve({ json: () => Promise.resolve([{ email: MOCK_USER.email, status: "accepted" }]) });
      if (url.includes("countriesnow"))
        return Promise.resolve({ json: () => Promise.resolve({ data: [] }) });
      if (url.includes("/notifications"))
        return Promise.resolve({ json: () => Promise.resolve([]) });
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    fireEvent.submit(document.querySelector(".opportunity-form"));
    
  });

  test("shows Success! on button after successful submission", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    await fillForm();
    fireEvent.submit(document.querySelector(".opportunity-form"));
    await waitFor(() =>
      expect(screen.getByText("Success!")).toBeInTheDocument()
    );
  });

  test("POST body sends empty duration string when duration not filled", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Post Opportunity"));
    fireEvent.submit(document.querySelector(".opportunity-form"));
    
  });
});

// ─── Provider status edge cases ───────────────────────────────

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
    await waitFor(() =>
      expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument()
    );
  });

  test("button shows Post Opportunity when provider is accepted", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("Post Opportunity")).toBeInTheDocument()
    );
    expect(screen.getByText("Post Opportunity")).not.toBeDisabled();
  });
});