import React, { useState } from 'react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users'); // Onglet par défaut

  // Liste des utilisateurs
  const [users, setUsers] = useState([
    { id: 1, name: 'Hadjidine', email: 'hadjidineanffane@gmail.com', role: 'Admin', status: 'Actif' },
    { id: 2, name: 'Étudiant ESP F', email: 'etudiant1@espf.mg', role: 'Membre', status: 'Actif' },
    { id: 3, name: 'Utilisateur Test', email: 'test@espf.mg', role: 'Membre', status: 'Inactif' },
  ]);

  // Liste des messages du chat
  const [messages, setMessages] = useState([
    { id: 101, user: 'Étudiant ESP F', text: 'Bonjour tout le monde !', time: '10:30' },
    { id: 102, user: 'Utilisateur Test', text: 'Message de test pour la modération.', time: '11:15' },
  ]);

  // Paramètres système
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    chatEnabled: true,
  });

  // Actions Utilisateurs
  const handleToggleStatus = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'Actif' ? 'Banni' : 'Actif' } : u));
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleChangeRole = (id, newRole) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  // Action Modération Chat
  const handleDeleteMessage = (id) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '25px', color: '#0f172a' }}>
        ⚙️ Panneau d'Administration
      </h1>

      {/* Barre de navigation / Onglets */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={tabButtonStyle(activeTab === 'dashboard')}
        >
          📊 Tableau de bord
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={tabButtonStyle(activeTab === 'users')}
        >
          👥 Utilisateurs ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          style={tabButtonStyle(activeTab === 'messages')}
        >
          💬 Messages Chat ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={tabButtonStyle(activeTab === 'settings')}
        >
          ⚙️ Paramètres
        </button>
      </div>

      {/* 1. ONGLET TABLEAU DE BORD */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div style={cardStyle('#3b82f6')}>
            <h3 style={{ margin: 0, color: '#475569' }}>Utilisateurs Totaux</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '10px 0 0', color: '#1e293b' }}>{users.length}</p>
          </div>
          <div style={cardStyle('#10b981')}>
            <h3 style={{ margin: 0, color: '#475569' }}>Membres Actifs</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '10px 0 0', color: '#166534' }}>
              {users.filter(u => u.status === 'Actif').length}
            </p>
          </div>
          <div style={cardStyle('#f59e0b')}>
            <h3 style={{ margin: 0, color: '#475569' }}>Messages Envoyés</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '10px 0 0', color: '#92400e' }}>{messages.length}</p>
          </div>
          <div style={cardStyle('#ef4444')}>
            <h3 style={{ margin: 0, color: '#475569' }}>Utilisateurs Bannis</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '10px 0 0', color: '#991b1b' }}>
              {users.filter(u => u.status === 'Banni').length}
            </p>
          </div>
        </div>
      )}

      {/* 2. ONGLET GESTION DES UTILISATEURS */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ marginTop: 0, color: '#1e293b' }}>Gestion des Utilisateurs</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={tableCellHeader}>Nom</th>
                <th style={tableCellHeader}>Email</th>
                <th style={tableCellHeader}>Rôle</th>
                <th style={tableCellHeader}>Statut</th>
                <th style={tableCellHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tableCell}><strong>{u.name}</strong></td>
                  <td style={tableCell}>{u.email}</td>
                  <td style={tableCell}>
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
                    >
                      <option value="Membre">Membre</option>
                      <option value="Admin">Admin</option>
                      <option value="Modérateur">Modérateur</option>
                    </select>
                  </td>
                  <td style={tableCell}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      backgroundColor: u.status === 'Actif' ? '#dcfce7' : '#fee2e2',
                      color: u.status === 'Actif' ? '#15803d' : '#b91c1c'
                    }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={tableCell}>
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      style={{ ...actionBtnStyle, backgroundColor: u.status === 'Actif' ? '#f59e0b' : '#10b981', color: '#fff' }}
                    >
                      {u.status === 'Actif' ? 'Bannir' : 'Débannir'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      style={{ ...actionBtnStyle, backgroundColor: '#ef4444', color: '#fff', marginLeft: '8px' }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. ONGLET MODÉRATION DES MESSAGES */}
      {activeTab === 'messages' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ marginTop: 0, color: '#1e293b' }}>Modération du Chat ESP F</h2>
          {messages.length === 0 ? (
            <p style={{ color: '#64748b' }}>Aucun message à afficher pour le moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              {messages.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{m.user}</strong> <small style={{ color: '#64748b', marginLeft: '6px' }}>({m.time})</small>
                    <p style={{ margin: '6px 0 0 0', color: '#334155', fontSize: '1rem' }}>{m.text}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteMessage(m.id)}
                    style={{ ...actionBtnStyle, backgroundColor: '#ef4444', color: '#fff' }}
                  >
                    Supprimer le message
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. ONGLET PARAMÈTRES DU SYSTÈME */}
      {activeTab === 'settings' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h2 style={{ marginTop: 0, color: '#1e293b' }}>Paramètres de la Plateforme</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '1rem', color: '#334155' }}>
              <input
                type="checkbox"
                style={{ width: '18px', height: '18px' }}
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              />
              <strong>Activer le Mode Maintenance</strong>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '1rem', color: '#334155' }}>
              <input
                type="checkbox"
                style={{ width: '18px', height: '18px' }}
                checked={settings.allowRegistrations}
                onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
              />
              <strong>Autoriser les nouvelles inscriptions</strong>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '1rem', color: '#334155' }}>
              <input
                type="checkbox"
                style={{ width: '18px', height: '18px' }}
                checked={settings.chatEnabled}
                onChange={(e) => setSettings({ ...settings, chatEnabled: e.target.checked })}
              />
              <strong>Activer le service de Chat</strong>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const tabButtonStyle = (isActive) => ({
  padding: '10px 20px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: isActive ? '#2563eb' : '#f1f5f9',
  color: isActive ? '#ffffff' : '#475569',
  fontWeight: 'bold',
  fontSize: '0.95rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
});

const cardStyle = (bgColor) => ({
  backgroundColor: '#ffffff',
  borderLeft: `6px solid ${bgColor}`,
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  border: '1px solid #e2e8f0',
});

const tableCellHeader = {
  padding: '12px 16px',
  color: '#475569',
  fontSize: '0.9rem',
};

const tableCell = {
  padding: '14px 16px',
  color: '#334155',
};

const actionBtnStyle = {
  border: 'none',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '0.85rem',
  cursor: 'pointer',
  fontWeight: '600',
};