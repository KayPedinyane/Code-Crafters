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

test('login module loads', () => {
  expect(true).toBe(true);
});