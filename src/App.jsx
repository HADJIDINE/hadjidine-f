import React, { useState, useEffect } from 'react';
import Home from './Home';
import Auth from './Auth';
import Chat from './Chat';
import AdminPanel from './AdminPanel';

function App() {
  const [user, setUser] = useState(null);
  // Navigation : 'home' (par défaut), 'auth', 'chat', 'admin'
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');

    if (token && email) {
      setUser({ token, email, role });
    }
  }, []);

  const handleLoginSuccess = (authData) => {
    setUser({
      token: authData.token,
      email: authData.email,
      role: authData.role,
    });
    setActiveTab('chat'); // Redirige directement vers le chat après connexion
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setActiveTab('home'); // Retour à l'accueil lors de la déconnexion
  };

  // Fonction transmise à Home.jsx pour le bouton "Espace Familial"
  const handleGoToEspF = () => {
    if (user) {
      setActiveTab('chat');
    } else {
      setActiveTab('auth');
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* BARRE DE NAVIGATION MODERNE */}
      <header style={styles.navbar}>
        <div style={styles.navLeft}>
          <button
            onClick={() => setActiveTab('home')}
            style={activeTab === 'home' ? styles.navBtnActive : styles.navBtn}
          >
            🏠 Accueil
          </button>

          {/* Accès à l'Espace Familial (Chat) si connecté */}
          {user && (
            <button
              onClick={() => setActiveTab('chat')}
              style={activeTab === 'chat' ? styles.navBtnActive : styles.navBtn}
            >
              💬 Espace Familial (Chat)
            </button>
          )}

          {/* Accès Administration si ADMIN */}
          {user && user.role === 'ROLE_ADMIN' && (
            <button
              onClick={() => setActiveTab('admin')}
              style={activeTab === 'admin' ? styles.navBtnActive : styles.navBtn}
            >
              🛠️ Administration
            </button>
          )}
        </div>

        {/* CÔTÉ DROIT : Affiché uniquement une fois connecté */}
        <div style={styles.navRight}>
          {user && (
            <div style={styles.userSection}>
              <span style={styles.userBadge}>
                👤 {user.email}
              </span>
              <button onClick={handleLogout} style={styles.btnLogout}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </header>

      {/* CONTENU PRINCIPAL SÉLECTIONNÉ */}
      <main style={styles.mainContent}>
        {activeTab === 'home' && <Home onGoToEspF={handleGoToEspF} />}

        {activeTab === 'auth' && !user && (
          <Auth onLoginSuccess={handleLoginSuccess} />
        )}

        {activeTab === 'chat' && user && <Chat />}

        {activeTab === 'admin' && user && user.role === 'ROLE_ADMIN' && (
          <AdminPanel />
        )}
      </main>
    </div>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 32px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navLeft: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
  },
  navBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '10px 18px',
    color: '#475569',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
  },
  navBtnActive: {
    background: '#f0f9ff',
    border: 'none',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: '10px 18px',
    color: '#0288d1',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(2, 136, 209, 0.12)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#f8fafc',
    padding: '6px 6px 6px 14px',
    borderRadius: '30px',
    border: '1px solid #e2e8f0',
  },
  userBadge: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155',
  },
  btnLogout: {
    padding: '8px 18px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px',
    boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
    transition: 'background 0.2s ease',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 20px',
  },
};

export default App;