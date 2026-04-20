import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock firebase
jest.mock('./firebase', () => ({
  auth: {
    currentUser: { email: 'test@test.com', uid: 'test-uid' }
  }
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
);

describe('App routing', () => {
  test('renders without crashing', async () => {
    const { default: App } = await import('./App');
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
  });
});