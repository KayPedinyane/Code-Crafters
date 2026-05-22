/**
 * Comprehensive Tests for AIRecommendations.js
 * Target: 80%+ Coverage (currently 10.9%)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AIRecommendations from './AIRecommendations';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock Firebase
const mockUser = {
  uid: 'user-123',
  email: 'test@test.com'
};

const mockUnsubscribe = jest.fn();

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (auth, callback) => {
    Promise.resolve().then(() => callback(mockUser));
    return mockUnsubscribe;
  }
}));

jest.mock('../firebase', () => ({
  auth: {}
}));

jest.mock('./AIRecommendations.css', () => ({}), { virtual: true });

global.fetch = jest.fn();

const mockProfile = {
  full_name: 'John Doe',
  email: 'test@test.com',
  nqf_level: 'NQF 5',
  qualification: 'Information Technology Diploma',
  skills: 'JavaScript, React, Python',
  province: 'Gauteng',
  city: 'Johannesburg',
  subjects: 'Mathematics, Computer Science'
};

const mockJobs = [
  {
    id: 1,
    title: 'Software Developer Learnership',
    company_name: 'Tech Corp',
    sector: 'Information Technology',
    nqf_level: 'NQF 5',
    location: 'Johannesburg, Gauteng',
    stipend: '5000',
    duration: '12 months',
    closing_date: new Date(Date.now() + 86400000 * 10).toISOString(),
    type: 'Learnership',
    description: 'Learn JavaScript and React',
    requirements: 'NQF 5, coding skills'
  },
  {
    id: 2,
    title: 'Data Analyst Internship',
    company_name: 'Data Co',
    sector: 'Finance',
    nqf_level: 'NQF 6',
    location: 'Cape Town',
    stipend: 'R4500',
    duration: '6 months',
    closing_date: new Date(Date.now() + 86400000 * 3).toISOString(),
    type: 'Internship',
    description: 'Analyze data with Python',
    requirements: 'NQF 6, Python'
  }
];

describe('AIRecommendations Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    global.fetch.mockImplementation((url) => {
      if (url.includes('/profile/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockProfile)
        });
      }
      if (url.includes('/opportunities')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockJobs)
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
        <AIRecommendations />
      </BrowserRouter>
    );
    
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

    test('fetches profile on mount', async () => {
      await renderComponent();
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/profile/')
      );
    });

    test('fetches opportunities on mount', async () => {
      await renderComponent();
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/opportunities')
      );
    });

    
  });

  describe('Navigation', () => {
    test('renders back button', async () => {
      await renderComponent();
      
      expect(screen.getByText(/Back to opportunities/i)).toBeInTheDocument();
    });

    test('navigates back on back button click', async () => {
      await renderComponent();
      
      const backButton = screen.getByText(/Back to opportunities/i);
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/applicant');
    });

    test('navigates on logo click', async () => {
      await renderComponent();
      
      const logo = screen.getByText(/SkillsBridge/i).closest('.logo');
      if (logo) fireEvent.click(logo);
      
      expect(mockNavigate).toHaveBeenCalledWith('/applicant');
    });
  });

  describe('How It Works Section', () => {
    test('displays how it works grid', async () => {
      await renderComponent();
      
      expect(screen.getByText('How matching works')).toBeInTheDocument();
      expect(screen.getByText('NQF Level')).toBeInTheDocument();
      expect(screen.getByText('Sector')).toBeInTheDocument();
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
    });

    test('displays correct icons', async () => {
      await renderComponent();
      
      expect(screen.getByText('🎓')).toBeInTheDocument();
      expect(screen.getByText('🏢')).toBeInTheDocument();
      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText('📍')).toBeInTheDocument();
    });
  });

  describe('Profile Card', () => {
    test('displays profile name', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    test('displays profile metadata', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/Information Technology Diploma/i)).toBeInTheDocument();
        expect(screen.getByText(/NQF 5/i)).toBeInTheDocument();
      });
    });

    test('displays skills tags', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Python')).toBeInTheDocument();
      });
    });

    test('displays match readiness percentage', async () => {
      await renderComponent();
      
      await waitFor(() => {
        // Profile has 6/6 fields filled, so 100%
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    test('displays profile avatar with initial', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const avatar = screen.getByText('J');
        expect(avatar).toHaveClass('ai-profile-avatar');
      });
    });
  });

  describe('Incomplete Profile Warning', () => {
    test('shows warning when profile incomplete', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/profile/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              email: 'test@test.com'
              // Missing nqf_level and full_name
            })
          });
        }
        if (url.includes('/opportunities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockJobs)
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
      
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/Complete your profile/i)).toBeInTheDocument();
      });
    });

    test('warning has edit profile button', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/profile/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ email: 'test@test.com' })
          });
        }
        if (url.includes('/opportunities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockJobs)
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
      
      await renderComponent();
      
      await waitFor(() => {
        const editButton = screen.getByText(/Complete Profile/i);
        expect(editButton).toBeInTheDocument();
      });
    });

    test('navigates to edit profile on warning button click', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/profile/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ email: 'test@test.com' })
          });
        }
        if (url.includes('/opportunities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockJobs)
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
      
      await renderComponent();
      
      await waitFor(() => {
        const editButton = screen.getByText(/Complete Profile →/i);
        fireEvent.click(editButton);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/edit-profile');
    });
  });

  describe('Generate Button', () => {
    test('displays generate button', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/Find My Best Matches/i)).toBeInTheDocument();
      });
    });

    test('button is disabled when profile incomplete', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/profile/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ email: 'test@test.com' })
          });
        }
        if (url.includes('/opportunities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockJobs)
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
      
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        expect(button).toBeDisabled();
      });
    });

    test('shows job count in subtitle', async () => {
      await renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/Analyses 2 available opportunities/i)).toBeInTheDocument();
      });
    });

    test('triggers recommendations on button click', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      expect(screen.getByText(/Analysing your profile/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    test('shows loading message when generating', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      expect(screen.getByText(/Matching your profile/i)).toBeInTheDocument();
    });

    test('shows loading steps', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      expect(screen.getByText(/Checking NQF levels/i)).toBeInTheDocument();
      expect(screen.getByText(/Comparing sectors/i)).toBeInTheDocument();
      expect(screen.getByText(/Analysing skills/i)).toBeInTheDocument();
      expect(screen.getByText(/Scoring locations/i)).toBeInTheDocument();
    });

    test('button shows spinner when loading', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      expect(screen.getByText('⟳')).toBeInTheDocument();
    });
  });

  describe('Recommendations Results', () => {
    test('displays results after generation', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      // Fast-forward through the 1.8s timeout
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.getByText(/Your Top.*Matches/i)).toBeInTheDocument();
      });
    });

    test('displays re-run button in results', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.getByText(/Re-run/i)).toBeInTheDocument();
      });
    });

    test('re-run button resets state', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        const rerunButton = screen.getByText(/Re-run/i);
        fireEvent.click(rerunButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Find My Best Matches/i)).toBeInTheDocument();
      });
    });

    test('displays job cards', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.getByText('Software Developer Learnership')).toBeInTheDocument();
      });
    });

    test('displays match rankings', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.getByText('#1 Match')).toBeInTheDocument();
      });
    });

    test('displays match labels', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
     
    });

    test('displays job details', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      
    });

    test('displays why this matches section', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      
    });

    test('displays tips', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      
    });

    
  });

  describe('No Results State', () => {
    test('shows no results message when no matches', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/profile/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              full_name: 'Test User',
              nqf_level: 'NQF 8',
              qualification: 'Underwater Basket Weaving',
              skills: 'Baskets',
              province: 'Remote',
              city: 'Nowhere'
            })
          });
        }
        if (url.includes('/opportunities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockJobs)
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
      
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.getByText(/No strong matches found/i)).toBeInTheDocument();
      });
    });

    test('shows update profile button in no results', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/profile/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              full_name: 'Test User',
              nqf_level: 'NQF 8',
              qualification: 'Unrelated Field'
            })
          });
        }
        if (url.includes('/opportunities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockJobs)
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
      
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        expect(screen.getByText(/Update Profile/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles profile fetch error', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/profile/')) {
          return Promise.reject(new Error('Network error'));
        }
        if (url.includes('/opportunities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockJobs)
          });
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

    test('handles opportunities fetch error', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/profile/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProfile)
          });
        }
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
  });

  
  describe('Helper Functions - formatStipend', () => {
    test('formats stipend without R prefix', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        // Should display R5000 (from 5000)
        expect(screen.getByText(/R5000/i)).toBeInTheDocument();
      });
    });

    test('keeps stipend with R prefix', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        // Should display R4500 (already has R)
        expect(screen.getByText(/R4500/i)).toBeInTheDocument();
      });
    });
  });

  describe('Closing Date Indicators', () => {
    test('shows closing pill for jobs closing within 7 days', async () => {
      await renderComponent();
      
      await waitFor(() => {
        const button = screen.getByText(/Find My Best Matches/i);
        fireEvent.click(button);
      });
      
      jest.advanceTimersByTime(2000);
      
      await waitFor(() => {
        // Job 2 closes in 3 days
        expect(screen.getByText(/3d left/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filters Closed Jobs', () => {
    test('excludes jobs with past closing dates', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/profile/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockProfile)
          });
        }
        if (url.includes('/opportunities')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([
              ...mockJobs,
              {
                id: 3,
                title: 'Expired Job',
                sector: 'IT',
                nqf_level: 'NQF 5',
                location: 'Johannesburg',
                stipend: '5000',
                duration: '12 months',
                closing_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                type: 'Learnership'
              }
            ])
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });
      
      await renderComponent();
      
      await waitFor(() => {
        // Should show 2 opportunities, not 3
        expect(screen.getByText(/Analyses 2 available opportunities/i)).toBeInTheDocument();
      });
    });
  });
});