import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import App from './app';

afterEach(cleanup);

describe('App', () => {
  it('renders without crashing', () => {
    const props = {
      chapters: [{ id: 'first-id', location: { center: [0, 0] } }],
      accessToken: '',
      style: '',
      theme: '',
      showMarkers: false,
      title: '',
      subtitle: '',
      byline: '',
      alignment: '',
      footer: ''
    };

    expect(() => render(<App {...props} />)).not.toThrow();
  });
});
