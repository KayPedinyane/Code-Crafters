import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Create from './create_acc';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock Firebase
const mockDelete = jest.fn();
const mockGetIdToken = jest.fn();
const mockCreateUser = jest.fn();
const mockSendEmailVerification = jest.fn();

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: (...args) => mockCreateUser(...args),
  sendEmailVerification: (...args) => mockSendEmailVerification(...args)
}));

jest.mock('./firebase', () => ({
  auth: {}
}));

jest.mock('./create_acc.css', () => ({}));

global.fetch = jest.fn();
global.alert = jest.fn();

const renderComponent = () => render(
  <BrowserRouter>
    <Create />
  </BrowserRouter>
);

describe('Create Account Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetIdToken.mockResolvedValue('test-token');
    mockDelete.mockResolvedValue(undefined);
    mockSendEmailVerification.mockResolvedValue(undefined);
    
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

  // ═══════════════════════════════════════════════════════════════════════
  // RENDERING TESTS
  // ═══════════════════════════════════════════════════════════════════════

  test('renders create account page', () => {
    renderComponent();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });
  test('renders form inputs', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeInTheDocument();
  });

  test('renders role dropdown with default value', () => {
    renderComponent();
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('user');
  });

  test('renders register button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('renders login link', () => {
    renderComponent();
    expect(screen.getByText(/Already have an account/)).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('renders brand footer', () => {
    renderComponent();
    expect(screen.getByText(/© 2026 SkillsBridgeSA/)).toBeInTheDocument();
  });

  // ═══════════════════════════════════════════════════════════════════════
  // FORM INPUT UPDATES
  // ═══════════════════════════════════════════════════════════════════════

  test('updates email input', () => {
    renderComponent();
    const input = screen.getByPlaceholderText('you@example.com');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(input.value).toBe('test@example.com');
  });

  test('updates password input', () => {
    renderComponent();
    const input = screen.getByPlaceholderText('Enter your password');
    fireEvent.change(input, { target: { value: 'Password1!' } });
    expect(input.value).toBe('Password1!');
  });

  test('updates confirm password input', () => {
    renderComponent();
    const input = screen.getByPlaceholderText('Re-enter your password');
    fireEvent.change(input, { target: { value: 'Password1!' } });
    expect(input.value).toBe('Password1!');
  });

  test('switches to provider role', () => {
    renderComponent();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'provider' } });
    expect(select.value).toBe('provider');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PASSWORD REQUIREMENTS
  // ═══════════════════════════════════════════════════════════════════════

  test('shows password requirements on focus', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    fireEvent.focus(passwordInput);
    
    expect(screen.getByText(/At least 8 characters/)).toBeInTheDocument();
    expect(screen.getByText(/One uppercase letter/)).toBeInTheDocument();
    expect(screen.getByText(/One number/)).toBeInTheDocument();
    expect(screen.getByText(/One symbol/)).toBeInTheDocument();
  });

  test('hides requirements on blur when not submitted', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    fireEvent.focus(passwordInput);
    fireEvent.blur(passwordInput);
    
    expect(screen.queryByText(/At least 8 characters/)).not.toBeInTheDocument();
  });

  test('shows green checkmark for met length requirement', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    
    expect(screen.getByText('✓ At least 8 characters')).toBeInTheDocument();
  });

  test('shows red X for unmet length requirement', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: '1234' } });
    
    expect(screen.getByText('✗ At least 8 characters')).toBeInTheDocument();
  });

  test('validates uppercase requirement', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    fireEvent.focus(passwordInput);
    
    fireEvent.change(passwordInput, { target: { value: 'password123!' } });
    expect(screen.getByText('✗ One uppercase letter (A–Z)')).toBeInTheDocument();
    
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    expect(screen.getByText('✓ One uppercase letter (A–Z)')).toBeInTheDocument();
  });

  test('validates number requirement', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    fireEvent.focus(passwordInput);
    
    fireEvent.change(passwordInput, { target: { value: 'Password!' } });
    expect(screen.getByText('✗ One number (0–9)')).toBeInTheDocument();
    
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
    expect(screen.getByText('✓ One number (0–9)')).toBeInTheDocument();
  });

  test('validates symbol requirement', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    fireEvent.focus(passwordInput);
    
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    expect(screen.getByText('✗ One symbol (!@#$%^&*)')).toBeInTheDocument();
    
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    expect(screen.getByText('✓ One symbol (!@#$%^&*)')).toBeInTheDocument();
  });

  test('shows all checkmarks for fully valid password', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    
    const checkmarks = screen.getAllByText(/✓/);
    expect(checkmarks.length).toBe(4);
  });

  test('accepts all allowed symbols', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const symbols = ['!', '@', '#', '$', '%', '^', '&', '*'];
    
    symbols.forEach(symbol => {
      fireEvent.focus(passwordInput);
      fireEvent.change(passwordInput, { target: { value: `Password1${symbol}` } });
      expect(screen.getByText(/✓ One symbol/)).toBeInTheDocument();
      fireEvent.blur(passwordInput);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // FORM VALIDATION
  // ═══════════════════════════════════════════════════════════════════════

  test('prevents submission with weak password', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'weak' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'weak' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(mockCreateUser).not.toHaveBeenCalled();
    });
  });

  test('shows requirements after submit attempt with weak password', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'weak' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'weak' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    expect(screen.getByText(/At least 8 characters/)).toBeInTheDocument();
  });

  test('shows error when passwords do not match', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Different123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  test('clears error on new submission', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Wrong!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
    
    // Fix and resubmit
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.queryByText('Passwords do not match.')).not.toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SUCCESSFUL SUBMISSION
  // ═══════════════════════════════════════════════════════════════════════

  test('creates account successfully', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({}, 'test@example.com', 'Password123!');
    });
  });

  test('sends user role by default', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/create'),
        expect.objectContaining({
          body: JSON.stringify({ role: 'user' })
        })
      );
    });
  });

  test('sends provider role when selected', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByRole('combobox'), { 
      target: { value: 'provider' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify({ role: 'provider' })
        })
      );
    });
  });

  test('sends authorization token', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/create'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });
  });

  test('sends email verification', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(mockSendEmailVerification).toHaveBeenCalled();
    });
  });

  test('shows success alert', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Account created')
      );
    });
  });

  test('navigates to home after success', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════════════

  test('displays Firebase error', async () => {
    mockCreateUser.mockRejectedValueOnce({
      message: 'Firebase: Error (auth/email-already-in-use).'
    });
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/auth\/email-already-in-use/)).toBeInTheDocument();
    });
  });

  test('deletes Firebase user on backend failure', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Database error' })
    });
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  test('shows backend error message', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Custom backend error' })
    });
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Custom backend error')).toBeInTheDocument();
    });
  });

  test('does not delete user on email-already-in-use error', async () => {
    const error = { message: 'Email in use', code: 'auth/email-already-in-use' };
    mockCreateUser.mockRejectedValueOnce(error);
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Email in use/)).toBeInTheDocument();
    });
    
    expect(mockDelete).not.toHaveBeenCalled();
  });

  test('handles generic backend error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to save user to database.')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════

  test('navigates to login on link click', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Login'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // EDGE CASES & COVERAGE
  // ═══════════════════════════════════════════════════════════════════════

  test('password exactly 8 characters passes', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: 'Pass123!' } });
    
    expect(screen.getByText('✓ At least 8 characters')).toBeInTheDocument();
  });

  test('form has required attributes', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText('you@example.com')).toBeRequired();
    expect(screen.getByPlaceholderText('Enter your password')).toBeRequired();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeRequired();
    expect(screen.getByRole('combobox')).toBeRequired();
  });

  test('role options are present', () => {
    renderComponent();
    
    expect(screen.getByRole('option', { name: 'Applicant' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Provider' })).toBeInTheDocument();
  });
});