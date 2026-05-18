/**
 * Job_Details.test.js
 * Tests for JobDetails component (admin job review screen)
 * Coverage target: ≥ 90%
 *
 * Stack: Jest + React Testing Library (Create React App defaults)
 * Run:   npx react-scripts test Job_Details.test.js --coverage
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import JobDetails from "./Job_Details";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Provide a stable REACT_APP_API_URL
process.env.REACT_APP_API_URL = "https://api.test.com";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PENDING_JOB = {
  id: "job-1",
  title: "ICT Learnership",
  location: "Johannesburg, Gauteng",
  description: "A great learnership in the ICT sector.",
  provider: "TechCorp SA",
  stipend: "R3000/month",
  status: "pending",
};

const APPROVED_JOB = { ...PENDING_JOB, status: "approved" };
const REJECTED_JOB = { ...PENDING_JOB, status: "rejected" };

function setupFetch(job = PENDING_JOB, updateOk = true) {
  global.fetch = jest.fn((url, options) => {
    // GET job
    if (!options || options.method !== "PUT") {
      return Promise.resolve({ json: () => Promise.resolve(job) });
    }
    // PUT status update
    if (updateOk) {
      const body = JSON.parse(options.body);
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ...job, status: body.status }),
      });
    }
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: "Failed" }),
    });
  });
}

/** Render at /admin/jobs/:jobId */
function renderComponent(jobId = "job-1") {
  return render(
    <MemoryRouter initialEntries={[`/admin/jobs/${jobId}`]}>
      <Routes>
        <Route path="/admin/jobs/:jobId" element={<JobDetails />} />
      </Routes>
    </MemoryRouter>
  );
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  setupFetch();
});

afterEach(() => {
  jest.runAllTimers();
  jest.useRealTimers();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("JobDetails — initial loading", () => {
  test("shows loading text before job is fetched", () => {
    global.fetch = jest.fn(() => new Promise(() => {})); // never resolves
    renderComponent();
    expect(screen.getByText("Loading job...")).toBeInTheDocument();
  });

  test("renders job title after fetch", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("ICT Learnership")).toBeInTheDocument()
    );
  });

  test("renders job location in subheading", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getAllByText("Johannesburg, Gauteng")[0]).toBeInTheDocument()
    );
  });

  test("renders job description", async () => {
    renderComponent();
    await waitFor(() =>
      expect(
        screen.getByText("A great learnership in the ICT sector.")
      ).toBeInTheDocument()
    );
  });

  test("renders provider field", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("TechCorp SA")).toBeInTheDocument()
    );
  });

  test("renders stipend field", async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("R3000/month")).toBeInTheDocument()
    );
  });

  test("renders status field", async () => {
    renderComponent();
    await waitFor(() =>
      // "pending" appears as the job status value
      expect(screen.getAllByText("pending").length).toBeGreaterThan(0)
    );
  });

  test("fetches job using jobId from URL params", async () => {
    renderComponent("job-42");
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/admin/jobs/job-42")
      )
    );
  });
});

describe("JobDetails — navigation", () => {
  test("renders Back button", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("ICT Learnership"));
    expect(screen.getByText("← Back")).toBeInTheDocument();
  });

  test("Back button navigates to /admin", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("← Back"));
    fireEvent.click(screen.getByText("← Back"));
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });
});

describe("JobDetails — pending job actions", () => {
  test("shows Approve and Reject buttons for pending job", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Approve"));
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  test("does NOT show Undo button for pending job", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Approve"));
    expect(screen.queryByText("Undo")).not.toBeInTheDocument();
  });

  test("Approve updates job status to approved", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Approve"));
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/admin/jobs/job-1/status"),
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ status: "approved" }),
        })
      )
    );
  });

  test("Approve shows success toast", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Approve"));
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() =>
      expect(
        screen.getByText("Job approved successfully")
      ).toBeInTheDocument()
    );
  });

  test("Reject updates job status to rejected", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Reject"));
    fireEvent.click(screen.getByText("Reject"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/admin/jobs/job-1/status"),
        expect.objectContaining({
          body: JSON.stringify({ status: "rejected" }),
        })
      )
    );
  });

  test("Reject shows rejected toast", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Reject"));
    fireEvent.click(screen.getByText("Reject"));
    await waitFor(() =>
      expect(
        screen.getByText("Job rejected successfully")
      ).toBeInTheDocument()
    );
  });

  test("navigates to /admin after toast timeout", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Approve"));
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() => screen.getByText("Job approved successfully"));
    act(() => jest.advanceTimersByTime(2500));
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });
});

describe("JobDetails — approved job actions", () => {
  beforeEach(() => setupFetch(APPROVED_JOB));

  test("shows Undo button for approved job", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Undo"));
    expect(screen.getByText("Undo")).toBeInTheDocument();
  });

  test("does NOT show Approve or Reject for approved job", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Undo"));
    expect(screen.queryByText("Approve")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject")).not.toBeInTheDocument();
  });

  test("Undo resets status to pending", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Undo"));
    fireEvent.click(screen.getByText("Undo"));
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/status"),
        expect.objectContaining({
          body: JSON.stringify({ status: "pending" }),
        })
      )
    );
  });

  test("Undo shows 'moved back to pending' toast", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Undo"));
    fireEvent.click(screen.getByText("Undo"));
    await waitFor(() =>
      expect(
        screen.getByText("Job moved back to pending")
      ).toBeInTheDocument()
    );
  });
});

describe("JobDetails — rejected job actions", () => {
  beforeEach(() => setupFetch(REJECTED_JOB));

  test("shows Undo button for rejected job", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Undo"));
    expect(screen.getByText("Undo")).toBeInTheDocument();
  });
});

describe("JobDetails — error handling", () => {
  test("shows 'Something went wrong' toast on failed status update", async () => {
    setupFetch(PENDING_JOB, false); // updateOk = false
    renderComponent();
    await waitFor(() => screen.getByText("Approve"));
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() =>
      expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    );
  });

  test("handles fetch error on status update gracefully", async () => {
    // Job fetch works, status update throws
    let callCount = 0;
    global.fetch = jest.fn(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ json: () => Promise.resolve(PENDING_JOB) });
      }
      return Promise.reject(new Error("Network failure"));
    });
    renderComponent();
    await waitFor(() => screen.getByText("Approve"));
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() =>
      expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    );
  });

  test("toast disappears after 2500ms", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Approve"));
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() => screen.getByText("Job approved successfully"));
    act(() => jest.advanceTimersByTime(2500));
    await waitFor(() =>
      expect(
        screen.queryByText("Job approved successfully")
      ).not.toBeInTheDocument()
    );
  });
});

describe("JobDetails — layout & styles", () => {
  test("renders card container", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("ICT Learnership"));
    expect(document.querySelector("article")).toBeInTheDocument();
  });

  test("renders all info section labels", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Description"));
    expect(screen.getByText("Provider")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Stipend")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });
});
