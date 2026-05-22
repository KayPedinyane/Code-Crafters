/**
 * Comprehensive Tests for ApplicantHome.js - Target: 75%+ Coverage
 * Note: This is a very large component (876 lines). Tests focus on core functionality.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ApplicantHome, { triggerConfetti } from './ApplicantHome';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/applicant', search: '' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

// Mock Firebase
const mockUser = {
  uid: 'user-123',
  email: 'test@test.com',
  displayName: 'Test User'
};

const mockUnsubscribe = jest.fn();

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth, callback) => {
    Promise.resolve().then(() => callback(mockUser));
    return mockUnsubscribe;
  },
  signOut: jest.fn(() => Promise.resolve())
}));

jest.mock('../firebase', () => ({
  auth: {}
}));

// Mock CSS imports
jest.mock('./ApplicantHome.css', () => ({}), { virtual: true });
jest.mock('./AIRecommendations.css', () => ({}), { virtual: true });

// Mock utility imports
jest.mock('../utils/nqfData', () => ({
  NQF_LEVELS: [
    { value: 'NQF 5', label: 'NQF 5' },
    { value: 'NQF 6', label: 'NQF 6' }
  ],
  SECTORS: ['IT', 'Finance', 'Engineering']
}));

jest.mock('../utils/saLocations', () => ({
  PROVINCES: ['Gauteng', 'Western Cape', 'KwaZulu-Natal']
}));

global.fetch = jest.fn();
global.confirm = jest.fn(() => true);
global.localStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

const mockOpportunities = [
  {
    id: 1,
    title: 'Software Developer Learnership',
    company_name: 'Tech Co',
    sector: 'IT',
    nqf_level: 'NQF 5',
    location: 'Johannesburg',
    stipend: '5000',
    duration: '12 months',
    closing_date: new Date(Date.now() + 86400000 * 10).toISOString(),
    opportunity_type: 'Learnership'
  },
  {
    id: 2,
    title: 'Data Analyst Internship',
    company_name: 'Data Corp',
    sector: 'Finance',
    nqf_level: 'NQF 6',
    location: 'Cape Town',
    stipend: 'R4500',
    duration: '6 months',
    closing_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    opportunity_type: 'Internship'
  }
];

const mockProfile = {
  full_name: 'John Doe',
  email: 'test@test.com',
  phone: '0821234567',
  id_number: '9001015800080',
  gender: 'Male',
  city: 'Johannesburg',
  province: 'Gauteng',
  qualification: 'IT Diploma',
  institution: 'Test University',
  nqf_level: 'NQF 5'
};

describe('ApplicantHome Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Default fetch mocks
    global.fetch.mockImplementation((url) => {
      if (url.includes('/opportunities')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOpportunities)
        });
      }
      if (url.includes('/profile/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfile)
        });
      }
      if (url.includes('/applications/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      if (url.includes('/notifications')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderComponent = async () => {
    const result = render(
      <BrowserRouter>
        <ApplicantHome />
      </BrowserRouter>
    );
    
    // Wait for initial data loads
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 3000 });
    
    return result;
  };

  describe('Rendering & Initial Load', () => {
    test('renders without crashing', async () => {
      await renderComponent();
      expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument();
    });

    test('fetches opportunities on mount', async () => {
      await renderComponent();
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/opportunities')
      );
    });

    test('fetches user profile on mount', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/profile/')
        );
      });
    });

   
  });

  describe('Search Functionality', () => {
    test('renders search input', async () => {
      await renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/Search by job title/i);
      expect(searchInput).toBeInTheDocument();
    });

    test('updates search input value', async () => {
      await renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/Search by job title/i);
      fireEvent.change(searchInput, { target: { value: 'Developer' } });
      
      expect(searchInput.value).toBe('Developer');
    });

    test('filters jobs by search term', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Software Developer Learnership')).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/Search by job title/i);
      fireEvent.change(searchInput, { target: { value: 'Data' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Software Developer Learnership')).not.toBeInTheDocument();
        expect(screen.getByText('Data Analyst Internship')).toBeInTheDocument();
      });
    });

    test('shows clear button when search has value', async () => {
      await renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/Search by job title/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButton = screen.getAllByText('✕')[0];
      expect(clearButton).toBeInTheDocument();
    });

    test('clears search on clear button click', async () => {
      await renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/Search by job title/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      const clearButtons = screen.getAllByText('✕');
      fireEvent.click(clearButtons[0]);
      
      expect(searchInput.value).toBe('');
    });
  });

  describe('Filter Functionality', () => {
    test('renders filter dropdowns', async () => {
      await renderComponent();
      
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(4);
    });

    test('filters by sector', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Software Developer Learnership')).toBeInTheDocument();
      });
      
      const selects = screen.getAllByRole('combobox');
      const sectorSelect = selects[0];
      
      fireEvent.change(sectorSelect, { target: { value: 'Finance' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Software Developer Learnership')).not.toBeInTheDocument();
        expect(screen.getByText('Data Analyst Internship')).toBeInTheDocument();
      });
    });

    test('shows clear filters button when filters active', async () => {
      await renderComponent();
      
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'IT' } });
      
      await waitFor(() => {
        expect(screen.getByText(/Clear all/i)).toBeInTheDocument();
      });
    });

    test('clears all filters on clear button click', async () => {
      await renderComponent();
      
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'IT' } });
      
      const clearButton = screen.getByText(/Clear all/i);
      fireEvent.click(clearButton);
      
      expect(selects[0].value).toBe('');
    });
  });

  describe('View Switching', () => {
    test('shows opportunities view by default', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/Find Your/i)).toBeInTheDocument();
      });
    });

    test('switches to applications view', async () => {
      await renderComponent();
      
      const appsLink = screen.getByText('My Applications');
      fireEvent.click(appsLink);
      
      await waitFor(() => {
        expect(screen.getByText(/Track the status/i)).toBeInTheDocument();
      });
    });

    test('fetches applications when switching to applications view', async () => {
      await renderComponent();
      
      global.fetch.mockClear();
      
      const appsLink = screen.getByText('My Applications');
      fireEvent.click(appsLink);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/applications/')
        );
      });
    });
  });

  describe('Job Cards', () => {
    test('displays job titles', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Software Developer Learnership')).toBeInTheDocument();
        expect(screen.getByText('Data Analyst Internship')).toBeInTheDocument();
      });
    });

    test('displays job details', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Tech Co')).toBeInTheDocument();
        expect(screen.getByText('Data Corp')).toBeInTheDocument();
      });
    });

    test('navigates to job details on card click', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const jobCard = screen.getByText('Software Developer Learnership').closest('.job-card');
        fireEvent.click(jobCard);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith(
        '/applicant/job/1',
        expect.any(Object)
      );
    });

    test('shows closing soon ribbon for jobs closing in 3 days', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/Closing in 2 day/i)).toBeInTheDocument();
      });
    });
  });

  describe('Saved Jobs', () => {
    

    test('shows saved jobs tab', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/🔖 Saved/i)).toBeInTheDocument();
      });
    });

    test('switches to saved jobs view', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const savedTab = screen.getByText(/🔖 Saved/i);
        fireEvent.click(savedTab);
      });
      
      expect(screen.getByText(/🔖 Saved/i).closest('button')).toHaveClass('view-tab-active');
    });
  });

  describe('Profile Popup', () => {
    test('shows profile popup on avatar click', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const profileChip = screen.getByText('Applicant').closest('.profile-chip');
        if (profileChip) fireEvent.click(profileChip);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Edit Profile →')).toBeInTheDocument();
      });
    });

    test('navigates to edit profile on click', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const profileChip = screen.getByText('Applicant').closest('.profile-chip');
        if (profileChip) fireEvent.click(profileChip);
      });
      
      await waitFor(() => {
        const editLink = screen.getByText('Edit Profile →');
        fireEvent.click(editLink);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/edit-profile');
    });

    test('navigates to settings', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const profileChip = screen.getByText('Applicant').closest('.profile-chip');
        if (profileChip) fireEvent.click(profileChip);
      });
      
      await waitFor(() => {
        const settingsLink = screen.getByText('Settings');
        fireEvent.click(settingsLink);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

  });

  describe('Notifications', () => {
    test('shows notification bell', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('🔔')).toBeInTheDocument();
      });
    });

    test('opens notification dropdown on bell click', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const bell = screen.getByText('🔔').closest('.notif-bell');
        if (bell) fireEvent.click(bell);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
      });
    });

    test('fetches notifications on bell click', async () => {
      await renderComponent();
      
      global.fetch.mockClear();
      
      await waitFor(() => {
        const bell = screen.getByText('🔔').closest('.notif-bell');
        if (bell) fireEvent.click(bell);
      });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/notifications/')
        );
      });
    });
  });

  describe('Empty States', () => {
    test('shows empty state when no opportunities found', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/opportunities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
      
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/No opportunities found/i)).toBeInTheDocument();
      });
    });

    test('shows empty state for applications', async () => {
      await renderComponent();
      
      const appsLink = screen.getByText('My Applications');
      fireEvent.click(appsLink);
      
      await waitFor(() => {
        expect(screen.getByText(/No applications yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Profile Completion', () => {
    test('shows profile completion nudge when incomplete', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/profile/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              full_name: 'John Doe',
              email: 'test@test.com'
              // Missing other fields
            })
          });
        }
        if (url.includes('/opportunities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockOpportunities)
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
      
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/Profile.*complete/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Helper Functions', () => {
    test('triggerConfetti creates confetti elements', () => {
      const initialChildCount = document.body.children.length;
      
      triggerConfetti();
      
      // Confetti elements should be added
      expect(document.body.children.length).toBeGreaterThan(initialChildCount);
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('focuses search on Ctrl+K', async () => {
      await renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/Search by job title/i);
      
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
      
      jest.advanceTimersByTime(100);
      
      // Search input should be focused
      expect(document.activeElement).toBe(searchInput);
    });
  });

  describe('Scroll to Top', () => {
    test('shows scroll to top button when scrolled', async () => {
      await renderComponent();
      
      // Simulate scroll
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
      fireEvent.scroll(window);
      
      await waitFor(() => {
        const scrollButton = screen.getByText('↑');
        expect(scrollButton).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Links', () => {
    test('navigates to AI recommendations', async () => {
      await renderComponent();
      
      const aiLink = screen.getByText(/AI Match/i);
      fireEvent.click(aiLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/ai-recommendations');
    });

    test('navigates to help page', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const profileChip = screen.getByText('Applicant').closest('.profile-chip');
        if (profileChip) fireEvent.click(profileChip);
      });
      
      await waitFor(() => {
        const helpLink = screen.getByText(/Help & Support/i);
        fireEvent.click(helpLink);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/help');
    });

    test('navigates to about page', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const profileChip = screen.getByText('Applicant').closest('.profile-chip');
        if (profileChip) fireEvent.click(profileChip);
      });
      
      await waitFor(() => {
        const aboutLink = screen.getByText(/About SkillsBridge SA/i);
        fireEvent.click(aboutLink);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/about');
    });
  });

  describe('Error Handling', () => {
    test('handles opportunities fetch error gracefully', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/opportunities')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
      
      await renderComponent();
      
      // Component should still render
      expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument();
    });

    test('handles profile fetch error gracefully', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/profile/')) {
          return Promise.reject(new Error('Network error'));
        }
        if (url.includes('/opportunities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockOpportunities)
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
      
      await renderComponent();
      
      // Component should still render with fallback name
      expect(screen.getByText(/SkillsBridge/i)).toBeInTheDocument();
    });
  });

});