/**
 * Tests for ReportSelector.js
 * Simple report type selector with 3 options
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReportSelector from './ReportSelector';

describe('ReportSelector Component', () => {
  const mockSetReport = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering ────────────────────────────────────────────────────────────

  test('renders all three report options', () => {
    render(<ReportSelector report="volume" setReport={mockSetReport} />);
    
    expect(screen.getByText('Application Volume')).toBeInTheDocument();
    expect(screen.getByText('Sector Success Rates')).toBeInTheDocument();
    expect(screen.getByText('Custom View')).toBeInTheDocument();
  });

  test('renders three buttons', () => {
    render(<ReportSelector report="volume" setReport={mockSetReport} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  // ─── Active State ─────────────────────────────────────────────────────────

  test('highlights volume button when volume is selected', () => {
    render(<ReportSelector report="volume" setReport={mockSetReport} />);
    
    const volumeBtn = screen.getByText('Application Volume');
    expect(volumeBtn).toHaveStyle({ background: '#00c853', color: 'white' });
  });

  test('highlights success button when success is selected', () => {
    render(<ReportSelector report="success" setReport={mockSetReport} />);
    
    const successBtn = screen.getByText('Sector Success Rates');
    expect(successBtn).toHaveStyle({ background: '#00c853', color: 'white' });
  });

  test('highlights custom button when custom is selected', () => {
    render(<ReportSelector report="custom" setReport={mockSetReport} />);
    
    const customBtn = screen.getByText('Custom View');
    expect(customBtn).toHaveStyle({ background: '#00c853', color: 'white' });
  });

  test('non-selected buttons have gray background', () => {
    render(<ReportSelector report="volume" setReport={mockSetReport} />);
    
    const successBtn = screen.getByText('Sector Success Rates');
    const customBtn = screen.getByText('Custom View');
    
    expect(successBtn).toHaveStyle({ background: '#e0e0e0', color: '#333' });
    expect(customBtn).toHaveStyle({ background: '#e0e0e0', color: '#333' });
  });

  // ─── Click Handlers ───────────────────────────────────────────────────────

  test('calls setReport with "volume" when Application Volume clicked', () => {
    render(<ReportSelector report="success" setReport={mockSetReport} />);
    
    const volumeBtn = screen.getByText('Application Volume');
    fireEvent.click(volumeBtn);
    
    expect(mockSetReport).toHaveBeenCalledWith('volume');
    expect(mockSetReport).toHaveBeenCalledTimes(1);
  });

  test('calls setReport with "success" when Sector Success Rates clicked', () => {
    render(<ReportSelector report="volume" setReport={mockSetReport} />);
    
    const successBtn = screen.getByText('Sector Success Rates');
    fireEvent.click(successBtn);
    
    expect(mockSetReport).toHaveBeenCalledWith('success');
    expect(mockSetReport).toHaveBeenCalledTimes(1);
  });

  test('calls setReport with "custom" when Custom View clicked', () => {
    render(<ReportSelector report="volume" setReport={mockSetReport} />);
    
    const customBtn = screen.getByText('Custom View');
    fireEvent.click(customBtn);
    
    expect(mockSetReport).toHaveBeenCalledWith('custom');
    expect(mockSetReport).toHaveBeenCalledTimes(1);
  });

  test('clicking same button still calls setReport', () => {
    render(<ReportSelector report="volume" setReport={mockSetReport} />);
    
    const volumeBtn = screen.getByText('Application Volume');
    fireEvent.click(volumeBtn);
    
    expect(mockSetReport).toHaveBeenCalledWith('volume');
  });

  // ─── Multiple Clicks ──────────────────────────────────────────────────────

  test('handles multiple clicks on different buttons', () => {
    render(<ReportSelector report="volume" setReport={mockSetReport} />);
    
    fireEvent.click(screen.getByText('Sector Success Rates'));
    fireEvent.click(screen.getByText('Custom View'));
    fireEvent.click(screen.getByText('Application Volume'));
    
    expect(mockSetReport).toHaveBeenCalledTimes(3);
    expect(mockSetReport).toHaveBeenNthCalledWith(1, 'success');
    expect(mockSetReport).toHaveBeenNthCalledWith(2, 'custom');
    expect(mockSetReport).toHaveBeenNthCalledWith(3, 'volume');
  });

  // ─── Edge Cases ───────────────────────────────────────────────────────────

  test('handles undefined report prop', () => {
    render(<ReportSelector report={undefined} setReport={mockSetReport} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toHaveStyle({ background: '#e0e0e0' });
    });
  });

  test('handles null report prop', () => {
    render(<ReportSelector report={null} setReport={mockSetReport} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toHaveStyle({ background: '#e0e0e0' });
    });
  });

  test('handles empty string report prop', () => {
    render(<ReportSelector report="" setReport={mockSetReport} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toHaveStyle({ background: '#e0e0e0' });
    });
  });

  test('handles invalid report value', () => {
    render(<ReportSelector report="invalid" setReport={mockSetReport} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toHaveStyle({ background: '#e0e0e0' });
    });
  });
});