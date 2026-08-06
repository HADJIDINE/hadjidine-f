import React from 'react';

// TA PHOTO DE DIPLÔME ENCADRÉE (CONVERTIE POUR UN AFFICHAGE DIRECT)
const MY_PHOTO_BASE64 = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAADwCAYAAAA+Vw4UAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTIxMgA...`; // Représentation de ta photo

const Home = ({ onGoToEspF }) => {
  const userInfo = {
    nom: 'AFFANE',
    prenom: 'Hadjidine',
    titre: 'Ingénieur en Électronique et Informatique Industrielle',
    photoUrl: '/hadjidine.png',
    whatsappNumber: '261388795903',
    telephone: '+261 38 87 959 03',
    adresse: 'Sotema Tanambao, Mahajanga',
  };

  // Liens réels vers tes comptes sociaux
  const socialLinks = [
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@hadjidineaffane',
      color: '#000000',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.29 0 .56.04.82.12V9.4a6.27 6.27 0 00-1-.08A6.34 6.34 0 003 15.66 6.34 6.34 0 009.34 22a6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.92 1.63V7.22a4.85 4.85 0 01-1-.53z" />
        </svg>
      ),
    },
    {
      name: 'WhatsApp',
      url: `https://wa.me/${userInfo.whatsappNumber}`,
      color: '#25D366',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.81 9.81 0 0012.04 2zm5.8 14.39c-.24.68-1.2 1.28-1.9 1.33-.53.04-1.23.18-3.56-.78-2.98-1.23-4.9-4.24-5.05-4.44-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.17 1.03-2.46.27-.29.6-.36.8-.36.2 0 .4 0 .58.01.19.01.45-.07.7.53.25.6.86 2.09.93 2.24.07.15.12.33.02.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.3.31-.13.61.17.3.76 1.25 1.64 2.03 1.12.99 2.07 1.3 2.37 1.45.3.15.47.13.64-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15s1.72.81 2.02.96c.3.15.5.22.57.34.07.12.07.7-.17 1.38z" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      url: 'http://t.me/hadjidineaffane',
      color: '#0088cc',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.75 3.99-1.73 6.66-2.87 8.01-3.44 3.82-1.6 4.61-1.88 5.13-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.22z" />
        </svg>
      ),
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/hadji_dine',
      color: '#E1306C',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      url: 'http://www.linkedin.com/in/hadjidine-anffane-549746343',
      color: '#0A66C2',
      svg: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.7a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z" />
        </svg>
      ),
    },
  ];

  return (
    <div style={styles.pageBackground}>
      <div style={styles.overlay} />

      <div style={styles.container}>
        {/* SECTION DU HAUT : ESPACE FAMILIAL & PROFIL */}
        <div style={styles.topGrid}>

          {/* BLOC ESPACE FAMILIAL */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h1 style={styles.espTitle}>Espace Familial</h1>
              <div style={styles.titleDivider} />
            </div>

            <button onClick={onGoToEspF} style={styles.btnPrimary}>
              Voir l'Espace Familial
            </button>
          </div>

          {/* BLOC PROFIL AVEC TA PHOTO 4X4 */}
          <div style={styles.card}>
            <div style={styles.profileHeader}>
              <div style={styles.profileDetails}>
                <p style={styles.infoRow}>
                  Nom : <span style={styles.infoValue}>{userInfo.nom}</span>
                </p>
                <p style={styles.infoRow}>
                  Prénom : <span style={styles.infoValue}>{userInfo.prenom}</span>
                </p>
                <p style={styles.titleBadge}>{userInfo.titre}</p>
              </div>

              {/* Cadre photo 4x4 avec ta vraie image */}
              <div style={styles.photoBox}>
                <img
                  src={userInfo.photoUrl}
                  alt="Hadjidine Affane"
                  style={styles.photoImage}
                />
              </div>
            </div>

            <a
              href={`https://wa.me/${userInfo.whatsappNumber}?text=Bonjour%20Hadjidine,%20je%20souhaite%20consulter%20vos%20compétences.`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.btnSecondary}
            >
              Voir mes compétences
            </a>
          </div>

        </div>

        {/* SECTION DU BAS : ME CONTACTER */}
        <div style={styles.contactCard}>
          <div style={styles.contactHeader}>
            <h2 style={styles.contactTitle}>Me Contacter</h2>
            <p style={styles.contactSubtitle}>
              Retrouvez-moi directement sur mes réseaux professionnels et plateformes
            </p>
          </div>

          {/* RÉSEAUX SOCIAUX */}
          <div style={styles.socialGrid}>
            {socialLinks.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.socialBtn}
              >
                <span style={{ color: item.color, display: 'flex', alignItems: 'center' }}>
                  {item.svg}
                </span>
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{item.name}</span>
              </a>
            ))}
          </div>

          {/* COORDONNÉES RÉELLES */}
          <div style={styles.directContactGrid}>
            <div style={styles.contactItem}>
              <div style={styles.contactIconCircle}>📞</div>
              <div>
                <span style={styles.contactLabel}>Numéro de téléphone / WhatsApp</span>
                <div style={styles.contactValue}>{userInfo.telephone}</div>
              </div>
            </div>

            <div style={styles.contactItem}>
              <div style={styles.contactIconCircle}>📍</div>
              <div>
                <span style={styles.contactLabel}>Adresse exacte</span>
                <div style={styles.contactValue}>{userInfo.adresse}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageBackground: {
    position: 'relative',
    minHeight: '100vh',
    backgroundImage: `url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    fontFamily: "'Plus Jakarta Sans', 'Segoe UI', Roboto, sans-serif",
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    backdropFilter: 'blur(5px)',
  },
  container: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '30px',
    marginBottom: '35px',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  cardHeader: {
    textAlign: 'center',
    margin: 'auto 0',
  },
  espTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  titleDivider: {
    width: '60px',
    height: '4px',
    backgroundColor: '#0288d1',
    margin: '15px auto 0',
    borderRadius: '2px',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '25px',
  },
  profileDetails: {
    flex: 1,
  },
  infoRow: {
    margin: '6px 0',
    color: '#64748b',
    fontSize: '14px',
  },
  infoValue: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: '16px',
  },
  titleBadge: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '6px 12px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    lineHeight: '1.4',
  },
  photoBox: {
    width: '105px',
    height: '105px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '3px solid #0288d1',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    flexShrink: 0,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  btnPrimary: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#0288d1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(2, 136, 209, 0.3)',
  },
  btnSecondary: {
    display: 'block',
    textAlign: 'center',
    width: '100%',
    padding: '14px 20px',
    backgroundColor: '#15803d',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '50px',
    fontWeight: '700',
    fontSize: '15px',
    boxShadow: '0 8px 20px rgba(21, 128, 61, 0.3)',
    boxSizing: 'border-box',
  },
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    padding: '35px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  contactHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  contactTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  contactSubtitle: {
    color: '#64748b',
    fontSize: '14px',
    marginTop: '6px',
  },
  socialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },
  socialBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px 18px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    textDecoration: 'none',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
  },
  directContactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    paddingTop: '25px',
    borderTop: '1px solid #e2e8f0',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: '#f8fafc',
    padding: '15px 20px',
    borderRadius: '14px',
    border: '1px solid #f1f5f9',
  },
  contactIconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    backgroundColor: '#e0f2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
  },
  contactLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '600',
  },
  contactValue: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
  },
};

export default Home;