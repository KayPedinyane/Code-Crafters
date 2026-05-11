import { render } from '@testing-library/react';
import React from 'react';

jest.mock('./firebase', () => ({
  auth: { onAuthStateChanged: jest.fn((cb) => { cb(null); return jest.fn(); }) },
  googleProvider: {}
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('./pages/HomePage', () => {
  return function MockHomePage() {
    return <div>HomePage</div>;
  };
});

const { default: App } = require('./App');

test('app renders without crashing', () => {
  render(<App />);
});