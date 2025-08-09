import React from 'react';
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Department from '../components/Department.jsx';

describe('Department', () => {
  it('renders department list', () => {
    render(
      <MemoryRouter>
        <Department />
      </MemoryRouter>
    );
  });
});
