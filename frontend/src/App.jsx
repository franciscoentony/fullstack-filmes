/**
 * COMPONENTE PRINCIPAL (FRONTEND)
 * 
 * Este arquivo define a estrutura base do site, a navegação (Rotas)
 * e o layout comum (Header, Footer, etc).
 */

import { Routes, Route, Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Film, Compass, LogOut, Loader2, User, ShieldAlert } from 'lucide-react';
import { getApiUrl, getUploadUrl } from './api/config';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Importação das Páginas
import Explore from './pages/Explore.jsx';
import MyMovies from './pages/MyMovies.jsx';
import NewMovie from './pages/NewMovie.jsx';
import MovieDetails from './pages/MovieDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import UserProfile from './pages/UserProfile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { useState, useRef, useEffect } from 'react';

/**
 * COMPONENTE DE ROTA PRIVADA
 * 
 * Um "wrapper" que envolve as páginas que precisam de login.
 * Se o usuário não estiver logado, ele é redirecionado para a página de Login.
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary w-10 h-10" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * COMPONENTE DE NOTIFICAÇÃO (BADGE)
 * 
 * Aparece apenas para administradores, indicando quantos filmes 
 * estão na fila aguardando aprovação.
 */
const PendingBadge = () => {
  const { user, isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Só busca contagem se estiver logado e for SuperUser (Admin)
    if (!isAuthenticated || !user?.isSuperUser) return;

    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('moderacao/pendentes'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCount(data.length);
        }
      } catch (error) {
        console.error('Erro ao buscar contagem:', error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000); // Atualiza a cada 1 minuto
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.isSuperUser]);

  if (count === 0) return null;

  return (
    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-brand-card animate-pulse shadow-lg">
      {count}
    </span>
  );
};

/**
 * COMPONENTE DE LAYOUT
 * 
 * Contém o Header e define onde o conteúdo das páginas será renderizado (<Outlet />).
 */
const Layout = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Lógica para fechar o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 bg-brand-card border-b border-brand-border sticky top-0 z-50 gap-4 md:gap-0">
        <div className="text-brand-primary font-heading font-extrabold text-xl md:text-2xl flex items-center gap-2">
          <Film size={24} className="md:w-7 md:h-7 text-brand-primary" />
          <span className="whitespace-nowrap">Gerenciador de Filmes</span>
        </div>
        
        {/* Menu de Navegação */}
        <nav className="flex gap-4 md:gap-8 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide justify-center">
          <Link to="/" className={`flex items-center gap-2 font-medium transition-colors duration-200 whitespace-nowrap text-sm md:text-base ${location.pathname === '/' ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'}`}>
            <Compass size={18} />
            Explorar
          </Link>
          <Link to="/my-movies" className={`flex items-center gap-2 font-medium transition-colors duration-200 whitespace-nowrap text-sm md:text-base ${location.pathname.startsWith('/my-movies') || location.pathname === '/new' || location.pathname.startsWith('/edit') ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'}`}>
            <Film size={18} />
            Meus filmes
          </Link>
          {user?.isSuperUser && (
            <Link to="/admin" className={`flex items-center gap-2 font-medium transition-colors duration-200 relative whitespace-nowrap text-sm md:text-base pr-6 ${location.pathname === '/admin' ? 'text-brand-primary' : 'text-brand-text-secondary hover:text-brand-primary'}`}>
              <ShieldAlert size={18} />
              Moderação
              <PendingBadge />
            </Link>
          )}
        </nav>
        
        {/* Área do Usuário (Login/Avatar) */}
        <div className="flex items-center gap-4 relative" ref={menuRef}>
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 py-1 px-2 rounded-xl transition-all hover:bg-white/5 active:scale-95 group"
              >
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-bold text-brand-text-primary">Olá, {user?.nome?.split(' ')[0]}</span>
                  {user?.isSuperUser ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-brand-primary px-1.5 bg-brand-primary/10 rounded">Administrador</span>
                  ) : (
                    <span className="text-[10px] text-brand-text-secondary group-hover:text-brand-primary transition-colors">Configurações</span>
                  )}
                </div>
                <img 
                  src={user?.avatar ? getUploadUrl(user.avatar) : `https://i.pravatar.cc/150?u=${user?.email}`} 
                  alt="User Avatar" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-brand-border group-hover:border-brand-primary transition-colors" 
                />
              </button>

              {/* Menu Dropdown de Opções */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-brand-card border border-brand-border rounded-2xl shadow-2xl py-2 overflow-hidden animate-[slideUp_0.2s_ease-out] z-50">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-brand-text-secondary hover:bg-white/5 hover:text-brand-text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} />
                    Editar Perfil
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 w-full text-left transition-colors"
                  >
                    <LogOut size={18} />
                    Sair da conta
                  </button>
                </div>
              )}
            </>
          ) : (
            // Botões se não estiver logado
            <div className="flex gap-3 items-center">
              <Link to="/login">
                <button className="text-brand-text-primary text-sm font-medium hover:text-brand-primary transition-colors cursor-pointer">Entrar</button>
              </Link>
              <Link to="/register">
                <button className="bg-brand-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-brand-primary/80 transition-all shadow-lg shadow-brand-primary/20 cursor-pointer">Cadastrar</button>
              </Link>
            </div>
          )}
        </div>
      </header>
      
      {/* Aqui é onde as páginas (Explore, Login, etc) são renderizadas */}
      <main className="w-full max-w-[1200px] mx-auto px-8 py-8 flex-1">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Rotas Públicas */}
          <Route index element={<Explore />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="movie/:id" element={<MovieDetails />} />
          <Route path="/user/:id" element={<UserProfile />} />
          
          {/* Rotas Protegidas (Só acessíveis se estiver logado) */}
          <Route path="my-movies" element={<PrivateRoute><MyMovies /></PrivateRoute>} />
          <Route path="new" element={<PrivateRoute><NewMovie /></PrivateRoute>} />
          <Route path="edit/:id" element={<PrivateRoute><NewMovie /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
