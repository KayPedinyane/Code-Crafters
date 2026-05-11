import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Create from './create_acc';

jest.mock('./firebase', () => ({
  auth: {}
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

global.fetch = jest.fn();

const renderCreate = () => render(
  <MemoryRouter>
    <Create />
  </MemoryRouter>
);

describe('Create Account component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders create account form', () => {
    renderCreate();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  test('renders role select dropdown', () => {
    renderCreate();
    expect(screen.getByText('Applicant')).toBeInTheDocument();
    expect(screen.getByText('Provider')).toBeInTheDocument();
  });

  test('renders login link', () => {
    renderCreate();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('updates email input', () => {
    renderCreate();
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  test('shows error when passwords do not match', async () => {
    renderCreate();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('shows error when firebase fails', async () => {
    const { createUserWithEmailAndPassword } = require('firebase/auth');
    createUserWithEmailAndPassword.mockRejectedValue(new Error('Email already in use'));

    renderCreate();
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByText('Register'));

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });

  test('can change role to provider', () => {
    renderCreate();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'provider' } });
    expect(select.value).toBe('provider');
  });
});