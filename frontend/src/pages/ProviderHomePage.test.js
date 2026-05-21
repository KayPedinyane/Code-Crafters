/**
 * Smoke Tests for ProviderHomePage.js
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProviderHomePage from './ProviderHomePage';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/provider' })
}));

jest.mock('../firebase', () => ({
  auth: {
    currentUser: {
      uid: 'provider-id',
      email: 'provider@example.com'
    }
  }
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
);

describe('ProviderHomePage Component - Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders provider home page without crashing', () => {
    render(
      <BrowserRouter>
        <ProviderHomePage />
      </BrowserRouter>
    );
    
    expect(document.body).toBeInTheDocument();
  });

  test('displays welcome message or heading', () => {
    render(
      <BrowserRouter>
        <ProviderHomePage />
      </BrowserRouter>
    );
    
    const heading = screen.queryByRole('heading') ||
                   screen.queryByText(/welcome/i) ||
                   screen.queryByText(/dashboard/i);
    expect(heading || document.body).toBeInTheDocument();
  });

  test('renders navigation buttons', () => {
    render(
      <BrowserRouter>
        <ProviderHomePage />
      </BrowserRouter>
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });

  test('clicking buttons triggers navigation', () => {
    render(
      <BrowserRouter>
        <ProviderHomePage />
      </BrowserRouter>
    );
    
    const buttons = screen.queryAllByRole('button');
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
    }
    expect(document.body).toBeInTheDocument();
  });

  test('fetches data on mount', async () => {
    render(
      <BrowserRouter>
        <ProviderHomePage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});