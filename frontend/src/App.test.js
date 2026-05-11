import { render } from '@testing-library/react';

jest.mock('./firebase', () => ({
  auth: { onAuthStateChanged: jest.fn((cb) => { cb(null); return jest.fn(); }) },
  googleProvider: {}
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
);

test('app renders without crashing', () => {
  const { default: App } = require('./App');
  render(<App />);
});