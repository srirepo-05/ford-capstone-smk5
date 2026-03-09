import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

// BrowserRouter is placed here so the entire app (including App.tsx) can use
// React Router hooks such as useNavigate, useParams, and <Link>.
// StrictMode runs every component twice in development to surface side-effect bugs.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
