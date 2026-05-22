/**
 * Tests for ExportButtons.js - CSV Export Only
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock jsPDF - just prevent errors
jest.mock('jspdf', () => jest.fn());
jest.mock('jspdf-autotable', () => jest.fn());

import ExportButtons from './ExportButtons';

// Mock browser APIs
global.alert = jest.fn();
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.Blob = jest.fn();

describe('ExportButtons Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Rendering ────────────────────────────────────────────────────────────

  test('renders both buttons', () => {
    render(<ExportButtons data={[]} />);
    
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });

  test('buttons have correct count', () => {
    render(<ExportButtons data={[]} />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  // ─── CSV Export - Empty Data ──────────────────────────────────────────────

  test('shows alert when exporting CSV with no data', () => {
    render(<ExportButtons data={[]} />);
    
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(global.alert).toHaveBeenCalledWith('No data to export');
  });

  test('shows alert when data is undefined', () => {
    render(<ExportButtons />);
    
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(global.alert).toHaveBeenCalledWith('No data to export');
  });

  test('does not create blob when data is empty', () => {
    render(<ExportButtons data={[]} />);
    
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(global.Blob).not.toHaveBeenCalled();
  });

  // ─── CSV Export - With Data ───────────────────────────────────────────────

  test('creates blob for CSV with data', () => {
    const testData = [{ name: 'John', age: 30 }];
    
    render(<ExportButtons data={testData} />);
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(global.Blob).toHaveBeenCalled();
  });

  test('creates object URL', () => {
    const testData = [{ name: 'John' }];
    
    render(<ExportButtons data={testData} />);
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(global.URL.createObjectURL).toHaveBeenCalled();
  });

  test('exports CSV with multiple rows', () => {
    const testData = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 }
    ];
    
    render(<ExportButtons data={testData} />);
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(global.Blob).toHaveBeenCalled();
  });

  test('handles null values in CSV', () => {
    const testData = [{ name: 'John', age: null }];
    
    render(<ExportButtons data={testData} />);
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(global.Blob).toHaveBeenCalled();
  });

  test('handles undefined values in CSV', () => {
    const testData = [{ name: 'John', age: undefined }];
    
    render(<ExportButtons data={testData} />);
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(global.Blob).toHaveBeenCalled();
  });

  // ─── PDF Export - Empty Data ──────────────────────────────────────────────

  test('shows alert when exporting PDF with no data', () => {
    render(<ExportButtons data={[]} />);
    
    fireEvent.click(screen.getByText('Export PDF'));
    
    expect(global.alert).toHaveBeenCalledWith('No data to export');
  });

  // ─── Button Styling ───────────────────────────────────────────────────────

  test('CSV button has green background', () => {
    render(<ExportButtons data={[]} />);
    
    const csvBtn = screen.getByText('Export CSV');
    expect(csvBtn).toHaveStyle({
      backgroundColor: '#00c853',
      color: '#ffffff'
    });
  });

  test('PDF button has blue background', () => {
    render(<ExportButtons data={[]} />);
    
    const pdfBtn = screen.getByText('Export PDF');
    expect(pdfBtn).toHaveStyle({
      backgroundColor: '#2196f3',
      color: '#ffffff'
    });
  });

  // ─── Edge Cases ───────────────────────────────────────────────────────────

  test('handles data with special characters', () => {
    const testData = [{ name: 'John "Boss" Doe' }];
    
    render(<ExportButtons data={testData} />);
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(global.Blob).toHaveBeenCalled();
  });

  test('handles empty object in data array', () => {
    const testData = [{}];
    
    render(<ExportButtons data={testData} />);
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(global.Blob).toHaveBeenCalled();
  });
});