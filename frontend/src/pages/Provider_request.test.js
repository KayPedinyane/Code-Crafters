
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProviderRequests from './Provider_requests';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

global.fetch = jest.fn();

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <ProviderRequests />
    </BrowserRouter>
  );
};

describe('ProviderRequests Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_API_URL = 'https://api.test.com';
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => []
    });
  });

  describe('Rendering', () => {
    test('renders page title', async () => {
      renderComponent();
      expect(screen.getByText('Provider Management')).toBeInTheDocument();
    });

    test('renders all three columns', async () => {
      renderComponent();
      expect(screen.getByText('New Requests')).toBeInTheDocument();
      expect(screen.getByText('Active Providers')).toBeInTheDocument();
      expect(screen.getByText('Rejected Providers')).toBeInTheDocument();
    });
  });

  describe('Fetching Providers', () => {
    test('fetches providers on mount', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.test.com/provider-profile'
        );
      });
    });

    test('handles successful fetch and displays email', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Provider 1', email: 'p1@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('p1@test.com')).toBeInTheDocument();
      });
    });

    test('logs error on fetch failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      global.fetch.mockRejectedValue(new Error('Network error'));
      
      renderComponent();
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Fetch error:', expect.any(Error));
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('handles non-array response', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      global.fetch.mockResolvedValue({
        json: async () => ({ error: 'Invalid data' })
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Expected array but got:', expect.any(Object));
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('handles null response', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      global.fetch.mockResolvedValue({
        json: async () => null
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Expected array but got:', null);
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Empty States', () => {
    test('shows all empty states when no providers exist', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('No new requests')).toBeInTheDocument();
        expect(screen.getByText('No active providers')).toBeInTheDocument();
        expect(screen.getByText('No rejected providers')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering by Status', () => {
    test('filters providers with new status', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'New Provider', email: 'new@test.com', status: 'new' },
          { id: 2, company_name: 'Active Provider', email: 'active@test.com', status: 'accepted' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const newColumn = screen.getByText('New Requests').closest('article');
        expect(newColumn).toContainElement(screen.getByText('new@test.com'));
        expect(newColumn).not.toContainElement(screen.getByText('active@test.com'));
      });
    });

    test('filters providers with accepted status', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Active Provider', email: 'active@test.com', status: 'accepted' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const activeColumn = screen.getByText('Active Providers').closest('article');
        expect(activeColumn).toContainElement(screen.getByText('active@test.com'));
      });
    });

    test('filters providers with rejected status', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Rejected Provider', email: 'rejected@test.com', status: 'rejected' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const rejectedColumn = screen.getByText('Rejected Providers').closest('article');
        expect(rejectedColumn).toContainElement(screen.getByText('rejected@test.com'));
      });
    });

    test('handles mixed case status values', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Provider 1', email: 'p1@test.com', status: 'NEW' },
          { id: 2, company_name: 'Provider 2', email: 'p2@test.com', status: 'Accepted' },
          { id: 3, company_name: 'Provider 3', email: 'p3@test.com', status: 'REJECTED' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('p1@test.com')).toBeInTheDocument();
        expect(screen.getByText('p2@test.com')).toBeInTheDocument();
        expect(screen.getByText('p3@test.com')).toBeInTheDocument();
      });
    });

    test('handles missing status field', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Provider without status', email: 'no-status@test.com' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.queryByText('no-status@test.com')).not.toBeInTheDocument();
      });
    });

    test('distributes providers across all three columns', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'New Provider', email: 'new@test.com', status: 'new' },
          { id: 2, company_name: 'Active Provider', email: 'active@test.com', status: 'accepted' },
          { id: 3, company_name: 'Rejected Provider', email: 'rejected@test.com', status: 'rejected' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('new@test.com')).toBeInTheDocument();
        expect(screen.getByText('active@test.com')).toBeInTheDocument();
        expect(screen.getByText('rejected@test.com')).toBeInTheDocument();
      });
    });

    test('handles multiple providers in same category', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'New Provider 1', email: 'new1@test.com', status: 'new' },
          { id: 2, company_name: 'New Provider 2', email: 'new2@test.com', status: 'new' },
          { id: 3, company_name: 'New Provider 3', email: 'new3@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('new1@test.com')).toBeInTheDocument();
        expect(screen.getByText('new2@test.com')).toBeInTheDocument();
        expect(screen.getByText('new3@test.com')).toBeInTheDocument();
      });
    });
  });

  describe('Provider Cards', () => {
    test('displays provider email', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Test Provider', email: 'test@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('test@test.com')).toBeInTheDocument();
      });
    });

    test('renders card structure correctly', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Complete Provider', email: 'complete@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const email = screen.getByText('complete@test.com');
        const card = email.closest('section');
        expect(card).toBeInTheDocument();
        expect(card).toHaveStyle({ cursor: 'pointer' });
      });
    });
  });

  describe('Navigation', () => {
    test('navigates to provider details on card click', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 123, company_name: 'Test Provider', email: 'test@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const card = screen.getByText('test@test.com').closest('section');
        fireEvent.click(card);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/providers/123');
    });

    test('clicking different cards navigates to different routes', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Provider 1', email: 'p1@test.com', status: 'new' },
          { id: 2, company_name: 'Provider 2', email: 'p2@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const card1 = screen.getByText('p1@test.com').closest('section');
        fireEvent.click(card1);
        expect(mockNavigate).toHaveBeenCalledWith('/providers/1');
        
        const card2 = screen.getByText('p2@test.com').closest('section');
        fireEvent.click(card2);
        expect(mockNavigate).toHaveBeenCalledWith('/providers/2');
      });
    });

    test('multiple navigation calls work correctly', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 456, company_name: 'Provider Two', email: 'two@test.com', status: 'accepted' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const card = screen.getByText('two@test.com').closest('section');
        fireEvent.click(card);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/providers/456');
    });
  });

  describe('Visual Elements', () => {
    test('title has correct color', () => {
      renderComponent();
      
      const title = screen.getByText('Provider Management');
      expect(title).toHaveStyle({ color: '#00c853' });
    });

    test('column titles have correct color', () => {
      renderComponent();
      
      const newTitle = screen.getByText('New Requests');
      const activeTitle = screen.getByText('Active Providers');
      const rejectedTitle = screen.getByText('Rejected Providers');
      
      expect(newTitle).toHaveStyle({ color: '#00c853' });
      expect(activeTitle).toHaveStyle({ color: '#00c853' });
      expect(rejectedTitle).toHaveStyle({ color: '#00c853' });
    });

    test('empty state messages have correct styling', async () => {
      renderComponent();
      
      await waitFor(() => {
        const emptyMsg = screen.getByText('No new requests');
        expect(emptyMsg).toHaveStyle({ color: '#aaa', fontSize: '14px' });
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles providers with very long emails', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { 
            id: 1, 
            company_name: 'Provider', 
            email: 'verylongemailaddress@verylongdomainname.com', 
            status: 'new' 
          }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('verylongemailaddress@verylongdomainname.com')).toBeInTheDocument();
      });
    });

    test('handles empty string status', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Provider', email: 'empty@test.com', status: '' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.queryByText('empty@test.com')).not.toBeInTheDocument();
      });
    });

    test('handles unknown status values', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Provider', email: 'unknown@test.com', status: 'pending' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.queryByText('unknown@test.com')).not.toBeInTheDocument();
      });
    });

    test('handles special characters in email', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: "O'Brien & Associates", email: 'obrien+test@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('obrien+test@test.com')).toBeInTheDocument();
      });
    });
  });

  describe('Component Structure', () => {
    test('uses semantic HTML', () => {
      renderComponent();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Provider Management' })).toBeInTheDocument();
    });

    test('renders lists with proper structure', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Provider', email: 'test@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const lists = screen.getAllByRole('list');
        expect(lists.length).toBe(3);
      });
    });

    test('renders list items correctly', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Provider', email: 'p1@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const listItem = screen.getByText('p1@test.com').closest('li');
        expect(listItem).toBeInTheDocument();
      });
    });

    test('maintains unique keys with multiple items', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, company_name: 'Provider 1', email: 'p1@test.com', status: 'new' },
          { id: 2, company_name: 'Provider 2', email: 'p2@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const items = screen.getAllByRole('listitem');
        expect(items.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});