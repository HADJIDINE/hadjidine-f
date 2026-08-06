import React, { useState, useRef } from 'react';

const Auth = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [useCamera, setUseCamera] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Formulaire d'inscription
  const [registerData, setRegisterData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    avatarUrl: '', // Contient l'image encodée en Base64
    familyCode: '',
  });

  // Formulaire de connexion
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // Convertir l'image choisie depuis le téléphone/PC en Base64
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegisterData((prev) => ({ ...prev, avatarUrl: reader.result }));
        setShowPhotoModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Activer la caméra de l'appareil
  const startCamera = async () => {
    setUseCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Impossible d'accéder à la caméra : " + err.message);
    }
  };

  // Prendre une photo instantanée depuis la caméra
  const takeSnapshot = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');

      // Arrêter le flux vidéo
      const stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      setRegisterData((prev) => ({ ...prev, avatarUrl: dataUrl }));
      setUseCamera(false);
      setShowPhotoModal(false);
    }
  };

  const closeModal = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
    }
    setUseCamera(false);
    setShowPhotoModal(false);
  };

  // Soumission Inscription
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur lors de l'inscription");
      }

      const data = await response.json();
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userRole', data.role);

      if (onLoginSuccess) onLoginSuccess(data);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  // Soumission Connexion
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Identifiants incorrects');
      }

      const data = await response.json();
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userRole', data.role);

      if (onLoginSuccess) onLoginSuccess(data);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1a237e' }}>
          {isRegistering ? 'Inscription Membre' : 'Connexion'}
        </h2>

        {errorMessage && <div style={styles.error}>{errorMessage}</div>}

        {isRegistering ? (
          <form onSubmit={handleRegisterSubmit} style={styles.form}>
            {/* CARTE PHOTO DE PROFIL INTERACTIVE */}
            <div style={styles.avatarCard} onClick={() => setShowPhotoModal(true)}>
              {registerData.avatarUrl ? (
                <img src={registerData.avatarUrl} alt="Profil" style={styles.avatarCardImg} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <span style={{ fontSize: '30px' }}>📷</span>
                  <span style={{ fontSize: '12px', marginTop: '4px', fontWeight: 'bold' }}>
                    Ajouter une photo
                  </span>
                </div>
              )}
            </div>

            <input
              type="text"
              name="nom"
              placeholder="Nom"
              value={registerData.nom}
              onChange={handleRegisterChange}
              required
              style={styles.input}
            />
            <input
              type="text"
              name="prenom"
              placeholder="Prénom"
              value={registerData.prenom}
              onChange={handleRegisterChange}
              required
              style={styles.input}
            />
            <input
              type="email"
              name="email"
              placeholder="Adresse Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
              style={styles.input}
            />
            <input
              type="text"
              name="familyCode"
              placeholder="Code Familial (ex: FAMILLE2026)"
              value={registerData.familyCode}
              onChange={handleRegisterChange}
              required
              style={styles.inputHighlight}
            />
            <button type="submit" style={styles.button}>
              S'inscrire
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} style={styles.form}>
            <input
              type="email"
              name="email"
              placeholder="Adresse Email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Se connecter
            </button>
          </form>
        )}

        <div style={styles.toggleText}>
          {isRegistering ? 'Déjà un compte ?' : "Vous n'avez pas encore de compte ?"}
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMessage('');
            }}
            style={styles.toggleButton}
          >
            {isRegistering ? 'Se connecter' : "S'inscrire"}
          </button>
        </div>
      </div>

      {/* FENÊTRE MODALE DE CHOIX PHOTO (Caméra / Fichier) */}
      {showPhotoModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>📸 Photo de Profil</h3>
            {!useCamera ? (
              <div style={styles.modalButtonsGroup}>
                <button style={styles.modalBtn} onClick={startCamera}>
                  📷 Prendre une photo en direct
                </button>
                <button
                  style={{ ...styles.modalBtn, backgroundColor: '#388e3c' }}
                  onClick={() => fileInputRef.current.click()}
                >
                  📁 Choisir depuis l'appareil
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <video ref={videoRef} autoPlay style={styles.videoPreview} />
                <button style={styles.button} onClick={takeSnapshot}>
                  📸 Capturer
                </button>
              </div>
            )}
            <button style={styles.modalCloseBtn} onClick={closeModal}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'Segoe UI, sans-serif' },
  card: { width: '100%', maxWidth: '420px', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', backgroundColor: '#fff' },
  avatarCard: { width: '110px', height: '110px', margin: '0 auto 15px auto', borderRadius: '50%', border: '3px dashed #0288d1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', backgroundColor: '#f0f4f8' },
  avatarCardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#0288d1' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '11px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', outline: 'none' },
  inputHighlight: { padding: '11px', borderRadius: '6px', border: '2px solid #0288d1', backgroundColor: '#e1f5fe', fontSize: '14px', outline: 'none' },
  button: { padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#0288d1', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  error: { backgroundColor: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '13px', textAlign: 'center' },
  toggleText: { marginTop: '20px', textAlign: 'center', fontSize: '14px' },
  toggleButton: { background: 'none', border: 'none', color: '#0288d1', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', width: '320px', textAlign: 'center' },
  modalButtonsGroup: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' },
  modalBtn: { padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#0288d1', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  modalCloseBtn: { marginTop: '15px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px' },
  videoPreview: { width: '100%', height: '200px', borderRadius: '8px', objectFit: 'cover', marginBottom: '10px' },
};

export default Auth;