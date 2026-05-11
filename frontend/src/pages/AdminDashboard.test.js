import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashBoard from './AdminDashboard';

global.fetch = jest.fn();

const renderDashboard = () => render(
  <MemoryRouter>
    <AdminDashBoard />
  </MemoryRouter>
);

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders admin dashboard heading', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });
    renderDashboard();
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  test('renders three columns', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });
    renderDashboard();
    expect(screen.getByText('New Jobs')).toBeInTheDocument();
    expect(screen.getByText('Approved Jobs')).toBeInTheDocument();
    expect(screen.getByText('Rejected Jobs')).toBeInTheDocument();
  });

  test('shows No jobs when empty', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([])
    });
    renderDashboard();
    await waitFor(() => {
      const noJobsElements = screen.getAllByText('No jobs');
      expect(noJobsElements.length).toBe(3);
    });
  });

  test('renders pending jobs in New Jobs column', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, title: 'IT Learnership', status: 'pending', location: 'JHB', stipend: 'R3500' }
      ])
    });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('IT Learnership')).toBeInTheDocument();
    });
  });

  test('renders approved jobs in Approved Jobs column', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { id: 2, title: 'Finance Internship', status: 'approved', location: 'Cape Town', stipend: 'R5000' }
      ])
    });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Finance Internship')).toBeInTheDocument();
    });
  });

  test('handles fetch error gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });
});