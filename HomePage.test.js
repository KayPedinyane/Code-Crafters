import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './frontend/src/pages/HomePage';

jest.mock('../firebase', () => ({
  auth: {}
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([])
  })
);

const renderHomePage = () => render(
  <MemoryRouter>
    <HomePage />
  </MemoryRouter>
);

describe('HomePage component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });
  });

  test('renders homepage heading', () => {
    renderHomePage();
    expect(screen.getByText(/Find your learnership or internship/i)).toBeInTheDocument();
  });

  test('renders search inputs', () => {
    renderHomePage();
    expect(screen.getByPlaceholderText('Job title or sector')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('City or province')).toBeInTheDocument();
  });

  test('renders search button', () => {
    renderHomePage();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  test('renders sector cards', () => {
    renderHomePage();
    expect(screen.getByText('ICT')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  test('renders how it works section', () => {
    renderHomePage();
    expect(screen.getByText('How it works')).toBeInTheDocument();
  });

  test('renders login and sign up nav links', () => {
    renderHomePage();
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  test('updates search input value', () => {
    renderHomePage();
    const searchInput = screen.getByPlaceholderText('Job title or sector');
    fireEvent.change(searchInput, { target: { value: 'ICT' } });
    expect(searchInput.value).toBe('ICT');
  });

  test('switches to opportunities view on search', () => {
    renderHomePage();
    const searchInput = screen.getByPlaceholderText('Job title or sector');
    fireEvent.change(searchInput, { target: { value: 'ICT' } });
    fireEvent.submit(searchInput.closest('form'));
    expect(screen.queryByText(/Find your learnership/i)).not.toBeInTheDocument();
  });
});