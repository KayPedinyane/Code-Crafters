/**
 * Tests for Header.js Component
 * Tests based on actual Header implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../components/Header';
import { getAuth, signOut } from 'firebase/auth';
import '@testing-library/jest-dom';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
}));

// Mock useNavigate and useLocation
const mockNavigate = jest.fn();
const mockLocation = { pathname: '/admin' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

// Mock fetch
global.fetch = jest.fn();

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default auth mock
    const mockAuth = {
      currentUser: {
        getIdToken: jest.fn().mockResolvedValue('mock-token')
      }
    };
    getAuth.mockReturnValue(mockAuth);
    
    // Setup onAuthStateChanged to immediately call with a user
    const { onAuthStateChanged } = require('firebase/auth');
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockAuth.currentUser);
      return jest.fn(); // unsubscribe function
    });
    
    // Setup fetch mock
    global.fetch.mockResolvedValue({
      json: async () => ({
        name: 'John',
        surname: 'Doe',
        role: 'Super Admin'
      })
    });
  });

  describe('Rendering', () => {
    test('renders header component', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    test('displays SkillsBridgeSA logo', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/SkillsBridge/)).toBeInTheDocument();
      expect(screen.getByText('SA')).toBeInTheDocument();
    });

    test('logo has correct aria-label', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const logoLink = screen.getByLabelText(/SkillsBridgeSA.*go to dashboard/i);
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/admin');
    });

    test('displays loading state initially', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Loading…')).toBeInTheDocument();
    });

    test('displays admin name after loading', async () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    test('displays admin role after loading', async () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Super Admin')).toBeInTheDocument();
      });
    });

    test('displays admin initials', async () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('JD')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    test('renders all navigation items', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Provider Requests')).toBeInTheDocument();
      expect(screen.getByText('Admins Page')).toBeInTheDocument();
    });

    test('navigation has correct aria-label', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const nav = screen.getByLabelText('Admin navigation');
      expect(nav).toBeInTheDocument();
    });

    test('clicking Admin Dashboard navigates to /admin', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const dashboardBtn = screen.getByText('Admin Dashboard');
      fireEvent.click(dashboardBtn);
      
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    test('clicking Provider Requests navigates to /requests', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const requestsBtn = screen.getByText('Provider Requests');
      fireEvent.click(requestsBtn);
      
      expect(mockNavigate).toHaveBeenCalledWith('/requests');
    });

    test('clicking Admins Page navigates to /admins', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const adminsBtn = screen.getByText('Admins Page');
      fireEvent.click(adminsBtn);
      
      expect(mockNavigate).toHaveBeenCalledWith('/admins');
    });

    test('active page has aria-current="page"', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const dashboardBtn = screen.getByText('Admin Dashboard');
      expect(dashboardBtn).toHaveAttribute('aria-current', 'page');
    });

    test('active page shows visual indicator', () => {
      const { container } = render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      // Check for active indicator element
      const activeIndicator = container.querySelector('[aria-hidden="true"]');
      expect(activeIndicator).toBeInTheDocument();
    });
  });

  describe('Profile Section', () => {
    test('renders profile avatar button', async () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        const profileBtn = screen.getByLabelText(/Open profile for John Doe/i);
        expect(profileBtn).toBeInTheDocument();
      });
    });

    test('clicking profile button navigates to AdminProfile', async () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        const profileBtn = screen.getByLabelText(/Open profile for John Doe/i);
        fireEvent.click(profileBtn);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('AdminProfile');
    });

    test('profile button has correct title attribute', async () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        const profileBtn = screen.getByLabelText(/Open profile for John Doe/i);
        expect(profileBtn).toHaveAttribute('title', 'John Doe');
      });
    });

    test('renders logout button', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const logoutBtn = screen.getByText('Logout');
      expect(logoutBtn).toBeInTheDocument();
    });

    test('logout button calls signOut and navigates to login', async () => {
      signOut.mockResolvedValue();
      
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const logoutBtn = screen.getByText('Logout');
      fireEvent.click(logoutBtn);
      
      await waitFor(() => {
        expect(signOut).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    test('logout handles errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      signOut.mockRejectedValue(new Error('Logout failed'));
      
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const logoutBtn = screen.getByText('Logout');
      fireEvent.click(logoutBtn);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Admin Info Loading', () => {
    test('fetches admin data with correct headers', async () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/admin/me'),
          expect.objectContaining({
            headers: { Authorization: 'Bearer mock-token' }
          })
        );
      });
    });

    test('handles fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('handles no user logged in', () => {
      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null); // No user
        return jest.fn();
      });
      
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Loading…')).toBeInTheDocument();
    });
  });

  describe('getInitials helper function', () => {
    test('returns both initials when name and surname provided', async () => {
      global.fetch.mockResolvedValue({
        json: async () => ({
          name: 'Jane',
          surname: 'Smith',
          role: 'Admin'
        })
      });
      
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('JS')).toBeInTheDocument();
      });
    });

    test('returns single initial when only name provided', async () => {
      global.fetch.mockResolvedValue({
        json: async () => ({
          name: 'Jane',
          surname: '',
          role: 'Admin'
        })
      });
      
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('J')).toBeInTheDocument();
      });
    });

    test('returns question mark when no name or surname', async () => {
      global.fetch.mockResolvedValue({
        json: async () => ({
          name: '',
          surname: '',
          role: 'Admin'
        })
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

    test('uppercases initials', async () => {
      global.fetch.mockResolvedValue({
        json: async () => ({
          name: 'john',
          surname: 'doe',
          role: 'Admin'
        })
      });
      
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText('JD')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('header has correct role', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    test('admin info has aria-live region', () => {
      const { container } = render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    test('navigation buttons are keyboard accessible', () => {
      render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });

    test('logo icon has aria-hidden', () => {
      const { container } = render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      const logoIcon = container.querySelector('[aria-hidden="true"]');
      expect(logoIcon).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    test('unsubscribes from auth listener on unmount', () => {
      const unsubscribe = jest.fn();
      const { onAuthStateChanged } = require('firebase/auth');
      onAuthStateChanged.mockReturnValue(unsubscribe);
      
      const { unmount } = render(
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      );
      
      unmount();
      
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});