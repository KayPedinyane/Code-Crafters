/**
 * Tests for dateUtils.js
 */

import { formatDate } from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    
    // ─── Null/Undefined/Empty Handling ────────────────────────────────────
    
    test('handles null input', () => {
      const result = formatDate(null);
      expect(result).toBe('N/A');
    });

    test('handles undefined input', () => {
      const result = formatDate(undefined);
      expect(result).toBe('N/A');
    });

    test('handles empty string', () => {
      const result = formatDate('');
      expect(result).toBe('N/A');
    });

    test('handles 0 (falsy number)', () => {
      const result = formatDate(0);
      expect(result).toBe('N/A');
    });

    // ─── Valid Date Formatting ────────────────────────────────────────────
    
    test('formats valid ISO date string', () => {
      const result = formatDate('2024-03-15');
      // Should return format like "15 March 2024"
      expect(result).toMatch(/\d{1,2}\s\w+\s\d{4}/);
      expect(result).toContain('March');
      expect(result).toContain('2024');
    });

    test('formats date with time component', () => {
      const result = formatDate('2024-03-15T10:30:00');
      expect(result).toMatch(/\d{1,2}\s\w+\s\d{4}/);
      expect(result).toContain('March');
      expect(result).toContain('2024');
    });

    test('formats Date object', () => {
      const date = new Date('2024-12-25');
      const result = formatDate(date);
      expect(result).toContain('December');
      expect(result).toContain('2024');
    });

    test('formats timestamp', () => {
      const timestamp = new Date('2024-01-01').getTime();
      const result = formatDate(timestamp);
      expect(result).toContain('January');
      expect(result).toContain('2024');
    });

    // ─── Different Months ──────────────────────────────────────────────────
    
    test('formats January date correctly', () => {
      const result = formatDate('2024-01-10');
      expect(result).toContain('January');
    });

    test('formats June date correctly', () => {
      const result = formatDate('2024-06-15');
      expect(result).toContain('June');
    });

    test('formats December date correctly', () => {
      const result = formatDate('2024-12-31');
      expect(result).toContain('December');
    });

    // ─── Edge Cases ────────────────────────────────────────────────────────
    
    test('formats leap year date', () => {
      const result = formatDate('2024-02-29');
      expect(result).toContain('February');
      expect(result).toContain('29');
    });

    test('formats year 2000 date', () => {
      const result = formatDate('2000-01-01');
      expect(result).toContain('2000');
    });

    test('formats future date', () => {
      const result = formatDate('2030-05-20');
      expect(result).toContain('May');
      expect(result).toContain('2030');
    });

    test('formats single-digit day', () => {
      const result = formatDate('2024-03-05');
      expect(result).toContain('5');
      expect(result).toContain('March');
    });

    test('formats double-digit day', () => {
      const result = formatDate('2024-03-25');
      expect(result).toContain('25');
      expect(result).toContain('March');
    });

    // ─── Invalid Dates ─────────────────────────────────────────────────────
    
    test('handles invalid date string', () => {
      const result = formatDate('not-a-date');
      // Invalid Date object toString returns "Invalid Date"
      expect(result).toContain('Invalid Date');
    });

    test('handles garbage input', () => {
      const result = formatDate('abc123xyz');
      expect(result).toContain('Invalid Date');
    });
  });
});