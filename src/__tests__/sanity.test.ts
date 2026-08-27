import { describe, it, expect } from 'vitest';
import { sum } from '../utils/sum';

describe('sanity', () => {
  it('adds numbers', () => {
    expect(sum(2,3)).toBe(5);
  });
});
