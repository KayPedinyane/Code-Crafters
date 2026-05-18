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

// ─────────────────────────────────────────────────────────────
// Navigation Mock
// ─────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),

  useNavigate: () => mockNavigate,
}));

// ─────────────────────────────────────────────────────────────
// Firebase Mock
// ─────────────────────────────────────────────────────────────

jest.mock("../firebase", () => ({
  auth: {
    signOut: jest.fn(() =>
      Promise.resolve()
    ),
  },
}));

process.env.REACT_APP_API_URL =
  "https://api.test.com";

// ─────────────────────────────────────────────────────────────
// Geolocation Mock
// ─────────────────────────────────────────────────────────────

const mockGetCurrentPosition =
  jest.fn();

global.navigator.geolocation = {
  getCurrentPosition:
    mockGetCurrentPosition,
};

// ─────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: "prov-1",
  name: "Provider One",
  email: "provider@example.com",
};

const MOCK_CITIES = [
  "Cape Town",
  "Johannesburg",
];

const MOCK_PROVIDERS_ACCEPTED = [
  {
    email: "provider@example.com",
    status: "accepted",
  },
];

const MOCK_PROVIDERS_PENDING = [
  {
    email: "provider@example.com",
    status: "pending",
  },
];

const MOCK_PROVIDERS_OTHER = [
  {
    email: "other@example.com",
    status: "accepted",
  },
];

// ─────────────────────────────────────────────────────────────
// Fetch Mock
// ─────────────────────────────────────────────────────────────

function setupFetch({
  providers =
    MOCK_PROVIDERS_ACCEPTED,
  postSuccess = true,
} = {}) {
  global.fetch = jest.fn(
    (url, options) => {
      if (
        url.includes("countriesnow")
      ) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              data: MOCK_CITIES,
            }),
        });
      }

      if (
        url.includes(
          "/provider-profile"
        )
      ) {
        return Promise.resolve({
          json: () =>
            Promise.resolve(
              providers
            ),
        });
      }

      if (
        url.includes(
          "/opportunities"
        ) &&
        options?.method === "POST"
      ) {
        if (postSuccess) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                id: 1,
              }),
          });
        }

        return Promise.resolve({
          json: () =>
            Promise.resolve({
              error:
                "Duplicate entry",
            }),
        });
      }

      return Promise.resolve({
        json: () =>
          Promise.resolve({}),
      });
    }
  );
}

// ─────────────────────────────────────────────────────────────
// Render Helper
// ─────────────────────────────────────────────────────────────

function renderComponent() {
  localStorage.setItem(
    "user",
    JSON.stringify(MOCK_USER)
  );

  return render(
    <MemoryRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ProviderOpportunityForm />
    </MemoryRouter>
  );
}

// ─────────────────────────────────────────────────────────────
// Wait For Form
// ─────────────────────────────────────────────────────────────

async function waitForForm() {
  await waitFor(() => {
    expect(
      screen.getByLabelText(
        "Title"
      )
    ).toBeInTheDocument();
  });
}

// ─────────────────────────────────────────────────────────────
// Fill Form
// ─────────────────────────────────────────────────────────────

async function fillForm() {
  fireEvent.change(
    screen.getByLabelText("Title"),
    {
      target: {
        value:
          "ICT Learnership",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText(
      "Description"
    ),
    {
      target: {
        value:
          "Great opportunity",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText(
      /Stipend/i
    ),
    {
      target: {
        value: "R3000",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText(
      "Duration"
    ),
    {
      target: {
        value: "12 months",
      },
    }
  );

  fireEvent.change(
    screen.getByLabelText(
      "Requirements"
    ),
    {
      target: {
        value:
          "Matric required",
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  localStorage.clear();

  setupFetch();

  jest.useFakeTimers();
});

afterEach(() => {
  jest.runAllTimers();

  jest.useRealTimers();
});

// ─────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────

describe(
  "ProviderOpportunityForm",
  () => {
    test(
      "renders form",
      async () => {
        renderComponent();

        await waitForForm();

        expect(
          screen.getByLabelText(
            "Title"
          )
        ).toBeInTheDocument();
      }
    );

    test(
      "updates duration field",
      async () => {
        renderComponent();

        await waitForForm();

        const input =
          screen.getByLabelText(
            "Duration"
          );

        fireEvent.change(input, {
          target: {
            value:
              "12 months",
          },
        });

        expect(
          input.value
        ).toBe("12 months");
      }
    );

    test(
      "submits form successfully",
      async () => {
        renderComponent();

        await waitForForm();

        await fillForm();

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name:
                /post opportunity/i,
            }
          )
        );

        await waitFor(() => {
          expect(global.fetch)
            .toHaveBeenCalledWith(
              expect.stringContaining(
                "/opportunities"
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
      "handles failed submission",
      async () => {
        setupFetch({
          postSuccess: false,
        });

        renderComponent();

        await waitForForm();

        await fillForm();

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name:
                /post opportunity/i,
            }
          )
        );

        await waitFor(() => {
          expect(
            screen.getByText(
              /duplicate entry/i
            )
          ).toBeInTheDocument();
        });
      }
    );

    test(
      "handles pending providers",
      async () => {
        setupFetch({
          providers:
            MOCK_PROVIDERS_PENDING,
        });

        renderComponent();

        await waitFor(() => {
          expect(
            screen.getByText(
              /pending/i
            )
          ).toBeInTheDocument();
        });
      }
    );

    test(
      "blocks unauthorized providers",
      async () => {
        setupFetch({
          providers:
            MOCK_PROVIDERS_OTHER,
        });

        renderComponent();

        await waitFor(() => {
          expect(
            screen.getByText(
              /not approved/i
            )
          ).toBeInTheDocument();
        });
      }
    );

    test(
      "uses geolocation",
      async () => {
        mockGetCurrentPosition.mockImplementation(
          (success) =>
            success({
              coords: {
                latitude: -26,
                longitude: 28,
              },
            })
        );

        renderComponent();

        await waitFor(() => {
          expect(
            mockGetCurrentPosition
          ).toHaveBeenCalled();
        });
      }
    );

    test(
      "handles geolocation errors",
      async () => {
        mockGetCurrentPosition.mockImplementation(
          (_success, error) =>
            error(
              new Error(
                "Permission denied"
              )
            )
        );

        renderComponent();

        await waitFor(() => {
          expect(
            mockGetCurrentPosition
          ).toHaveBeenCalled();
        });
      }
    );

    test(
      "validates required fields",
      async () => {
        renderComponent();

        await waitForForm();

        fireEvent.click(
          screen.getByRole(
            "button",
            {
              name:
                /post opportunity/i,
            }
          )
        );

        expect(
          screen.getByLabelText(
            "Title"
          )
        ).toBeInvalid();
      }
    );
  }
);