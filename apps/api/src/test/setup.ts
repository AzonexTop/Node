// Jest setup file for API tests
import 'dotenv/config';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to ignore console.log during tests
  // log: jest.fn(),
  // Uncomment to ignore console.warn during tests
  // warn: jest.fn(),
  // Uncomment to ignore console.error during tests
  // error: jest.fn(),
};