/**
 * Tests for AboutPage.js
 * Tests based on actual AboutPage implementation
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AboutPage from './AboutPage';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('AboutPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Rendering', () => {
    test('renders about page', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/About/)).toBeInTheDocument();
    });

    test('displays SkillsBridge SA title', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('SA')).toBeInTheDocument();
    });

    test('displays South Africa badge', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/Made for South Africa/)).toBeInTheDocument();
    });

    test('displays subtitle', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/Connecting South African youth/)).toBeInTheDocument();
    });
  });

  describe('Header Navigation', () => {
    test('displays logo', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      const logos = screen.getAllByText(/SkillsBridge/);
      expect(logos.length).toBeGreaterThanOrEqual(1);
    });

    test('clicking logo navigates to applicant page', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      const logo = document.querySelector('.logo');
      fireEvent.click(logo);
      
      expect(mockNavigate).toHaveBeenCalledWith('/applicant');
    });
  });

  describe('Mission Section', () => {
    test('displays mission heading', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Our Mission')).toBeInTheDocument();
    });

    test('displays mission description', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/youth unemployment challenge/)).toBeInTheDocument();
    });


    test('mentions NQF alignment', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/National Qualifications Framework/)).toBeInTheDocument();
    });
  });

  describe('Feature Cards', () => {
    test('displays NQF-Aligned card', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('NQF-Aligned')).toBeInTheDocument();
    });

    test('displays AI-Powered card', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('AI-Powered')).toBeInTheDocument();
    });

    test('displays Real-Time Alerts card', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Real-Time Alerts')).toBeInTheDocument();
    });

    test('displays Secure & Private card', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Secure & Private')).toBeInTheDocument();
    });

    test('AI card mentions smart matching', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/smart matching engine/)).toBeInTheDocument();
    });

    test('Alerts card mentions notifications', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/application status changes/)).toBeInTheDocument();
    });
    test('all feature cards have icons', () => {
      const { container } = render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      const icons = container.querySelectorAll('.about-card-icon');
      expect(icons.length).toBe(4);
    });
  });

  describe('Team Section', () => {
    test('displays team heading', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Built By')).toBeInTheDocument();
    });

    test('displays team description', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/Code-Crafters team/)).toBeInTheDocument();
    });

    test('mentions University of the Witwatersrand', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/University of the Witwatersrand/)).toBeInTheDocument();
    });

    test('displays Mlungisi Mahlangu', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Mlungisi Mahlangu')).toBeInTheDocument();
      expect(screen.getByText(/Applicant Features & AI/)).toBeInTheDocument();
    });

    test('displays Zandile Mkontwana', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Zandile Mkontwana')).toBeInTheDocument();
      expect(screen.getByText(/Admin Features/)).toBeInTheDocument();
    });

    test('displays Ronie Hokwana', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Ronie Hokwana')).toBeInTheDocument();
      expect(screen.getByText(/Provider Features/)).toBeInTheDocument();
    });

    test('displays Kutloano Diale', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Kutloano Diale')).toBeInTheDocument();
      expect(screen.getByText(/Login & Authentication/)).toBeInTheDocument();
    });

    test('displays Kamogelo Pedinyane', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Kamogelo Pedinyane')).toBeInTheDocument();
      expect(screen.getByText(/Backend & Infrastructure/)).toBeInTheDocument();
    });

    test('displays all 5 team members', () => {
      const { container } = render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      const teamMembers = container.querySelectorAll('.about-team-member');
      expect(teamMembers.length).toBe(5);
    });

    test('each team member has avatar with initial', () => {
      const { container } = render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      const avatars = container.querySelectorAll('.about-team-avatar');
      expect(avatars.length).toBe(5);
      expect(avatars[0].textContent).toBe('M');
    });
  });

  describe('Version & Legal Section', () => {
    test('displays version heading', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Version & Legal')).toBeInTheDocument();
    });

    test('displays version number', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Version')).toBeInTheDocument();
      expect(screen.getByText('1.0.0')).toBeInTheDocument();
    });

    test('displays release date', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Released')).toBeInTheDocument();
      expect(screen.getByText('22 May 2026')).toBeInTheDocument();
    });

    test('displays platform information', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Platform')).toBeInTheDocument();
      expect(screen.getByText(/Vercel.*Render/)).toBeInTheDocument();
    });

    test('displays contact email', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('skillsbridgesa@gmail.com')).toBeInTheDocument();
    });

    test('displays data sources', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Data Source')).toBeInTheDocument();
      expect(screen.getByText(/SAQA.*Stats SA/)).toBeInTheDocument();
    });

    test('displays compliance information', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Compliance')).toBeInTheDocument();
      expect(screen.getByText(/POPIA.*NQF Act/)).toBeInTheDocument();
    });

    test('displays all 6 meta items', () => {
      const { container } = render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      const metaItems = container.querySelectorAll('.about-meta-item');
      expect(metaItems.length).toBe(6);
    });
  });

  describe('Layout & Structure', () => {
    test('has about-wrapper container', () => {
      const { container } = render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(container.querySelector('.about-wrapper')).toBeInTheDocument();
    });

    test('has header section', () => {
      const { container } = render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(container.querySelector('.about-header')).toBeInTheDocument();
    });

    test('has hero section', () => {
      const { container } = render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(container.querySelector('.about-hero')).toBeInTheDocument();
    });

    test('has content section', () => {
      const { container } = render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      expect(container.querySelector('.about-content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('logo has cursor pointer style', () => {
      const { container } = render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      const logo = container.querySelector('.logo');
      expect(logo).toHaveStyle({ cursor: 'pointer' });
    });

    test('page has proper heading structure', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
    });

    test('section headings are h2 elements', () => {
      render(
        <BrowserRouter>
          <AboutPage />
        </BrowserRouter>
      );
      
      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });
  });
});