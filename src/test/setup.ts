import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Polyfill for React 19 useId in tests
Object.defineProperty(React, 'useId', {
  writable: true,
  configurable: true,
  value: () => 'test-use-id',
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, 'Notification', {
  writable: true,
  value: class Notification {
    static permission = 'granted';
    constructor() {}
    close = vi.fn();
  },
});

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});