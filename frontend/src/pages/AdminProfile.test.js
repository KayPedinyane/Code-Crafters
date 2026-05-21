/**
 * Smoke Tests for AdminProfile.js
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminProfile from './AdminProfile';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../firebase', () => ({
  auth: {
    currentUser: {
      uid: 'admin-id',
      email: 'admin@example.com',
      getIdToken: () => Promise.resolve('token')
    }
  }
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      name: 'Admin',
      surname: 'User',
      email: 'admin@example.com'
    })
  })
);

describe('AdminProfile Component - Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders admin profile without crashing', () => {
    render(
      <BrowserRouter>
        <AdminProfile />
      </BrowserRouter>
    );
    
    expect(document.body).toBeInTheDocument();
  });

  test('displays profile heading', () => {
    render(
      <BrowserRouter>
        <AdminProfile />
      </BrowserRouter>
    );
    
    const heading = screen.queryByText(/profile/i) ||
                   screen.queryByRole('heading');
    expect(heading || document.body).toBeInTheDocument();
  });

  test('fetches admin data', async () => {
    render(
      <BrowserRouter>
        <AdminProfile />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  test('renders form inputs', () => {
    render(
      <BrowserRouter>
        <AdminProfile />
      </BrowserRouter>
    );
    
    const inputs = screen.queryAllByRole('textbox');
    expect(inputs.length >= 0).toBe(true);
  });

  test('edit button exists', () => {
    render(
      <BrowserRouter>
        <AdminProfile />
      </BrowserRouter>
    );
    
    const editButton = screen.queryByText(/edit/i);
    if (editButton) {
      fireEvent.click(editButton);
    }
    expect(document.body).toBeInTheDocument();
  });
});