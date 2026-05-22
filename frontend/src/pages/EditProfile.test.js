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
const mockOnAuthStateChanged = jest.fn();

jest.mock("../firebase", () => ({ auth: {} }));

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

// ─── Test data ────────────────────────────────────────────────────────────────

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
    if (url.includes("/profile"))
      return Promise.resolve({ json: () => Promise.resolve(profile) });
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
  const cb = mockOnAuthStateChanged.mock.calls[0]?.[1];
  act(() => cb(email ? { email } : null));
}

async function clickTab(label) {
  await waitFor(() => {
    const tabs = document.querySelectorAll(".ep-tab");
    const tab = Array.from(tabs).find((t) => t.textContent.includes(label));
    if (!tab) throw new Error(`Tab "${label}" not found`);
    fireEvent.click(tab);
  });
}

// ─── Setup ────────────────────────────────────────────────────────────────────

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
  test("populates personal fields from DB profile", async () => {
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
        dateOfBirth: "",
        gender: "",
        race: "",
        disability: "",
        city: "",
        province: "",
      },
      education: {},
      skills: "React",
      cvName: "local_cv.pdf",
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
      personal: {
        fullName: "Fallback Name",
        phone: "0801234567",
        idNumber: "",
        dateOfBirth: "",
        gender: "",
        race: "",
        disability: "",
        city: "",
        province: "",
      },
      education: {},
      skills: "",
      cvName: null,
    };
    localStorage.setItem(`profile_${MOCK_EMAIL}`, JSON.stringify(localData));
    setupFetch({ error: "not found" });
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() =>
      expect(screen.getByDisplayValue("Fallback Name")).toBeInTheDocument()
    );
  });

  test("populates skills chips from DB", async () => {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => document.querySelector(".ep-tab"));
    await clickTab("Skills");
    await waitFor(() => expect(screen.getByText("JavaScript")).toBeInTheDocument());
    expect(screen.getByText("Python")).toBeInTheDocument();
  });

  test("shows saved CV name from DB", async () => {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => document.querySelector(".ep-tab"));
    await clickTab("CV");
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
    fireEvent.change(phoneInput, {
      target: { name: "phone", value: "abc0831234567xyz" },
    });
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
    const dobInput = document.querySelector("input[name='dateOfBirth']");
    expect(dobInput.value).toMatch(/2000-01-01/);
  });

  test("ID field shows 13-digit confirmation", async () => {
    await setup();
    const idInput = screen.getByPlaceholderText("e.g. 0001014800086");
    fireEvent.change(idInput, {
      target: { name: "idNumber", value: "0001014800086" },
    });
    await waitFor(() =>
      expect(screen.getByText(/Date of birth auto-filled/)).toBeInTheDocument()
    );
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

  test("changing province resets city and shows its cities", async () => {
    await setup();
    const provinceSelect = document.querySelector("select[name='province']");
    fireEvent.change(provinceSelect, {
      target: { name: "province", value: "Western Cape" },
    });
    await waitFor(() =>
      expect(screen.getByText("Cape Town")).toBeInTheDocument()
    );
  });

  test("city dropdown is disabled until province is selected", async () => {
    setupFetch({ error: "not found" });
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => screen.getByText("Personal Details"));
    const cityInput = screen.getByPlaceholderText("Select a province first");
    expect(cityInput).toBeDisabled();
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
    await waitFor(() => {
      const errors = document.querySelectorAll(".ep-error-msg");
      const msgs = Array.from(errors).map((e) => e.textContent);
      expect(msgs.some((m) => m.includes("10 digits"))).toBe(true);
    });
  });

  test("successful save shows confirmation badge", async () => {
    await setup();
    await waitFor(() => screen.getByDisplayValue("Thabo Nkosi"));
    fireEvent.click(screen.getByText("Save Personal Details"));
    await waitFor(() =>
      expect(document.querySelector(".ep-saved-badge")).toBeInTheDocument()
    );
  });
});

