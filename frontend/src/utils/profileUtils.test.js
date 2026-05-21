/**
 * Tests for profileUtils.js
 * Tests the actual validation and checking functions
 */

import { validatePersonal, validateEducation, checkMissingFields } from '../utils/profileUtils';

describe('profileUtils', () => {
  
  describe('validatePersonal', () => {
    test('returns empty errors for valid personal data', () => {
      const personal = {
        fullName: 'John Doe',
        phone: '0712345678',
        idNumber: '9001015009087',
        gender: 'Male',
        city: 'Johannesburg',
        province: 'Gauteng'
      };
      
      const errors = validatePersonal(personal);
      expect(errors).toEqual({});
      expect(Object.keys(errors)).toHaveLength(0);
    });

    test('returns error for missing fullName', () => {
      const personal = {
        fullName: '',
        phone: '0712345678',
        idNumber: '9001015009087',
        gender: 'Male',
        city: 'Johannesburg',
        province: 'Gauteng'
      };
      
      const errors = validatePersonal(personal);
      expect(errors.fullName).toBe('Full Name is required');
    });

    test('returns error for missing phone', () => {
      const personal = {
        fullName: 'John Doe',
        phone: '',
        idNumber: '9001015009087',
        gender: 'Male',
        city: 'Johannesburg',
        province: 'Gauteng'
      };
      
      const errors = validatePersonal(personal);
      expect(errors.phone).toBe('Phone Number is required');
    });

    test('returns error for missing idNumber', () => {
      const personal = {
        fullName: 'John Doe',
        phone: '0712345678',
        idNumber: '',
        gender: 'Male',
        city: 'Johannesburg',
        province: 'Gauteng'
      };
      
      const errors = validatePersonal(personal);
      expect(errors.idNumber).toBe('ID Number is required');
    });

    test('returns error for missing gender', () => {
      const personal = {
        fullName: 'John Doe',
        phone: '0712345678',
        idNumber: '9001015009087',
        gender: '',
        city: 'Johannesburg',
        province: 'Gauteng'
      };
      
      const errors = validatePersonal(personal);
      expect(errors.gender).toBe('Gender is required');
    });

    test('returns error for missing city', () => {
      const personal = {
        fullName: 'John Doe',
        phone: '0712345678',
        idNumber: '9001015009087',
        gender: 'Male',
        city: '',
        province: 'Gauteng'
      };
      
      const errors = validatePersonal(personal);
      expect(errors.city).toBe('City is required');
    });

    test('returns error for missing province', () => {
      const personal = {
        fullName: 'John Doe',
        phone: '0712345678',
        idNumber: '9001015009087',
        gender: 'Male',
        city: 'Johannesburg',
        province: ''
      };
      
      const errors = validatePersonal(personal);
      expect(errors.province).toBe('Province is required');
    });

    test('returns multiple errors for multiple missing fields', () => {
      const personal = {
        fullName: '',
        phone: '',
        idNumber: '9001015009087',
        gender: 'Male',
        city: 'Johannesburg',
        province: 'Gauteng'
      };
      
      const errors = validatePersonal(personal);
      expect(Object.keys(errors)).toHaveLength(2);
      expect(errors.fullName).toBe('Full Name is required');
      expect(errors.phone).toBe('Phone Number is required');
    });

    test('treats whitespace-only values as empty', () => {
      const personal = {
        fullName: '   ',
        phone: '0712345678',
        idNumber: '9001015009087',
        gender: 'Male',
        city: 'Johannesburg',
        province: 'Gauteng'
      };
      
      const errors = validatePersonal(personal);
      expect(errors.fullName).toBe('Full Name is required');
    });

    test('returns all errors when all fields are empty', () => {
      const personal = {
        fullName: '',
        phone: '',
        idNumber: '',
        gender: '',
        city: '',
        province: ''
      };
      
      const errors = validatePersonal(personal);
      expect(Object.keys(errors)).toHaveLength(6);
    });
  });

  describe('validateEducation', () => {
    test('returns empty errors for valid education data', () => {
      const education = {
        highestQualification: 'Bachelor of Science',
        institution: 'University of Cape Town',
        nqfLevel: '7'
      };
      
      const errors = validateEducation(education);
      expect(errors).toEqual({});
      expect(Object.keys(errors)).toHaveLength(0);
    });

    test('returns error for missing highestQualification', () => {
      const education = {
        highestQualification: '',
        institution: 'University of Cape Town',
        nqfLevel: '7'
      };
      
      const errors = validateEducation(education);
      expect(errors.highestQualification).toBe('Qualification is required');
    });

    test('returns error for missing institution', () => {
      const education = {
        highestQualification: 'Bachelor of Science',
        institution: '',
        nqfLevel: '7'
      };
      
      const errors = validateEducation(education);
      expect(errors.institution).toBe('Institution is required');
    });

    test('returns error for missing nqfLevel', () => {
      const education = {
        highestQualification: 'Bachelor of Science',
        institution: 'University of Cape Town',
        nqfLevel: ''
      };
      
      const errors = validateEducation(education);
      expect(errors.nqfLevel).toBe('NQF Level is required');
    });

    test('returns multiple errors for multiple missing fields', () => {
      const education = {
        highestQualification: '',
        institution: '',
        nqfLevel: '7'
      };
      
      const errors = validateEducation(education);
      expect(Object.keys(errors)).toHaveLength(2);
      expect(errors.highestQualification).toBe('Qualification is required');
      expect(errors.institution).toBe('Institution is required');
    });

    test('treats whitespace-only values as empty', () => {
      const education = {
        highestQualification: '   ',
        institution: 'University of Cape Town',
        nqfLevel: '7'
      };
      
      const errors = validateEducation(education);
      expect(errors.highestQualification).toBe('Qualification is required');
    });

    test('returns all errors when all fields are empty', () => {
      const education = {
        highestQualification: '',
        institution: '',
        nqfLevel: ''
      };
      
      const errors = validateEducation(education);
      expect(Object.keys(errors)).toHaveLength(3);
    });
  });

  describe('checkMissingFields', () => {
    test('returns empty array for complete profile', () => {
      const profileData = {
        full_name: 'John Doe',
        phone: '0712345678',
        id_number: '9001015009087',
        gender: 'Male',
        city: 'Johannesburg',
        province: 'Gauteng',
        qualification: 'Bachelor of Science',
        institution: 'University of Cape Town',
        nqf_level: '7'
      };
      
      const missing = checkMissingFields(profileData);
      expect(missing).toEqual([]);
      expect(missing).toHaveLength(0);
    });

    test('identifies missing personal fields', () => {
      const profileData = {
        full_name: '',
        phone: '',
        id_number: '9001015009087',
        gender: 'Male',
        city: 'Johannesburg',
        province: 'Gauteng',
        qualification: 'Bachelor of Science',
        institution: 'University of Cape Town',
        nqf_level: '7'
      };
      
      const missing = checkMissingFields(profileData);
      expect(missing).toContain('Full Name');
      expect(missing).toContain('Phone Number');
      expect(missing).toHaveLength(2);
    });

    test('identifies missing education fields', () => {
      const profileData = {
        full_name: 'John Doe',
        phone: '0712345678',
        id_number: '9001015009087',
        gender: 'Male',
        city: 'Johannesburg',
        province: 'Gauteng',
        qualification: '',
        institution: '',
        nqf_level: '7'
      };
      
      const missing = checkMissingFields(profileData);
      expect(missing).toContain('Highest Qualification');
      expect(missing).toContain('Institution');
      expect(missing).toHaveLength(2);
    });

    test('identifies all missing fields', () => {
      const profileData = {
        full_name: '',
        phone: '',
        id_number: '',
        gender: '',
        city: '',
        province: '',
        qualification: '',
        institution: '',
        nqf_level: ''
      };
      
      const missing = checkMissingFields(profileData);
      expect(missing).toHaveLength(9);
      expect(missing).toContain('Full Name');
      expect(missing).toContain('Phone Number');
      expect(missing).toContain('ID Number');
      expect(missing).toContain('Gender');
      expect(missing).toContain('City');
      expect(missing).toContain('Province');
      expect(missing).toContain('Highest Qualification');
      expect(missing).toContain('Institution');
      expect(missing).toContain('NQF Level');
    });

    test('treats whitespace-only values as missing', () => {
      const profileData = {
        full_name: '   ',
        phone: '0712345678',
        id_number: '9001015009087',
        gender: 'Male',
        city: 'Johannesburg',
        province: 'Gauteng',
        qualification: 'Bachelor of Science',
        institution: 'University of Cape Town',
        nqf_level: '7'
      };
      
      const missing = checkMissingFields(profileData);
      expect(missing).toContain('Full Name');
      expect(missing).toHaveLength(1);
    });

    test('handles numeric values correctly', () => {
      const profileData = {
        full_name: 'John Doe',
        phone: 712345678,  // Number instead of string
        id_number: 9001015009087,
        gender: 'Male',
        city: 'Johannesburg',
        province: 'Gauteng',
        qualification: 'Bachelor of Science',
        institution: 'University of Cape Town',
        nqf_level: 7  // Number instead of string
      };
      
      const missing = checkMissingFields(profileData);
      expect(missing).toEqual([]);
    });

    test('identifies mix of missing personal and education fields', () => {
      const profileData = {
        full_name: 'John Doe',
        phone: '',
        id_number: '9001015009087',
        gender: '',
        city: 'Johannesburg',
        province: 'Gauteng',
        qualification: '',
        institution: 'University of Cape Town',
        nqf_level: '7'
      };
      
      const missing = checkMissingFields(profileData);
      expect(missing).toHaveLength(3);
      expect(missing).toContain('Phone Number');
      expect(missing).toContain('Gender');
      expect(missing).toContain('Highest Qualification');
    });
  });
});