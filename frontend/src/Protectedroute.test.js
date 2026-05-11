import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './Protectedroute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('redirects to login when no user in localStorage', () => {
    const { queryByText } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Login Page</div>} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('redirects when user role not allowed', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'user' }));
    localStorage.setItem('token', 'test-token');

    const { queryByText } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/applicant" element={<div>Applicant Page</div>} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('Admin Content')).not.toBeInTheDocument();
  });

  test('renders children when user has correct role', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
    localStorage.setItem('token', 'test-token');

    const { getByText } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );
    expect(getByText('Admin Content')).toBeInTheDocument();
  });

  test('renders children when no allowedRoles specified', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'user' }));
    localStorage.setItem('token', 'test-token');

    const { getByText } = render(
      <MemoryRouter initialEntries={['/page']}>
        <Routes>
          <Route path="/page" element={
            <ProtectedRoute>
              <div>Any Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );
    expect(getByText('Any Content')).toBeInTheDocument();
  });

  test('redirects provider to provider page when accessing wrong route', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'provider' }));
    localStorage.setItem('token', 'test-token');

    const { queryByText } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/provider" element={<div>Provider Page</div>} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>Admin Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    );
    expect(queryByText('Admin Content')).not.toBeInTheDocument();
  });
});