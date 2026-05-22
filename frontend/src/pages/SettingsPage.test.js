/**
 * Comprehensive Tests for SettingsPage.js - Target: 80%+ Coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SettingsPage from './SettingsPage';
import '@testing-library/jest-dom';
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential } from 'firebase/auth';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock Firebase
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com'
};

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updatePassword: jest.fn(),
  EmailAuthProvider: {
    credential: jest.fn()
  },
  reauthenticateWithCredential: jest.fn()
}));

jest.mock('../firebase', () => ({
  auth: {}
}));

describe('SettingsPage Component - Comprehensive Coverage', () => {
  let authCallback;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Mock onAuthStateChanged
    onAuthStateChanged.mockImplementation((auth, callback) => {
      authCallback = callback;
      callback(mockUser); // Immediately call with logged-in user
      return jest.fn(); // Return unsubscribe function
    });

    updatePassword.mockResolvedValue();
    reauthenticateWithCredential.mockResolvedValue();
  });

  describe('Authentication & Navigation', () => {
    test('renders settings page when user is authenticated', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    test('redirects to home when user is not authenticated', () => {
      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null); // No user
        return jest.fn();
      });
      
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('displays SkillsBridge SA logo', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText('SkillsBridge')).toBeInTheDocument();
      expect(screen.getByText('SA')).toBeInTheDocument();
    });

    test('logo click navigates to applicant page', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      const logo = screen.getByText('SkillsBridge').parentElement;
      fireEvent.click(logo);
      expect(mockNavigate).toHaveBeenCalledWith('/applicant');
    });

    test('back button navigates to applicant page', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      const backBtn = screen.getByText('← Back');
      fireEvent.click(backBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/applicant');
    });

    test('cleans up auth listener on unmount', () => {
      const unsubscribe = jest.fn();
      onAuthStateChanged.mockReturnValue(unsubscribe);
      
      const { unmount } = render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      unmount();
      
      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Sidebar Navigation', () => {
    test('displays all section buttons', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText(/⚙️ Account/)).toBeInTheDocument();
      expect(screen.getByText(/🔔 Notifications/)).toBeInTheDocument();
      expect(screen.getByText(/🔒 Privacy/)).toBeInTheDocument();
      expect(screen.getByText(/🎨 Appearance/)).toBeInTheDocument();
    });

    test('account section is active by default', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });

    test('switches to notifications section', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/🔔 Notifications/));
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    test('switches to privacy section', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/🔒 Privacy/));
      expect(screen.getByText('Privacy & Data')).toBeInTheDocument();
    });

    test('switches to appearance section', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/🎨 Appearance/));
      expect(screen.getByText(/Theme/)).toBeInTheDocument();
    });

    test('sidebar button gets active class when selected', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      const notifBtn = screen.getByText(/🔔 Notifications/);
      fireEvent.click(notifBtn);
      expect(notifBtn.className).toContain('settings-nav-active');
    });

    test('can switch between sections multiple times', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/🔔 Notifications/));
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText(/🔒 Privacy/));
      expect(screen.getByText('Privacy & Data')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText(/⚙️ Account/));
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });
  });

  describe('Account Section - Email Display', () => {
    test('displays account settings title', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
    });

    test('displays email address card', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    test('displays current user email', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    test('displays email warning message', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText(/cannot be changed here/i)).toBeInTheDocument();
    });

    test('displays email icon', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText('✉️')).toBeInTheDocument();
    });
  });

  describe('Account Section - Password Change', () => {
    test('displays change password card', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    test('displays password requirements text', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    });

    test('displays current password input', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByPlaceholderText('Current password')).toBeInTheDocument();
    });

    test('displays new password input', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByPlaceholderText('New password')).toBeInTheDocument();
    });

    test('displays confirm password input', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    });

    test('displays update password button', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText('Update Password')).toBeInTheDocument();
    });

    test('current password input accepts text', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      const input = screen.getByPlaceholderText('Current password');
      fireEvent.change(input, { target: { value: 'oldpass123' } });
      expect(input.value).toBe('oldpass123');
    });

    test('new password input accepts text', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      const input = screen.getByPlaceholderText('New password');
      fireEvent.change(input, { target: { value: 'newpass123' } });
      expect(input.value).toBe('newpass123');
    });

    test('confirm password input accepts text', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      const input = screen.getByPlaceholderText('Confirm new password');
      fireEvent.change(input, { target: { value: 'newpass123' } });
      expect(input.value).toBe('newpass123');
    });
  });

  describe('Password Validation', () => {
    test('validates empty fields', async () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(screen.getByText(/Please fill in all fields/i)).toBeInTheDocument();
      });
    });

    test('validates missing current password', async () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(screen.getByText(/Please fill in all fields/i)).toBeInTheDocument();
      });
    });

    test('validates missing new password', async () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'oldpass123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(screen.getByText(/Please fill in all fields/i)).toBeInTheDocument();
      });
    });

    test('validates password mismatch', async () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'different123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(screen.getByText(/do not match/i)).toBeInTheDocument();
      });
    });

    test('error messages have error styling', async () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        const errorMsg = screen.getByText(/Please fill in all fields/i);
        expect(errorMsg.className).toContain('settings-msg-error');
      });
    });
  });

  describe('Password Change Success', () => {
    test('successfully updates password', async () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(screen.getByText(/Password updated successfully/i)).toBeInTheDocument();
      });
    });

    test('calls reauthenticateWithCredential with correct params', async () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(reauthenticateWithCredential).toHaveBeenCalled();
      });
    });

    test('calls updatePassword with new password', async () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(updatePassword).toHaveBeenCalled();
      });
    });

    test('clears password fields after success', async () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      const currentInput = screen.getByPlaceholderText('Current password');
      const newInput = screen.getByPlaceholderText('New password');
      const confirmInput = screen.getByPlaceholderText('Confirm new password');
      
      fireEvent.change(currentInput, { target: { value: 'oldpass123' } });
      fireEvent.change(newInput, { target: { value: 'newpass123' } });
      fireEvent.change(confirmInput, { target: { value: 'newpass123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(currentInput.value).toBe('');
        expect(newInput.value).toBe('');
        expect(confirmInput.value).toBe('');
      });
    });

    test('success message has success styling', async () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        const successMsg = screen.getByText(/Password updated successfully/i);
        expect(successMsg.className).toContain('settings-msg-success');
      });
    });

    test('shows loading state during update', async () => {
      updatePassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });

    test('disables button during loading', async () => {
      updatePassword.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      
      const button = screen.getByText('Update Password');
      fireEvent.click(button);
      
      expect(button).toBeDisabled();
    });
  });

  describe('Password Change Errors', () => {
    test('handles wrong password error', async () => {
      reauthenticateWithCredential.mockRejectedValueOnce({ code: 'auth/wrong-password' });
      
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'wrongpass' } });
      fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(screen.getByText(/Current password is incorrect/i)).toBeInTheDocument();
      });
    });

    test('handles too many requests error', async () => {
      reauthenticateWithCredential.mockRejectedValueOnce({ code: 'auth/too-many-requests' });
      
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(screen.getByText(/Too many attempts/i)).toBeInTheDocument();
      });
    });

    test('handles generic error', async () => {
      reauthenticateWithCredential.mockRejectedValueOnce({ code: 'auth/network-error' });
      
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      fireEvent.change(screen.getByPlaceholderText('Current password'), { target: { value: 'oldpass123' } });
      fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
      fireEvent.click(screen.getByText('Update Password'));
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to update password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Notifications Section', () => {
    beforeEach(() => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/🔔 Notifications/));
    });

    test('displays notification preferences title', () => {
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    test('displays email notifications card', () => {
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    });

    test('displays in-app notifications card', () => {
      expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
    });

    test('displays application status toggle', () => {
      expect(screen.getByText('Application status updates')).toBeInTheDocument();
    });

    test('displays matching opportunities toggle', () => {
      expect(screen.getByText('New matching opportunities')).toBeInTheDocument();
    });

    test('displays closing deadline toggle', () => {
      expect(screen.getByText('Closing deadline reminders')).toBeInTheDocument();
    });

    test('displays in-app all toggle', () => {
      expect(screen.getByText('All in-app notifications')).toBeInTheDocument();
    });

    test('all toggles are checked by default', () => {
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
    });

    test('can toggle email status updates', () => {
      const checkbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    test('can toggle matching opportunities', () => {
      const checkbox = screen.getAllByRole('checkbox')[1];
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    test('can toggle closing deadline', () => {
      const checkbox = screen.getAllByRole('checkbox')[2];
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    test('can toggle in-app notifications', () => {
      const checkbox = screen.getAllByRole('checkbox')[3];
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    test('saves preferences to localStorage', () => {
      const checkbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(checkbox);
      
      const saved = JSON.parse(localStorage.getItem('notif_prefs_test@example.com'));
      expect(saved.emailStatusChange).toBe(false);
    });

    test('can toggle preferences multiple times', () => {
      const checkbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    test('displays notification descriptions', () => {
      expect(screen.getByText(/When your application is shortlisted/i)).toBeInTheDocument();
      expect(screen.getByText(/When a new opportunity matches/i)).toBeInTheDocument();
      expect(screen.getByText(/When an opportunity you haven't applied/i)).toBeInTheDocument();
    });
  });

  describe('Privacy Section', () => {
    beforeEach(() => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/🔒 Privacy/));
    });

    test('displays privacy title', () => {
      expect(screen.getByText('Privacy & Data')).toBeInTheDocument();
    });

    test('displays your data card', () => {
      expect(screen.getByText('Your Data')).toBeInTheDocument();
    });

    test('displays POPIA description', () => {
      expect(screen.getByText(/SkillsBridge SA collects only/i)).toBeInTheDocument();
    });

    test('displays personal details data item', () => {
      expect(screen.getByText('Personal details')).toBeInTheDocument();
      expect(screen.getByText(/Name, ID number, contact details/i)).toBeInTheDocument();
    });

    test('displays education data item', () => {
      expect(screen.getByText('Education & qualifications')).toBeInTheDocument();
    });

    test('displays location data item', () => {
      expect(screen.getByText('Location')).toBeInTheDocument();
    });

    test('displays applications data item', () => {
      expect(screen.getByText('Applications')).toBeInTheDocument();
    });

    test('displays notification history data item', () => {
      expect(screen.getByText('Notification history')).toBeInTheDocument();
    });

    test('displays all data item icons', () => {
      expect(screen.getByText('👤')).toBeInTheDocument();
      expect(screen.getByText('🎓')).toBeInTheDocument();
      expect(screen.getByText('📍')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
      expect(screen.getByText('🔔')).toBeInTheDocument();
    });

    test('displays data requests card', () => {
      expect(screen.getByText('Data Requests')).toBeInTheDocument();
    });

    test('displays POPIA compliance text', () => {
      expect(screen.getByText(/POPIA/i)).toBeInTheDocument();
    });

    test('displays request my data button', () => {
      expect(screen.getByText('Request My Data')).toBeInTheDocument();
    });

    test('request data button shows alert', () => {
      window.alert = jest.fn();
      fireEvent.click(screen.getByText('Request My Data'));
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('skillsbridgesa@gmail.com'));
    });

    test('alert mentions 30 day response time', () => {
      window.alert = jest.fn();
      fireEvent.click(screen.getByText('Request My Data'));
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('30 days'));
    });
  });

  describe('Appearance Section', () => {
    beforeEach(() => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/🎨 Appearance/));
    });

    test('displays appearance title', () => {
      expect(screen.getByText('Appearance')).toBeInTheDocument();
    });

    test('displays theme card', () => {
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    test('displays theme description', () => {
      expect(screen.getByText(/Choose how SkillsBridge SA looks/i)).toBeInTheDocument();
    });

    test('displays light theme option', () => {
      expect(screen.getByText('☀️ Light')).toBeInTheDocument();
      expect(screen.getByText('Clean white background')).toBeInTheDocument();
    });

    test('displays system default option', () => {
      expect(screen.getByText('💻 System Default')).toBeInTheDocument();
      expect(screen.getByText('Match your device setting')).toBeInTheDocument();
    });

    test('displays active checkmarks', () => {
      const activeLabels = screen.getAllByText('✓ Active');
      expect(activeLabels.length).toBeGreaterThan(0);
    });

    test('displays dark mode coming soon text', () => {
      expect(screen.getByText(/Dark mode coming soon/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles user without saved preferences', () => {
      localStorage.clear();
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      fireEvent.click(screen.getByText(/🔔 Notifications/));
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked(); // Should default to true
      });
    });

    test('handles null in localStorage', () => {
      localStorage.setItem('notif_prefs_test@example.com', 'null');
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      
      fireEvent.click(screen.getByText(/🔔 Notifications/));
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    test('password inputs are type password', () => {
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByPlaceholderText('Current password').type).toBe('password');
      expect(screen.getByPlaceholderText('New password').type).toBe('password');
      expect(screen.getByPlaceholderText('Confirm new password').type).toBe('password');
    });

    test('renders without crashing with no user email', () => {
      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback({ uid: 'test', email: null });
        return jest.fn();
      });
      
      render(<BrowserRouter><SettingsPage /></BrowserRouter>);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});
