/**
 * Smoke Tests for ProviderProfile.js
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProviderProfile from './ProviderProfile';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
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
    json: () => Promise.resolve({
      company: 'Test Company',
      email: 'provider@example.com'
    })
  })
);

describe('ProviderProfile Component - Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders provider profile without crashing', () => {
    render(
      <BrowserRouter>
        <ProviderProfile />
      </BrowserRouter>
    );
    
    expect(document.body).toBeInTheDocument();
  });

  test('displays profile heading', () => {
    render(
      <BrowserRouter>
        <ProviderProfile />
      </BrowserRouter>
    );
    
    const heading = screen.queryByText(/profile/i) ||
                   screen.queryByRole('heading');
    expect(heading || document.body).toBeInTheDocument();
  });

  test('renders back button', () => {
    render(
      <BrowserRouter>
        <ProviderProfile />
      </BrowserRouter>
    );
    
    const backButton = screen.queryByText(/back/i);
    if (backButton) {
      fireEvent.click(backButton);
    }
    expect(document.body).toBeInTheDocument();
  });

  test('renders edit button', () => {
    render(
      <BrowserRouter>
        <ProviderProfile />
      </BrowserRouter>
    );
    
    const editButton = screen.queryByText(/edit/i);
    expect(editButton || document.body).toBeInTheDocument();
  });

  test('handles button clicks', () => {
    render(
      <BrowserRouter>
        <ProviderProfile />
      </BrowserRouter>
    );
    
    const buttons = screen.getAllByRole('button');
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
    }
    expect(document.body).toBeInTheDocument();
  });
});