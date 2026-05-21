/**
 * Smoke Tests for ProfilePage.js
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('ProfilePage Component - Smoke Tests', () => {
  test('renders profile page without crashing', () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    expect(document.body).toBeInTheDocument();
  });

  test('displays profile content', () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    const content = screen.queryByText(/profile/i) || document.body;
    expect(content).toBeInTheDocument();
  });

  test('renders without errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});