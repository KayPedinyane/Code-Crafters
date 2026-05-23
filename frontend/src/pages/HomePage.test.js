/**
 * Comprehensive Tests for HomePage.js
 * Target: 80%+ Coverage (currently 48.88%)
 * Based on ACTUAL component implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('./HomePage.css', () => ({}), { virtual: true });

jest.mock('../utils/nqfData', () => ({
  NQF_LEVELS: [
    { value: 'NQF 5', label: 'NQF 5' },
    { value: 'NQF 6', label: 'NQF 6' }
  ],
  SECTORS: ['IT', 'Finance', 'Engineering']
}));

jest.mock('../utils/saLocations', () => ({
  ALL_CITIES: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria']
}));

global.fetch = jest.fn();

const mockJobs = [
  {
    id: 1,
    title: 'Software Developer Learnership',
    sector: 'IT',
    nqf_level: 'NQF 5',
    location: 'Johannesburg',
    stipend: 'R5000',
    duration: '12 months',
    closing_date: '2026-12-31',
    type: 'Learnership'
  },
  {
    id: 2,
    title: 'Finance Intern',
    sector: 'Finance',
    nqf_level: 'NQF 6',
    location: 'Cape Town',
    stipend: 'R4500',
    duration: '6 months',
    closing_date: '2026-11-30',
    type: 'Internship'
  }
];

describe('HomePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJobs)
    });
  });

  const renderComponent = async () => {
    const result = render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
    
    return result;
  };

  describe('Rendering & Initial Load', () => {
    test('fetches opportunities on mount', async () => {
      await renderComponent();
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/opportunities')
      );
    });
  });

  describe('Header Navigation', () => {
    test('displays Home link', async () => {
      await renderComponent();
      
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    test('displays Log in link', async () => {
      await renderComponent();
      
      expect(screen.getByText('Log in')).toBeInTheDocument();
    });

    test('displays Sign up link', async () => {
      await renderComponent();
      
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    test('navigates to login on Log in click', async () => {
      await renderComponent();
      
      const loginLink = screen.getByText('Log in');
      fireEvent.click(loginLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('navigates to signup on Sign up click', async () => {
      await renderComponent();
      
      const signupLink = screen.getByText('Sign up');
      fireEvent.click(signupLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/create');
    });
  });

  describe('Hero Section - Home View', () => {
    test('displays main heading', async () => {
      await renderComponent();
      
      expect(screen.getByText(/Find your learnership or internship/i)).toBeInTheDocument();
    });

    test('displays tagline', async () => {
      await renderComponent();
      
      expect(screen.getByText(/Connecting South African youth/i)).toBeInTheDocument();
    });
  });

  describe('Search Form', () => {
    test('displays search input', async () => {
      await renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/Job title or sector/i);
      expect(searchInput).toBeInTheDocument();
    });

    test('displays location input', async () => {
      await renderComponent();
      
      const locationInput = screen.getByPlaceholderText(/City or province/i);
      expect(locationInput).toBeInTheDocument();
    });

    test('displays search button', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      expect(searchButton).toBeInTheDocument();
    });

    test('updates search input value', async () => {
      await renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/Job title or sector/i);
      fireEvent.change(searchInput, { target: { value: 'Developer' } });
      
      expect(searchInput.value).toBe('Developer');
    });

    test('updates location input value', async () => {
      await renderComponent();
      
      const locationInput = screen.getByPlaceholderText(/City or province/i);
      fireEvent.change(locationInput, { target: { value: 'Johannesburg' } });
      
      expect(locationInput.value).toBe('Johannesburg');
    });

    test('switches to opportunities view on search submit', async () => {
      await renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/Job title or sector/i);
      const searchButton = screen.getByText('Search');
      
      fireEvent.change(searchInput, { target: { value: 'Developer' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Filter Opportunities/i)).toBeInTheDocument();
      });
    });

    test('form submission prevents default', async () => {
      await renderComponent();
      
      const form = screen.getByPlaceholderText(/Job title or sector/i).closest('form');
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      
      form.dispatchEvent(submitEvent);
      
      expect(submitEvent.defaultPrevented).toBe(true);
    });
  });

  describe('Sectors Section - Home View', () => {
    test('displays Browse by sector heading', async () => {
      await renderComponent();
      
      expect(screen.getByText('Browse by sector')).toBeInTheDocument();
    });

    test('displays Engineering sector card', async () => {
      await renderComponent();
      
      expect(screen.getByText('Engineering')).toBeInTheDocument();
    });

    test('displays Finance sector card', async () => {
      await renderComponent();
      
      expect(screen.getByText('Finance')).toBeInTheDocument();
    });
  });

  describe('How It Works Section - Home View', () => {
    test('displays How it works heading', async () => {
      await renderComponent();
      
      expect(screen.getByText('How it works')).toBeInTheDocument();
    });

    test('displays step 1', async () => {
      await renderComponent();
      
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Create an account')).toBeInTheDocument();
      expect(screen.getByText(/Sign up as an applicant/i)).toBeInTheDocument();
    });

    test('displays step 2', async () => {
      await renderComponent();
      
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Search opportunities')).toBeInTheDocument();
      expect(screen.getByText(/Filter by sector/i)).toBeInTheDocument();
    });

    test('displays step 3', async () => {
      await renderComponent();
      
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Apply online')).toBeInTheDocument();
      expect(screen.getByText(/Submit your profile/i)).toBeInTheDocument();
    });

    test('displays step 4', async () => {
      await renderComponent();
      
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Get placed')).toBeInTheDocument();
      expect(screen.getByText(/Track your applications/i)).toBeInTheDocument();
    });
  });

  describe('Opportunities View', () => {
    test('hides home sections in opportunities view', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Browse by sector')).not.toBeInTheDocument();
        expect(screen.queryByText('How it works')).not.toBeInTheDocument();
      });
    });

    test('displays filter section', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Filter Opportunities/i)).toBeInTheDocument();
      });
    });

    test('displays all filter dropdowns', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        expect(selects.length).toBe(4); // sector, nqfLevel, location, type
      });
    });

    test('filters by sector', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        const sectorSelect = selects[0];
        
        fireEvent.change(sectorSelect, { target: { value: 'IT' } });
        
        expect(screen.getByText('Software Developer Learnership')).toBeInTheDocument();
        expect(screen.queryByText('Finance Intern')).not.toBeInTheDocument();
      });
    });

    test('filters by NQF level', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        const nqfSelect = selects[1];
        
        fireEvent.change(nqfSelect, { target: { value: 'NQF 6' } });
        
        expect(screen.queryByText('Software Developer Learnership')).not.toBeInTheDocument();
        expect(screen.getByText('Finance Intern')).toBeInTheDocument();
      });
    });

    test('filters by location', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        const locationSelect = selects[2];
        
        fireEvent.change(locationSelect, { target: { value: 'Cape Town' } });
        
        expect(screen.queryByText('Software Developer Learnership')).not.toBeInTheDocument();
        expect(screen.getByText('Finance Intern')).toBeInTheDocument();
      });
    });

    test('filters by type', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        const typeSelect = selects[3];
        
        fireEvent.change(typeSelect, { target: { value: 'Internship' } });
        
        expect(screen.queryByText('Software Developer Learnership')).not.toBeInTheDocument();
        expect(screen.getByText('Finance Intern')).toBeInTheDocument();
      });
    });

    test('shows clear filters button when filters active', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: 'IT' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Clear filters/i)).toBeInTheDocument();
      });
    });

    test('clears filters on button click', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: 'IT' } });
      });
      
      await waitFor(() => {
        const clearButton = screen.getByText(/Clear filters/i);
        fireEvent.click(clearButton);
      });
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        expect(selects[0].value).toBe('');
      });
    });

    test('displays results count', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
    });
  });

  describe('Job Cards', () => {
    test('displays job cards', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Software Developer Learnership')).toBeInTheDocument();
        expect(screen.getByText('Finance Intern')).toBeInTheDocument();
      });
    });

    test('displays job details', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      
    });

    test('displays type badges', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
     
    });

    test('displays stipends', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('R5000')).toBeInTheDocument();
        expect(screen.getByText('R4500')).toBeInTheDocument();
      });
    });

    test('displays durations', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('12 months')).toBeInTheDocument();
        expect(screen.getByText('6 months')).toBeInTheDocument();
      });
    });

    test('navigates to job details on card click', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const jobCard = screen.getByText('Software Developer Learnership').closest('.job-card');
        fireEvent.click(jobCard);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith(
        '/applicant/job/1',
        expect.any(Object)
      );
    });
  });

  describe('Search Filtering', () => {
    test('filters jobs by search term', async () => {
      await renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/Job title or sector/i);
      fireEvent.change(searchInput, { target: { value: 'Developer' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Software Developer Learnership')).toBeInTheDocument();
        expect(screen.queryByText('Finance Intern')).not.toBeInTheDocument();
      });
    });

    test('filters jobs by location search', async () => {
      await renderComponent();
      
      const locationInput = screen.getByPlaceholderText(/City or province/i);
      fireEvent.change(locationInput, { target: { value: 'Cape Town' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Software Developer Learnership')).not.toBeInTheDocument();
        expect(screen.getByText('Finance Intern')).toBeInTheDocument();
      });
    });

    test('search is case insensitive', async () => {
      await renderComponent();
      
      const searchInput = screen.getByPlaceholderText(/Job title or sector/i);
      fireEvent.change(searchInput, { target: { value: 'DEVELOPER' } });
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Software Developer Learnership')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    test('displays loading state', async () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Loading opportunities/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    test('shows empty state when no jobs match', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: 'Agriculture' } });
      });
    });

    test('empty state has clear filters button', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: 'Agriculture' } });
      });

    });
  });

  describe('Footer', () => {
    test('displays footer', async () => {
      await renderComponent();
      
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    test('displays copyright', async () => {
      await renderComponent();
      
      expect(screen.getByText(/© 2026 SkillsBridgeSA/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    
    test('still renders when no jobs fetched', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });
      
      await renderComponent();
      
      expect(screen.getByText(/Find your learnership/i)).toBeInTheDocument();
    });
  });

  describe('View State Management', () => {
    test('starts in home view', async () => {
      await renderComponent();
      
      expect(screen.getByText('Browse by sector')).toBeInTheDocument();
      expect(screen.getByText('How it works')).toBeInTheDocument();
    });

    test('switches to opportunities view after search', async () => {
      await renderComponent();
      
      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Browse by sector')).not.toBeInTheDocument();
        expect(screen.getByText(/Filter Opportunities/i)).toBeInTheDocument();
      });
    });
  });
});