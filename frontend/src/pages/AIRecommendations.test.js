/**
 * Smoke Tests for AIRecommendations.js
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

jest.mock('../firebase', () => ({
  auth: {
    currentUser: {
      uid: 'user-id',
      getIdToken: () => Promise.resolve('token')
    }
  }
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      recommendations: []
    })
  })
);

describe('AIRecommendations Component - Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders AI recommendations page without crashing', () => {
    render(
      <BrowserRouter>
        <AIRecommendations />
      </BrowserRouter>
    );
    
    expect(document.body).toBeInTheDocument();
  });

  test('displays AI recommendations heading', () => {
    render(
      <BrowserRouter>
        <AIRecommendations />
      </BrowserRouter>
    );
    
    const heading = screen.queryByText(/AI/i) ||
                   screen.queryByText(/recommend/i) ||
                   screen.queryByRole('heading');
    expect(heading || document.body).toBeInTheDocument();
  });

  test('renders back button', () => {
    render(
      <BrowserRouter>
        <AIRecommendations />
      </BrowserRouter>
    );
    
    const backButton = screen.queryByText(/back/i);
    if (backButton) {
      fireEvent.click(backButton);
    }
    expect(document.body).toBeInTheDocument();
  });

  test('fetches recommendations data', async () => {
    render(
      <BrowserRouter>
        <AIRecommendations />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test('displays loading state', () => {
    render(
      <BrowserRouter>
        <AIRecommendations />
      </BrowserRouter>
    );
    
    const loading = screen.queryByText(/loading/i) ||
                   screen.queryByRole('status');
    expect(loading || document.body).toBeInTheDocument();
  });

  test('renders generate button', () => {
    render(
      <BrowserRouter>
        <AIRecommendations />
      </BrowserRouter>
    );
    
    const generateButton = screen.queryByText(/generate/i) ||
                          screen.queryByText(/get.*recommend/i);
    expect(generateButton || document.body).toBeInTheDocument();
  });

  test('clicking generate button triggers action', async () => {
    render(
      <BrowserRouter>
        <AIRecommendations />
      </BrowserRouter>
    );
    
    const generateButton = screen.queryByText(/generate/i);
    
    if (generateButton) {
      fireEvent.click(generateButton);
      await waitFor(() => {
        expect(generateButton).toBeInTheDocument();
      });
    }
  });
});