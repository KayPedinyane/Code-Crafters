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

  test('renders brand content', () => {
    renderComponent();
    expect(screen.getByText('Join the platform')).toBeInTheDocument();
    expect(screen.getByText(/Start your/)).toBeInTheDocument();
    expect(screen.getByText('journey')).toBeInTheDocument();
  });

  test('renders form inputs', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min. 8 characters')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repeat your password')).toBeInTheDocument();
  });

  test('renders role toggle buttons', () => {
    renderComponent();
    expect(screen.getByText('🎓 Applicant')).toBeInTheDocument();
    expect(screen.getByText('🏢 Provider')).toBeInTheDocument();
  });

  test('renders create account button', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();
  });

  test('renders sign in link', () => {
    renderComponent();
    expect(screen.getByText(/Already have an account/)).toBeInTheDocument();
    expect(screen.getByText('Sign in →')).toBeInTheDocument();
  });

  test('renders footer with terms and privacy', () => {
    renderComponent();
    expect(screen.getByText('© 2026 SkillsBridgeSA · Built by Code-Crafters')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  test('renders floating cards', () => {
    renderComponent();
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Create account')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Complete profile')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
    expect(screen.getByText('Apply & get placed')).toBeInTheDocument();
  });

  test('renders password toggle buttons', () => {
    renderComponent();
    const toggleButtons = screen.getAllByRole('button', { name: /👁/ });
    expect(toggleButtons.length).toBeGreaterThan(0);
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
    const input = screen.getByPlaceholderText('Min. 8 characters');
    fireEvent.change(input, { target: { value: 'Password1!' } });
    expect(input.value).toBe('Password1!');
  });

  test('updates confirm password input', () => {
    renderComponent();
    const input = screen.getByPlaceholderText('Repeat your password');
    fireEvent.change(input, { target: { value: 'Password1!' } });
    expect(input.value).toBe('Password1!');
  });

  test('defaults to user role (Applicant button active)', () => {
    renderComponent();
    const applicantBtn = screen.getByText('🎓 Applicant');
    expect(applicantBtn.className).toContain('role-toggle-active');
  });

  test('switches to provider role', () => {
    renderComponent();
    const providerBtn = screen.getByText('🏢 Provider');
    fireEvent.click(providerBtn);
    expect(providerBtn.className).toContain('role-toggle-active');
  });

  test('switches back to user role', () => {
    renderComponent();
    const providerBtn = screen.getByText('🏢 Provider');
    const applicantBtn = screen.getByText('🎓 Applicant');
    
    fireEvent.click(providerBtn);
    expect(providerBtn.className).toContain('role-toggle-active');
    
    fireEvent.click(applicantBtn);
    expect(applicantBtn.className).toContain('role-toggle-active');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PASSWORD VISIBILITY TOGGLE
  // ═══════════════════════════════════════════════════════════════════════

  test('toggles password visibility', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    const toggleButtons = screen.getAllByRole('button', { name: /👁|🙈/ });
    const passwordToggle = toggleButtons[0];
    
    expect(passwordInput.type).toBe('password');
    
    fireEvent.click(passwordToggle);
    expect(passwordInput.type).toBe('text');
    
    fireEvent.click(passwordToggle);
    expect(passwordInput.type).toBe('password');
  });

  test('toggles confirm password visibility', () => {
    renderComponent();
    const confirmInput = screen.getByPlaceholderText('Repeat your password');
    const toggleButtons = screen.getAllByRole('button', { name: /👁|🙈/ });
    const confirmToggle = toggleButtons[1];
    
    expect(confirmInput.type).toBe('password');
    
    fireEvent.click(confirmToggle);
    expect(confirmInput.type).toBe('text');
    
    fireEvent.click(confirmToggle);
    expect(confirmInput.type).toBe('password');
  });

  test('password toggle shows eye emoji when hidden', () => {
    renderComponent();
    expect(screen.getAllByText('👁').length).toBeGreaterThan(0);
  });

  test('password toggle shows hide emoji when visible', () => {
    renderComponent();
    const toggleButtons = screen.getAllByRole('button', { name: /👁/ });
    fireEvent.click(toggleButtons[0]);
    expect(screen.getAllByText('🙈').length).toBeGreaterThan(0);
  });

  // ═══════════════════════════════════════════════════════════════════════
  // PASSWORD REQUIREMENTS
  // ═══════════════════════════════════════════════════════════════════════

  test('shows password requirements on focus', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    
    fireEvent.focus(passwordInput);
    
    expect(screen.getByText(/At least 8 characters/)).toBeInTheDocument();
    expect(screen.getByText(/One uppercase letter/)).toBeInTheDocument();
    expect(screen.getByText(/One number/)).toBeInTheDocument();
    expect(screen.getByText(/One symbol/)).toBeInTheDocument();
  });

  test('hides requirements on blur when not submitted', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    
    fireEvent.focus(passwordInput);
    fireEvent.blur(passwordInput);
    
    expect(screen.queryByText(/At least 8 characters/)).not.toBeInTheDocument();
  });

  test('shows checkmark for met length requirement', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    
    expect(screen.getByText('✓ At least 8 characters')).toBeInTheDocument();
  });

  test('shows X for unmet length requirement', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: '1234' } });
    
    expect(screen.getByText('✗ At least 8 characters')).toBeInTheDocument();
  });

  test('validates uppercase requirement', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    
    fireEvent.focus(passwordInput);
    
    fireEvent.change(passwordInput, { target: { value: 'password123!' } });
    expect(screen.getByText('✗ One uppercase letter (A–Z)')).toBeInTheDocument();
    
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    expect(screen.getByText('✓ One uppercase letter (A–Z)')).toBeInTheDocument();
  });

  test('validates number requirement', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    
    fireEvent.focus(passwordInput);
    
    fireEvent.change(passwordInput, { target: { value: 'Password!' } });
    expect(screen.getByText('✗ One number (0–9)')).toBeInTheDocument();
    
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } });
    expect(screen.getByText('✓ One number (0–9)')).toBeInTheDocument();
  });

  test('validates symbol requirement', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    
    fireEvent.focus(passwordInput);
    
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    expect(screen.getByText('✗ One symbol (!@#$%^&*)')).toBeInTheDocument();
    
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    expect(screen.getByText('✓ One symbol (!@#$%^&*)')).toBeInTheDocument();
  });

  test('shows all checkmarks for fully valid password', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    
    const checkmarks = screen.getAllByText(/✓/);
    expect(checkmarks.length).toBe(4);
  });

  test('accepts all allowed symbols', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    const symbols = ['!', '@', '#', '$', '%', '^', '&', '*'];
    
    symbols.forEach(symbol => {
      fireEvent.focus(passwordInput);
      fireEvent.change(passwordInput, { target: { value: `Password1${symbol}` } });
      expect(screen.getByText(/✓ One symbol/)).toBeInTheDocument();
      fireEvent.blur(passwordInput);
    });
  });

  test('requirements have correct CSS classes when met', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    
    const metRequirement = screen.getByText('✓ At least 8 characters');
    expect(metRequirement.className).toContain('pw-req-met');
  });

  test('requirements have correct CSS classes when unmet', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    
    const unmetRequirement = screen.getByText('✗ At least 8 characters');
    expect(unmetRequirement.className).toContain('pw-req-unmet');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // FORM VALIDATION
  // ═══════════════════════════════════════════════════════════════════════

  test('prevents submission with weak password', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'weak' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'weak' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
    await waitFor(() => {
      expect(mockCreateUser).not.toHaveBeenCalled();
    });
  });

  test('shows requirements after submit attempt with weak password', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'weak' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'weak' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
    expect(screen.getByText(/At least 8 characters/)).toBeInTheDocument();
  });

  test('shows error when passwords do not match', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Different123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('clears error on new submission', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Wrong!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
    await waitFor(() => {
      expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SUBMITTING STATE
  // ═══════════════════════════════════════════════════════════════════════

  test('shows submitting state', async () => {
    mockCreateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
    expect(screen.getByText('Creating account...')).toBeInTheDocument();
  });

  test('disables button while submitting', async () => {
    mockCreateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    const button = screen.getByRole('button', { name: /Create account/i });
    fireEvent.click(button);
    
    expect(button).toBeDisabled();
  });

  test('re-enables button after error', async () => {
    mockCreateUser.mockRejectedValueOnce({ message: 'Test error' });
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    const button = screen.getByRole('button', { name: /Create account/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(button).not.toBeDisabled();
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
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({}, 'test@example.com', 'Password123!');
    });
  });

  test('sends user role by default', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
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
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.click(screen.getByText('🏢 Provider'));
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
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
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
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
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
    await waitFor(() => {
      expect(mockSendEmailVerification).toHaveBeenCalled();
    });
  });

  test('shows success alert', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
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
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
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
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/auth\/email-already-in-use/)).toBeInTheDocument();
    });
  });

  test('error message has warning icon', async () => {
    mockCreateUser.mockRejectedValueOnce({
      message: 'Test error'
    });
    
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText('⚠')).toBeInTheDocument();
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
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
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
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
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
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
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
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { 
      target: { value: 'Password123!' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), { 
      target: { value: 'Password123!' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Failed to save user to database.')).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════

  test('navigates to login on sign in link click', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Sign in →'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  // ═══════════════════════════════════════════════════════════════════════
  // EDGE CASES & COVERAGE
  // ═══════════════════════════════════════════════════════════════════════

  test('password exactly 8 characters passes', () => {
    renderComponent();
    const passwordInput = screen.getByPlaceholderText('Min. 8 characters');
    
    fireEvent.focus(passwordInput);
    fireEvent.change(passwordInput, { target: { value: 'Pass123!' } });
    
    expect(screen.getByText('✓ At least 8 characters')).toBeInTheDocument();
  });

  test('form inputs have required attributes', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText('you@example.com')).toBeRequired();
    expect(screen.getByPlaceholderText('Min. 8 characters')).toBeRequired();
    expect(screen.getByPlaceholderText('Repeat your password')).toBeRequired();
  });

  test('password toggle buttons have tabindex -1', () => {
    renderComponent();
    const toggleButtons = screen.getAllByRole('button', { name: /👁|🙈/ });
    toggleButtons.forEach(button => {
      expect(button).toHaveAttribute('tabindex', '-1');
    });
  });

  test('role toggle buttons are type button', () => {
    renderComponent();
    const applicantBtn = screen.getByText('🎓 Applicant');
    const providerBtn = screen.getByText('🏢 Provider');
    
    expect(applicantBtn).toHaveAttribute('type', 'button');
    expect(providerBtn).toHaveAttribute('type', 'button');
  });
});