/**
 * Comprehensive Tests for Forgot.js (Password Reset)
 * Target: 80%+ coverage (currently 36.84%)
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

const mockSendPasswordResetEmail = jest.fn();

jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: (...args) => mockSendPasswordResetEmail(...args)
}));

jest.mock('./firebase', () => ({
  auth: {}
}));

jest.mock('./forgot.css', () => ({}), { virtual: true });

const Forgot = require('./forgot').default;

describe('Forgot Password Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSendPasswordResetEmail.mockResolvedValue();
  });

  // ─── Rendering ────────────────────────────────────────────────────────────

  test('renders forgot password page', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Forgot your password/i)).toBeInTheDocument();
  });

  test('displays brand logo', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument();
  });

  test('displays form title', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Password recovery/i)).toBeInTheDocument();
  });

  test('displays email input', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
  });

  test('displays submit button', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Send reset link/i)).toBeInTheDocument();
  });

  // ─── Form Input ───────────────────────────────────────────────────────────

  test('updates email input', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(input.value).toBe('test@example.com');
  });

  test('email input is required', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    expect(input).toBeRequired();
  });

  test('email input has correct type', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    expect(input).toHaveAttribute('type', 'email');
  });

  // ─── Form Submission ──────────────────────────────────────────────────────

  test('submits form with email', async () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        {},
        'test@example.com'
      );
    });
  });

  test('shows loading state during submission', async () => {
    mockSendPasswordResetEmail.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);
    
    expect(screen.getByText(/Sending/i)).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test('disables button during submission', async () => {
    mockSendPasswordResetEmail.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
  });

  // ─── Success State ────────────────────────────────────────────────────────

  test('shows success message after reset', async () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Check your inbox/i)).toBeInTheDocument();
    });
  });

  test('displays submitted email in success message', async () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'user@test.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('user@test.com')).toBeInTheDocument();
    });
  });

  test('hides form after successful submission', async () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/you@example.com/i)).not.toBeInTheDocument();
    });
  });

  test('shows try different email button in success state', async () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Try a different email/i)).toBeInTheDocument();
    });
  });

  test('resets form on try different email click', async () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    let button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Try a different email/i)).toBeInTheDocument();
    });
    
    const tryAgainButton = screen.getByText(/Try a different email/i);
    fireEvent.click(tryAgainButton);
    
    await waitFor(() => {
      const newInput = screen.getByPlaceholderText(/you@example.com/i);
      expect(newInput.value).toBe('');
    });
  });

  // ─── Error Handling ───────────────────────────────────────────────────────

  test('displays error message on failure', async () => {
    mockSendPasswordResetEmail.mockRejectedValue(
      new Error('Firebase: Error (auth/user-not-found).')
    );
    
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'nonexistent@example.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/auth\/user-not-found/i)).toBeInTheDocument();
    });
  });

  test('clears previous error on new submission', async () => {
    mockSendPasswordResetEmail
      .mockRejectedValueOnce(new Error('Error message'))
      .mockResolvedValueOnce();
    
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    // First submission - error
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Error message/i)).toBeInTheDocument();
    });
    
    // Second submission - success
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.queryByText(/Error message/i)).not.toBeInTheDocument();
    });
  });

  test('re-enables button after error', async () => {
    mockSendPasswordResetEmail.mockRejectedValue(new Error('Error'));
    
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  // ─── Navigation ───────────────────────────────────────────────────────────

  test('navigates to login on back to sign in click', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const backLink = screen.getByText(/Back to sign in/i);
    fireEvent.click(backLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // ─── UI Elements ──────────────────────────────────────────────────────────

  test('displays steps on brand panel', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByText(/Check your inbox/i)).toBeInTheDocument();
    expect(screen.getByText(/Set new password/i)).toBeInTheDocument();
  });

  test('displays decorative cards', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Secure reset/i)).toBeInTheDocument();
    expect(screen.getByText(/Instant delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Your data is safe/i)).toBeInTheDocument();
  });

  test('displays footer', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/© 2026 SkillsBridgeSA/i)).toBeInTheDocument();
  });

  test('displays success icon in success state', async () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Email sent/i)).toBeInTheDocument();
    });
  });

  test('shows spam folder tip in success state', async () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/you@example.com/i);
    const button = screen.getByText(/Send reset link/i);
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Check your spam folder/i)).toBeInTheDocument();
    });
  });

  // ─── Form Validation ──────────────────────────────────────────────────────

  test('prevents submission with empty email', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const form = screen.getByPlaceholderText(/you@example.com/i).closest('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    
    form.dispatchEvent(submitEvent);
    
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });

  test('form has submit handler', () => {
    render(
      <BrowserRouter>
        <Forgot />
      </BrowserRouter>
    );
    
    const form = screen.getByPlaceholderText(/you@example.com/i).closest('form');
    expect(form).toBeInTheDocument();
  });
});