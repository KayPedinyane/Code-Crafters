import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './login';

// Mock firebase
jest.mock('./firebase', () => ({
  auth: { onAuthStateChanged: jest.fn((cb) => { cb(null); return jest.fn(); }) },
  googleProvider: {}
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

const renderLogin = () => render(
  <MemoryRouter>
    <Login />
  </MemoryRouter>
);

describe('Login component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('renders Google login button', () => {
    renderLogin();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  test('renders create account link', () => {
    renderLogin();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  test('renders forgot password link', () => {
    renderLogin();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
  });

  test('updates email input value', () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  test('updates password input value', () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  test('shows error when login fails', async () => {
    const { signInWithEmailAndPassword } = require('firebase/auth');
    signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('shows error when email not verified', async () => {
    const { signInWithEmailAndPassword } = require('firebase/auth');
    signInWithEmailAndPassword.mockResolvedValue({
      user: { emailVerified: false, getIdToken: jest.fn() }
    });

    renderLogin();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Please verify your email before logging in.')).toBeInTheDocument();
    });
  });
});