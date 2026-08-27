import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './app';
import config from './config.js';
import './i18n';

const root = createRoot(document.getElementById('root'));
root.render(<App {...config} />);
