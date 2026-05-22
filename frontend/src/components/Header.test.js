/**
 * Simplified Header.js Tests with Better Mocking
 * Target: 75%+ coverage (currently 42.42%)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// ─── Mocks MUST BE BEFORE IMPORTS ────────────────────────────────────────────

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/admin' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

// Firebase mock - must be synchronous for Jest hoisting
let authCallback = null;
const mockUser = {
  getIdToken: jest.fn().mockResolvedValue('test-token')
};

const mockUnsubscribe = jest.fn();

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    onAuthStateChanged: jest.fn((callback) => {
      authCallback = callback;
      // Call callback async
      setTimeout(() => callback(mockUser), 0);
      return mockUnsubscribe;
    })
  })),
  signOut: jest.fn(() => Promise.resolve())
}));

// NOW import Header after mocks
const Header = require('./Header').default;

global.fetch = jest.fn();

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset mock functions
    mockUser.getIdToken.mockResolvedValue('test-token');
    
    // Default successful fetch
    global.fetch.mockResolvedValue({
      json: async () => ({
        name: 'John',
        surname: 'Doe',
        role: 'Super Admin'
      })
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ─── Basic Rendering ──────────────────────────────────────────────────────

  test('renders header', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('renders logo', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/SkillsBridge/)).toBeInTheDocument();
  });

  test('renders navigation', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  // ─── Admin Data ───────────────────────────────────────────────────────────

  test('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  test('displays admin name after fetch', async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Run timers to trigger auth callback
    jest.runAllTimers();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('displays admin role', async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    jest.runAllTimers();
    
    await waitFor(() => {
      expect(screen.getByText('Super Admin')).toBeInTheDocument();
    });
  });

  test('fetches admin data with token', async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    jest.runAllTimers();
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/me'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' }
        })
      );
    });
  });

  // ─── Initials ─────────────────────────────────────────────────────────────

  test('displays correct initials', async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    jest.runAllTimers();
    
    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  test('shows ellipsis before loading', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('…')).toBeInTheDocument();
  });

  test('handles missing name', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ name: '', surname: 'Doe', role: 'Admin' })
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    jest.runAllTimers();
    
    await waitFor(() => {
      expect(screen.getByText('D')).toBeInTheDocument();
    });
  });

  test('handles missing surname', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ name: 'John', surname: '', role: 'Admin' })
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    jest.runAllTimers();
    
    await waitFor(() => {
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  test('shows question mark when no names', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ name: '', surname: '', role: 'Admin' })
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    jest.runAllTimers();
    
    await waitFor(() => {
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  test('uppercases initials', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ name: 'jane', surname: 'smith', role: 'Admin' })
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    jest.runAllTimers();
    
    await waitFor(() => {
      expect(screen.getByText('JS')).toBeInTheDocument();
    });
  });

  test('trims whitespace', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ name: '  Bob  ', surname: '  Jones  ', role: 'Admin' })
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    jest.runAllTimers();
    
    await waitFor(() => {
      expect(screen.getByText('BJ')).toBeInTheDocument();
    });
  });

  // ─── Navigation ───────────────────────────────────────────────────────────

  test('renders all nav items', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Provider Requests')).toBeInTheDocument();
    expect(screen.getByText('Admins Page')).toBeInTheDocument();
  });

  test('navigates on click', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Admin Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
    
    fireEvent.click(screen.getByText('Provider Requests'));
    expect(mockNavigate).toHaveBeenCalledWith('/requests');
    
    fireEvent.click(screen.getByText('Admins Page'));
    expect(mockNavigate).toHaveBeenCalledWith('/admins');
  });

  test('shows active state', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Admin Dashboard')).toHaveAttribute('aria-current', 'page');
  });

  // ─── Profile Button ───────────────────────────────────────────────────────

  test('renders profile button', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/Open profile/i)).toBeInTheDocument();
  });

  test('navigates to profile on click', async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Open profile/i)).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByLabelText(/Open profile/i));
    expect(mockNavigate).toHaveBeenCalledWith('AdminProfile');
  });

  // ─── Logout ───────────────────────────────────────────────────────────────

  test('renders logout button', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('logs out on click', async () => {
    const { signOut } = require('firebase/auth');
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Logout'));
    
    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('handles logout error', async () => {
    const { signOut } = require('firebase/auth');
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    
    signOut.mockRejectedValueOnce(new Error('Logout failed'));
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    fireEvent.click(screen.getByText('Logout'));
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    
    consoleError.mockRestore();
  });

  // ─── Error Handling ───────────────────────────────────────────────────────

  test('handles fetch error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    global.fetch.mockRejectedValue(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    
    consoleError.mockRestore();
  });

  test('handles JSON parse error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    global.fetch.mockResolvedValue({
      json: async () => { throw new Error('Invalid JSON'); }
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    
    consoleError.mockRestore();
  });

  test('handles token error', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockUser.getIdToken.mockRejectedValueOnce(new Error('Token error'));
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    
    consoleError.mockRestore();
  });

  // ─── Cleanup ──────────────────────────────────────────────────────────────

  test('cleans up on unmount', () => {
    const { unmount } = render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    unmount();
    
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  // ─── Edge Cases ───────────────────────────────────────────────────────────

  test('handles undefined admin data', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({})
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  test('handles null values', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ name: null, surname: null, role: null })
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  test('handles very long names', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ 
        name: 'VeryLongFirstName', 
        surname: 'VeryLongLastName', 
        role: 'Admin' 
      })
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('VL')).toBeInTheDocument();
    });
  });

  test('handles special characters', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ name: "Seán", surname: "O'Brien", role: 'Admin' })
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText("Seán O'Brien")).toBeInTheDocument();
    });
  });

  test('handles spaces only', async () => {
    global.fetch.mockResolvedValue({
      json: async () => ({ name: '   ', surname: '   ', role: 'Admin' })
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  // ─── Accessibility ────────────────────────────────────────────────────────

  test('has banner role', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('navigation has label', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Admin navigation');
  });

  test('logo has aria-label', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText('SkillsBridgeSA — go to dashboard')).toBeInTheDocument();
  });

  test('profile button has aria-label', async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Open profile for John Doe/i)).toBeInTheDocument();
    });
  });

  test('active nav has aria-current', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Admin Dashboard')).toHaveAttribute('aria-current', 'page');
  });

  test('admin info has aria-live', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    const liveRegion = screen.getByText('Loading…').parentElement;
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
  });
});