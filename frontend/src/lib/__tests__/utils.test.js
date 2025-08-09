import { describe, it, expect } from 'vitest';
import { cn } from '../utils.js';

describe('cn', () => {
  it('merges tailwind classnames and dedupes conflicts', () => {
    const result = cn('p-2', 'p-4', false && 'hidden', ['text-sm']);
    expect(result).toContain('p-4');
    expect(result).toContain('text-sm');
    expect(result).not.toContain('p-2 ');
  });
});
