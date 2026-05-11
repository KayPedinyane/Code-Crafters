import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Forgot from './forgot';

jest.mock('./firebase', () => ({
  auth: {}
}));

jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

const renderForgot = () => render(
  <MemoryRouter>
    <Forgot />
  </MemoryRouter>
);

describe('Forgot Password component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders forgot password form', () => {
    renderForgot();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByText('Send Reset Email')).toBeInTheDocument();
  });

  test('renders back to login link', () => {
    renderForgot();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('updates email input', () => {
    renderForgot();
    const emailInput = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  test('shows success message after reset email sent', async () => {
    const { sendPasswordResetEmail } = require('firebase/auth');
    sendPasswordResetEmail.mockResolvedValue();

    renderForgot();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.click(screen.getByText('Send Reset Email'));

    await waitFor(() => {
      expect(screen.getByText('Password reset email sent! Check your inbox.')).toBeInTheDocument();
    });
  });

  test('shows error when reset fails', async () => {
    const { sendPasswordResetEmail } = require('firebase/auth');
    sendPasswordResetEmail.mockRejectedValue(new Error('User not found'));

    renderForgot();
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'unknown@example.com' }
    });
    fireEvent.click(screen.getByText('Send Reset Email'));

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });
});