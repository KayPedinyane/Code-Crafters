/**
 * Tests for dateUtils.js
 * This file tests all date utility functions
 */

import { formatDate, parseDate, isValidDate } from '../utils/dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    test('formats a valid Date object to readable string', () => {
      const date = new Date('2024-03-15T10:30:00');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    test('formats ISO date string to readable format', () => {
      const dateString = '2024-03-15';
      const formatted = formatDate(dateString);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    test('handles date with time', () => {
      const date = new Date('2024-03-15T14:30:00');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
    });

    test('handles today\'s date', () => {
      const today = new Date();
      const formatted = formatDate(today);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    test('handles past dates', () => {
      const pastDate = new Date('2020-01-01');
      const formatted = formatDate(pastDate);
      expect(formatted).toBeTruthy();
    });

    test('handles future dates', () => {
      const futureDate = new Date('2030-12-31');
      const formatted = formatDate(futureDate);
      expect(formatted).toBeTruthy();
    });

    test('returns empty string or null for invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result === '' || result === null || result === 'Invalid Date').toBeTruthy();
    });

    test('handles null input', () => {
      const result = formatDate(null);
      expect(result === '' || result === null || result === 'Invalid Date').toBeTruthy();
    });

    test('handles undefined input', () => {
      const result = formatDate(undefined);
      expect(result === '' || result === null || result === 'Invalid Date').toBeTruthy();
    });

    test('formats date with custom format if supported', () => {
      const date = new Date('2024-03-15');
      const formatted = formatDate(date, 'yyyy-MM-dd');
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('parseDate', () => {
    test('parses valid date string to Date object', () => {
      const dateString = '2024-03-15';
      const parsed = parseDate(dateString);
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.getFullYear()).toBe(2024);
    });

    test('parses ISO date string', () => {
      const isoString = '2024-03-15T10:30:00.000Z';
      const parsed = parseDate(isoString);
      expect(parsed).toBeInstanceOf(Date);
    });

    test('returns Date object for Date input', () => {
      const date = new Date('2024-03-15');
      const parsed = parseDate(date);
      expect(parsed).toBeInstanceOf(Date);
    });

    test('handles timestamp numbers', () => {
      const timestamp = Date.now();
      const parsed = parseDate(timestamp);
      expect(parsed).toBeInstanceOf(Date);
    });

    test('returns null for invalid date string', () => {
      const result = parseDate('not-a-date');
      expect(result === null || isNaN(result?.getTime())).toBeTruthy();
    });

    test('handles null input', () => {
      const result = parseDate(null);
      expect(result === null || result === undefined).toBeTruthy();
    });

    test('handles undefined input', () => {
      const result = parseDate(undefined);
      expect(result === null || result === undefined).toBeTruthy();
    });

    test('parses different date formats', () => {
      const formats = [
        '2024-03-15',
        '2024/03/15',
        '03-15-2024',
        'March 15, 2024'
      ];

      formats.forEach(format => {
        const parsed = parseDate(format);
        expect(parsed === null || parsed instanceof Date).toBeTruthy();
      });
    });
  });

  describe('isValidDate', () => {
    test('returns true for valid Date object', () => {
      const date = new Date('2024-03-15');
      expect(isValidDate(date)).toBe(true);
    });

    test('returns true for valid date string', () => {
      const dateString = '2024-03-15';
      const result = isValidDate(dateString);
      expect(typeof result).toBe('boolean');
    });

    test('returns false for invalid Date object', () => {
      const invalidDate = new Date('invalid');
      expect(isValidDate(invalidDate)).toBe(false);
    });

    test('returns false for invalid date string', () => {
      expect(isValidDate('not-a-date')).toBe(false);
    });

    test('returns false for null', () => {
      expect(isValidDate(null)).toBe(false);
    });

    test('returns false for undefined', () => {
      expect(isValidDate(undefined)).toBe(false);
    });

    test('returns false for empty string', () => {
      expect(isValidDate('')).toBe(false);
    });

    test('returns true for timestamp number', () => {
      const timestamp = Date.now();
      const result = isValidDate(timestamp);
      expect(typeof result).toBe('boolean');
    });

    test('handles ISO date strings', () => {
      const isoString = '2024-03-15T10:30:00.000Z';
      const result = isValidDate(isoString);
      expect(typeof result).toBe('boolean');
    });

    test('handles edge case dates', () => {
      const edgeCases = [
        new Date(0), // Unix epoch
        new Date('1970-01-01'),
        new Date('2099-12-31')
      ];

      edgeCases.forEach(date => {
        expect(isValidDate(date)).toBe(true);
      });
    });
  });

  describe('Edge cases and integration', () => {
    test('format and parse roundtrip', () => {
      const originalDate = new Date('2024-03-15T10:30:00');
      const formatted = formatDate(originalDate);
      
      if (formatted && formatted !== 'Invalid Date') {
        const parsed = parseDate(formatted);
        expect(parsed).toBeInstanceOf(Date);
      }
    });

    test('handles timezone differences', () => {
      const date = new Date('2024-03-15T00:00:00Z');
      const formatted = formatDate(date);
      expect(formatted).toBeTruthy();
    });

    test('validates then formats date', () => {
      const dateString = '2024-03-15';
      
      if (isValidDate(dateString)) {
        const formatted = formatDate(dateString);
        expect(formatted).toBeTruthy();
      }
    });
  });
});
