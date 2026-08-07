import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = "https://hadjidine-b.onrender.com";
const socket = io(API_URL, { autoConnect: false });

const Chat = () => {
  // --- ÉTATS (STATES) ---
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // null = Discussion Groupe
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fonctionnalités avancées
  const [replyTo, setReplyTo] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeReactionModalId, setActiveReactionModalId] = useState(null);
  const [showStickers, setShowStickers] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});

  // Vocaux & Médias
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Appels Audio / Vidéo
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  // --- EFFETS (USEEFFECT) ---
  useEffect(() => {
    // Récupérer l'utilisateur connecté depuis le LocalStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      socket.connect();
      socket.emit('join', parsedUser._id || parsedUser.id);
    }

    fetchUsers();
    fetchMessages();

    // Écouteurs WebSockets
    socket.on('receive_message', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on('user_typing', ({ userId, isTyping }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
    });

    socket.on('incoming_call', (data) => {
      setIncomingCall(data);
    });

    socket.on('call_answered', (data) => {
      setActiveCall((prev) => prev ? { ...prev, status: 'connected' } : null);
    });

    socket.on('call_ended', () => {
      setActiveCall(null);
      setIncomingCall(null);
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('incoming_call');
      socket.off('call_answered');
      socket.off('call_ended');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- REQUÊTES API ---
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur de chargement des utilisateurs:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error("Erreur de chargement des messages:", err);
    }
  };

  // --- GESTION DES MESSAGES & ENVOI ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setLoading(true);
    const messageData = {
      sender: currentUser?._id || currentUser?.id,
      recipient: selectedUser ? selectedUser._id : null,
      text: inputMessage,
      replyTo: replyTo ? replyTo._id : null,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await axios.post(`${API_URL}/api/messages`, messageData);
      socket.emit('send_message', res.data);
      setMessages((prev) => [...prev, res.data]);
      setInputMessage('');
      setReplyTo(null);
    } catch (err) {
      console.error("Erreur d'envoi du message:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- GESTION DES FICHIERS & VOCAUX ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/upload`, formData);
      const messageData = {
        sender: currentUser?._id || currentUser?.id,
        recipient: selectedUser ? selectedUser._id : null,
        mediaUrl: res.data.url,
        mediaType: file.type.startsWith('image/') ? 'image' : 'video',
      };
      const msgRes = await axios.post(`${API_URL}/api/messages`, messageData);
      socket.emit('send_message', msgRes.data);
      setMessages((prev) => [...prev, msgRes.data]);
    } catch (err) {
      console.error("Erreur d'upload du fichier:", err);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'voiceMessage.mp3');

        try {
          const res = await axios.post(`${API_URL}/api/upload`, formData);
          const messageData = {
            sender: currentUser?._id || currentUser?.id,
            recipient: selectedUser ? selectedUser._id : null,
            mediaUrl: res.data.url,
            mediaType: 'audio',
          };
          const msgRes = await axios.post(`${API_URL}/api/messages`, messageData);
          socket.emit('send_message', msgRes.data);
          setMessages((prev) => [...prev, msgRes.data]);
        } catch (err) {
          console.error("Erreur d'envoi du vocal:", err);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch (err) {
      console.error("Accès micro refusé:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // --- INDICATEUR DE SAISIE (TYPING) ---
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleInputFocus = () => {
    socket.emit('typing', { targetId: selectedUser?._id, isTyping: true });
  };

  const handleInputBlur = () => {
    socket.emit('typing', { targetId: selectedUser?._id, isTyping: false });
  };

  // --- REACTION ET MENU D'ACTION ---
  const handleAddReaction = async (messageId, emoji) => {
    try {
      const res = await axios.post(`${API_URL}/api/messages/${messageId}/react`, { emoji, userId: currentUser._id });
      setMessages((prev) => prev.map((msg) => (msg._id === messageId ? res.data : msg)));
      setActiveMenuId(null);
    } catch (err) {
      console.error("Erreur d'ajout de réaction:", err);
    }
  };

  // --- APPELS AUDIO / VIDÉO ---
  const startCall = (type) => {
    if (!selectedUser) return;
    setActiveCall({ target: selectedUser, type, status: 'calling' });
    socket.emit('call_user', { targetId: selectedUser._id, caller: currentUser, type });
  };

  const answerCall = () => {
    setActiveCall({ target: incomingCall.caller, type: incomingCall.type, status: 'connected' });
    socket.emit('answer_call', { targetId: incomingCall.caller._id });
    setIncomingCall(null);
  };

  const rejectOrCancelCall = () => {
    const targetId = activeCall ? activeCall.target?._id : incomingCall?.caller?._id;
    socket.emit('end_call', { targetId });
    setActiveCall(null);
    setIncomingCall(null);
  };

  const getUserDisplayName = (user) => {
    if (!user) return "Utilisateur";
    return user.prenom ? `${user.prenom} ${user.nom || ''}` : user.username || "Utilisateur";
  };

  const filteredUsers = users.filter((u) =>
    getUserDisplayName(u).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMessages = messages.filter((m) => {
    if (!selectedUser) return !m.recipient; // Groupe
    return (
      (m.sender === currentUser?._id && m.recipient === selectedUser._id) ||
      (m.sender === selectedUser._id && m.recipient === currentUser?._id)
    );
  });

  return (
    <div style={{ ...styles.chatLayout, backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f7fb', color: isDarkMode ? '#fff' : '#333' }}>

      {/* SIDEBAR */}
      <div style={{ ...styles.sidebar, borderColor: isDarkMode ? '#333' : '#e0e0e0', backgroundColor: isDarkMode ? '#242424' : '#fff' }}>
        <div style={{ ...styles.searchBox, borderBottomColor: isDarkMode ? '#333' : '#eee' }}>
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...styles.searchInput,
              backgroundColor: isDarkMode ? '#333' : '#f0f2f5',
              color: isDarkMode ? '#fff' : '#333',
              borderColor: isDarkMode ? '#444' : '#ccc',
            }}
          />
        </div>

        <div style={styles.userList}>
          {/* Option Discussion Générale / Groupe */}
          <div
            onClick={() => setSelectedUser(null)}
            style={{
              ...styles.userCard,
              backgroundColor: selectedUser === null ? (isDarkMode ? '#333' : '#e3f2fd') : 'transparent',
            }}
          >
            <div style={styles.avatarGeneral}>💬</div>
            <div>
              <strong>Discussion Générale</strong>
              <div style={{ ...styles.subText, color: isDarkMode ? '#aaa' : '#666' }}>Groupe principal</div>
            </div>
          </div>

          {/* Liste des Utilisateurs */}
          {filteredUsers.map((user) => (
            <div
              key={user._id || user.id}
              onClick={() => setSelectedUser(user)}
              style={{
                ...styles.userCard,
                backgroundColor: selectedUser?._id === user._id ? (isDarkMode ? '#333' : '#e3f2fd') : 'transparent',
              }}
            >
              <img
                src={user.avatar || 'https://via.placeholder.com/40'}
                alt="avatar"
                style={styles.avatar}
              />
              <div>
                <strong>{getUserDisplayName(user)}</strong>
                <div style={{ ...styles.subText, color: isDarkMode ? '#aaa' : '#666' }}>
                  {typingUsers[user._id] ? 'Écrit...' : 'En ligne'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={styles.chatArea}>
        {/* HEADER */}
        <div style={{ ...styles.chatHeader, borderBottomColor: isDarkMode ? '#333' : '#eee', backgroundColor: isDarkMode ? '#242424' : '#fff' }}>
          <div>
            <h3>{selectedUser ? getUserDisplayName(selectedUser) : 'Discussion Générale'}</h3>
            {selectedUser && typingUsers[selectedUser._id] && (
              <span style={styles.typingIndicator}>est en train d'écrire...</span>
            )}
          </div>
          {selectedUser && (
            <div style={styles.callButtons}>
              <button onClick={() => startCall('audio')} style={styles.btnCall} title="Appel Audio">📞</button>
              <button onClick={() => startCall('video')} style={styles.btnCall} title="Appel Vidéo">📹</button>
            </div>
          )}
        </div>

        {/* BOÎTE DE MESSAGES */}
        <div style={styles.messagesBox}>
          {filteredMessages.map((msg) => {
            const isMe = (msg.sender?._id || msg.sender) === (currentUser?._id || currentUser?.id);
            return (
              <div
                key={msg._id}
                style={{
                  ...styles.messageWrapper,
                  justifyContent: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.messageBubble,
                    backgroundColor: isMe ? '#0288d1' : (isDarkMode ? '#333' : '#fff'),
                    color: isMe ? '#fff' : (isDarkMode ? '#fff' : '#333'),
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Aperçu de réponse */}
                  {msg.replyTo && (
                    <div style={{ ...styles.replyBoxPreview, backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)' }}>
                      <small>Réponse : {msg.replyTo.text || 'Média'}</small>
                    </div>
                  )}

                  {/* Texte du message */}
                  {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}

                  {/* Médias */}
                  {msg.mediaUrl && msg.mediaType === 'image' && (
                    <img src={msg.mediaUrl} alt="media" style={styles.mediaContent} />
                  )}
                  {msg.mediaUrl && msg.mediaType === 'video' && (
                    <video src={msg.mediaUrl} controls style={styles.mediaContent} />
                  )}
                  {msg.mediaUrl && msg.mediaType === 'audio' && (
                    <audio src={msg.mediaUrl} controls style={{ marginTop: '5px', width: '200px' }} />
                  )}

                  <span style={{ ...styles.msgTime, color: isMe ? '#e0e0e0' : '#888' }}>
                    {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* Bouton trois points */}
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === msg._id ? null : msg._id)}
                    style={{ ...styles.btnThreeDots, color: isMe ? '#fff' : '#666' }}
                  >
                    ⋮
                  </button>

                  {/* Menu contextuel (Réactions / Répondre) */}
                  {activeMenuId === msg._id && (
                    <div style={{ ...styles.actionMenuPop, backgroundColor: isDarkMode ? '#444' : '#fff', color: isDarkMode ? '#fff' : '#333' }}>
                      <div style={styles.emojiRow}>
                        {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => (
                          <span
                            key={emoji}
                            onClick={() => handleAddReaction(msg._id, emoji)}
                            style={styles.reactionEmoji}
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                      <div
                        onClick={() => { setReplyTo(msg); setActiveMenuId(null); }}
                        style={styles.menuItem}
                      >
                        ↩️ Répondre
                      </div>
                    </div>
                  )}

                  {/* Badges de réactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div
                      onClick={() => setActiveReactionModalId(activeReactionModalId === msg._id ? null : msg._id)}
                      style={{ ...styles.reactionBadge, backgroundColor: isDarkMode ? '#444' : '#fff' }}
                    >
                      {msg.reactions.map((r, i) => <span key={i}>{r.emoji}</span>)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* BARRE DE STICKERS ET RÉPONSE */}
        {showStickers && (
          <div style={{ ...styles.stickerBar, backgroundColor: isDarkMode ? '#242424' : '#fff', borderTopColor: isDarkMode ? '#333' : '#eee' }}>
            {['🔥', '🎉', '💯', '👏', '🚀', '❤️', '😍', '✨'].map((sticker) => (
              <span
                key={sticker}
                onClick={() => { setInputMessage((prev) => prev + sticker); setShowStickers(false); }}
                style={{ fontSize: '24px', cursor: 'pointer' }}
              >
                {sticker}
              </span>
            ))}
          </div>
        )}

        {replyTo && (
          <div style={{ ...styles.replyBar, backgroundColor: isDarkMode ? '#2d2d2d' : '#e3f2fd', borderTopColor: isDarkMode ? '#333' : '#eee' }}>
            <span>Réponse à : <i>{replyTo.text || 'Fichier/Média'}</i></span>
            <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
              ❌
            </button>
          </div>
        )}

        {/* FORMULAIRE D'ENVOI */}
        <form onSubmit={handleSendMessage} style={{ ...styles.inputForm, borderTopColor: isDarkMode ? '#333' : '#eee' }}>
          <button type="button" onClick={() => setShowStickers(!showStickers)} style={styles.toolBtn} title="Emoji">
            😊
          </button>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" style={{ display: 'none' }} />
          <button type="button" onClick={() => fileInputRef.current.click()} style={styles.toolBtn} title="Joindre un fichier">
            📎
          </button>

          {!isRecording ? (
            <button type="button" onClick={startRecording} style={{ ...styles.toolBtn, color: '#0288d1' }} title="Vocal">
              🎙️
            </button>
          ) : (
            <button type="button" onClick={stopRecording} style={{ ...styles.toolBtn, color: '#ef5350', fontWeight: 'bold' }}>
              ⏹️ ({recordingTime}s)
            </button>
          )}

          <input
            type="text"
            placeholder={selectedUser ? `Message à ${getUserDisplayName(selectedUser)}...` : 'Écrire au groupe...'}
            value={inputMessage}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onChange={handleInputChange}
            style={{
              ...styles.chatInput,
              backgroundColor: isDarkMode ? '#333' : '#fff',
              color: isDarkMode ? '#fff' : '#333',
              borderColor: isDarkMode ? '#444' : '#ccc',
            }}
          />

          <button type="submit" disabled={loading} style={styles.btnSend}>
            {loading ? '...' : 'Envoyer'}
          </button>
        </form>
      </div>

      {/* POP-UPS D'APPEL */}
      {incomingCall && (
        <div style={styles.callOverlay}>
          <div style={{ ...styles.callModal, backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', color: isDarkMode ? '#fff' : '#333' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔔</div>
            <h3>Appel {incomingCall.type === 'video' ? 'Vidéo' : 'Audio'} Entrant...</h3>
            <p><strong>{getUserDisplayName(incomingCall.caller)}</strong> vous appelle</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
              <button onClick={answerCall} style={{ ...styles.btnCallAction, backgroundColor: '#2e7d32' }}>
                📞 Répondre
              </button>
              <button onClick={rejectOrCancelCall} style={{ ...styles.btnCallAction, backgroundColor: '#c62828' }}>
                Refuser
              </button>
            </div>
          </div>
        </div>
      )}

      {activeCall && (
        <div style={styles.callOverlay}>
          <div style={{ ...styles.callModal, backgroundColor: isDarkMode ? '#2d2d2d' : '#fff', color: isDarkMode ? '#fff' : '#333' }}>
            <h3>Appel {activeCall.type === 'video' ? 'Vidéo' : 'Audio'}</h3>
            <p style={{ margin: '15px 0', color: isDarkMode ? '#aaa' : '#666' }}>
              {activeCall.status === 'calling' ? 'Sonnerie en cours...' : '🟢 En communication'}
            </p>
            <button onClick={rejectOrCancelCall} style={{ ...styles.btnCallAction, backgroundColor: '#c62828' }}>
              📵 Raccrocher
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- TABLEAU DE STYLES COMPLETS ---
const styles = {
  chatLayout: { display: 'flex', height: '85vh', maxWidth: '1100px', margin: '15px auto', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden', fontFamily: 'Segoe UI, sans-serif' },
  sidebar: { width: '320px', borderRight: '1px solid', display: 'flex', flexDirection: 'column' },
  searchBox: { padding: '15px', borderBottom: '1px solid' },
  searchInput: { width: '100%', padding: '10px', borderRadius: '20px', border: '1px solid', outline: 'none', boxSizing: 'border-box' },
  userList: { flex: 1, overflowY: 'auto', padding: '10px' },
  userCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' },
  avatarGeneral: { width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#0288d1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  unreadBadge: { position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#c62828', borderRadius: '50%' },
  subText: { fontSize: '12px' },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px 20px', borderBottom: '1px solid', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  callButtons: { display: 'flex', gap: '8px' },
  btnCall: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2e7d32', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  messagesBox: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  messageWrapper: { display: 'flex', alignItems: 'flex-start', margin: '2px 0' },
  messageBubble: { padding: '10px 14px', borderRadius: '12px', wordBreak: 'break-word', position: 'relative', width: '100%' },
  mediaContent: { maxWidth: '100%', maxHeight: '220px', borderRadius: '8px', marginTop: '5px' },
  msgTime: { fontSize: '10px', opacity: 0.7, float: 'right', marginTop: '4px', marginLeft: '8px' },
  btnThreeDots: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '2px 6px' },
  actionMenuPop: { position: 'absolute', bottom: '25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', padding: '8px', zIndex: 100, minWidth: '150px' },
  emojiRow: { display: 'flex', gap: '6px', marginBottom: '4px' },
  reactionEmoji: { cursor: 'pointer', fontSize: '16px' },
  reactionBadge: { position: 'absolute', bottom: '-10px', borderRadius: '12px', padding: '2px 6px', fontSize: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  reactionDetailsModal: { position: 'absolute', bottom: '-45px', borderRadius: '8px', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', zIndex: 101, minWidth: '140px' },
  menuItem: { padding: '6px 8px', fontSize: '12px', cursor: 'pointer', borderRadius: '4px' },
  replyBoxPreview: { padding: '4px 8px', borderRadius: '4px', borderLeft: '3px solid #0288d1', marginBottom: '6px' },
  replyBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 15px', borderTop: '1px solid' },
  typingIndicator: { display: 'flex', alignItems: 'center', gap: '3px', color: '#0288d1', fontSize: '12px', padding: '5px' },
  stickerBar: { display: 'flex', gap: '8px', padding: '8px 15px', borderTop: '1px solid', overflowX: 'auto' },
  inputForm: { display: 'flex', padding: '15px', gap: '10px', borderTop: '1px solid', alignItems: 'center' },
  toolBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px 6px' },
  chatInput: { flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid', outline: 'none' },
  btnSend: { padding: '10px 20px', backgroundColor: '#0288d1', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
  callOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  callModal: { padding: '30px', borderRadius: '15px', textAlign: 'center', minWidth: '280px' },
  btnCallAction: { padding: '10px 20px', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' },
};

export default Chat;