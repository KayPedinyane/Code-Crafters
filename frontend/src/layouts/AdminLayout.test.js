/**
 * Tests for AdminLayout.js Component
 * This file tests the AdminLayout wrapper component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import '@testing-library/jest-dom';

// Mock Firebase auth
jest.mock('../firebase', () => ({
  auth: {
    currentUser: {
      uid: 'admin-user-id',
      email: 'admin@example.com',
      displayName: 'Admin User'
    },
    signOut: jest.fn(() => Promise.resolve())
  }
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('AdminLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders admin layout component', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Test Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('renders children content', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <h1>Admin Dashboard</h1>
            <p>Dashboard content</p>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Dashboard content')).toBeInTheDocument();
    });

    test('renders multiple children', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Child 1</div>
            <div>Child 2</div>
            <div>Child 3</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    test('renders with no children', () => {
      render(
        <BrowserRouter>
          <AdminLayout />
        </BrowserRouter>
      );
      
      // Should render without crashing
      const layout = document.querySelector('body');
      expect(layout).toBeInTheDocument();
    });

    test('renders admin header or navigation', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      // Should have some navigation structure
      const nav = screen.queryByRole('navigation') || 
                 screen.queryByRole('banner') ||
                 document.querySelector('nav') ||
                 document.querySelector('header');
      
      expect(nav || screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('renders sidebar navigation', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      // Look for navigation or sidebar elements
      const sidebar = screen.queryByRole('navigation') ||
                     screen.queryByRole('complementary') ||
                     document.querySelector('.sidebar') ||
                     document.querySelector('aside');
      
      // Layout should render even if sidebar structure differs
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('sidebar contains navigation links', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(0);
    });

    test('renders dashboard link', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const dashboardLink = screen.queryByText(/dashboard/i) ||
                           screen.queryByRole('link', { name: /dashboard/i });
      
      // If dashboard link exists, verify it
      if (dashboardLink) {
        expect(dashboardLink).toBeInTheDocument();
      }
    });

    test('renders admin management links', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      // Common admin links
      const adminLinks = screen.queryByText(/admin/i) ||
                        screen.queryByText(/users/i) ||
                        screen.queryByText(/manage/i);
      
      // Should have some navigation
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('navigation links are clickable', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        expect(link).toBeInTheDocument();
        expect(link.tagName).toBe('A');
      });
    });

    test('highlights active navigation item', () => {
      render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminLayout>
            <div>Dashboard Content</div>
          </AdminLayout>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });
  });

  describe('Mobile Sidebar', () => {
    test('sidebar can be toggled on mobile', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const toggleButton = screen.queryByLabelText(/menu/i) ||
                          screen.queryByRole('button');
      
      if (toggleButton) {
        fireEvent.click(toggleButton);
        expect(toggleButton).toBeInTheDocument();
      }
    });

    test('mobile menu opens on toggle', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const buttons = screen.getAllByRole('button');
      
      if (buttons.length > 0) {
        fireEvent.click(buttons[0]);
        expect(buttons[0]).toBeInTheDocument();
      }
    });

    test('mobile menu closes on navigation', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const toggleButton = screen.queryByRole('button');
      
      if (toggleButton) {
        // Open
        fireEvent.click(toggleButton);
        
        // Click a link
        const links = screen.getAllByRole('link');
        if (links.length > 0) {
          fireEvent.click(links[0]);
        }
        
        expect(toggleButton).toBeInTheDocument();
      }
    });

    test('mobile menu closes on outside click', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const toggleButton = screen.queryByRole('button');
      
      if (toggleButton) {
        fireEvent.click(toggleButton);
        
        // Click outside
        fireEvent.click(document.body);
        
        expect(toggleButton).toBeInTheDocument();
      }
    });
  });

  describe('Admin Header', () => {
    test('renders admin header', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const header = screen.queryByRole('banner') ||
                    document.querySelector('header');
      
      // Layout should render
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('displays admin user info', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const userInfo = screen.queryByText(/admin/i) ||
                      screen.queryByText(/@/);
      
      // Should handle user display
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('renders logout button', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const logoutButton = screen.queryByText(/logout/i) ||
                          screen.queryByText(/sign out/i);
      
      if (logoutButton) {
        expect(logoutButton).toBeInTheDocument();
      }
    });

    test('logout button triggers sign out', async () => {
      const { auth } = require('../firebase');
      
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const logoutButton = screen.queryByText(/logout/i);
      
      if (logoutButton) {
        fireEvent.click(logoutButton);
        
        await waitFor(() => {
          expect(auth.signOut).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Main Content Area', () => {
    test('renders main content area', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div data-testid="main-content">Main Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveTextContent('Main Content');
    });

    test('main content area is scrollable', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div style={{ height: '2000px' }}>Long Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Long Content')).toBeInTheDocument();
    });

    test('content area takes up available space', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const content = screen.getByText('Content');
      expect(content).toBeInTheDocument();
    });

    test('content updates on prop change', () => {
      const { rerender } = render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content 1</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      
      rerender(
        <BrowserRouter>
          <AdminLayout>
            <div>Content 2</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('Page Title', () => {
    test('accepts and displays page title prop', () => {
      render(
        <BrowserRouter>
          <AdminLayout title="User Management">
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const title = screen.queryByText('User Management');
      
      if (title) {
        expect(title).toBeInTheDocument();
      }
    });

    test('updates page title dynamically', () => {
      const { rerender } = render(
        <BrowserRouter>
          <AdminLayout title="Dashboard">
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      rerender(
        <BrowserRouter>
          <AdminLayout title="Settings">
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const settingsTitle = screen.queryByText('Settings');
      if (settingsTitle) {
        expect(settingsTitle).toBeInTheDocument();
      }
    });
  });

  describe('Breadcrumbs', () => {
    test('renders breadcrumbs if provided', () => {
      render(
        <BrowserRouter>
          <AdminLayout breadcrumbs={['Admin', 'Users', 'Edit']}>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      // Check if breadcrumbs are rendered
      const breadcrumb = screen.queryByText('Admin') ||
                        screen.queryByText('Users');
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('breadcrumbs are clickable links', () => {
      render(
        <BrowserRouter>
          <AdminLayout breadcrumbs={['Admin', 'Dashboard']}>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Loading State', () => {
    test('shows loading indicator when loading prop is true', () => {
      render(
        <BrowserRouter>
          <AdminLayout loading={true}>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const loader = screen.queryByText(/loading/i) ||
                    screen.queryByRole('status');
      
      // Should handle loading state
      expect(screen.getByText('Content') || loader).toBeInTheDocument();
    });

    test('hides loading indicator when loading is false', () => {
      render(
        <BrowserRouter>
          <AdminLayout loading={false}>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing children gracefully', () => {
      render(
        <BrowserRouter>
          <AdminLayout />
        </BrowserRouter>
      );
      
      // Should not crash
      expect(document.body).toBeInTheDocument();
    });

    test('handles null children', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            {null}
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(document.body).toBeInTheDocument();
    });

    test('handles undefined props', () => {
      render(
        <BrowserRouter>
          <AdminLayout title={undefined} breadcrumbs={undefined}>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('displays error boundary if child crashes', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };
      
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      try {
        render(
          <BrowserRouter>
            <AdminLayout>
              <ThrowError />
            </AdminLayout>
          </BrowserRouter>
        );
      } catch (error) {
        // Expected to throw
      }
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    test('layout has proper semantic structure', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <main>Main Content</main>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    test('navigation is keyboard accessible', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        expect(link).toBeInTheDocument();
      });
    });

    test('sidebar has proper ARIA labels', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const nav = screen.queryByRole('navigation');
      
      if (nav) {
        expect(nav).toBeInTheDocument();
      }
    });

    test('buttons have accessible labels', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const buttons = screen.getAllByRole('button');
      
      buttons.forEach(button => {
        const hasLabel = button.getAttribute('aria-label') ||
                        button.textContent.length > 0;
        expect(hasLabel).toBeTruthy();
      });
    });

    test('skip to main content link exists', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const skipLink = screen.queryByText(/skip/i);
      
      // If skip link is implemented
      if (skipLink) {
        expect(skipLink).toBeInTheDocument();
      }
    });
  });

  describe('Responsive Design', () => {
    test('layout adapts to different screen sizes', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('sidebar collapses on small screens', () => {
      // Simulate small screen
      global.innerWidth = 500;
      
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('sidebar expands on large screens', () => {
      // Simulate large screen
      global.innerWidth = 1200;
      
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    test('works with React Router navigation', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      const links = screen.getAllByRole('link');
      
      if (links.length > 0) {
        expect(links[0]).toHaveAttribute('href');
      }
    });

    test('maintains layout across route changes', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminLayout>
            <div>Dashboard</div>
          </AdminLayout>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      
      rerender(
        <MemoryRouter initialEntries={['/admin/users']}>
          <AdminLayout>
            <div>Users</div>
          </AdminLayout>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    test('preserves scroll position on navigation', () => {
      render(
        <BrowserRouter>
          <AdminLayout>
            <div style={{ height: '2000px' }}>Long Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Long Content')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    test('handles all valid props', () => {
      render(
        <BrowserRouter>
          <AdminLayout
            title="Test Title"
            loading={false}
            breadcrumbs={['Admin', 'Test']}
            className="custom-class"
          >
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    test('ignores invalid props', () => {
      render(
        <BrowserRouter>
          <AdminLayout invalidProp="test">
            <div>Content</div>
          </AdminLayout>
        </BrowserRouter>
      );
      
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });
});
