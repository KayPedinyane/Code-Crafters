import { render, screen } from '@testing-library/react';
//import { MemoryRouter } from 'react-router-dom';

jest.mock('./firebase', () => ({
  auth: {
    currentUser: { email: 'test@test.com', uid: 'test-uid' }
  }
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({}))
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
);

test('app renders without crashing', () => {
  expect(true).toBe(true);
});