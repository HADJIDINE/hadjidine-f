import React, { useState, useEffect } from 'react';

// 🌐 URL de ton Backend Spring Boot déployé sur Render
const API_BASE_URL = 'https://hadjidine-b.onrender.com';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [newFamilyCode, setNewFamilyCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('jwtToken');
  const currentUserEmail = localStorage.getItem('userEmail');

  // Charger la liste complète des membres
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erreur lors du chargement des membres');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Activer / Désactiver un membre
  const handleToggleStatus = async (userId, email, role) => {
    if (email === currentUserEmail || role === 'ROLE_ADMIN') {
      alert("Vous ne pouvez pas désactiver un compte Administrateur !");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Action échouée');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Supprimer un membre
  const handleDeleteUser = async (userId, email, role) => {
    if (email === currentUserEmail || role === 'ROLE_ADMIN') {
      alert("Vous ne pouvez pas supprimer un compte Administrateur !");
      return;
    }
    if (!window.confirm('Supprimer définitivement ce membre ?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Suppression échouée');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Réinitialiser le mot de passe d'un membre
  const handleResetPassword = async (userId, email) => {
    const newPassword = prompt(`Entrez le nouveau mot de passe pour ${email} :`);
    if (!newPassword || newPassword.trim() === '') return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${userId}/reset-password?newPassword=${encodeURIComponent(newPassword)}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Échec de la réinitialisation');
      setMessage(`Le mot de passe de ${email} a été réinitialisé !`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Mettre à jour le code familial (Modifié et corrigé pour Render)
  const handleUpdateCode = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/family-code?code=${encodeURIComponent(newFamilyCode)}`, {
        method: 'PUT', // Utilisation de PUT au lieu de POST
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) throw new Error('Mise à jour du code échouée');
      setMessage('Nouveau code familial enregistré avec succès !');
      setNewFamilyCode('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛠️ Panneau d'Administration</h2>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Section Code Familial */}
      <section style={styles.card}>
        <h3 style={styles.cardTitle}>🔑 Modifier le Code Familial</h3>
        <form onSubmit={handleUpdateCode} style={styles.form}>
          <input
            type="text"
            placeholder="Nouveau code (ex: FAMILLE2026)"
            value={newFamilyCode}
            onChange={(e) => setNewFamilyCode(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.btnPrimary}>Mettre à jour</button>
        </form>
      </section>

      {/* Section Gestion des Membres */}
      <section style={styles.card}>
        <div style={styles.headerFlex}>
          <h3 style={styles.cardTitle}>👥 Membres Inscrits</h3>
          <span style={styles.countBadge}>{users ? users.length : 0} membres</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Photo</th>
                <th style={styles.th}>Nom / Prénom</th>
                <th style={styles.th}>E-mail</th>
                <th style={styles.th}>Rôle</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users && users.map((u) => {
                const isAdmin = u.role === 'ROLE_ADMIN';
                return (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>
                      <img
                        src={u.avatarUrl || 'https://via.placeholder.com/40'}
                        alt="Avatar"
                        style={styles.avatarImg}
                      />
                    </td>
                    <td style={styles.td}><strong>{u.nom}</strong> {u.prenom}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={isAdmin ? styles.badgeAdmin : styles.badgeUser}>
                        {isAdmin ? 'ADMIN' : 'UTILISATEUR'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {u.active ? (
                        <span style={styles.statusActive}>● Actif</span>
                      ) : (
                        <span style={styles.statusInactive}>● Inactif</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.email, u.role)}
                          disabled={isAdmin}
                          style={isAdmin ? styles.btnDisabled : styles.btnToggle}
                        >
                          {u.active ? 'Désactiver' : 'Activer'}
                        </button>

                        <button
                          onClick={() => handleResetPassword(u.id, u.email)}
                          style={styles.btnReset}
                        >
                          Réinitialiser MDP
                        </button>

                        {!isAdmin && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email, u.role)}
                            style={styles.btnDelete}
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1000px', margin: '30px auto', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
  title: { textAlign: 'center', color: '#1a237e', marginBottom: '25px' },
  card: { backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' },
  cardTitle: { margin: 0, color: '#333', fontSize: '18px' },
  headerFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  countBadge: { backgroundColor: '#e3f2fd', color: '#0288d1', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' },
  form: { display: 'flex', gap: '12px', marginTop: '15px' },
  input: { flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' },
  btnPrimary: { padding: '12px 20px', backgroundColor: '#0288d1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' },
  th: { padding: '12px 15px', color: '#555', borderBottom: '2px solid #eee', textAlign: 'left', fontSize: '14px' },
  tr: { backgroundColor: '#fafafa', borderRadius: '8px' },
  td: { padding: '12px 15px', fontSize: '14px', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' },
  avatarImg: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' },
  actionGroup: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  btnToggle: { padding: '6px 12px', backgroundColor: '#ef6c00', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  btnReset: { padding: '6px 12px', backgroundColor: '#6a1b9a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  btnDelete: { padding: '6px 12px', backgroundColor: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  btnDisabled: { padding: '6px 12px', backgroundColor: '#bdbdbd', color: '#757575', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontSize: '12px' },
  badgeAdmin: { backgroundColor: '#c62828', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  badgeUser: { backgroundColor: '#1565c0', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  statusActive: { color: '#2e7d32', fontWeight: 'bold' },
  statusInactive: { color: '#c62828', fontWeight: 'bold' },
  success: { padding: '12px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '6px', marginBottom: '20px' },
  error: { padding: '12px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '6px', marginBottom: '20px' },
};

export default AdminPanel;