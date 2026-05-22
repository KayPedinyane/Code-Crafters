import React from 'react';
import { render, screen } from '@testing-library/react';
import ProfilePage from './ProfilePage';
import '@testing-library/jest-dom';
 
describe('ProfilePage Component - Complete Coverage', () => {
  describe('Rendering', () => {
    test('renders without crashing', () => {
      render(<ProfilePage />);
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });
 
    test('displays the correct heading', () => {
      render(<ProfilePage />);
      const heading = screen.getByRole('heading', { name: /My Profile/i });
      expect(heading).toBeInTheDocument();
    });
 
    test('heading is an h1 element', () => {
      render(<ProfilePage />);
      const heading = screen.getByRole('heading', { name: /My Profile/i });
      expect(heading.tagName).toBe('H1');
    });
 
    test('displays placeholder content', () => {
      render(<ProfilePage />);
      expect(screen.getByText('Profile content coming soon...')).toBeInTheDocument();
    });
 
    test('placeholder text is in a paragraph', () => {
      render(<ProfilePage />);
      const paragraph = screen.getByText('Profile content coming soon...');
      expect(paragraph.tagName).toBe('P');
    });
  });
 
  describe('Structure & Styling', () => {
    test('has profile-container class', () => {
      const { container } = render(<ProfilePage />);
      const profileDiv = container.querySelector('.profile-container');
      expect(profileDiv).toBeInTheDocument();
    });
 
    test('container wraps all content', () => {
      const { container } = render(<ProfilePage />);
      const profileDiv = container.querySelector('.profile-container');
      expect(profileDiv).toContainElement(screen.getByText('My Profile'));
      expect(profileDiv).toContainElement(screen.getByText('Profile content coming soon...'));
    });
 
    test('renders exactly 2 child elements (h1 and p)', () => {
      const { container } = render(<ProfilePage />);
      const profileDiv = container.querySelector('.profile-container');
      expect(profileDiv.children.length).toBe(2);
    });
  });
 
  describe('Content Accuracy', () => {
    test('heading text is exactly "My Profile"', () => {
      render(<ProfilePage />);
      expect(screen.getByText('My Profile')).toHaveTextContent('My Profile');
    });
 
    test('placeholder text is exactly "Profile content coming soon..."', () => {
      render(<ProfilePage />);
      expect(screen.getByText('Profile content coming soon...')).toHaveTextContent('Profile content coming soon...');
    });
 
    test('does not render any other text', () => {
      const { container } = render(<ProfilePage />);
      const text = container.textContent;
      expect(text).toBe('My ProfileProfile content coming soon...');
    });
  });
 
  describe('Accessibility', () => {
    test('has exactly one heading', () => {
      render(<ProfilePage />);
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(1);
    });
 
    test('heading is accessible by role', () => {
      render(<ProfilePage />);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
    });
 
    test('content is visible', () => {
      render(<ProfilePage />);
      expect(screen.getByText('My Profile')).toBeVisible();
      expect(screen.getByText('Profile content coming soon...')).toBeVisible();
    });
  });
 
  describe('Edge Cases', () => {
    test('renders consistently on multiple renders', () => {
      const { rerender } = render(<ProfilePage />);
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      
      rerender(<ProfilePage />);
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Profile content coming soon...')).toBeInTheDocument();
    });
 
    test('does not crash with empty props', () => {
      expect(() => render(<ProfilePage />)).not.toThrow();
    });
 
    test('component exports correctly', () => {
      expect(ProfilePage).toBeDefined();
      expect(typeof ProfilePage).toBe('function');
    });
  });
 
  describe('DOM Structure', () => {
    test('root element is a div', () => {
      const { container } = render(<ProfilePage />);
      const rootElement = container.firstChild;
      expect(rootElement.tagName).toBe('DIV');
    });
 
    test('root div has correct class', () => {
      const { container } = render(<ProfilePage />);
      const rootElement = container.firstChild;
      expect(rootElement.className).toBe('profile-container');
    });
 
    test('h1 comes before p in DOM order', () => {
      const { container } = render(<ProfilePage />);
      const profileDiv = container.querySelector('.profile-container');
      const firstChild = profileDiv.children[0];
      const secondChild = profileDiv.children[1];
      
      expect(firstChild.tagName).toBe('H1');
      expect(secondChild.tagName).toBe('P');
    });
  });
 
  describe('Component Type', () => {
    
    test('returns valid JSX', () => {
      const result = ProfilePage();
      expect(result).toBeTruthy();
      expect(result.type).toBe('div');
    });
  });
 
  describe('Snapshot Testing', () => {
    test('matches snapshot', () => {
      const { container } = render(<ProfilePage />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});