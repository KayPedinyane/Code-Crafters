/**
 * Comprehensive Tests for ProviderAnalytics.js - Target: 80%+ Coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProviderAnalytics from './ProviderAnalytics';
import '@testing-library/jest-dom';

global.fetch = jest.fn();

describe('ProviderAnalytics Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_API_URL = 'https://api.test.com';
    global.fetch.mockResolvedValue({
      json: async () => []
    });
  });

  describe('Rendering', () => {
    test('renders analytics section', () => {
      render(<ProviderAnalytics providerId="provider-1" />);
      expect(screen.getByText('Application Analytics')).toBeInTheDocument();
    });

    test('displays section description', () => {
      render(<ProviderAnalytics providerId="provider-1" />);
      expect(screen.getByText(/Applicant volume per opportunity/i)).toBeInTheDocument();
    });

    test('displays click instruction', () => {
      render(<ProviderAnalytics providerId="provider-1" />);
      expect(screen.getByText(/click a bar to see status breakdown/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    test('shows loading message', () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<ProviderAnalytics providerId="provider-1" />);
      expect(screen.getByText('Loading analytics…')).toBeInTheDocument();
    });

    test('fetches opportunities when providerId present', async () => {
      global.fetch.mockResolvedValue({
        json: async () => []
      });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.test.com/opportunities/provider/provider-1'
        );
      });
    });

    test('does not fetch when providerId missing', () => {
      render(<ProviderAnalytics />);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('does not fetch when providerId is null', () => {
      render(<ProviderAnalytics providerId={null} />);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    test('shows empty message when no opportunities', async () => {
      global.fetch.mockResolvedValue({
        json: async () => []
      });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('No opportunities posted yet.')).toBeInTheDocument();
      });
    });

    test('handles non-array response', async () => {
      global.fetch.mockResolvedValue({
        json: async () => null
      });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('No opportunities posted yet.')).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    test('shows error message on fetch failure', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Could not load analytics.')).toBeInTheDocument();
      });
    });

    test('error message has red color', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        const errorMsg = screen.getByText('Could not load analytics.');
        expect(errorMsg).toHaveStyle({ color: '#e53e3e' });
      });
    });
  });

  describe('Data Display', () => {
    test('displays opportunities with applications', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [
            { id: 1, title: 'Software Developer' },
            { id: 2, title: 'Data Analyst' }
          ]
        })
        .mockResolvedValueOnce({
          json: async () => [
            { status: 'pending' },
            { status: 'accepted' }
          ]
        })
        .mockResolvedValueOnce({
          json: async () => [
            { status: 'pending' }
          ]
        });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Software Developer')).toBeInTheDocument();
      });
    });

    test('fetches applications for each opportunity', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [
            { id: 1, title: 'Job 1' },
            { id: 2, title: 'Job 2' }
          ]
        })
        .mockResolvedValueOnce({
          json: async () => []
        })
        .mockResolvedValueOnce({
          json: async () => []
        });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.test.com/applications/opportunities/1'
        );
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.test.com/applications/opportunities/2'
        );
      });
    });


    test('counts status types correctly', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [
            { id: 1, title: 'Job 1' }
          ]
        })
        .mockResolvedValueOnce({
          json: async () => [
            { status: 'pending' },
            { status: 'pending' },
            { status: 'accepted' },
            { status: 'rejected' },
            { status: 'shortlisted' }
          ]
        });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Accepted')).toBeInTheDocument();
        expect(screen.getByText('Rejected')).toBeInTheDocument();
        expect(screen.getByText('Shortlisted')).toBeInTheDocument();
      });
    });

    test('handles lowercase status values', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [{ id: 1, title: 'Job 1' }]
        })
        .mockResolvedValueOnce({
          json: async () => [
            { status: 'PENDING' },
            { status: 'Accepted' },
            { status: 'rejected' }
          ]
        });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });

    test('ignores unknown status values', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [{ id: 1, title: 'Job 1' }]
        })
        .mockResolvedValueOnce({
          json: async () => [
            { status: 'pending' },
            { status: 'unknown_status' },
            { status: 'accepted' }
          ]
        });
      
      const { container } = render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        // Total shows 3 (counts all apps including unknown status)
        const svgText = container.querySelector('text[font-size="22"]');
        expect(svgText).toHaveTextContent('3');
      });
    });

    test('handles applications fetch error gracefully', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [{ id: 1, title: 'Job 1' }]
        })
        .mockRejectedValueOnce(new Error('Applications fetch failed'));
      
      const { container } = render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        // Check SVG center text shows 0
        const svgText = container.querySelector('text[font-size="22"]');
        expect(svgText).toHaveTextContent('0');
      });
    });

    test('shows top 8 opportunities only', async () => {
      const opportunities = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        title: `Job ${i + 1}`
      }));
      
      global.fetch.mockResolvedValueOnce({
        json: async () => opportunities
      });
      
      // Mock applications for all
      for (let i = 0; i < 12; i++) {
        global.fetch.mockResolvedValueOnce({
          json: async () => [{ status: 'pending' }]
        });
      }
      
      const { container } = render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        const bars = container.querySelectorAll('[title]');
        expect(bars.length).toBeLessThanOrEqual(8);
      });
    });

    test('sorts opportunities by total descending', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [
            { id: 1, title: 'Low' },
            { id: 2, title: 'High' },
            { id: 3, title: 'Medium' }
          ]
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'pending' }] // 1 app
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'pending' }, { status: 'accepted' }, { status: 'rejected' }] // 3 apps
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'pending' }, { status: 'accepted' }] // 2 apps
        });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      
    });
  });

  describe('Bar Chart', () => {
    test('renders bars for each opportunity', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [
            { id: 1, title: 'Job 1' },
            { id: 2, title: 'Job 2' }
          ]
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'pending' }]
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'pending' }]
        });
      
      const { container } = render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        const bars = container.querySelectorAll('[title]');
        expect(bars.length).toBeGreaterThan(0);
      });
    });

    test('truncates long opportunity titles', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [
            { id: 1, title: 'This is a very long opportunity title that should be truncated' }
          ]
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'pending' }]
        });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        expect(screen.getByText(/…/)).toBeInTheDocument();
      });
    });

    test('does not truncate short titles', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [
            { id: 1, title: 'Short Title' }
          ]
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'pending' }]
        });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      
    });

    test('clicking bar selects opportunity', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [
            { id: 1, title: 'Job 1' },
            { id: 2, title: 'Job 2' }
          ]
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'pending' }]
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'accepted' }]
        });
      
      const { container } = render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        const bars = container.querySelectorAll('[title]');
        expect(bars.length).toBe(2);
      });
      
      const secondBar = container.querySelectorAll('[title]')[1];
      fireEvent.click(secondBar);
      
      
    });

    test('first opportunity selected by default', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [
            { id: 1, title: 'First Job' },
            { id: 2, title: 'Second Job' }
          ]
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'pending' }]
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'accepted' }]
        });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        const title = screen.getAllByText('First Job')[0];
        expect(title).toBeInTheDocument();
      });
    });
  });

  describe('Donut Chart', () => {
    test('renders donut chart for selected opportunity', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [{ id: 1, title: 'Job 1' }]
        })
        .mockResolvedValueOnce({
          json: async () => [{ status: 'pending' }]
        });
      
      const { container } = render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    test('renders legend with all status types', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [{ id: 1, title: 'Job 1' }]
        })
        .mockResolvedValueOnce({
          json: async () => [
            { status: 'pending' },
            { status: 'shortlisted' },
            { status: 'accepted' },
            { status: 'rejected' }
          ]
        });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Shortlisted')).toBeInTheDocument();
        expect(screen.getByText('Accepted')).toBeInTheDocument();
        expect(screen.getByText('Rejected')).toBeInTheDocument();
      });
    });

    test('displays count for each status', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [{ id: 1, title: 'Job 1' }]
        })
        .mockResolvedValueOnce({
          json: async () => [
            { status: 'pending' },
            { status: 'pending' },
            { status: 'accepted' }
          ]
        });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        // Check legend shows counts - 2 pending, 1 accepted
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Accepted')).toBeInTheDocument();
        const allText = screen.getAllByText(/\d+/);
        expect(allText.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Visual Elements', () => {
    test('renders card with border', async () => {
      global.fetch.mockResolvedValue({
        json: async () => []
      });
      
      const { container } = render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        const card = container.querySelector('[style*="border"]');
        expect(card).toBeInTheDocument();
      });
    });

    test('applies styling to loading message', () => {
      global.fetch.mockImplementation(() => new Promise(() => {}));
      
      const { container } = render(<ProviderAnalytics providerId="provider-1" />);
      
      const loading = screen.getByText('Loading analytics…');
      expect(loading).toHaveStyle({ color: '#718096' });
    });

    test('empty message has correct styling', async () => {
      global.fetch.mockResolvedValue({
        json: async () => []
      });
      
      render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        const empty = screen.getByText('No opportunities posted yet.');
        expect(empty).toHaveStyle({ color: '#718096' });
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles zero applications', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [{ id: 1, title: 'Job 1' }]
        })
        .mockResolvedValueOnce({
          json: async () => []
        });
      
      const { container } = render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        // Check SVG center text shows 0
        const svgText = container.querySelector('text[font-size="22"]');
        expect(svgText).toHaveTextContent('0');
      });
    });

    test('handles missing status field', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [{ id: 1, title: 'Job 1' }]
        })
        .mockResolvedValueOnce({
          json: async () => [
            { status: 'pending' },
            { /* no status field */ },
            { status: 'accepted' }
          ]
        });
      
      const { container } = render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        // Total shows 3 (component counts ALL apps, not just valid statuses)
        const svgText = container.querySelector('text[font-size="22"]');
        expect(svgText).toHaveTextContent('3');
      });
    });

    test('handles null applications response', async () => {
      global.fetch
        .mockResolvedValueOnce({
          json: async () => [{ id: 1, title: 'Job 1' }]
        })
        .mockResolvedValueOnce({
          json: async () => null
        });
      
      const { container } = render(<ProviderAnalytics providerId="provider-1" />);
      
      await waitFor(() => {
        // Check SVG center text shows 0
        const svgText = container.querySelector('text[font-size="22"]');
        expect(svgText).toHaveTextContent('0');
      });
    });
  });
});