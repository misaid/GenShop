import React from 'react';
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Hero from '../Hero.jsx';

describe('Hero', () => {
  it('renders hero without crashing', () => {
    render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>
    );
  });
});
