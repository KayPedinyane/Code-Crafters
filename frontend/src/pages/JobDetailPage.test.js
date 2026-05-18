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
  Routes,
  Route,
} from "react-router-dom";

import JobDetailPage from "./JobDetailPage";

// ─────────────────────────────────────────────────────────────
// Firebase Auth Mock
// ─────────────────────────────────────────────────────────────

const mockOnAuthStateChanged =
  jest.fn();

const mockUnsubscribe = jest.fn();

jest.mock("../firebase", () => ({
  auth: {},
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) =>
    mockOnAuthStateChanged(...args),
}));

// ─────────────────────────────────────────────────────────────
// Navigation Mock
// ─────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),

  useNavigate: () => mockNavigate,
}));

// ─────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────

const MOCK_USER = {
  email: "student@test.com",
  displayName: "Student User",
};

const COMPLETE_PROFILE = {
  full_name: "Student User",
  phone: "0123456789",
  cv_url: "cv.pdf",
  skills: "React, Node",
};

const INCOMPLETE_PROFILE = {
  full_name: "",
  phone: "",
  cv_url: "",
};

const ACTIVE_JOB = {
  id: 1,
  title: "ICT Learnership",
  description:
    "Excellent ICT opportunity",

  sector: "ICT",
  location: "Johannesburg",
  stipend: "R3000",
  duration: "12 months",

  closing_date: "2099-12-31",

  provider_name: "TechCorp",
};

const EXPIRED_JOB = {
  ...ACTIVE_JOB,

  id: 2,

  title: "Expired Internship",

  closing_date: "2020-01-01",
};

// ─────────────────────────────────────────────────────────────
// Fetch Mock
// ─────────────────────────────────────────────────────────────

function setupFetch({
  profile = COMPLETE_PROFILE,
  job = ACTIVE_JOB,
  applyStatus = 200,
  applyError = null,
} = {}) {
  global.fetch = jest.fn(
    (url, options) => {
      // Profile
      if (
        url.includes("/profile/")
      ) {
        return Promise.resolve({
          ok: true,

          json: () =>
            Promise.resolve(profile),
        });
      }

      // Job Details
      if (
        url.includes(
          "/opportunities/"
        ) &&
        !options
      ) {
        return Promise.resolve({
          ok: true,

          json: () =>
            Promise.resolve(job),
        });
      }

      // Apply
      if (
        url.includes(
          "/applications"
        ) &&
        options?.method === "POST"
      ) {
        if (applyStatus === 200) {
          return Promise.resolve({
            ok: true,

            status: 200,

            json: () =>
              Promise.resolve({
                success: true,
              }),
          });
        }

        return Promise.resolve({
          ok: false,

          status: applyStatus,

          json: () =>
            Promise.resolve({
              error:
                applyError ||
                "Already applied",
            }),
        });
      }

      return Promise.resolve({
        ok: true,

        json: () =>
          Promise.resolve({}),
      });
    }
  );
}

// ─────────────────────────────────────────────────────────────
// Render Helper
// ─────────────────────────────────────────────────────────────

function renderComponent(
  jobId = "1"
) {
  return render(
    <MemoryRouter
      initialEntries={[
        `/jobs/${jobId}`,
      ]}

      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route
          path="/jobs/:id"
          element={
            <JobDetailPage />
          }
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

  setupFetch();

  mockOnAuthStateChanged.mockImplementation(
    (_auth, callback) =>
      mockUnsubscribe
  );
});

// ─────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────

