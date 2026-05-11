import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './login';

// --------------------
// Firebase mocks (CLEAN)
// --------------------
jest.mock('./firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn((cb) => {
      cb(null);
      return jest.fn();
    }),
  },
  googleProvider: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb(null);
    return () => {};
  }),
}));

import { signInWithEmailAndPassword } from 'firebase/auth';

// --------------------
// Render helper
// --------------------
const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

// --------------------
// Tests
// --------------------
describe('Login component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    renderLogin();

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    // FIX: disambiguate duplicate "Login"
    expect(
      screen.getByRole('heading', { name: /login/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /login/i })
    ).toBeInTheDocument();
  });

  test('renders Google login button', () => {
    renderLogin();
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
  });

  test('renders create account link', () => {
    renderLogin();
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
  });

  test('renders forgot password link', () => {
    renderLogin();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  test('updates email input value', () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, {
      target: { value: 'test@example.com' },
    });

    expect(emailInput.value).toBe('test@example.com');
  });

  test('updates password input value', () => {
    renderLogin();

    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, {
      target: { value: 'password123' },
    });

    expect(passwordInput.value).toBe('password123');
  });

  test('shows error when login fails', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(
      new Error('Invalid credentials')
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid credentials/i)
      ).toBeInTheDocument();
    });
  });

  test('shows error when email not verified', async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        emailVerified: false,
        getIdToken: jest.fn(),
      },
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please verify your email before logging in/i)
      ).toBeInTheDocument();
    });
  });
});