import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import HomePage from './pages/HomePage';
import DisplayPage from './pages/DisplayPage';
import ControllerPage from './pages/ControllerPage';
import ScanPage from './pages/ScanPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/display/:id" element={<DisplayPage />} />
        <Route path="/controller/:id" element={<ControllerPage />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
