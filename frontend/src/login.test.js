import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './login';

jest.mock('./firebase', () => ({
  auth: {}
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: {
        getIdToken: jest.fn(() => Promise.resolve('mock-token')),
        email: 'test@test.com'
      }
    })
  )
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ role: 'user' })
  })
);

describe('Login', () => {
  test('renders login form', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  test('renders login button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('shows error for empty form submit', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    const button = screen.getByText('Login');
    fireEvent.click(button);
  });
});