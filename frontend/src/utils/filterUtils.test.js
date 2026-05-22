/**
 * Tests for filterUtils.js
 * Tests the actual filterJobs function implementation
 */

import { filterJobs } from '../utils/filterUtils';

describe('filterUtils', () => {
  const mockJobs = [
    {
      id: 1,
      title: 'Software Developer',
      sector: 'IT',
      nqf_level: '7',
      location: 'Johannesburg',
      type: 'Internship'
    },
    {
      id: 2,
      title: 'Data Analyst',
      sector: 'Finance',
      nqf_level: '6',
      location: 'Cape Town',
      type: 'Learnership'
    },
    {
      id: 3,
      title: 'Network Engineer',
      sector: 'IT',
      nqf_level: '8',
      location: 'Durban',
      type: 'Apprenticeship'
    },
    {
      id: 4,
      title: 'Web Developer',
      sector: 'IT',
      nqf_level: '7',
      location: 'Johannesburg',
      type: 'Internship'
    }
  ];

  describe('filterJobs', () => {
    test('returns all jobs when filters are empty', () => {
      const filters = {
        sector: '',
        nqfLevel: '',
        location: '',
        type: ''
      };
      const result = filterJobs(mockJobs, filters);
      expect(result).toHaveLength(4);
      expect(result).toEqual(mockJobs);
    });

    test('filters by sector', () => {
      const filters = {
        sector: 'IT',
        nqfLevel: '',
        location: '',
        type: ''
      };
      const result = filterJobs(mockJobs, filters);
      expect(result).toHaveLength(3);
      expect(result.every(job => job.sector === 'IT')).toBe(true);
    });

    test('filters by nqfLevel', () => {
      const filters = {
        sector: '',
        nqfLevel: '7',
        location: '',
        type: ''
      };
      const result = filterJobs(mockJobs, filters);
      expect(result).toHaveLength(2);
      expect(result.every(job => job.nqf_level === '7')).toBe(true);
    });

    test('filters by location', () => {
      const filters = {
        sector: '',
        nqfLevel: '',
        location: 'Johannesburg',
        type: ''
      };
      const result = filterJobs(mockJobs, filters);
      expect(result).toHaveLength(2);
      expect(result.every(job => job.location === 'Johannesburg')).toBe(true);
    });

    test('filters by type', () => {
      const filters = {
        sector: '',
        nqfLevel: '',
        location: '',
        type: 'Internship'
      };
      const result = filterJobs(mockJobs, filters);
      expect(result).toHaveLength(2);
      expect(result.every(job => job.type === 'Internship')).toBe(true);
    });

    test('combines multiple filters (sector + location)', () => {
      const filters = {
        sector: 'IT',
        nqfLevel: '',
        location: 'Johannesburg',
        type: ''
      };
      const result = filterJobs(mockJobs, filters);
      expect(result[0].sector).toBe('IT');
      expect(result[0].location).toBe('Johannesburg');
    });

    test('combines multiple filters (sector + nqfLevel + type)', () => {
      const filters = {
        sector: 'IT',
        nqfLevel: '7',
        location: '',
        type: 'Internship'
      };
      const result = filterJobs(mockJobs, filters);
      expect(result).toHaveLength(2);
      expect(result.every(job => 
        job.sector === 'IT' && 
        job.nqf_level === '7' && 
        job.type === 'Internship'
      )).toBe(true);
    });

    test('returns empty array when no matches found', () => {
      const filters = {
        sector: 'Healthcare',
        nqfLevel: '',
        location: '',
        type: ''
      };
      const result = filterJobs(mockJobs, filters);
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    test('handles empty jobs array', () => {
      const filters = {
        sector: 'IT',
        nqfLevel: '',
        location: '',
        type: ''
      };
      const result = filterJobs([], filters);
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    test('is case-sensitive for sector', () => {
      const filters = {
        sector: 'it',
        nqfLevel: '',
        location: '',
        type: ''
      };
      const result = filterJobs(mockJobs, filters);
      expect(result).toHaveLength(0);
    });

    test('works with partial filters', () => {
      const filters = {
        sector: '',
        nqfLevel: '7',
        location: '',
        type: 'Internship'
      };
      const result = filterJobs(mockJobs, filters);
      expect(result).toHaveLength(2);
    });
  });
});