describe(
  "JobDetailPage",
  () => {
    test(
      "redirects unauthenticated users",
      async () => {
        renderComponent();

        triggerAuth(null);

        await waitFor(() => {
          expect(
            mockNavigate
          ).toHaveBeenCalledWith(
            "/"
          );
        });
      }
    );

    test(
      "renders job details",
      async () => {
        renderComponent();

        triggerAuth(MOCK_USER);

        await waitFor(() => {
          expect(
            screen.getByText(
              /ICT Learnership/i
            )
          ).toBeInTheDocument();
        });

        expect(
          screen.getByText(
            /Excellent ICT opportunity/i
          )
        ).toBeInTheDocument();
      }
    );

    test(
      "renders provider name",
      async () => {
        renderComponent();

        triggerAuth(MOCK_USER);

        await waitFor(() => {
          expect(
            screen.getByText(
              /TechCorp/i
            )
          ).toBeInTheDocument();
        });
      }
    );

    test(
      "shows loading state",
      async () => {
        global.fetch = jest.fn(
          () =>
            new Promise(() => {})
        );

        renderComponent();

        triggerAuth(MOCK_USER);

        expect(
          screen.getByText(
            /loading/i
          )
        ).toBeInTheDocument();
      }
    );

    test(
      "handles fetch failure",
      async () => {
        global.fetch = jest.fn(
          () =>
            Promise.reject(
              new Error(
                "Network Error"
              )
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
      }
    );

    test(
      "submits application successfully",
      async () => {
        renderComponent();

        triggerAuth(MOCK_USER);

        await waitFor(() => {
          expect(
            screen.getByRole(
              "button",
              {
                name: /apply/i,
              }
            )
          ).toBeInTheDocument();
        });

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: /apply/i,
            }
          )
        );

        await waitFor(() => {
          expect(global.fetch)
            .toHaveBeenCalledWith(
              expect.stringContaining(
                "/applications"
              ),

              expect.objectContaining(
                {
                  method: "POST",
                }
              )
            );
        });
      }
    );

    test(
      "shows duplicate application message",
      async () => {
        setupFetch({
          applyStatus: 409,

          applyError:
            "Already applied",
        });

        renderComponent();

        triggerAuth(MOCK_USER);

        await waitFor(() => {
          expect(
            screen.getByRole(
              "button",
              {
                name: /apply/i,
              }
            )
          ).toBeInTheDocument();
        });

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: /apply/i,
            }
          )
        );

        await waitFor(() => {
          expect(
            screen.getByText(
              /already applied/i
            )
          ).toBeInTheDocument();
        });
      }
    );

    test(
      "blocks application with incomplete profile",
      async () => {
        setupFetch({
          profile:
            INCOMPLETE_PROFILE,
        });

        renderComponent();

        triggerAuth(MOCK_USER);

        await waitFor(() => {
          expect(
            screen.getByRole(
              "button",
              {
                name: /apply/i,
              }
            )
          ).toBeInTheDocument();
        });

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: /apply/i,
            }
          )
        );

        await waitFor(() => {
          expect(
            screen.getByText(
              /complete your profile/i
            )
          ).toBeInTheDocument();
        });
      }
    );

    test(
      "disables apply button for expired jobs",
      async () => {
        setupFetch({
          job: EXPIRED_JOB,
        });

        renderComponent("2");

        triggerAuth(MOCK_USER);

        await waitFor(() => {
          expect(
            screen.getByText(
              /expired/i
            )
          ).toBeInTheDocument();
        });
      }
    );

    test(
      "renders sector and location",
      async () => {
        renderComponent();

        triggerAuth(MOCK_USER);

        await waitFor(() => {
          expect(
            screen.getByText(
              /ICT/i
            )
          ).toBeInTheDocument();
        });

        expect(
          screen.getByText(
            /Johannesburg/i
          )
        ).toBeInTheDocument();
      }
    );

    test(
      "renders stipend and duration",
      async () => {
        renderComponent();

        triggerAuth(MOCK_USER);

        await waitFor(() => {
          expect(
            screen.getByText(
              /R3000/i
            )
          ).toBeInTheDocument();
        });

        expect(
          screen.getByText(
            /12 months/i
          )
        ).toBeInTheDocument();
      }
    );

    test(
      "navigates back",
      async () => {
        renderComponent();

        triggerAuth(MOCK_USER);

        await waitFor(() => {
          expect(
            screen.getByRole(
              "button",
              {
                name: /back/i,
              }
            )
          ).toBeInTheDocument();
        });

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name: /back/i,
            }
          )
        );

        expect(
          mockNavigate
        ).toHaveBeenCalled();
      }
    );

    test(
      "unsubscribes auth listener on unmount",
      () => {
        const { unmount } =
          renderComponent();

        unmount();

        expect(
          mockUnsubscribe
        ).toHaveBeenCalled();
      }
    );
  }
);