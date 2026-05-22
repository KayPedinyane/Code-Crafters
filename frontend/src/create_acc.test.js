/**
 * Comprehensive Tests for create_acc.js (Sign Up)
 * Target: 80%+ coverage (currently 22.91%)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

const mockCreateUser = jest.fn();
const mockSendEmailVerification = jest.fn();
const mockDelete = jest.fn();
const mockGetIdToken = jest.fn();

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: (...args) => mockCreateUser(...args),
  sendEmailVerification: (...args) => mockSendEmailVerification(...args)
}));

jest.mock('./firebase', () => ({
  auth: {}
}));

jest.mock('./create_acc.css', () => ({}), { virtual: true });

const Create = require('./create_acc').default;

global.fetch = jest.fn();
global.alert = jest.fn();

describe('Create Account Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetIdToken.mockResolvedValue('test-token');
    mockDelete.mockResolvedValue();
    mockSendEmailVerification.mockResolvedValue();
    
    mockCreateUser.mockResolvedValue({
      user: {
        getIdToken: mockGetIdToken,
        delete: mockDelete
      }
    });
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({})
    });
  });

  // ─── Rendering ────────────────────────────────────────────────────────────

  test('renders create account page', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
  });

  test('displays brand logo', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument();
  });

  test('displays email input', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
  });

  test('displays password inputs', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText(/Min. 6 characters/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Repeat your password/i)).toBeInTheDocument();
  });

  test('displays role toggle buttons', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/🎓 Applicant/i)).toBeInTheDocument();
    expect(screen.getByText(/🏢 Provider/i)).toBeInTheDocument();
  });

  test('displays submit button', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Create account →/i)).toBeInTheDocument();
  });

  // ─── Form Input ───────────────────────────────────────────────────────────

  test('updates email input', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(input.value).toBe('test@example.com');
  });

  test('updates password input', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/Min. 6 characters/i);
    fireEvent.change(input, { target: { value: 'password123' } });
    
    expect(input.value).toBe('password123');
  });

  test('updates confirm password input', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/Repeat your password/i);
    fireEvent.change(input, { target: { value: 'password123' } });
    
    expect(input.value).toBe('password123');
  });

  // ─── Role Selection ───────────────────────────────────────────────────────

  test('defaults to user role', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const applicantBtn = screen.getByText(/🎓 Applicant/i);
    expect(applicantBtn).toHaveClass('role-toggle-active');
  });

  test('switches to provider role', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const providerBtn = screen.getByText(/🏢 Provider/i);
    fireEvent.click(providerBtn);
    
    expect(providerBtn).toHaveClass('role-toggle-active');
  });

  test('switches back to user role', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const providerBtn = screen.getByText(/🏢 Provider/i);
    const applicantBtn = screen.getByText(/🎓 Applicant/i);
    
    fireEvent.click(providerBtn);
    fireEvent.click(applicantBtn);
    
    expect(applicantBtn).toHaveClass('role-toggle-active');
  });

  // ─── Password Visibility Toggle ───────────────────────────────────────────

  test('toggles password visibility', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const toggleButtons = screen.getAllByText('👁');
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(screen.getByText('🙈'));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('toggles confirm password visibility', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const toggleButtons = screen.getAllByText('👁');
    
    expect(confirmInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButtons[1]);
    expect(confirmInput).toHaveAttribute('type', 'text');
  });

  // ─── Validation ───────────────────────────────────────────────────────────

  test('shows error when passwords do not match', async () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
    
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  test('shows error when password is too short', async () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.change(confirmInput, { target: { value: '12345' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
    });
    
    expect(mockCreateUser).not.toHaveBeenCalled();
  });

  // ─── Successful Submission ────────────────────────────────────────────────

  test('creates account successfully', async () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({}, 'test@example.com', 'password123');
    });
  });

  test('sends data to backend API', async () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/create'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }),
          body: JSON.stringify({ role: 'user' })
        })
      );
    });
  });

  test('sends provider role to backend', async () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const providerBtn = screen.getByText(/🏢 Provider/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(providerBtn);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify({ role: 'provider' })
        })
      );
    });
  });

  test('sends email verification', async () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSendEmailVerification).toHaveBeenCalled();
    });
  });

  test('shows success alert', async () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Account created')
      );
    });
  });

  test('navigates to home after success', async () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // ─── Loading State ────────────────────────────────────────────────────────

  test('shows loading state during submission', async () => {
    mockCreateUser.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        user: { getIdToken: mockGetIdToken, delete: mockDelete }
      }), 100))
    );
    
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/Creating account/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  // ─── Error Handling ───────────────────────────────────────────────────────

  test('displays Firebase error', async () => {
    mockCreateUser.mockRejectedValue(
      new Error('Firebase: Error (auth/email-already-in-use).')
    );
    
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/auth\/email-already-in-use/i)).toBeInTheDocument();
    });
  });

  test('deletes Firebase user on backend failure', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Database error' })
    });
    
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  test('shows backend error message', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Custom error message' })
    });
    
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Min. 6 characters/i);
    const confirmInput = screen.getByPlaceholderText(/Repeat your password/i);
    const submitButton = screen.getByText(/Create account →/i);
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Custom error message/i)).toBeInTheDocument();
    });
  });

  // ─── Navigation ───────────────────────────────────────────────────────────

  test('navigates to login on sign in link click', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    const signInLink = screen.getByText(/Sign in →/i);
    fireEvent.click(signInLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // ─── UI Elements ──────────────────────────────────────────────────────────

  test('displays brand information', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Join the platform/i)).toBeInTheDocument();
    expect(screen.getByText(/Start your/i)).toBeInTheDocument();
  });

  test('displays steps cards', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Create account/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Apply & get placed/i)).toBeInTheDocument();
  });

  test('displays footer', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/© 2026 SkillsBridgeSA/i)).toBeInTheDocument();
  });

  test('displays terms and privacy policy text', () => {
    render(
      <BrowserRouter>
        <Create />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument();
  });
});