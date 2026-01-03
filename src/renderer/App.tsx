import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { MainPage } from './pages/MainPage';
import { AppContextProvider } from './context/AppContextProvider';
import { ModalsManager } from './components/ModalsManager';
import { ModalsManagerContextProvider } from './context/ModalsManagerContextProvider';

export default function App() {
  return (
    <AppContextProvider>
      <ModalsManagerContextProvider>
        <ModalsManager />
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
          </Routes>
        </Router>
      </ModalsManagerContextProvider>
    </AppContextProvider>
  );
}
