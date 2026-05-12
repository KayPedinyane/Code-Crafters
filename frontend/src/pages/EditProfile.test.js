
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EditProfile from "./EditProfile";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUnsubscribe = jest.fn();
jest.mock("../firebase", () => ({ auth: {} }));

const mockOnAuthStateChanged = jest.fn();
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../utils/nqfData", () => ({
  NQF_LEVELS: [
    { value: "NQF 4", label: "NQF 4", description: "Grade 12 / Matric" },
    { value: "NQF 6", label: "NQF 6", description: "Diploma" },
  ],
  QUALIFICATION_TYPES: [
    { value: "Matric", nqf: "NQF 4" },
    { value: "Diploma", nqf: "NQF 6" },
  ],
}));

jest.mock("../utils/saLocations", () => ({
  PROVINCES: ["Gauteng", "Western Cape"],
  CITIES_BY_PROVINCE: {
    Gauteng: ["Johannesburg", "Pretoria"],
    "Western Cape": ["Cape Town", "Stellenbosch"],
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_EMAIL = "user@example.com";

const MOCK_PROFILE = {
  full_name: "Thabo Nkosi",
  phone: "0821234567",
  id_number: "0001014800086",
  date_of_birth: "2000-01-01",
  gender: "Male",
  race: "African/Black",
  disability: "No disability",
  city: "Johannesburg",
  province: "Gauteng",
  qualification: "Matric",
  institution_type: "University",
  institution: "University of Johannesburg (UJ)",
  year_completed: "2022",
  nqf_level: "NQF 4",
  subjects: "Mathematics, Science",
  skills: "JavaScript, Python",
  cv_url: "cv_thabo.pdf",
};

function setupFetch(profile = MOCK_PROFILE) {
  global.fetch = jest.fn((url) => {
    if (url.includes("/profile/") || url.includes("/profile")) {
      return Promise.resolve({ json: () => Promise.resolve(profile) });
    }
    return Promise.resolve({ json: () => Promise.resolve({ ok: true }) });
  });
}

function renderComponent() {
  return render(
    <MemoryRouter>
      <EditProfile />
    </MemoryRouter>
  );
}

function triggerAuth(email) {
  const cb = mockOnAuthStateChanged.mock.calls[0][1];
  act(() => cb(email ? { email } : null));
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  mockOnAuthStateChanged.mockImplementation((_auth, cb) => mockUnsubscribe);
  setupFetch();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("EditProfile — authentication", () => {
  test("shows loading state before auth resolves", () => {
    renderComponent();
    expect(screen.getByText(/Loading your profile/i)).toBeInTheDocument();
  });

  test("redirects to / when user is unauthenticated", async () => {
    renderComponent();
    triggerAuth(null);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });

  test("renders form after auth", async () => {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() =>
      expect(screen.getByText("Personal Details")).toBeInTheDocument()
    );
  });

  test("unsubscribes from auth on unmount", () => {
    const { unmount } = renderComponent();
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

describe("EditProfile — header & navigation", () => {
  async function setup() {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Personal Details"));
  }

  test("renders SkillsBridgeSA logo", async () => {
    await setup();
    expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument();
  });

  test("back button navigates to /applicant", async () => {
    await setup();
    fireEvent.click(screen.getByText(/← Back to opportunities/i));
    expect(mockNavigate).toHaveBeenCalledWith("/applicant");
  });

  test("displays signed-in email", async () => {
    await setup();
    expect(screen.getByText(MOCK_EMAIL)).toBeInTheDocument();
  });
});

describe("EditProfile — loading profile data", () => {
  test("populates fields from DB profile", async () => {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() =>
      expect(screen.getByDisplayValue("Thabo Nkosi")).toBeInTheDocument()
    );
    expect(screen.getByDisplayValue("0821234567")).toBeInTheDocument();
  });

  test("falls back to localStorage when fetch fails", async () => {
    const localData = {
    personal: { 
      fullName: "Local User", 
      phone: "0831234567",
      idNumber: "",      
      gender: "",
      city: "",
      province: "",
      dateOfBirth: "",
    },
    education: {},
    skills: "",
    cvName: null,
  };
    localStorage.setItem(`profile_${MOCK_EMAIL}`, JSON.stringify(localData));
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));

    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() =>
      expect(screen.getByDisplayValue("Local User")).toBeInTheDocument()
    );
  });

  test("falls back to localStorage when DB returns error", async () => {
    const localData = {
      personal: { fullName: "Fallback Name", phone: "0801234567", idNumber: "", gender: "", city: "", province: "" },
      education: {},
      skills: "",
      cvName: null,
    };
    localStorage.setItem(`profile_${MOCK_EMAIL}`, JSON.stringify(localData));
    global.fetch = jest.fn(() => Promise.reject(new Error("not found")));

    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() =>
      expect(screen.getByDisplayValue("Fallback Name")).toBeInTheDocument()
    );
  });

  test("populates skills chips from DB", async () => {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("JavaScript"));
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  test("shows saved CV name from DB", async () => {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() =>
      expect(screen.getByText("cv_thabo.pdf")).toBeInTheDocument()
    );
  });
});

describe("EditProfile — personal details form", () => {
  async function setup() {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Personal Details"));
  }

  test("phone field only accepts digits", async () => {
    await setup();
    const phoneInput = screen.getByPlaceholderText("e.g. 0821234567");
    fireEvent.change(phoneInput, { target: { name: "phone", value: "abc0831234567xyz" } });
    expect(phoneInput.value).toMatch(/^\d+$/);
  });

  test("phone field maxes at 10 digits", async () => {
    await setup();
    const phoneInput = screen.getByPlaceholderText("e.g. 0821234567");
    fireEvent.change(phoneInput, {
      target: { name: "phone", value: "08312345678901234" },
    });
    expect(phoneInput.value.length).toBeLessThanOrEqual(10);
  });

  test("ID field auto-fills date of birth", async () => {
    await setup();
    const idInput = screen.getByPlaceholderText("e.g. 0001014800086");
    fireEvent.change(idInput, {
      target: { name: "idNumber", value: "0001014800086" },
    });
    const dobInput = screen.getByDisplayValue(/2000-01-01/);
    expect(dobInput).toBeInTheDocument();
  });

  test("ID field shows 13-digit confirmation", async () => {
    await setup();
    const idInput = screen.getByPlaceholderText("e.g. 0001014800086");
    fireEvent.change(idInput, {
      target: { name: "idNumber", value: "0001014800086" },
    });
    expect(
      screen.getByText(/Date of birth auto-filled/)
    ).toBeInTheDocument();
  });

  test("date of birth is disabled when 13-digit ID entered", async () => {
    await setup();
    const idInput = screen.getByPlaceholderText("e.g. 0001014800086");
    fireEvent.change(idInput, {
      target: { name: "idNumber", value: "0001014800086" },
    });
    const dobInput = document.querySelector("input[name='dateOfBirth']");
    expect(dobInput).toBeDisabled();
  });

  test("changing province resets city", async () => {
    await setup();
    const provinceSelect = screen.getByDisplayValue(/Select province|Gauteng/);
    fireEvent.change(provinceSelect, {
      target: { name: "province", value: "Western Cape" },
    });
    // City should have reset — city select now shows Western Cape cities
    await waitFor(() =>
      expect(screen.getByText("Cape Town")).toBeInTheDocument()
    );
  });

  test("city dropdown is disabled until province selected", async () => {
    setupFetch({ error: "not found" });
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Personal Details"));
    const cityInput = screen.getByPlaceholderText("Select a province first");
    expect(cityInput).toBeDisabled();
  });

  test("shows validation errors on save with empty required fields", async () => {
    setupFetch({ error: "not found" });
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Save Personal Details"));
    fireEvent.click(screen.getByText("Save Personal Details"));
    await waitFor(() =>
      expect(screen.getByText("Full Name is required")).toBeInTheDocument()
    );
  });

  test("shows phone length validation error", async () => {
    setupFetch({ error: "not found" });
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Personal Details"));

    fireEvent.change(screen.getByPlaceholderText("e.g. John Mkhize"), {
      target: { name: "fullName", value: "Test" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. 0821234567"), {
      target: { name: "phone", value: "12345" },
    });
    fireEvent.click(screen.getByText("Save Personal Details"));
    await waitFor(() =>
      expect(
        screen.getByText("Phone number must be exactly 10 digits")
      ).toBeInTheDocument()
    );
  });

  test("successful save shows confirmation message", async () => {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByDisplayValue("Thabo Nkosi"));
    fireEvent.click(screen.getByText("Save Personal Details"));
    await waitFor(() =>
      expect(
        screen.getByText("✓ Personal details saved!")
      ).toBeInTheDocument()
    );
  });
});

describe("EditProfile — education form", () => {
  async function setup() {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Education"));
  }

  test("changing institution type resets institution field", async () => {
    await setup();
    const typeSelect = document.querySelector("select[name='institutionType']");
    fireEvent.change(typeSelect, {
      target: { name: "institutionType", value: "TVET College" },
    });
    // Institution select should reset
    await waitFor(() =>
      expect(screen.getByText(/Select institution/)).toBeInTheDocument()
    );
  });

  test("institution shows text input for High School type", async () => {
    setupFetch({ error: "not found" });
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Education"));
    const typeSelect = document.querySelector("select[name='institutionType']");
    fireEvent.change(typeSelect, {
      target: { name: "institutionType", value: "High School" },
    });
    await waitFor(() =>
      expect(
        screen.getByPlaceholderText("Enter your institution name")
      ).toBeInTheDocument()
    );
  });

  test("institution field disabled before type selected", async () => {
    setupFetch({ error: "not found" });
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Education"));
    const institutionInput = screen.getByPlaceholderText(
      "Select institution type first"
    );
    expect(institutionInput).toBeDisabled();
  });

  test("year completed only accepts digits, max 4", async () => {
    await setup();
    const yearInput = screen.getByPlaceholderText("e.g. 2024");
    fireEvent.change(yearInput, {
      target: { name: "yearCompleted", value: "abcd20249999" },
    });
    expect(yearInput.value).toMatch(/^\d{0,4}$/);
  });

  test("shows validation errors when required education fields missing", async () => {
    setupFetch({ error: "not found" });
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Save Education"));
    fireEvent.click(screen.getByText("Save Education"));
    await waitFor(() =>
      expect(
        screen.getByText("Highest Qualification is required")
      ).toBeInTheDocument()
    );
  });

  test("successful education save shows confirmation", async () => {
  renderComponent();
  triggerAuth(MOCK_EMAIL);
  await waitFor(() => screen.getByText("Save Education"));
  fireEvent.click(screen.getByText("Save Education"));
  await waitFor(() =>
    expect(screen.getByText("✓ Education saved!")).toBeInTheDocument()
  );
});

describe("EditProfile — skills section", () => {
  async function setup() {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Skills"));
  }

  test("adds a skill on Add button click", async () => {
    await setup();
    const skillInput = screen.getByPlaceholderText(
      "Type a skill and press Enter or Add"
    );
    fireEvent.change(skillInput, { target: { value: "React" } });
    fireEvent.click(screen.getByText("Add"));
    await waitFor(() => expect(screen.getByText("React")).toBeInTheDocument());
  });

  test("adds skill on Enter key press", async () => {
    await setup();
    const skillInput = screen.getByPlaceholderText(
      "Type a skill and press Enter or Add"
    );
    fireEvent.change(skillInput, { target: { value: "Node.js" } });
    fireEvent.keyDown(skillInput, { key: "Enter" });
    await waitFor(() =>
      expect(screen.getByText("Node.js")).toBeInTheDocument()
    );
  });

  test("does not add duplicate skills", async () => {
    await setup();
    const skillInput = screen.getByPlaceholderText(
      "Type a skill and press Enter or Add"
    );
    fireEvent.change(skillInput, { target: { value: "JavaScript" } });
    fireEvent.click(screen.getByText("Add"));
    // "JavaScript" already loaded from profile; should not duplicate
    const allJS = screen.getAllByText("JavaScript");
    expect(allJS.length).toBe(1);
  });

  test("removes a skill on ✕ click", async () => {
    await setup();
    await waitFor(() => screen.getByText("JavaScript"));
    const removeButtons = document.querySelectorAll(".ep-skill-remove");
    fireEvent.click(removeButtons[0]); // remove first skill
    // one skill should be gone
    await waitFor(() =>
      expect(screen.queryAllByText(/JavaScript|Python/).length).toBeLessThan(2)
    );
  });

  test("save skills calls API", async () => {
    await setup();
    await waitFor(() => screen.getByText("Save Skills"));
    fireEvent.click(screen.getByText("Save Skills"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/profile"),
        expect.objectContaining({ method: "POST" })
      )
    );
  });

  test("shows skills saved confirmation", async () => {
    await setup();
    fireEvent.click(screen.getByText("Save Skills"));
    await waitFor(() =>
      expect(screen.getByText("✓ Skills saved!")).toBeInTheDocument()
    );
  });
});

describe("EditProfile — CV upload", () => {
  async function setup() {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Upload CV"));
  }

  test("renders CV dropzone", async () => {
    await setup();
    expect(screen.getByText(/Click to upload your CV/i)).toBeInTheDocument();
  });

  test("selecting a file shows filename", async () => {
    await setup();
    const file = new File(["content"], "mycv.pdf", { type: "application/pdf" });
    const fileInput = document.querySelector("input[type='file']");
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() =>
      expect(screen.getByText("mycv.pdf")).toBeInTheDocument()
    );
  });

  test("save CV button calls API with filename", async () => {
    await setup();
    const file = new File(["content"], "newcv.pdf", { type: "application/pdf" });
    const fileInput = document.querySelector("input[type='file']");
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText("Save CV"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/profile"),
        expect.objectContaining({
          body: expect.stringContaining("newcv.pdf"),
        })
      )
    );
  });

  test("shows CV saved confirmation", async () => {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("cv_thabo.pdf")); // from profile
    fireEvent.click(screen.getByText("Save CV"));
    await waitFor(() =>
      expect(screen.getByText("✓ CV saved!")).toBeInTheDocument()
    );
  });
});

describe("EditProfile — Save Everything", () => {
  async function setup() {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Save Everything"));
  }

  test("Save Everything button is rendered", async () => {
    await setup();
    expect(screen.getByText("Save Everything")).toBeInTheDocument();
  });

  test("Save Everything calls API with full payload", async () => {
    await setup();
    await waitFor(() => screen.getByDisplayValue("Thabo Nkosi"));
    fireEvent.click(screen.getByText("Save Everything"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/profile"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("Thabo Nkosi"),
        })
      )
    );
  });

  test("Save Everything shows validation errors when fields invalid", async () => {
    setupFetch({ error: "not found" });
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Save Everything"));
    fireEvent.click(screen.getByText("Save Everything"));
    await waitFor(() =>
      expect(screen.getByText("Full Name is required")).toBeInTheDocument()
    );
  });

  test("Save Everything shows all section confirmations on success", async () => {
    await setup();
    await waitFor(() => screen.getByDisplayValue("Thabo Nkosi"));
    fireEvent.click(screen.getByText("Save Everything"));
    await waitFor(() =>
      expect(screen.getByText("✓ Personal details saved!")).toBeInTheDocument()
    );
    expect(screen.getByText("✓ Education saved!")).toBeInTheDocument();
    expect(screen.getByText("✓ Skills saved!")).toBeInTheDocument();
  });
});
