import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis Supabase
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Charger les utilisateurs depuis la table 'users'
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) {
        console.error('Erreur table users:', usersError.message);
      } else if (usersData) {
        setUsers(usersData);
      }

      // 2. Charger les messages depuis la table 'messages' triés par 'timestamp'
      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: false });

      if (msgError) {
        console.error('Erreur table messages:', msgError.message);
      } else if (msgData) {
        setMessages(msgData);
      }
    } catch (err) {
      console.error('Erreur globale Supabase :', err);
    } finally {
      setLoading(false);
    }
  };

  // Suppression d'un message
  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce message ?')) return;

    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
      setMessages(messages.filter((m) => m.id !== id));
    } else {
      alert('Erreur lors de la suppression : ' + error.message);
    }
  };

  // Activer / Désactiver un compte utilisateur (champ 'active')
  const handleToggleActive = async (user) => {
    const newStatus = !user.active;
    const { error } = await supabase
      .from('users')
      .update({ active: newStatus })
      .eq('id', user.id);

    if (!error) {
      setUsers(users.map((u) => (u.id === user.id ? { ...u, active: newStatus } : u)));
    } else {
      alert('Erreur lors du changement de statut : ' + error.message);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
        🔄 Connexion aux tables `users` et `messages`...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ margin: 0, color: '#0f172a' }}>⚙️ Panneau d'Administration</h1>
        <button onClick={fetchData} style={{ padding: '8px 16px', backgroundColor: '#0288d1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          🔄 Actualiser
        </button>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>
        <button onClick={() => setActiveTab('dashboard')} style={tabButtonStyle(activeTab === 'dashboard')}>
          📊 Tableau de bord
        </button>
        <button onClick={() => setActiveTab('users')} style={tabButtonStyle(activeTab === 'users')}>
          👥 Utilisateurs ({users.length})
        </button>
        <button onClick={() => setActiveTab('messages')} style={tabButtonStyle(activeTab === 'messages')}>
          💬 Messages Chat ({messages.length})
        </button>
      </div>

      {/* 📊 TABLEAU DE BORD */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div style={cardStyle('#3b82f6')}>
            <h3 style={{ margin: 0, color: '#475569' }}>Utilisateurs Inscrits</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '10px 0 0', color: '#1e293b' }}>{users.length}</p>
          </div>
          <div style={cardStyle('#10b981')}>
            <h3 style={{ margin: 0, color: '#475569' }}>Comptes Actifs</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '10px 0 0', color: '#166534' }}>
              {users.filter((u) => u.active).length}
            </p>
          </div>
          <div style={cardStyle('#f59e0b')}>
            <h3 style={{ margin: 0, color: '#475569' }}>Messages Envoyés</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '10px 0 0', color: '#92400e' }}>{messages.length}</p>
          </div>
          <div style={cardStyle('#ef4444')}>
            <h3 style={{ margin: 0, color: '#475569' }}>Comptes Inactifs</h3>
            <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: '10px 0 0', color: '#991b1b' }}>
              {users.filter((u) => !u.active).length}
            </p>
          </div>
        </div>
      )}

      {/* 👥 LISTE DES UTILISATEURS */}
      {activeTab === 'users' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0, color: '#1e293b' }}>Membres Inscrits</h2>
          {users.length === 0 ? (
            <p style={{ color: '#64748b' }}>Aucun utilisateur dans la base de données.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={tableCellHeader}>Nom / Prénom</th>
                  <th style={tableCellHeader}>Email</th>
                  <th style={tableCellHeader}>Rôle</th>
                  <th style={tableCellHeader}>Statut</th>
                  <th style={tableCellHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tableCell}>
                      <strong>{u.prenom} {u.nom}</strong>
                    </td>
                    <td style={tableCell}>{u.email}</td>
                    <td style={tableCell}>{u.role || 'Membre'}</td>
                    <td style={tableCell}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        backgroundColor: u.active ? '#dcfce7' : '#fee2e2',
                        color: u.active ? '#15803d' : '#b91c1c',
                      }}>
                        {u.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={tableCell}>
                      <button
                        onClick={() => handleToggleActive(u)}
                        style={{ ...actionBtnStyle, backgroundColor: u.active ? '#f59e0b' : '#10b981', color: '#fff' }}
                      >
                        {u.active ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 💬 MESSAGES DU CHAT */}
      {activeTab === 'messages' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h2 style={{ marginTop: 0, color: '#1e293b' }}>Messages du Chat</h2>
          {messages.length === 0 ? (
            <p style={{ color: '#64748b' }}>Aucun message dans la base de données.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
              {messages.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{m.sender_email || m.sender || 'Expéditeur'}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '10px' }}>
                      ➜ {m.receiver_email || m.receiver || (m.is_group ? 'Groupe' : 'Destinataire')}
                    </span>
                    <p style={{ margin: '6px 0 0 0', color: '#334155' }}>{m.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteMessage(m.id)}
                    style={{ ...actionBtnStyle, backgroundColor: '#ef4444', color: '#fff' }}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
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
  backgroundColor: isActive ? '#0288d1' : '#f1f5f9',
  color: isActive ? '#ffffff' : '#475569',
  fontWeight: 'bold',
  cursor: 'pointer',
});

const cardStyle = (bgColor) => ({
  backgroundColor: '#ffffff',
  borderLeft: `6px solid ${bgColor}`,
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
});

const tableCellHeader = { padding: '12px 16px', color: '#475569', fontSize: '0.9rem' };
const tableCell = { padding: '14px 16px', color: '#334155' };
const actionBtnStyle = { border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' };