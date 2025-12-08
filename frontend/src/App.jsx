import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login'; 
import PrivateRoute from './components/auth/PrivateRoute'; 
import ClientesPage from './pages/ClientesPage';
import QuartosPage from './pages/QuartosPage';
import ReservasPage from './pages/ReservasPage'; // <-- NOVO: Importa a página de Reservas
import Header from './components/nav/Header'; 

function App() {
  return (
    <div className="container">
      <Header /> 
      
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Protegidas */}
        <Route 
          path="/clientes" 
          element={<PrivateRoute element={<ClientesPage />} />} 
        />
        <Route 
          path="/quartos" 
          element={<PrivateRoute element={<QuartosPage />} />} 
        />
        <Route 
          path="/reservas" 
          element={<PrivateRoute element={<ReservasPage />} />} // <-- ATUALIZADO
        />
        
        <Route path="/" element={<Navigate to="/clientes" replace />} /> 
      </Routes>
    </div>
  );
}

export default App;