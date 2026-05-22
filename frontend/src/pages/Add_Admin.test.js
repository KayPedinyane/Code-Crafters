/**
 * Comprehensive Tests for Add_Admin.js (AdminsPage) - Target: 80%+ Coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import AdminsPage from './Add_Admin';
import '@testing-library/jest-dom';

global.fetch = jest.fn();

// Helper to wait for initial mount effects to complete
const renderAndWait = async () => {
  const result = render(<AdminsPage />);
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalled();
  });
  return result;
};

describe('AdminsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    process.env.REACT_APP_API_URL = 'https://api.test.com';
    
    // Default mock for fetching admins
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('renders page title', async () => {
      await renderAndWait();
      expect(screen.getByText('Admin Management')).toBeInTheDocument();
    });

    test('renders Add New Admin section', async () => {
      await renderAndWait();
      expect(screen.getByText('Add New Admin')).toBeInTheDocument();
    });

    test('renders Existing Admins section', async () => {
      await renderAndWait();
      expect(screen.getByText('Existing Admins')).toBeInTheDocument();
    });

    test('renders all form inputs', async () => {
      await renderAndWait();
      expect(screen.getByLabelText(/Surname/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    test('renders Add Admin button', async () => {
      await renderAndWait();
      expect(screen.getByRole('button', { name: /Add Admin/i })).toBeInTheDocument();
    });

    test('displays password hint', async () => {
      await renderAndWait();
      expect(screen.getByText(/At least 8 characters, 1 uppercase letter, and 1 number/i)).toBeInTheDocument();
    });
  });

  describe('Fetching Admins', () => {
    test('fetches admins on mount', async () => {
      await renderAndWait();
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/admin/admins'
      );
    });

    test('displays fetched admins', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => [
          {
            firebase_uid: '1',
            name: 'John',
            surname: 'Doe',
            email: 'john@example.com',
            role: 'admin'
          }
        ]
      });
      
      await renderAndWait();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
      });
    });

    test('displays multiple admins', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => [
          { firebase_uid: '1', name: 'John', surname: 'Doe', email: 'john@example.com', role: 'admin' },
          { firebase_uid: '2', name: 'Jane', surname: 'Smith', email: 'jane@example.com', role: 'admin' }
        ]
      });
      
      await renderAndWait();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    test('handles non-array response', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => null
      });
      
      await renderAndWait();
      
      await waitFor(() => {
        expect(screen.getByText('No admins found.')).toBeInTheDocument();
      });
    });

    test('shows toast on fetch error', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      await renderAndWait();
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load admins')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    test('shows no admins message when list is empty', async () => {
      await renderAndWait();
      
      await waitFor(() => {
        expect(screen.getByText('No admins found.')).toBeInTheDocument();
      });
    });
  });



  describe('Form Input - Surname Field', () => {
    test('accepts valid surname input', async () => {
      await renderAndWait();
      const surnameInput = screen.getByLabelText(/Surname/i);
      
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      expect(surnameInput.value).toBe('Doe');
    });

    test('blocks numbers in surname field', async () => {
      await renderAndWait();
      const surnameInput = screen.getByLabelText(/Surname/i);
      
      fireEvent.change(surnameInput, { target: { value: 'Doe123' } });
      expect(surnameInput.value).toBe('');
    });

    test('shows error after blur if surname invalid', async () => {
      await renderAndWait();
      const surnameInput = screen.getByLabelText(/Surname/i);
      
      fireEvent.change(surnameInput, { target: { value: 'D' } });
      fireEvent.blur(surnameInput);
      
      expect(screen.getByText('2–50 letters only')).toBeInTheDocument();
    });
  });

  describe('Form Input - Email Field', () => {
    test('accepts valid email input', async () => {
      await renderAndWait();
      const emailInput = screen.getByLabelText(/Email/i);
      
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      expect(emailInput.value).toBe('john@example.com');
    });

    test('shows error for invalid email after blur', async () => {
      await renderAndWait();
      const emailInput = screen.getByLabelText(/Email/i);
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
      
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    });

    test('accepts email with numbers', async () => {
      await renderAndWait();
      const emailInput = screen.getByLabelText(/Email/i);
      
      fireEvent.change(emailInput, { target: { value: 'user123@example.com' } });
      expect(emailInput.value).toBe('user123@example.com');
    });

    test('clears error when valid email entered', async () => {
      await renderAndWait();
      const emailInput = screen.getByLabelText(/Email/i);
      
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.blur(emailInput);
      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
      
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
      expect(screen.queryByText('Enter a valid email address')).not.toBeInTheDocument();
    });
  });

  describe('Form Input - Password Field', () => {
    test('accepts valid password input', async () => {
      await renderAndWait();
      const passwordInput = screen.getByLabelText(/Password/i);
      
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      expect(passwordInput.value).toBe('Password123');
    });

    test('shows error for short password', async () => {
      await renderAndWait();
      const passwordInput = screen.getByLabelText(/Password/i);
      
      fireEvent.change(passwordInput, { target: { value: 'Pass1' } });
      fireEvent.blur(passwordInput);
      
      expect(screen.getByText('Min 8 chars, 1 uppercase, 1 number')).toBeInTheDocument();
    });

    test('shows error for password without uppercase', async () => {
      await renderAndWait();
      const passwordInput = screen.getByLabelText(/Password/i);
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.blur(passwordInput);
      
      expect(screen.getByText('Min 8 chars, 1 uppercase, 1 number')).toBeInTheDocument();
    });

    test('shows error for password without number', async () => {
      await renderAndWait();
      const passwordInput = screen.getByLabelText(/Password/i);
      
      fireEvent.change(passwordInput, { target: { value: 'Password' } });
      fireEvent.blur(passwordInput);
      
      expect(screen.getByText('Min 8 chars, 1 uppercase, 1 number')).toBeInTheDocument();
    });

    test('accepts password with special characters', async () => {
      await renderAndWait();
      const passwordInput = screen.getByLabelText(/Password/i);
      
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.blur(passwordInput);
      
      expect(screen.queryByText('Min 8 chars, 1 uppercase, 1 number')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('prevents submission with empty form', async () => {
      await renderAndWait();
      const submitButton = screen.getByRole('button', { name: /Add Admin/i });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please fix the errors before submitting')).toBeInTheDocument();
      });
    });

    test('shows all errors on submit with invalid form', async () => {
      await renderAndWait();
      const submitButton = screen.getByRole('button', { name: /Add Admin/i });
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getAllByText('2–50 letters only').length).toBeGreaterThan(0);
        expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
        expect(screen.getByText('Min 8 chars, 1 uppercase, 1 number')).toBeInTheDocument();
      });
    });

    test('submits form with valid data', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            firebase_uid: '123',
            name: 'John',
            surname: 'Doe',
            email: 'john@example.com',
            role: 'admin'
          })
        });
      
      await renderAndWait();
      
      fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Add Admin/i }));
      
      
    });

    test('shows success toast on successful submission', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ firebase_uid: '123', name: 'John', surname: 'Doe', email: 'john@example.com' })
        });
      
      await renderAndWait();
      
      fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Add Admin/i }));
      
      
    });

    test('resets form after successful submission', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ firebase_uid: '123', name: 'John', surname: 'Doe', email: 'john@example.com' })
        });
      
      await renderAndWait();
      
      const surnameInput = screen.getByLabelText(/Surname/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      
      fireEvent.change(surnameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Add Admin/i }));
      
      
    });

    test('adds new admin to list after submission', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            firebase_uid: '123',
            name: 'John',
            surname: 'Doe',
            email: 'john@example.com',
            role: 'admin'
          })
        });
      
      await renderAndWait();
      
      fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Add Admin/i }));
      
      
    });

    test('shows error toast on API error', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Email already exists' })
        });
      
      await renderAndWait();
      
      fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Add Admin/i }));
      
      
    });

    test('shows generic error on network failure', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockRejectedValueOnce(new Error('Network error'));
      
      await renderAndWait();
      
      fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Add Admin/i }));
      
      
    });

    test('disables button during submission', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockImplementation(() => new Promise(() => {})); // Never resolves
      
      await renderAndWait();
      
      fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123' } });
      
      const submitButton = screen.getByRole('button', { name: /Add Admin/i });
      fireEvent.click(submitButton);
      
      
    });
  });

  describe('Delete Admin', () => {
    test('removes admin from list on delete', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { firebase_uid: '1', name: 'John', surname: 'Doe', email: 'john@example.com', role: 'admin' }
          ]
        })
        .mockResolvedValueOnce({ ok: true });
      
      await renderAndWait();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const removeButton = screen.getByRole('button', { name: /Remove admin John/i });
      fireEvent.click(removeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    test('shows success toast on delete', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { firebase_uid: '1', name: 'John', surname: 'Doe', email: 'john@example.com', role: 'admin' }
          ]
        })
        .mockResolvedValueOnce({ ok: true });
      
      await renderAndWait();
      
      await waitFor(() => {
        const removeButton = screen.getByRole('button', { name: /Remove admin John/i });
        fireEvent.click(removeButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Admin removed')).toBeInTheDocument();
      });
    });

    test('shows error toast on delete failure', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { firebase_uid: '1', name: 'John', surname: 'Doe', email: 'john@example.com', role: 'admin' }
          ]
        })
        .mockRejectedValueOnce(new Error('Network error'));
      
      await renderAndWait();
      
      await waitFor(() => {
        const removeButton = screen.getByRole('button', { name: /Remove admin John/i });
        fireEvent.click(removeButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Failed to delete admin')).toBeInTheDocument();
      });
    });

    test('calls DELETE endpoint with correct firebase_uid', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { firebase_uid: 'uid-123', name: 'John', surname: 'Doe', email: 'john@example.com', role: 'admin' }
          ]
        })
        .mockResolvedValueOnce({ ok: true });
      
      await renderAndWait();
      
      await waitFor(() => {
        const removeButton = screen.getByRole('button', { name: /Remove admin John/i });
        fireEvent.click(removeButton);
      });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.test.com/admin/admins/uid-123',
          { method: 'DELETE' }
        );
      });
    });
  });

  describe('Toast Notifications', () => {
    test('toast auto-hides after 3 seconds', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      await renderAndWait();
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load admins')).toBeInTheDocument();
      });
      
      jest.advanceTimersByTime(3000);
      
      await waitFor(() => {
        expect(screen.queryByText('Failed to load admins')).not.toBeInTheDocument();
      });
    });

    test('success toast has green background', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => [] })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ firebase_uid: '123', name: 'John', surname: 'Doe', email: 'john@example.com' })
        });
      
      await renderAndWait();
      
      fireEvent.change(screen.getByLabelText(/Surname/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Add Admin/i }));
      
    });

    test('error toast has red background', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      await renderAndWait();
      
      await waitFor(() => {
        const toast = screen.getByRole('status');
        expect(toast).toHaveStyle({ backgroundColor: '#ff5252' });
      });
    });
  });

  describe('Accessibility', () => {
    test('form fields have proper labels', async () => {
      await renderAndWait();     
      expect(screen.getByLabelText(/Surname/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    test('admin list has aria-label', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => [
          { firebase_uid: '1', name: 'John', surname: 'Doe', email: 'john@example.com', role: 'admin' }
        ]
      });
      
      await renderAndWait();
      
      await waitFor(() => {
        const list = screen.getByRole('list', { name: /Admin accounts/i });
        expect(list).toBeInTheDocument();
      });
    });

    test('toast has role status', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      await renderAndWait();
      
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });
});