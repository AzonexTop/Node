import { describe, it, expect, jest } from '@jest/globals';
import { formatDate, isValidEmail, sleep } from './utils';

describe('formatDate', () => {
  it('should format date as YYYY-MM-DD', () => {
    const date = new Date('2023-12-01T10:30:00.000Z');
    const result = formatDate(date);
    expect(result).toBe('2023-12-01');
  });

  it('should handle date with time components', () => {
    const date = new Date('2023-12-01T15:45:30.123Z');
    const result = formatDate(date);
    expect(result).toBe('2023-12-01');
  });

  it('should handle local date', () => {
    const date = new Date(2023, 11, 1); // December 1, 2023
    const result = formatDate(date);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('isValidEmail', () => {
  it('should validate correct email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@example')).toBe(false);
    expect(isValidEmail('test@.com')).toBe(false);
    expect(isValidEmail('test@example.')).toBe(false);
    expect(isValidEmail('test example.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isValidEmail('a@b.c')).toBe(true);
    expect(isValidEmail('very.long.email.address@example-domain.com')).toBe(true);
  });
});

describe('sleep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve after specified time', async () => {
    const promise = sleep(1000);
    
    // Promise should not be resolved immediately
    expect(promise).resolves.toBeUndefined();
    
    // Fast-forward time
    jest.advanceTimersByTime(1000);
    
    // Now it should be resolved
    await expect(promise).resolves.toBeUndefined();
  });

  it('should work with zero delay', async () => {
    const promise = sleep(0);
    jest.advanceTimersByTime(0);
    await expect(promise).resolves.toBeUndefined();
  });
});