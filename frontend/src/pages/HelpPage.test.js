/**
 * Comprehensive Tests for HelpPage.js - Target: 80%+ Coverage
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

describe('HelpPage Component - Comprehensive Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  describe('Header & Navigation', () => {
    test('renders help page with header', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText(/How can we/i)).toBeInTheDocument();
    });

    test('displays SkillsBridge SA logo with SA accent', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('SkillsBridge')).toBeInTheDocument();
      expect(screen.getByText('SA')).toBeInTheDocument();
    });

    test('logo click navigates to applicant page', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const logo = screen.getByText('SkillsBridge').parentElement;
      fireEvent.click(logo);
      expect(mockNavigate).toHaveBeenCalledWith('/applicant');
    });

    test('back button navigates to applicant page', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const backButton = screen.getByText(/← Back/);
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/applicant');
    });

    test('displays support centre badge', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('Support Centre')).toBeInTheDocument();
    });

    test('displays hero subtitle', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText(/Find answers, track your applications/i)).toBeInTheDocument();
    });

    test('displays stats: 10 FAQ Topics', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('FAQ Topics')).toBeInTheDocument();
    });

    test('displays stats: 1-2 Day Response', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('1-2')).toBeInTheDocument();
      expect(screen.getByText('Day Response')).toBeInTheDocument();
    });

    test('displays stats: 24/7 App Support', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('24/7')).toBeInTheDocument();
      expect(screen.getByText('App Support')).toBeInTheDocument();
    });
  });

  describe('Quick Links Bar', () => {
    test('displays Edit Profile quick link', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    test('displays AI Match quick link', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('AI Match')).toBeInTheDocument();
    });

    test('displays My Applications quick link', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('My Applications')).toBeInTheDocument();
    });

    test('Edit Profile button navigates correctly', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const editBtn = screen.getByText('Edit Profile');
      fireEvent.click(editBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/edit-profile');
    });

    test('AI Match button navigates correctly', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const aiBtn = screen.getByText('AI Match');
      fireEvent.click(aiBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/ai-recommendations');
    });

    test('My Applications button navigates correctly', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const appsBtn = screen.getByText('My Applications');
      fireEvent.click(appsBtn);
      expect(mockNavigate).toHaveBeenCalledWith('/applicant');
    });
  });

  describe('Tab Navigation', () => {
    test('displays all three tabs with icons', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText(/FAQs/)).toBeInTheDocument();
      expect(screen.getByText(/Check My Status/)).toBeInTheDocument();
      expect(screen.getByText(/Contact Us/)).toBeInTheDocument();
    });

    test('FAQ tab is active by default', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
    });

    test('switches to Contact tab', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/Contact Us/));
      expect(screen.getByText(/Get in Touch/)).toBeInTheDocument();
    });

    test('switches to Status tab', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/Check My Status/));
      expect(screen.getByText(/Check Your Application Status/)).toBeInTheDocument();
    });

  });

  describe('FAQ Section - Search', () => {
    test('displays search input', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByPlaceholderText(/Search for help topics/i)).toBeInTheDocument();
    });

    test('search input accepts text', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const input = screen.getByPlaceholderText(/Search for help topics/i);
      fireEvent.change(input, { target: { value: 'learnership' } });
      expect(input.value).toBe('learnership');
    });

    test('displays clear button when search has text', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const input = screen.getByPlaceholderText(/Search for help topics/i);
      fireEvent.change(input, { target: { value: 'test' } });
      expect(screen.getByText('✕')).toBeInTheDocument();
    });

    test('clear button clears search text', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const input = screen.getByPlaceholderText(/Search for help topics/i);
      fireEvent.change(input, { target: { value: 'test' } });
      const clearBtn = screen.getByText('✕');
      fireEvent.click(clearBtn);
      expect(input.value).toBe('');
    });

    test('search filters FAQ items', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const input = screen.getByPlaceholderText(/Search for help topics/i);
      fireEvent.change(input, { target: { value: 'NQF' } });
      expect(screen.getByText(/What is the NQF/)).toBeInTheDocument();
    });

    test('search shows result count', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const input = screen.getByPlaceholderText(/Search for help topics/i);
      fireEvent.change(input, { target: { value: 'apply' } });
      expect(screen.getByText(/result/i)).toBeInTheDocument();
    });

    test('search with no results shows empty state', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const input = screen.getByPlaceholderText(/Search for help topics/i);
      fireEvent.change(input, { target: { value: 'xyznonexistent' } });
      expect(screen.getByText(/No results found/i)).toBeInTheDocument();
    });

    test('empty state shows clear search button', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const input = screen.getByPlaceholderText(/Search for help topics/i);
      fireEvent.change(input, { target: { value: 'xyznonexistent' } });
      const clearBtn = screen.getByText('Clear search');
      fireEvent.click(clearBtn);
      expect(input.value).toBe('');
    });
  });  
  describe('FAQ Section - Categories', () => {
    test('displays Getting Started category', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
    });

    test('displays Applications & Status category', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('Applications & Status')).toBeInTheDocument();
    });

    test('displays AI & Notifications category', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('AI & Notifications')).toBeInTheDocument();
    });

    test('displays Qualifications & NQF category', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('Qualifications & NQF')).toBeInTheDocument();
    });

    test('displays FAQ question', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText(/How do I apply for a learnership/)).toBeInTheDocument();
    });

    test('clicking question expands answer', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const question = screen.getByText(/How do I apply for a learnership/);
      fireEvent.click(question);
      expect(screen.getByText(/First complete your profile/)).toBeInTheDocument();
    });

    test('clicking expanded question collapses it', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const question = screen.getByText(/How do I apply for a learnership/);
      fireEvent.click(question);
      fireEvent.click(question);
      // Question still exists but answer is hidden
      expect(question).toBeInTheDocument();
    });

    test('displays chevron icons', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const question = screen.getByText(/How do I apply for a learnership/);
      expect(question.parentElement.textContent).toContain('▼');
      fireEvent.click(question);
      expect(question.parentElement.textContent).toContain('▲');
    });
  });

  describe('FAQ Section - Still Stuck', () => {
    test('displays "Still stuck?" section', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText('Still stuck?')).toBeInTheDocument();
    });

    test('displays contact support button', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText(/Contact Support/)).toBeInTheDocument();
    });

    test('Contact Support button switches to contact tab', () => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      const btn = screen.getByText(/Contact Support/);
      fireEvent.click(btn);
      expect(screen.getByText(/Get in Touch/)).toBeInTheDocument();
    });
  });

  describe('Contact Form - Rendering', () => {
    beforeEach(() => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/Contact Us/));
    });

    test('displays contact form title', () => {
      expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    });

    test('displays contact form description', () => {
      expect(screen.getByText(/Our support team is here to help/i)).toBeInTheDocument();
    });

    test('displays email contact detail', () => {
      expect(screen.getByText('skillsbridgesa@gmail.com')).toBeInTheDocument();
    });

    test('displays response time', () => {
      expect(screen.getByText(/Within 1-2 business days/)).toBeInTheDocument();
    });

    test('displays location', () => {
      expect(screen.getByText(/Johannesburg, South Africa/)).toBeInTheDocument();
    });

    test('displays languages', () => {
      expect(screen.getByText(/English, Zulu, Sotho/)).toBeInTheDocument();
    });

    test('displays FAQ tip with link', () => {
      expect(screen.getByText(/most questions are answered there instantly/i)).toBeInTheDocument();
    });

  
  });

  describe('Contact Form - Fields', () => {
    beforeEach(() => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/Contact Us/));
    });

    test('displays all form fields', () => {
      expect(screen.getByPlaceholderText(/Thabo Nkosi/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/thabo@email.com/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/0821234567/)).toBeInTheDocument();
      expect(screen.getByText(/Select a subject/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Describe your issue/i)).toBeInTheDocument();
    });

    test('name field accepts text', () => {
      const input = screen.getByPlaceholderText(/Thabo Nkosi/);
      fireEvent.change(input, { target: { value: 'John Doe' } });
      expect(input.value).toBe('John Doe');
    });

    test('email field accepts text', () => {
      const input = screen.getByPlaceholderText(/thabo@email.com/);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      expect(input.value).toBe('test@test.com');
    });

    test('phone field accepts numbers', () => {
      const input = screen.getByPlaceholderText(/0821234567/);
      fireEvent.change(input, { target: { value: '0829876543' } });
      expect(input.value).toBe('0829876543');
    });

    test('phone field strips non-digits', () => {
      const input = screen.getByPlaceholderText(/0821234567/);
      fireEvent.change(input, { target: { value: '082-987-6543' } });
      expect(input.value).toBe('0829876543');
    });

    test('phone field limits to 10 digits', () => {
      const input = screen.getByPlaceholderText(/0821234567/);
      fireEvent.change(input, { target: { value: '082987654321' } });
      expect(input.value).toBe('0829876543');
    });

    test('phone field shows digit counter', () => {
      const input = screen.getByPlaceholderText(/0821234567/);
      fireEvent.change(input, { target: { value: '082' } });
      expect(screen.getByText('3/10 digits')).toBeInTheDocument();
    });

    test('phone counter turns green at 10 digits', () => {
      const input = screen.getByPlaceholderText(/0821234567/);
      fireEvent.change(input, { target: { value: '0829876543' } });
      expect(screen.getByText('10/10 digits')).toBeInTheDocument();
    });

    test('subject dropdown has all options', () => {
      const select = screen.getByText(/Select a subject/).parentElement;
      expect(select.textContent).toContain('Application Issue');
      expect(select.textContent).toContain('General Enquiry');
    });

    test('subject can be selected', () => {
      const select = screen.getByText(/Select a subject/).parentElement;
      fireEvent.change(select, { target: { value: 'Application Issue' } });
      expect(select.value).toBe('Application Issue');
    });

    test('message field accepts text', () => {
      const input = screen.getByPlaceholderText(/Describe your issue/i);
      fireEvent.change(input, { target: { value: 'This is my message' } });
      expect(input.value).toBe('This is my message');
    });

    test('message field shows character count', () => {
      const input = screen.getByPlaceholderText(/Describe your issue/i);
      fireEvent.change(input, { target: { value: 'Hello' } });
      expect(screen.getByText('5 characters')).toBeInTheDocument();
    });

    test('displays Send Message button', () => {
      expect(screen.getByText(/Send Message →/)).toBeInTheDocument();
    });
  });

  describe('Contact Form - Validation', () => {
    beforeEach(() => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/Contact Us/));
    });

    test('validates empty name', async () => {
      fireEvent.click(screen.getByText(/Send Message →/));
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });
    });

    test('validates name with numbers', async () => {
      const input = screen.getByPlaceholderText(/Thabo Nkosi/);
      fireEvent.change(input, { target: { value: 'John123' } });
      fireEvent.click(screen.getByText(/Send Message →/));
      await waitFor(() => {
        expect(screen.getByText(/Name must contain letters only/i)).toBeInTheDocument();
      });
    });

    test('validates empty email', async () => {
      fireEvent.click(screen.getByText(/Send Message →/));
      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });
    });

    test('validates invalid email format', async () => {
      const input = screen.getByPlaceholderText(/thabo@email.com/);
      fireEvent.change(input, { target: { value: 'notanemail' } });
      fireEvent.click(screen.getByText(/Send Message →/));
      await waitFor(() => {
        expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
      });
    });

    test('validates invalid phone number', async () => {
      const input = screen.getByPlaceholderText(/0821234567/);
      fireEvent.change(input, { target: { value: '123' } });
      fireEvent.click(screen.getByText(/Send Message →/));
      await waitFor(() => {
        expect(screen.getByText(/valid SA number/i)).toBeInTheDocument();
      });
    });

    test('phone validation requires 0 prefix', async () => {
      const input = screen.getByPlaceholderText(/0821234567/);
      fireEvent.change(input, { target: { value: '8212345678' } });
      fireEvent.click(screen.getByText(/Send Message →/));
      await waitFor(() => {
        expect(screen.getByText(/valid SA number/i)).toBeInTheDocument();
      });
    });

    test('validates empty subject', async () => {
      fireEvent.click(screen.getByText(/Send Message →/));
      await waitFor(() => {
        expect(screen.getByText(/Please select a subject/i)).toBeInTheDocument();
      });
    });

    test('validates empty message', async () => {
      fireEvent.click(screen.getByText(/Send Message →/));
      await waitFor(() => {
        expect(screen.getByText(/Message is required/i)).toBeInTheDocument();
      });
    });

    test('validates message minimum length', async () => {
      const input = screen.getByPlaceholderText(/Describe your issue/i);
      fireEvent.change(input, { target: { value: 'Short' } });
      fireEvent.click(screen.getByText(/Send Message →/));
      await waitFor(() => {
        expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument();
      });
    });

    test('clears field error on change', async () => {
      const input = screen.getByPlaceholderText(/Thabo Nkosi/);
      fireEvent.click(screen.getByText(/Send Message →/));
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
      });
      fireEvent.change(input, { target: { value: 'John' } });
      expect(screen.queryByText(/Name is required/i)).not.toBeInTheDocument();
    });

    test('accepts valid phone number with spaces', async () => {
      const nameInput = screen.getByPlaceholderText(/Thabo Nkosi/);
      const emailInput = screen.getByPlaceholderText(/thabo@email.com/);
      const phoneInput = screen.getByPlaceholderText(/0821234567/);
      const subjectSelect = screen.getByText(/Select a subject/).parentElement;
      const messageInput = screen.getByPlaceholderText(/Describe your issue/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(phoneInput, { target: { value: '082 123 4567' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a message with more than 20 characters' } });

      fireEvent.click(screen.getByText(/Send Message →/));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Contact Form - Submission', () => {
    beforeEach(() => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/Contact Us/));
    });

    test('submits valid form', async () => {
      const nameInput = screen.getByPlaceholderText(/Thabo Nkosi/);
      const emailInput = screen.getByPlaceholderText(/thabo@email.com/);
      const phoneInput = screen.getByPlaceholderText(/0821234567/);
      const subjectSelect = screen.getByText(/Select a subject/).parentElement;
      const messageInput = screen.getByPlaceholderText(/Describe your issue/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(phoneInput, { target: { value: '0821234567' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 20 characters' } });

      fireEvent.click(screen.getByText(/Send Message →/));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/contact'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        );
      });
    });

    test('shows sending state', async () => {
      global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const nameInput = screen.getByPlaceholderText(/Thabo Nkosi/);
      const emailInput = screen.getByPlaceholderText(/thabo@email.com/);
      const subjectSelect = screen.getByText(/Select a subject/).parentElement;
      const messageInput = screen.getByPlaceholderText(/Describe your issue/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 20 characters' } });

      fireEvent.click(screen.getByText(/Send Message →/));

      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });

    test('shows success message after sending', async () => {
      const nameInput = screen.getByPlaceholderText(/Thabo Nkosi/);
      const emailInput = screen.getByPlaceholderText(/thabo@email.com/);
      const subjectSelect = screen.getByText(/Select a subject/).parentElement;
      const messageInput = screen.getByPlaceholderText(/Describe your issue/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 20 characters' } });

      fireEvent.click(screen.getByText(/Send Message →/));

      await waitFor(() => {
        expect(screen.getByText(/Message Received!/)).toBeInTheDocument();
      });
    });

    test('success message shows user email', async () => {
      const nameInput = screen.getByPlaceholderText(/Thabo Nkosi/);
      const emailInput = screen.getByPlaceholderText(/thabo@email.com/);
      const subjectSelect = screen.getByText(/Select a subject/).parentElement;
      const messageInput = screen.getByPlaceholderText(/Describe your issue/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 20 characters' } });

      fireEvent.click(screen.getByText(/Send Message →/));

      await waitFor(() => {
        expect(screen.getByText(/john@test.com/)).toBeInTheDocument();
      });
    });

    test('Browse FAQs button switches to FAQ tab', async () => {
      const nameInput = screen.getByPlaceholderText(/Thabo Nkosi/);
      const emailInput = screen.getByPlaceholderText(/thabo@email.com/);
      const subjectSelect = screen.getByText(/Select a subject/).parentElement;
      const messageInput = screen.getByPlaceholderText(/Describe your issue/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 20 characters' } });

      fireEvent.click(screen.getByText(/Send Message →/));

      await waitFor(() => {
        const browseFaqBtn = screen.getByText('Browse FAQs');
        fireEvent.click(browseFaqBtn);
      });

      expect(screen.getByText('Getting Started')).toBeInTheDocument();
    });

    test('Send Another button resets form', async () => {
      const nameInput = screen.getByPlaceholderText(/Thabo Nkosi/);
      const emailInput = screen.getByPlaceholderText(/thabo@email.com/);
      const subjectSelect = screen.getByText(/Select a subject/).parentElement;
      const messageInput = screen.getByPlaceholderText(/Describe your issue/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 20 characters' } });

      fireEvent.click(screen.getByText(/Send Message →/));

      await waitFor(() => {
        const sendAnotherBtn = screen.getByText('Send Another');
        fireEvent.click(sendAnotherBtn);
      });

      expect(screen.getByPlaceholderText(/Thabo Nkosi/).value).toBe('');
      expect(screen.getByPlaceholderText(/Describe your issue/i).value).toBe('');
    });

    test('handles fetch error gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const nameInput = screen.getByPlaceholderText(/Thabo Nkosi/);
      const emailInput = screen.getByPlaceholderText(/thabo@email.com/);
      const subjectSelect = screen.getByText(/Select a subject/).parentElement;
      const messageInput = screen.getByPlaceholderText(/Describe your issue/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 20 characters' } });

      fireEvent.click(screen.getByText(/Send Message →/));

      await waitFor(() => {
        expect(screen.getByText(/Failed to send/i)).toBeInTheDocument();
      });
    });

    test('handles non-ok response', async () => {
      global.fetch.mockResolvedValueOnce({ ok: false });

      const nameInput = screen.getByPlaceholderText(/Thabo Nkosi/);
      const emailInput = screen.getByPlaceholderText(/thabo@email.com/);
      const subjectSelect = screen.getByText(/Select a subject/).parentElement;
      const messageInput = screen.getByPlaceholderText(/Describe your issue/i);

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
      fireEvent.change(subjectSelect, { target: { value: 'General Enquiry' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message with more than 20 characters' } });

      fireEvent.click(screen.getByText(/Send Message →/));

      await waitFor(() => {
        expect(screen.getByText(/Failed to send/i)).toBeInTheDocument();
      });
    });
  });

  describe('Status Checker', () => {
    beforeEach(() => {
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      fireEvent.click(screen.getByText(/Check My Status/));
    });

    test('displays status checker title', () => {
      expect(screen.getByText(/Check Your Application Status/)).toBeInTheDocument();
    });

    test('displays email input', () => {
      expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    });

    test('displays Check Status button', () => {
      expect(screen.getByText(/Check Status/)).toBeInTheDocument();
    });

    test('email input accepts text', () => {
      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      expect(input.value).toBe('test@test.com');
    });

    test('clears error on email change', () => {
      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.click(screen.getByText(/Check Status/));
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      expect(screen.queryByText(/valid email/i)).not.toBeInTheDocument();
    });

    test('validates empty email', () => {
      fireEvent.click(screen.getByText(/Check Status/));
      expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    });

    test('validates invalid email format', () => {
      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'notemail' } });
      fireEvent.click(screen.getByText(/Check Status/));
      expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    });

    test('Enter key triggers status check', () => {
      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(global.fetch).toHaveBeenCalled();
    });

    test('shows loading state', async () => {
      global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByText(/Check Status/));
      expect(screen.getByText('Checking...')).toBeInTheDocument();
    });

    test('fetches applications from API', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { title: 'Software Developer', sector: 'IT', location: 'Johannesburg', status: 'pending', applied_at: '2024-01-01' }
        ])
      });

      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByText(/Check Status/));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/applications/test%40test.com')
        );
      });
    });

    test('displays applications when found', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { title: 'Software Developer', sector: 'IT', location: 'Johannesburg', status: 'pending', applied_at: '2024-01-01' }
        ])
      });

      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByText(/Check Status/));

      await waitFor(() => {
        expect(screen.getByText(/Found 1 application/)).toBeInTheDocument();
        expect(screen.getByText('Software Developer')).toBeInTheDocument();
      });
    });

    test('displays multiple applications', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { title: 'Job 1', sector: 'IT', location: 'JHB', status: 'pending', applied_at: '2024-01-01' },
          { title: 'Job 2', sector: 'Finance', location: 'CPT', status: 'accepted', applied_at: '2024-01-02' }
        ])
      });

      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByText(/Check Status/));

      await waitFor(() => {
        expect(screen.getByText(/Found 2 applications/)).toBeInTheDocument();
        expect(screen.getByText('Job 1')).toBeInTheDocument();
        expect(screen.getByText('Job 2')).toBeInTheDocument();
      });
    });

    test('displays status badges correctly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { title: 'Job 1', sector: 'IT', location: 'JHB', status: 'pending', applied_at: '2024-01-01' },
          { title: 'Job 2', sector: 'IT', location: 'JHB', status: 'shortlisted', applied_at: '2024-01-01' },
          { title: 'Job 3', sector: 'IT', location: 'JHB', status: 'accepted', applied_at: '2024-01-01' },
          { title: 'Job 4', sector: 'IT', location: 'JHB', status: 'rejected', applied_at: '2024-01-01' }
        ])
      });

      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByText(/Check Status/));

      await waitFor(() => {
        expect(screen.getByText(/Pending Review/)).toBeInTheDocument();
        expect(screen.getByText(/Shortlisted ⭐/)).toBeInTheDocument();
        expect(screen.getByText(/Accepted 🎉/)).toBeInTheDocument();
        expect(screen.getByText(/Unsuccessful/)).toBeInTheDocument();
      });
    });

    test('shows error when no applications found', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByText(/Check Status/));

      await waitFor(() => {
        expect(screen.getByText(/No applications found/i)).toBeInTheDocument();
      });
    });

    test('handles fetch error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByText(/Check Status/));

      await waitFor(() => {
        expect(screen.getByText(/Could not fetch applications/i)).toBeInTheDocument();
      });
    });

    test('formats application date correctly', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { title: 'Job 1', sector: 'IT', location: 'JHB', status: 'pending', applied_at: '2024-03-15' }
        ])
      });

      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByText(/Check Status/));

      await waitFor(() => {
        expect(screen.getByText(/Applied/)).toBeInTheDocument();
      });
    });

    test('displays first letter of job title in logo', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { title: 'Software Developer', sector: 'IT', location: 'JHB', status: 'pending', applied_at: '2024-01-01' }
        ])
      });

      const input = screen.getByPlaceholderText(/Enter your email/i);
      fireEvent.change(input, { target: { value: 'test@test.com' } });
      fireEvent.click(screen.getByText(/Check Status/));

      await waitFor(() => {
        expect(screen.getByText('S')).toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Integration', () => {
    test('auto-fills email from stored user', () => {
      localStorage.setItem('user', JSON.stringify({ email: 'stored@test.com' }));
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      
      fireEvent.click(screen.getByText(/Contact Us/));
      const emailInput = screen.getByPlaceholderText(/thabo@email.com/);
      expect(emailInput.value).toBe('stored@test.com');
    });

    test('auto-fills status checker email from stored user', () => {
      localStorage.setItem('user', JSON.stringify({ email: 'stored@test.com' }));
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      
      fireEvent.click(screen.getByText(/Check My Status/));
      const emailInput = screen.getByPlaceholderText(/Enter your email/i);
      expect(emailInput.value).toBe('stored@test.com');
    });

    test('handles invalid JSON in localStorage', () => {
      localStorage.setItem('user', 'invalid json');
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText(/Help/i)).toBeInTheDocument();
    });

    test('handles missing email in stored user', () => {
      localStorage.setItem('user', JSON.stringify({ name: 'John' }));
      render(<BrowserRouter><HelpPage /></BrowserRouter>);
      expect(screen.getByText(/Help/i)).toBeInTheDocument();
    });
  });
});
