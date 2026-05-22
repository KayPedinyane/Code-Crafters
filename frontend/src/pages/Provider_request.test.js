/**
 * Comprehensive Tests for Provider_requests.js - Target: 80%+ Coverage
 */

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
    
    // Default empty response
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

    test('renders New Requests column', async () => {
      renderComponent();
      expect(screen.getByText('New Requests')).toBeInTheDocument();
    });

    test('renders Active Providers column', async () => {
      renderComponent();
      expect(screen.getByText('Active Providers')).toBeInTheDocument();
    });

    test('renders Rejected Providers column', async () => {
      renderComponent();
      expect(screen.getByText('Rejected Providers')).toBeInTheDocument();
    });

    test('displays all three columns', async () => {
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

    test('handles successful fetch', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Provider 1', email: 'p1@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Provider 1')).toBeInTheDocument();
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
    test('shows empty message for new requests', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('No new requests')).toBeInTheDocument();
      });
    });

    test('shows empty message for active providers', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('No active providers')).toBeInTheDocument();
      });
    });

    test('shows empty message for rejected providers', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('No rejected providers')).toBeInTheDocument();
      });
    });

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
          { id: 1, name: 'New Provider', email: 'new@test.com', status: 'new' },
          { id: 2, name: 'Active Provider', email: 'active@test.com', status: 'accepted' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('New Provider')).toBeInTheDocument();
      });
      
      // Check it's in the New Requests column (not in others)
      const newColumn = screen.getByText('New Requests').closest('article');
      expect(newColumn).toContainElement(screen.getByText('New Provider'));
    });

    test('filters providers with accepted status', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Active Provider', email: 'active@test.com', status: 'accepted' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Active Provider')).toBeInTheDocument();
      });
      
      const activeColumn = screen.getByText('Active Providers').closest('article');
      expect(activeColumn).toContainElement(screen.getByText('Active Provider'));
    });

    test('filters providers with rejected status', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Rejected Provider', email: 'rejected@test.com', status: 'rejected' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Rejected Provider')).toBeInTheDocument();
      });
      
      const rejectedColumn = screen.getByText('Rejected Providers').closest('article');
      expect(rejectedColumn).toContainElement(screen.getByText('Rejected Provider'));
    });

    test('handles mixed case status values', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Provider 1', email: 'p1@test.com', status: 'NEW' },
          { id: 2, name: 'Provider 2', email: 'p2@test.com', status: 'Accepted' },
          { id: 3, name: 'Provider 3', email: 'p3@test.com', status: 'REJECTED' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Provider 1')).toBeInTheDocument();
        expect(screen.getByText('Provider 2')).toBeInTheDocument();
        expect(screen.getByText('Provider 3')).toBeInTheDocument();
      });
    });

    test('handles missing status field', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Provider without status', email: 'no-status@test.com' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        // Should not appear in any column since status is undefined
        expect(screen.queryByText('Provider without status')).not.toBeInTheDocument();
      });
    });

    test('distributes providers across all three columns', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'New Provider', email: 'new@test.com', status: 'new' },
          { id: 2, name: 'Active Provider', email: 'active@test.com', status: 'accepted' },
          { id: 3, name: 'Rejected Provider', email: 'rejected@test.com', status: 'rejected' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('New Provider')).toBeInTheDocument();
        expect(screen.getByText('Active Provider')).toBeInTheDocument();
        expect(screen.getByText('Rejected Provider')).toBeInTheDocument();
      });
    });

    test('handles multiple providers in same category', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'New Provider 1', email: 'new1@test.com', status: 'new' },
          { id: 2, name: 'New Provider 2', email: 'new2@test.com', status: 'new' },
          { id: 3, name: 'New Provider 3', email: 'new3@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('New Provider 1')).toBeInTheDocument();
        expect(screen.getByText('New Provider 2')).toBeInTheDocument();
        expect(screen.getByText('New Provider 3')).toBeInTheDocument();
      });
    });
  });

  describe('Provider Cards', () => {
    test('displays provider name', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Test Provider', email: 'test@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Test Provider')).toBeInTheDocument();
      });
    });

    test('displays provider email', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Test Provider', email: 'test@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('test@test.com')).toBeInTheDocument();
      });
    });

    test('renders all provider fields', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Complete Provider', email: 'complete@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Complete Provider')).toBeInTheDocument();
        expect(screen.getByText('complete@test.com')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    test('navigates to provider details on card click', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 123, name: 'Test Provider', email: 'test@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const card = screen.getByText('Test Provider').closest('section');
        fireEvent.click(card);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/providers/123');
    });

    test('navigates with correct provider id', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 456, name: 'Provider Two', email: 'two@test.com', status: 'accepted' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const card = screen.getByText('Provider Two').closest('section');
        fireEvent.click(card);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/providers/456');
    });

    test('clicking different cards navigates to different routes', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Provider 1', email: 'p1@test.com', status: 'new' },
          { id: 2, name: 'Provider 2', email: 'p2@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const card1 = screen.getByText('Provider 1').closest('section');
        fireEvent.click(card1);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/providers/1');
      
      await waitFor(() => {
        const card2 = screen.getByText('Provider 2').closest('section');
        fireEvent.click(card2);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/providers/2');
    });

    test('card has pointer cursor style', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Test Provider', email: 'test@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const card = screen.getByText('Test Provider').closest('section');
        expect(card).toHaveStyle({ cursor: 'pointer' });
      });
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
    test('handles providers with very long names', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { 
            id: 1, 
            name: 'Very Long Provider Name That Might Cause Layout Issues If Not Handled Properly', 
            email: 'long@test.com', 
            status: 'new' 
          }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/Very Long Provider Name/)).toBeInTheDocument();
      });
    });

    test('handles providers with very long emails', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { 
            id: 1, 
            name: 'Provider', 
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
          { id: 1, name: 'Provider', email: 'test@test.com', status: '' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.queryByText('Provider')).not.toBeInTheDocument();
      });
    });

    test('handles unknown status values', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Provider', email: 'test@test.com', status: 'pending' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        // Should not appear in any column
        expect(screen.queryByText('Provider')).not.toBeInTheDocument();
      });
    });

    test('handles providers with special characters in name', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: "O'Brien & Associates", email: 'obrien@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText("O'Brien & Associates")).toBeInTheDocument();
      });
    });

    test('handles providers with numbers in name', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Provider 123 Inc', email: 'test@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Provider 123 Inc')).toBeInTheDocument();
      });
    });
  });

  describe('List Rendering', () => {
    test('renders providers as list items', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Provider 1', email: 'p1@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const listItem = screen.getByText('Provider 1').closest('li');
        expect(listItem).toBeInTheDocument();
      });
    });

    test('maintains unique keys for list items', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Provider 1', email: 'p1@test.com', status: 'new' },
          { id: 2, name: 'Provider 2', email: 'p2@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const items = screen.getAllByRole('listitem');
        // Should have unique keys (React will warn if not, but we're checking they render)
        expect(items.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Component Structure', () => {
    test('uses semantic HTML', () => {
      renderComponent();
      
      // Check for main element
      expect(screen.getByRole('main')).toBeInTheDocument();
      
      // Check for headings
      expect(screen.getByRole('heading', { name: 'Provider Management' })).toBeInTheDocument();
    });

    test('renders lists with proper structure', async () => {
      global.fetch.mockResolvedValue({
        json: async () => [
          { id: 1, name: 'Provider', email: 'test@test.com', status: 'new' }
        ]
      });
      
      renderComponent();
      
      await waitFor(() => {
        const lists = screen.getAllByRole('list');
        expect(lists.length).toBe(3); // One for each column
      });
    });
  });
});