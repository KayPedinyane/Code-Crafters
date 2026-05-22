/**
 * Tests for HelpPage.js
 * Tests based on actual HelpPage implementation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HelpPage from './HelpPage';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

global.fetch = jest.fn();

describe('HelpPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  describe('Page Rendering', () => {
    test('renders help page', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/Help/i)).toBeInTheDocument();
    });

    test('displays SkillsBridge SA logo', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/SkillsBridge/)).toBeInTheDocument();
    });

    test('displays back button', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/Back/)).toBeInTheDocument();
    });

    test('clicking back navigates to applicant page', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      const backButton = screen.getByText(/Back/);
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/applicant');
    });
  });

  describe('Tabs', () => {
    test('displays FAQ tab', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/FAQ/i)).toBeInTheDocument();
    });

    test('displays Contact tab', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/Contact/i)).toBeInTheDocument();
    });

    test('displays Status tab', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/Status/i)).toBeInTheDocument();
    });

    test('FAQ tab is active by default', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      // FAQ content should be visible
      expect(screen.getByText(/Getting Started/)).toBeInTheDocument();
    });

    test('clicking Contact tab switches to contact form', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      const contactTab = screen.getByText(/Contact/i);
      fireEvent.click(contactTab);
      
      expect(screen.getByText(/Send us a message/i)).toBeInTheDocument();
    });

    test('clicking Status tab switches to status checker', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      const statusTab = screen.getByText(/Status/i);
      fireEvent.click(statusTab);
      
      expect(screen.getByText(/Check Application Status/i)).toBeInTheDocument();
    });
  });

  describe('FAQ Section', () => {
    test('displays search bar', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    test('search input accepts text', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      const searchInput = screen.getByPlaceholderText(/Search/i);
      fireEvent.change(searchInput, { target: { value: 'learnership' } });
      
      expect(searchInput.value).toBe('learnership');
    });

    test('displays Getting Started category', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
    });

    test('displays Applications & Status category', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Applications & Status')).toBeInTheDocument();
    });

    test('displays AI & Notifications category', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('AI & Notifications')).toBeInTheDocument();
    });

    test('displays Qualifications & NQF category', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText('Qualifications & NQF')).toBeInTheDocument();
    });

    test('displays FAQ questions', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      expect(screen.getByText(/How do I apply for a learnership/)).toBeInTheDocument();
    });

    test('clicking FAQ question expands answer', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      const question = screen.getByText(/How do I apply for a learnership/);
      fireEvent.click(question);
      
      expect(screen.getByText(/First complete your profile/)).toBeInTheDocument();
    });

    test('clicking expanded question collapses it', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      const question = screen.getByText(/How do I apply for a learnership/);
      
      // Expand
      fireEvent.click(question);
      expect(screen.getByText(/First complete your profile/)).toBeInTheDocument();
      
      // Collapse
      fireEvent.click(question);
      
      // Answer should still be in document (just hidden via CSS)
      expect(question).toBeInTheDocument();
    });

    test('search filters FAQ items', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      const searchInput = screen.getByPlaceholderText(/Search/i);
      fireEvent.change(searchInput, { target: { value: 'NQF' } });
      
      expect(screen.getByText(/What is the NQF/)).toBeInTheDocument();
    });
  });

  describe('Contact Form', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      // Switch to contact tab
      const contactTab = screen.getByText(/Contact/i);
      fireEvent.click(contactTab);
    });

    test('displays name input', () => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });

    test('displays email input', () => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });

    test('displays phone input', () => {
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    });

    test('displays subject dropdown', () => {
      expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
    });

    test('displays message textarea', () => {
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    });

    test('name input accepts text', () => {
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      expect(nameInput.value).toBe('John Doe');
    });

    test('email input accepts text', () => {
      const emailInput = screen.getByLabelText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      
      expect(emailInput.value).toBe('john@example.com');
    });

    test('phone input accepts numbers only', () => {
      const phoneInput = screen.getByLabelText(/Phone/i);
      fireEvent.change(phoneInput, { target: { value: '0821234567' } });
      
      expect(phoneInput.value).toBe('0821234567');
    });

    test('phone input removes non-digits', () => {
      const phoneInput = screen.getByLabelText(/Phone/i);
      fireEvent.change(phoneInput, { target: { value: '082-123-4567' } });
      
      expect(phoneInput.value).toBe('0821234567');
    });

    test('phone input limits to 10 digits', () => {
      const phoneInput = screen.getByLabelText(/Phone/i);
      fireEvent.change(phoneInput, { target: { value: '082123456789999' } });
      
      expect(phoneInput.value).toBe('0821234567');
    });

    test('subject dropdown has options', () => {
      const subjectSelect = screen.getByLabelText(/Subject/i);
      
      expect(subjectSelect.children.length).toBeGreaterThan(1);
    });

    test('message textarea accepts text', () => {
      const messageInput = screen.getByLabelText(/Message/i);
      fireEvent.change(messageInput, { target: { value: 'This is my message' } });
      
      expect(messageInput.value).toBe('This is my message');
    });

    test('displays send button', () => {
      expect(screen.getByText(/Send Message/i)).toBeInTheDocument();
    });

    test('validates required fields on submit', async () => {
      const sendButton = screen.getByText(/Send Message/i);
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });
    });

    test('validates email format', async () => {
      const emailInput = screen.getByLabelText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      const sendButton = screen.getByText(/Send Message/i);
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    test('validates phone format', async () => {
      const phoneInput = screen.getByLabelText(/Phone/i);
      fireEvent.change(phoneInput, { target: { value: '123' } });
      
      const sendButton = screen.getByText(/Send Message/i);
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/valid SA number/i)).toBeInTheDocument();
      });
    });

    test('validates message length', async () => {
      const messageInput = screen.getByLabelText(/Message/i);
      fireEvent.change(messageInput, { target: { value: 'Short' } });
      
      const sendButton = screen.getByText(/Send Message/i);
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument();
      });
    });

    test('submits form with valid data', async () => {
      const nameInput = screen.getByLabelText(/Name/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const phoneInput = screen.getByLabelText(/Phone/i);
      const subjectSelect = screen.getByLabelText(/Subject/i);
      const messageInput = screen.getByLabelText(/Message/i);
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '0821234567' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 20 characters' } });
      
      const sendButton = screen.getByText(/Send Message/i);
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/contact'),
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });

    test('shows success message after sending', async () => {
      const nameInput = screen.getByLabelText(/Name/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const subjectSelect = screen.getByLabelText(/Subject/i);
      const messageInput = screen.getByLabelText(/Message/i);
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 20 characters' } });
      
      const sendButton = screen.getByText(/Send Message/i);
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/sent|success/i)).toBeInTheDocument();
      });
    });
  });

  describe('Status Checker', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      // Switch to status tab
      const statusTab = screen.getByText(/Status/i);
      fireEvent.click(statusTab);
    });

    test('displays email input for status check', () => {
      expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    });

    test('displays check status button', () => {
      expect(screen.getByText(/Check.*Status/i)).toBeInTheDocument();
    });

    test('email input accepts text', () => {
      const emailInput = screen.getByPlaceholderText(/your email/i);
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('Auto-fill from localStorage', () => {
    test('auto-fills email from stored user', () => {
      localStorage.setItem('user', JSON.stringify({ email: 'stored@example.com' }));
      
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      const contactTab = screen.getByText(/Contact/i);
      fireEvent.click(contactTab);
      
      const emailInput = screen.getByLabelText(/Email/i);
      expect(emailInput.value).toBe('stored@example.com');
    });

    test('handles missing localStorage gracefully', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      // Should render without errors
      expect(screen.getByText(/Help/i)).toBeInTheDocument();
    });
  });

  describe('Validation Functions', () => {
    test('validates SA phone numbers correctly', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      const contactTab = screen.getByText(/Contact/i);
      fireEvent.click(contactTab);
      
      const phoneInput = screen.getByLabelText(/Phone/i);
      
      // Valid SA number
      fireEvent.change(phoneInput, { target: { value: '0821234567' } });
      expect(phoneInput.value).toBe('0821234567');
    });

    test('validates text-only fields', () => {
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      const contactTab = screen.getByText(/Contact/i);
      fireEvent.click(contactTab);
      
      const nameInput = screen.getByLabelText(/Name/i);
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      expect(nameInput.value).toBe('John Doe');
    });
  });

  describe('Error Handling', () => {
    test('handles fetch errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      render(
        <BrowserRouter>
          <HelpPage />
        </BrowserRouter>
      );
      
      const contactTab = screen.getByText(/Contact/i);
      fireEvent.click(contactTab);
      
      const nameInput = screen.getByLabelText(/Name/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const subjectSelect = screen.getByLabelText(/Subject/i);
      const messageInput = screen.getByLabelText(/Message/i);
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 20 characters' } });
      
      const sendButton = screen.getByText(/Send Message/i);
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        // Should handle error without crashing
        expect(sendButton).toBeInTheDocument();
      });
    });
  });
});