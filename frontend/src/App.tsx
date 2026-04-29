import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { DisplayPage } from './pages/DisplayPage';
import { ControllerPage } from './pages/ControllerPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/display/:id" element={<DisplayPage />} />
        <Route path="/controller/:id" element={<ControllerPage />} />
      </Routes>
    </BrowserRouter>
  );
}
