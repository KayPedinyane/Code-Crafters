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

// ─── Mock NotificationPanel component ─────────────────────────
jest.mock('../components/NotificationPanel', () => {
  return function MockNotificationPanel({ notifications, onClose, onMarkRead, onMarkAllRead }) {
    return (
      <div className="mock-notification-panel">
        <button onClick={onClose}>Close</button>
        <button onClick={onMarkAllRead}>Mark All Read</button>
        {notifications.length === 0 ? (
          <p>No notifications yet</p>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} onClick={() => onMarkRead(notif.id)}>
              <p>{notif.message}</p>
              <time>{new Date(notif.created_at).toLocaleDateString("en-ZA")}</time>
            </div>
          ))
        )}
      </div>
    );
  };
});

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

// ─── Mock user in localStorage ────────────────────────────────
const MOCK_USER = { id: 42, name: "Sipho Dlamini", email: "sipho@provider.com" };

// ─── Fetch setup ──────────────────────────────────────────────
function setupFetch({
  providerStatus = "accepted",
  postSuccess = true,
  provinces = ["Gauteng", "Western Cape"],
  cities = ["Johannesburg", "Cape Town", "Durban"],
} = {}) {
  global.fetch = jest.fn((url, options) => {
    if (url.includes("countries/states")) {
      return Promise.resolve({
        json: () => Promise.resolve({
          data: { states: provinces.map(p => ({ name: p })) }
        })
      });
    }
    if (url.includes("state/cities")) {
      return Promise.resolve({ json: () => Promise.resolve({ data: cities }) });
    }
    if (url.includes("bigdatacloud")) {
      return Promise.resolve({
        json: () => Promise.resolve({
          city: "Johannesburg",
          principalSubdivision: "Gauteng"
        })
      });
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
  
  // Wait for provinces to load
  await waitFor(() => screen.getByText("Gauteng"));
  
  // Select province
  fireEvent.change(screen.getByDisplayValue(/Select Province/i), {
    target: { name: "province", value: "Gauteng" },
  });
  
  // Wait for cities to load
  await waitFor(() => screen.getByText("Johannesburg"));
  
  // Select city
  const citySelect = document.querySelector("select[name='location']");
  fireEvent.change(citySelect, {
    target: { value: "Johannesburg" },
  });
  
  fireEvent.change(screen.getByPlaceholderText(/e\.g\. 12/i), {
    target: { name: "duration", value: "12" },
  });
  const closingInput = document.querySelector("input[name='closing_date']");
  fireEvent.change(closingInput, { target: { name: "closing_date", value: "2030-06-30" } });
  fireEvent.change(screen.getByDisplayValue("Select Sector"), {
    target: { name: "sector", value: "ICT & Media" },
  });
  fireEvent.change(screen.getByDisplayValue("Select NQF Level"), {
    target: { name: "nqf_level", value: "NQF 4" },
  });
  
  // Add requirement using new system
  const requirementInput = screen.getByPlaceholderText(/e.g. Matric certificate/i);
  fireEvent.change(requirementInput, { target: { value: "Matric required" } });
  fireEvent.click(screen.getByText("+ Add"));
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
  });

  test("renders requirements add button", () => {
    renderComponent();
    expect(screen.getByText("+ Add")).toBeInTheDocument();
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

  test("Settings nav navigates to /provider-settings", () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText("Settings"));
    expect(mockNavigate).toHaveBeenCalledWith("/provider-settings");
  });
});

// ─── Requirements List ────────────────────────────────────────

describe("ProviderOpportunityForm — requirements list", () => {
  test("adds requirement when clicking + Add button", () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/e.g. Matric certificate/i);
    
    fireEvent.change(input, { target: { value: "Matric required" } });
    fireEvent.click(screen.getByText("+ Add"));
    
    expect(screen.getByText(/• Matric required/i)).toBeInTheDocument();
  });

  test("adds requirement when pressing Enter", () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/e.g. Matric certificate/i);
    
    fireEvent.change(input, { target: { value: "Degree required" } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(screen.getByText(/• Degree required/i)).toBeInTheDocument();
  });

  test("clears input after adding requirement", () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/e.g. Matric certificate/i);
    
    fireEvent.change(input, { target: { value: "Matric required" } });
    fireEvent.click(screen.getByText("+ Add"));
    
    expect(input.value).toBe("");
  });

  test("removes requirement when clicking ✕", () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/e.g. Matric certificate/i);
    
    fireEvent.change(input, { target: { value: "Matric required" } });
    fireEvent.click(screen.getByText("+ Add"));
    
    expect(screen.getByText(/• Matric required/i)).toBeInTheDocument();
    
    const removeButton = screen.getByText("✕");
    fireEvent.click(removeButton);
    
    expect(screen.queryByText(/• Matric required/i)).not.toBeInTheDocument();
  });

  test("adds multiple requirements", () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/e.g. Matric certificate/i);
    
    fireEvent.change(input, { target: { value: "Matric" } });
    fireEvent.click(screen.getByText("+ Add"));
    
    fireEvent.change(input, { target: { value: "Drivers license" } });
    fireEvent.click(screen.getByText("+ Add"));
    
    expect(screen.getByText(/• Matric/i)).toBeInTheDocument();
    expect(screen.getByText(/• Drivers license/i)).toBeInTheDocument();
  });

  test("does not add empty requirement", () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/e.g. Matric certificate/i);
    
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(screen.getByText("+ Add"));
    
    expect(screen.queryByText(/•/)).not.toBeInTheDocument();
  });
});

// ─── Notifications ────────────────────────────────────────────

describe("ProviderOpportunityForm — notifications", () => {
  test("shows NotificationPanel from popup menu", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText("Notifications"));
    
    await waitFor(() =>
      expect(screen.getByText("Your listing was approved")).toBeInTheDocument()
    );
  });

  test("closes notification panel", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText("Notifications"));
    
    await waitFor(() => screen.getByText("Your listing was approved"));
    
    fireEvent.click(screen.getByText("Close"));
    
    await waitFor(() =>
      expect(screen.queryByText("Your listing was approved")).not.toBeInTheDocument()
    );
  });

  test("marks notification as read", async () => {
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

  test("marks all notifications as read", async () => {
    renderComponent();
    fireEvent.click(screen.getByText("Sipho Dlamini"));
    fireEvent.click(screen.getByText("Notifications"));
    
    await waitFor(() => screen.getByText("Your listing was approved"));
    
    fireEvent.click(screen.getByText("Mark All Read"));
    
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/read"),
        expect.objectContaining({ method: "PATCH" })
      )
    );
  });
});

// ─── Form Submission ──────────────────────────────────────────

describe("ProviderOpportunityForm — form submission", () => {
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

  test("shows error when provider not accepted", async () => {
    setupFetch({ providerStatus: "pending" });
    renderComponent();
    await waitFor(() => screen.getByText(/Pending Approval/i));
    fireEvent.submit(document.querySelector(".opportunity-form"));
    await waitFor(() =>
      expect(screen.getByText(/Your provider account is still pending approval/i)).toBeInTheDocument()
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
});