/**
 * Comprehensive Tests for AdminProfile.js - Target: 80%+ Coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminProfile from './AdminProfile';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock Firebase - simpler pattern
const mockGetIdToken = jest.fn();
const mockUser = {
  uid: 'admin-123',
  email: 'admin@test.com',
  getIdToken: mockGetIdToken
};

const mockUnsubscribe = jest.fn();

jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    onAuthStateChanged: (callback) => {
      // Call callback immediately with mock user
      Promise.resolve().then(() => callback(mockUser));
      return mockUnsubscribe;
    }
  })
}));

global.fetch = jest.fn();
global.localStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

const renderComponent = async () => {
  const result = render(
    <BrowserRouter>
      <AdminProfile />
    </BrowserRouter>
  );
  
  // Wait for profile to load (loading message to disappear)
  await waitFor(() => {
    expect(screen.queryByText('Loading profile...')).not.toBeInTheDocument();
  }, { timeout: 3000 });
  
  return result;
};

describe('AdminProfile Component', () => {
  const mockAdminData = {
    name: 'John',
    surname: 'Doe',
    email: 'john.doe@test.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    process.env.REACT_APP_API_URL = 'https://api.test.com';
    
    mockGetIdToken.mockResolvedValue('firebase-token-123');
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockAdminData
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Loading State', () => {
    test('shows loading message initially', () => {
      // Don't use renderComponent helper - render directly to see loading
      render(
        <BrowserRouter>
          <AdminProfile />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    test('loading message has white color', () => {
      render(
        <BrowserRouter>
          <AdminProfile />
        </BrowserRouter>
      );
      
      const loading = screen.getByText('Loading profile...');
      expect(loading).toHaveStyle({ color: 'white' });
    });
  });

  describe('Firebase Authentication', () => {
    test('fetches profile when user is authenticated', async () => {
      await renderComponent();
      
      expect(mockGetIdToken).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.com/admin/me',
        expect.objectContaining({
          headers: {
            Authorization: 'Bearer firebase-token-123'
          }
        })
      );
    });

    test('logs Firebase token', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await renderComponent();
      
      expect(consoleLogSpy).toHaveBeenCalledWith('TOKEN:', 'firebase-token-123');
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('Profile Data Display', () => {
    test('displays admin name', async () => {
      await renderComponent();
      
      const nameInput = screen.getByPlaceholderText('Name');
      expect(nameInput.value).toBe('John');
    });

    test('displays admin surname', async () => {
      await renderComponent();
      
      const surnameInput = screen.getByPlaceholderText('Surname');
      expect(surnameInput.value).toBe('Doe');
    });

    test('displays admin email', async () => {
      await renderComponent();
      
      const emailInput = screen.getByPlaceholderText('Email');
      expect(emailInput.value).toBe('john.doe@test.com');
    });

    test('displays initials in avatar', async () => {
      await renderComponent();
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    test('handles missing name data', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ name: '', surname: 'Doe', email: 'test@test.com' })
      });
      
      await renderComponent();
      
      expect(screen.getByText('D')).toBeInTheDocument();
    });

    test('handles missing surname data', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ name: 'John', surname: '', email: 'test@test.com' })
      });
      
      await renderComponent();
      
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    test('shows question mark when no name or surname', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ name: '', surname: '', email: 'test@test.com' })
      });
      
      await renderComponent();
      
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    test('inputs are disabled by default', async () => {
      await renderComponent();
      
      const nameInput = screen.getByPlaceholderText('Name');
      expect(nameInput).toBeDisabled();
    });

    test('shows Edit Profile button initially', async () => {
      await renderComponent();
      
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    test('enables inputs when Edit Profile clicked', async () => {
      await renderComponent();
      
      const editButton = screen.getByText('Edit Profile');
      fireEvent.click(editButton);
      
      const nameInput = screen.getByPlaceholderText('Name');
      expect(nameInput).not.toBeDisabled();
    });

    test('shows Save and Cancel buttons in edit mode', async () => {
      await renderComponent();
      
      const editButton = screen.getByText('Edit Profile');
      fireEvent.click(editButton);
      
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('hides Edit Profile button in edit mode', async () => {
      await renderComponent();
      
      const editButton = screen.getByText('Edit Profile');
      fireEvent.click(editButton);
      
      expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    });

    test('Cancel button exits edit mode', async () => {
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      fireEvent.click(screen.getByText('Cancel'));
      
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    test('inputs are disabled after cancel', async () => {
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      fireEvent.click(screen.getByText('Cancel'));
      
      const nameInput = screen.getByPlaceholderText('Name');
      expect(nameInput).toBeDisabled();
    });
  });

  describe('Input Changes', () => {
    test('updates name field', async () => {
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      const nameInput = screen.getByPlaceholderText('Name');
      fireEvent.change(nameInput, { target: { value: 'Jane' } });
      
      expect(nameInput.value).toBe('Jane');
    });

    test('updates surname field', async () => {
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      const surnameInput = screen.getByPlaceholderText('Surname');
      fireEvent.change(surnameInput, { target: { value: 'Smith' } });
      
      expect(surnameInput.value).toBe('Smith');
    });

    test('updates email field', async () => {
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'new@test.com' } });
      
      expect(emailInput.value).toBe('new@test.com');
    });

    test('handles empty input values', async () => {
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      const nameInput = screen.getByPlaceholderText('Name');
      fireEvent.change(nameInput, { target: { value: '' } });
      
      expect(nameInput.value).toBe('');
    });
  });

  describe('Save Profile', () => {
    

    test('exits edit mode after successful save', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockAdminData })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      fireEvent.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });
    });

    test('shows success toast after save', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockAdminData })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      fireEvent.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(screen.getByText('Profile updated')).toBeInTheDocument();
      });
    });

    test('shows error toast on save failure', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockAdminData })
        .mockResolvedValueOnce({ ok: false });
      
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      fireEvent.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });

    test('handles network error on save', async () => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockAdminData })
        .mockRejectedValueOnce(new Error('Network error'));
      
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      fireEvent.click(screen.getByText('Save'));
      
      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    test('renders Back button', async () => {
      await renderComponent();
      
      expect(screen.getByText('← Back')).toBeInTheDocument();
    });

    test('Back button navigates to admin page', async () => {
      await renderComponent();
      
      const backButton = screen.getByText('← Back');
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    test('renders Analytics button', async () => {
      await renderComponent();
      
      expect(screen.getByText('📊 Analytics')).toBeInTheDocument();
    });

    test('Analytics button navigates to analytics page', async () => {
      await renderComponent();
      
      const analyticsButton = screen.getByText('📊 Analytics');
      fireEvent.click(analyticsButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/analytics');
    });
  });

  describe('Error Handling', () => {
    
    test('logs error on fetch failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      render(
        <BrowserRouter>
          <AdminProfile />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Fetch profile error:', expect.any(Error));
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('handles non-ok response', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      global.fetch.mockResolvedValue({
        ok: false,
        text: async () => 'Server error message'
      });
      
      render(
        <BrowserRouter>
          <AdminProfile />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Server error:', 'Server error message');
      });
      
      consoleErrorSpy.mockRestore();
    });

    
  });

  

  describe('Avatar Initials', () => {
    test('displays uppercase initials', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ name: 'john', surname: 'doe', email: 'test@test.com' })
      });
      
      await renderComponent();
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    test('handles single letter names', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ name: 'A', surname: 'B', email: 'test@test.com' })
      });
      
      await renderComponent();
      
      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    test('handles names with spaces', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ name: '  John  ', surname: '  Doe  ', email: 'test@test.com' })
      });
      
      await renderComponent();
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    test('avatar has correct styling', async () => {
      await renderComponent();
      
      const avatar = screen.getByText('JD').parentElement;
      expect(avatar).toHaveStyle({
        width: '70px',
        height: '70px',
        borderRadius: '60%',
        border: '3px solid #00c853'
      });
    });
  });

  describe('Visual Elements', () => {
    test('inputs have correct background color', async () => {
      await renderComponent();
      
      const nameInput = screen.getByPlaceholderText('Name');
      expect(nameInput).toHaveStyle({
        backgroundColor: 'rgba(235, 245, 240, 0.94)'
      });
    });

    test('Save button has green background', async () => {
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      const saveButton = screen.getByText('Save');
      expect(saveButton).toHaveStyle({ backgroundColor: '#00c853' });
    });

    test('Cancel button has red background', async () => {
      await renderComponent();
      
      fireEvent.click(screen.getByText('Edit Profile'));
      
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toHaveStyle({ backgroundColor: '#ff5252' });
    });
  });

  describe('Component Cleanup', () => {
    test('unsubscribes from auth listener on unmount', async () => {
      const { unmount } = await renderComponent();
      unmount();
      
      // Component should clean up properly
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});