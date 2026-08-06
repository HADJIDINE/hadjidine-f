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

  // Fonction transmise à Home.jsx pour le bouton "Voir l'ESP F"
  const handleGoToEspF = () => {
    if (user) {
      setActiveTab('chat');
    } else {
      setActiveTab('auth');
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>
      {/* BARRE DE NAVIGATION SUPÉRIEURE */}
      <header style={styles.navbar}>
        <div style={styles.navLeft}>
          <button
            onClick={() => setActiveTab('home')}
            style={{
              ...styles.navBtn,
              fontWeight: activeTab === 'home' ? 'bold' : 'normal',
              borderBottom: activeTab === 'home' ? '2px solid #0288d1' : 'none',
            }}
          >
            🏠 Accueil
          </button>

          {/* Accès à l'ESP F (Chat) si connecté */}
          {user && (
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                ...styles.navBtn,
                fontWeight: activeTab === 'chat' ? 'bold' : 'normal',
                borderBottom: activeTab === 'chat' ? '2px solid #0288d1' : 'none',
              }}
            >
              💬 ESP F (Chat)
            </button>
          )}

          {/* Accès Administration si ADMIN */}
          {user && user.role === 'ROLE_ADMIN' && (
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                ...styles.navBtn,
                fontWeight: activeTab === 'admin' ? 'bold' : 'normal',
                borderBottom: activeTab === 'admin' ? '2px solid #0288d1' : 'none',
              }}
            >
              🛠️ Administration
            </button>
          )}
        </div>

        {/* CÔTÉ DROIT : Utilisateur & Connexion / Déconnexion */}
        <div style={styles.navRight}>
          {user ? (
            <>
              <span style={styles.userEmail}>👤 {user.email}</span>
              <button onClick={handleLogout} style={styles.btnLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              style={{
                ...styles.btnLoginNav,
                backgroundColor: activeTab === 'auth' ? '#0288d1' : '#ffffff',
                color: activeTab === 'auth' ? '#ffffff' : '#0288d1',
              }}
            >
              Se connecter / S'inscrire
            </button>
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
    padding: '12px 24px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  navLeft: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  navRight: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  navBtn: {
    background: 'none',
    border: 'none',
    fontSize: '15px',
    cursor: 'pointer',
    padding: '6px 10px',
    color: '#333',
  },
  userEmail: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
  },
  btnLogout: {
    padding: '6px 14px',
    backgroundColor: '#d32f2f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  btnLoginNav: {
    padding: '6px 14px',
    border: '1.5px solid #0288d1',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  mainContent: {
    padding: '20px',
  },
};

export default App;