import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './login';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

// --------------------
// MOCKS (hoisted automatically by Jest/Babel)
// --------------------
jest.mock('./firebase', () => ({
  auth: {},
  googleProvider: {},
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null); // simulate logged-out user by default
    return jest.fn(); // return unsubscribe function
  }),
}));

global.fetch = jest.fn();

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

describe('Login component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-apply default onAuthStateChanged behavior after clearAllMocks
    const { onAuthStateChanged } = require('firebase/auth');
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return jest.fn();
    });
  });

  test('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
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
    const emailInput = screen.getByPlaceholderText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  test('updates password input value', () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText(/password/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  test('shows error when login fails', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
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

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please verify your email before logging in/i)
      ).toBeInTheDocument();
    });
  });

  test('successful login calls postLoginFlow', async () => {
    const mockGetIdToken = jest.fn().mockResolvedValue('fake-token');
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: '123',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: mockGetIdToken,
      },
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', role: 'user' }),
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('shows error when backend login returns error', async () => {
    const mockGetIdToken = jest.fn().mockResolvedValue('fake-token');
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: '123',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: mockGetIdToken,
      },
    });

    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'User not found' }),
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    });
  });

  test('Google login success calls handleGoogleUser', async () => {
    const mockGetIdToken = jest.fn().mockResolvedValue('fake-google-token');
    signInWithPopup.mockResolvedValueOnce({
      user: {
        uid: 'google-123',
        email: 'test@gmail.com',
        emailVerified: true,
        getIdToken: mockGetIdToken,
      },
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: '2', role: 'user' }),
    });

    // second fetch inside postLoginFlow
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '2', role: 'user' }),
    });

    renderLogin();
    fireEvent.click(screen.getByText(/continue with google/i));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });
  });
});