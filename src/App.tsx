// src/App.tsx (Remove BrowserRouter here)
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/Routes';
import MaisonChat from './components/chat/MaisonChat';

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <MaisonChat />
    </BrowserRouter>
  );
}

export default App;