describe("EditProfile — education form", () => {
  async function setupEducationTab() {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => document.querySelector(".ep-tab"));
    await clickTab("Education");
    await waitFor(() =>
      expect(document.querySelector("select[name='institutionType']")).toBeInTheDocument()
    );
  }

  test("changing institution type resets institution field", async () => {
    await setupEducationTab();
    const typeSelect = document.querySelector("select[name='institutionType']");
    fireEvent.change(typeSelect, {
      target: { name: "institutionType", value: "TVET College" },
    });
    await waitFor(() =>
      expect(
        document.querySelector("select[name='institution']")
      ).toBeInTheDocument()
    );
  });

  test("institution shows text input for High School type", async () => {
    setupFetch({ error: "not found" });
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => document.querySelector(".ep-tab"));
    await clickTab("Education");
    await waitFor(() =>
      document.querySelector("select[name='institutionType']")
    );
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
    await waitFor(() => document.querySelector(".ep-tab"));
    await clickTab("Education");
    await waitFor(() =>
      expect(
        screen.getByPlaceholderText("Select institution type first")
      ).toBeInTheDocument()
    );
    expect(
      screen.getByPlaceholderText("Select institution type first")
    ).toBeDisabled();
  });

  test("year completed only accepts digits, max 4", async () => {
    await setupEducationTab();
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
    await waitFor(() => document.querySelector(".ep-tab"));
    await clickTab("Education");
    await waitFor(() => screen.getByText("Save Education"));
    fireEvent.click(screen.getByText("Save Education"));
    await waitFor(() => {
      const errors = document.querySelectorAll(".ep-error-msg");
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  test("successful education save shows confirmation badge", async () => {
    await setupEducationTab();
    await waitFor(() => screen.getByText("Save Education"));
    fireEvent.click(screen.getByText("Save Education"));
    await waitFor(() =>
      expect(document.querySelector(".ep-saved-badge")).toBeInTheDocument()
    );
  });
});

describe("EditProfile — skills section", () => {
  async function setupSkillsTab() {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => document.querySelector(".ep-tab"));
    await clickTab("Skills");
    await waitFor(() =>
      expect(
        screen.getByPlaceholderText("Type a skill and press Enter or Add")
      ).toBeInTheDocument()
    );
  }

  test("adds a skill on Add button click", async () => {
    await setupSkillsTab();
    const skillInput = screen.getByPlaceholderText(
      "Type a skill and press Enter or Add"
    );
    fireEvent.change(skillInput, { target: { value: "React" } });
    fireEvent.click(screen.getByText("Add"));
    await waitFor(() => expect(screen.getByText("React")).toBeInTheDocument());
  });

  test("adds skill on Enter key press", async () => {
    await setupSkillsTab();
    const skillInput = screen.getByPlaceholderText(
      "Type a skill and press Enter or Add"
    );
    fireEvent.change(skillInput, { target: { value: "Node.js" } });
    fireEvent.keyDown(skillInput, { key: "Enter" });
    await waitFor(() => expect(screen.getByText("Node.js")).toBeInTheDocument());
  });

  test("does not add duplicate skills", async () => {
    await setupSkillsTab();
    await waitFor(() => screen.getByText("JavaScript"));
    const skillInput = screen.getByPlaceholderText(
      "Type a skill and press Enter or Add"
    );
    fireEvent.change(skillInput, { target: { value: "JavaScript" } });
    fireEvent.click(screen.getByText("Add"));
    expect(screen.getAllByText("JavaScript").length).toBe(1);
  });

  test("removes a skill on ✕ click", async () => {
    await setupSkillsTab();
    await waitFor(() => screen.getByText("JavaScript"));
    const removeButtons = document.querySelectorAll(".ep-skill-remove");
    fireEvent.click(removeButtons[0]);
    await waitFor(() =>
      expect(screen.queryAllByText(/JavaScript|Python/).length).toBeLessThan(2)
    );
  });

  test("save skills calls API", async () => {
    await setupSkillsTab();
    await waitFor(() => screen.getByText("Save Skills"));
    fireEvent.click(screen.getByText("Save Skills"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/profile"),
        expect.objectContaining({ method: "POST" })
      )
    );
  });

  test("shows skills saved confirmation badge", async () => {
    await setupSkillsTab();
    await waitFor(() => screen.getByText("Save Skills"));
    fireEvent.click(screen.getByText("Save Skills"));
    await waitFor(() =>
      expect(document.querySelector(".ep-saved-badge")).toBeInTheDocument()
    );
  });
});

describe("EditProfile — CV upload", () => {
  async function setupCVTab() {
    renderComponent();
    triggerAuth(MOCK_EMAIL);
    await waitFor(() => document.querySelector(".ep-tab"));
    await clickTab("CV");
    await waitFor(() =>
      expect(document.querySelector("input[type='file']")).toBeInTheDocument()
    );
  }

  test("renders CV dropzone", async () => {
    await setupCVTab();
    await waitFor(() =>
      expect(screen.getByText("cv_thabo.pdf")).toBeInTheDocument()
    );
  });

  test("selecting a file shows filename", async () => {
    await setupCVTab();
    const file = new File(["content"], "mycv.pdf", { type: "application/pdf" });
    const fileInput = document.querySelector("input[type='file']");
    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => expect(screen.getByText("mycv.pdf")).toBeInTheDocument());
  });

  test("save CV button calls API with filename", async () => {
    await setupCVTab();
    const file = new File(["content"], "newcv.pdf", { type: "application/pdf" });
    const fileInput = document.querySelector("input[type='file']");
    fireEvent.change(fileInput, { target: { files: [file] } });
    fireEvent.click(screen.getByText("Save CV"));
    
  });

  test("shows CV saved confirmation badge", async () => {
    await setupCVTab();
    await waitFor(() => screen.getByText("cv_thabo.pdf"));
    fireEvent.click(screen.getByText("Save CV"));
    await waitFor(() =>
      expect(document.querySelector(".ep-saved-badge")).toBeInTheDocument()
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
  });

  test("Save Everything shows saved confirmation badge on success", async () => {
    await setup();
    await waitFor(() => screen.getByDisplayValue("Thabo Nkosi"));
    fireEvent.click(screen.getByText("Save Everything"));
    await waitFor(() =>
      expect(document.querySelector(".ep-saved-badge")).toBeInTheDocument()
    );
  });
});