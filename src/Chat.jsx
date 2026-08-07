import React, { useState, useEffect, useRef } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 💾 SAUVEGARDE & RESTAURATION DE L'UTILISATEUR SÉLECTIONNÉ
  const [selectedUser, setSelectedUser] = useState(() => {
    const savedUser = localStorage.getItem('chat_selected_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // Thème (Clair / Sombre / Auto)
  const [theme, setTheme] = useState('light');

  // Emojis & Réactions
  const [showStickers, setShowStickers] = useState(false);
  const stickers = ['👍', '❤️', '😂', '🔥', '🎉', '🙏', '👏', '🤝', '⚡', '💡', '😎', '👌'];
  const reactionsList = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  // Appels & Média
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const handledCallsRef = useRef(new Set());
  const localStreamRef = useRef(null);

  // Enregistrement Vocal
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Indicateurs & Menus
  const [isTypingRemote, setIsTypingRemote] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [deletedMsgIds, setDeletedMsgIds] = useState([]);
  const [unreadUsers, setUnreadUsers] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);

  // Stockage des réactions
  const [reactionsMap, setReactionsMap] = useState({});
  const [activeReactionDetailsMsgId, setActiveReactionDetailsMsgId] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const token = localStorage.getItem('jwtToken');
  const currentUserEmail = localStorage.getItem('userEmail') || '';
  const userRole = localStorage.getItem('userRole') || 'USER';

  // Infos de l'utilisateur connecté
  const currentUser = users.find((u) => u.email === currentUserEmail);
  const currentUserName = currentUser && (currentUser.prenom || currentUser.nom)
    ? `${currentUser.prenom || ''} ${currentUser.nom || ''}`.trim()
    : currentUserEmail;

  // Vérification Administrateur
  const isAdmin = userRole === 'ADMIN' || currentUserEmail.includes('hadjidine');

  // Avatars par défaut
  const defaultAvatarMale = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%230288d1'/><circle cx='32' cy='23' r='12' fill='%23fff'/><path d='M12 52c0-11 9-20 20-20s20 9 20 20z' fill='%23fff'/></svg>";
  const defaultAvatarFemale = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='32' fill='%23e91e63'/><circle cx='32' cy='23' r='12' fill='%23fff'/><path d='M12 52c0-11 9-20 20-20s20 9 20 20z' fill='%23fff'/></svg>";

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('auto');
    else setTheme('light');
  };

  const isDarkMode =
    theme === 'dark' ||
    (theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const formatLastSeen = (lastActiveDate) => {
    if (!lastActiveDate) return 'Hors ligne';
    const now = new Date();
    const lastSeen = new Date(lastActiveDate);
    const diffInSeconds = Math.floor((now - lastSeen) / 1000);

    if (diffInSeconds < 120) return '● En ligne';
    if (diffInSeconds < 3600) return `En ligne il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `En ligne il y a ${Math.floor(diffInSeconds / 3600)} h`;
    return `En ligne il y a ${Math.floor(diffInSeconds / 86400)} j`;
  };

  // ✅ Priorise le Prénom + Nom au lieu de l'E-mail
  const getUserDisplayName = (email) => {
    if (email === currentUserEmail) return 'Moi';
    const foundUser = users.find((u) => u.email === email);
    if (foundUser && (foundUser.prenom || foundUser.nom)) {
      return `${foundUser.prenom || ''} ${foundUser.nom || ''}`.trim();
    }
    return email;
  };

  const isUserAdmin = (email) => {
    if (email === currentUserEmail && isAdmin) return true;
    const foundUser = users.find((u) => u.email === email);
    return foundUser ? (foundUser.role === 'ADMIN' || foundUser.email?.includes('hadjidine')) : false;
  };

  const isUserOnline = (user) => {
    if (!user) return false;
    if (user.active === true) {
      if (user.lastActive) {
        const diff = (new Date() - new Date(user.lastActive)) / 1000;
        return diff < 120;
      }
      return true;
    }
    return false;
  };

  // Badge Administrateur
  const VerifiedBadge = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="#1DA1F2" style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#FFF"/>
    </svg>
  );

  // 1. ✅ CORRECTION CORRIGÉE : Charger la liste des utilisateurs via /api/users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch('https://hadjidine-b.onrender.com/api/users', { headers });
        if (response.ok) {
          const data = await response.json();
          const filtered = data.filter((u) => u.email !== currentUserEmail);
          setUsers(filtered);

          if (selectedUser) {
            const updatedSelected = filtered.find((u) => u.email === selectedUser.email);
            if (updatedSelected) setSelectedUser(updatedSelected);
          }
        }
      } catch (err) {
        console.error('Erreur chargement utilisateurs:', err);
      }
    };
    fetchUsers();
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, [token, currentUserEmail]);

  // 2. Fetch Messages & Synchronisation des réactions / appels
  const fetchMessages = async () => {
    try {
      const receiver = selectedUser ? selectedUser.email : 'GENERAL';
      const sender = currentUserEmail || '';
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(
        `https://hadjidine-b.onrender.com/api/messages?sender=${encodeURIComponent(sender)}&receiver=${encodeURIComponent(receiver)}`,
        { headers }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data);

        let isOtherTyping = false;

        data.forEach((msg) => {
          const content = msg.content || '';
          const msgKey = `${msg.id}_${content}`;

          if (content.startsWith('[REACTION:')) {
            const parts = content.split(':');
            if (parts.length >= 3) {
              const emoji = parts[1];
              const targetMsgId = parts[2].replace(']', '');
              setReactionsMap((prev) => ({
                ...prev,
                [targetMsgId]: {
                  ...(prev[targetMsgId] || {}),
                  [msg.sender]: emoji,
                },
              }));
            }
          }

          if (msg.sender !== currentUserEmail && msg.receiver === currentUserEmail) {
            if (!selectedUser || selectedUser.email !== msg.sender) {
              setUnreadUsers((prev) => ({ ...prev, [msg.sender]: true }));
            }
          }

          // ✅ Gestion synchrone du signalement d'appel (Raccrocher / Refuser / Missed)
          if ((msg.receiver === currentUserEmail || msg.receiver === 'GENERAL') && !handledCallsRef.current.has(msgKey)) {
            if (content.startsWith('[CALL_REQ_AUDIO]') && !activeCall && !incomingCall) {
              setIncomingCall({ caller: msg.sender, type: 'audio' });
              handledCallsRef.current.add(msgKey);
            } else if (content.startsWith('[CALL_REQ_VIDEO]') && !activeCall && !incomingCall) {
              setIncomingCall({ caller: msg.sender, type: 'video' });
              handledCallsRef.current.add(msgKey);
            } else if (content === '[CALL_ACCEPT]' && activeCall?.status === 'calling') {
              setActiveCall((prev) => ({ ...prev, status: 'in-call' }));
              handledCallsRef.current.add(msgKey);
            } else if (content === '[CALL_REJECT]' || content === '[CALL_END]') {
              closeCallMedia();
              setActiveCall(null);
              setIncomingCall(null);
              handledCallsRef.current.add(msgKey);
            }
          }

          if (
            msg.sender !== currentUserEmail &&
            (selectedUser ? msg.sender === selectedUser.email : true)
          ) {
            if (content === '[TYPING]') isOtherTyping = true;
            if (content === '[STOP_TYPING]') isOtherTyping = false;
          }
        });

        setIsTypingRemote(isOtherTyping);
      }
    } catch (err) {
      console.error('Erreur chargement messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 1500);
    return () => clearInterval(interval);
  }, [selectedUser, activeCall, incomingCall]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUser, messages.length]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (user) {
      localStorage.setItem('chat_selected_user', JSON.stringify(user));
      setUnreadUsers((prev) => ({ ...prev, [user.email]: false }));
    } else {
      localStorage.removeItem('chat_selected_user');
    }
  };

  const sendPayloadToBackend = async (contentPayload, targetReceiver = null) => {
    if (!currentUserEmail) return;

    let finalContent = contentPayload;
    if (replyingTo && !contentPayload.startsWith('[')) {
      finalContent = `[REPLY:${getUserDisplayName(replyingTo.sender)}:${replyingTo.content}] ${contentPayload}`;
    }

    const payload = {
      sender: currentUserEmail,
      receiver: targetReceiver || (selectedUser ? selectedUser.email : 'GENERAL'),
      content: finalContent,
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('https://hadjidine-b.onrender.com/api/messages', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!contentPayload.startsWith('[')) {
        setReplyingTo(null);
      }
      await fetchMessages();
    } catch (err) {
      console.error('Erreur d\'envoi:', err);
    }
  };

  const handleInputFocus = () => sendPayloadToBackend('[TYPING]');
  const handleInputBlur = () => sendPayloadToBackend('[STOP_TYPING]');
  const handleInputChange = (e) => setInputMessage(e.target.value);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;
    setLoading(true);
    await sendPayloadToBackend(inputMessage);
    await sendPayloadToBackend('[STOP_TYPING]');
    setInputMessage('');
    setShowStickers(false);
    setLoading(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();

    reader.onload = async () => {
      const tag = isVideo ? '[MEDIA_VID]' : '[MEDIA_IMG]';
      await sendPayloadToBackend(`${tag}${reader.result}`);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          await sendPayloadToBackend(`[MEDIA_AUDIO]${reader.result}`);
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch (err) {
      alert('Aucun microphone détecté.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const checkMediaDevices = async (type) => {
    try {
      const constraints = { audio: true, video: type === 'video' };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      return true;
    } catch (err) {
      alert(`Impossible d'initier l'appel : Matériel non détecté.`);
      return false;
    }
  };

  const closeCallMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  };

  const startCall = async (type) => {
    if (!selectedUser) return;
    const hasHardware = await checkMediaDevices(type);
    if (!hasHardware) return;

    const tag = type === 'video' ? '[CALL_REQ_VIDEO]' : '[CALL_REQ_AUDIO]';
    setActiveCall({ type, status: 'calling', target: selectedUser.email });
    await sendPayloadToBackend(tag, selectedUser.email);
  };

  const answerCall = async () => {
    if (!incomingCall) return;
    const hasHardware = await checkMediaDevices(incomingCall.type);
    if (!hasHardware) {
      rejectOrCancelCall();
      return;
    }

    setActiveCall({ type: incomingCall.type, status: 'in-call', target: incomingCall.caller });
    await sendPayloadToBackend('[CALL_ACCEPT]', incomingCall.caller);
    setIncomingCall(null);
  };

  const rejectOrCancelCall = async () => {
    closeCallMedia();
    if (incomingCall) {
      await sendPayloadToBackend('[CALL_MISSED]', incomingCall.caller);
      await sendPayloadToBackend('[CALL_REJECT]', incomingCall.caller);
      setIncomingCall(null);
    } else if (activeCall) {
      if (activeCall.status === 'calling') {
        await sendPayloadToBackend('[CALL_MISSED]', activeCall.target);
      }
      await sendPayloadToBackend('[CALL_END]', activeCall.target);
      setActiveCall(null);
    }
  };

  const handleAddReaction = async (msgId, emoji) => {
    setReactionsMap((prev) => ({
      ...prev,
      [msgId]: {
        ...(prev[msgId] || {}),
        [currentUserEmail]: emoji,
      },
    }));
    setOpenMenuId(null);
    await sendPayloadToBackend(`[REACTION:${emoji}:${msgId}]`);
  };

  const handleReplyMessage = (msg) => {
    setReplyingTo(msg);
    setOpenMenuId(null);
  };

  const handleDeleteMessage = (msgId) => {
    setDeletedMsgIds((prev) => [...prev, msgId]);
    setOpenMenuId(null);
  };

  const filteredUsers = users.filter((u) =>
    `${u.nom || ''} ${u.prenom || ''} ${u.email || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        ...styles.chatLayout,
        backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
        color: isDarkMode ? '#e0e0e0' : '#333',
      }}
    >
      {/* SIDEBAR AVEC LISTE DES MEMBRES */}
      <div
        style={{
          ...styles.sidebar,
          backgroundColor: isDarkMode ? '#252526' : '#fafafa',
          borderRightColor: isDarkMode ? '#333' : '#eee',
        }}
      >
        <div style={{ ...styles.searchBox, borderBottomColor: isDarkMode ? '#333' : '#eee' }}>
          <input
            type="text"
            placeholder="🔍 Rechercher un membre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              ...styles.searchInput,
              backgroundColor: isDarkMode ? '#333' : '#fff',
              color: isDarkMode ? '#fff' : '#333',
              borderColor: isDarkMode ? '#444' : '#ccc',
            }}
          />
        </div>

        <div style={styles.userList}>
          {/* Groupe Familial Général */}
          <div
            onClick={() => handleSelectUser(null)}
            style={{
              ...styles.userCard,
              backgroundColor:
                selectedUser === null
                  ? isDarkMode
                    ? '#0d47a1'
                    : '#e3f2fd'
                  : 'transparent',
            }}
          >
            <div style={styles.avatarGeneral}>📢</div>
            <div>
              <strong>Groupe Familial</strong>
              <div style={{ ...styles.subText, color: isDarkMode ? '#aaa' : '#888' }}>Chat Général</div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: `1px solid ${isDarkMode ? '#333' : '#eee'}`, margin: '8px 0' }} />

          {/* Rendu dynamique des membres */}
          {filteredUsers.map((user) => {
            const isUnread = unreadUsers[user.email];
            const hasAdminBadge = isUserAdmin(user.email);
            const fallbackAvatar = user.sexe === 'F' ? defaultAvatarFemale : defaultAvatarMale;
            const online = isUserOnline(user);

            return (
              <div
                key={user.id || user.email}
                onClick={() => handleSelectUser(user)}
                style={{
                  ...styles.userCard,
                  backgroundColor:
                    selectedUser?.email === user.email
                      ? isDarkMode
                        ? '#0d47a1'
                        : '#e3f2fd'
                      : 'transparent',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={user.avatarUrl || fallbackAvatar}
                    alt="Avatar"
                    style={styles.avatar}
                  />
                  {isUnread && <span style={styles.unreadBadge} />}
                </div>
                <div>
                  <strong style={{ fontWeight: isUnread ? '900' : 'normal', color: isDarkMode ? '#fff' : '#333' }}>
                    {user.prenom || user.nom ? `${user.prenom || ''} ${user.nom || ''}` : user.email} {hasAdminBadge && <VerifiedBadge />}
                  </strong>
                  <div style={{ fontSize: '12px', color: online ? '#4caf50' : isDarkMode ? '#aaa' : '#888' }}>
                    {online ? '● En ligne' : formatLastSeen(user.lastActive)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ZONE DE CHAT */}
      <div style={styles.chatArea}>
        {/* HEADER */}
        <div
          style={{
            ...styles.chatHeader,
            backgroundColor: isDarkMode ? '#2d2d2d' : '#f9f9f9',
            borderBottomColor: isDarkMode ? '#333' : '#eee',
          }}
        >
          {selectedUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={selectedUser.avatarUrl || (selectedUser.sexe === 'F' ? defaultAvatarFemale : defaultAvatarMale)}
                alt="Avatar"
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', color: isDarkMode ? '#fff' : '#333' }}>
                  {selectedUser.prenom || selectedUser.nom ? `${selectedUser.prenom || ''} ${selectedUser.nom || ''}` : selectedUser.email}
                  {isUserAdmin(selectedUser.email) && <VerifiedBadge />}
                </h3>
                <small style={{ color: isUserOnline(selectedUser) ? '#4caf50' : isDarkMode ? '#aaa' : '#888' }}>
                  {isUserOnline(selectedUser) ? '● En ligne' : formatLastSeen(selectedUser.lastActive)}
                </small>
              </div>
            </div>
          ) : (
            <h3 style={{ margin: 0, color: isDarkMode ? '#fff' : '#333' }}>📢 Groupe Familial (Général)</h3>
          )}

          {/* ZONE DROITE AVEC APPLI/BOUTONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: isDarkMode ? '#e0e0e0' : '#555', display: 'flex', alignItems: 'center' }}>
              👤 {currentUserName} {isAdmin && <VerifiedBadge />}
            </div>

            <button
              onClick={toggleTheme}
              style={{
                ...styles.btnCall,
                backgroundColor: isDarkMode ? '#444' : '#eceff1',
                color: isDarkMode ? '#fff' : '#333',
              }}
              title={`Mode actuel : ${theme.toUpperCase()}`}
            >
              {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🔄'}
            </button>

            {selectedUser && (
              <div style={styles.callButtons}>
                <button onClick={() => startCall('audio')} style={styles.btnCall} title="Appel Audio">
                  📞
                </button>
                <button onClick={() => startCall('video')} style={{ ...styles.btnCall, backgroundColor: '#0288d1' }} title="Appel Vidéo">
                  📹
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MESSAGES */}
        <div style={styles.messagesBox} ref={chatContainerRef}>
          {messages.map((msg, index) => {
            const isMe = msg.sender === currentUserEmail;
            let content = msg.content || '';
            const msgId = msg.id || index;

            const isDeleted = deletedMsgIds.includes(msgId);
            if (isDeleted && !isAdmin) return null;

            const isSignal = content.startsWith('[CALL_REQ') || content.startsWith('[CALL_ACCEPT') || content.startsWith('[CALL_REJECT') || content.startsWith('[CALL_END') || content.startsWith('[REACTION:') || content === '[TYPING]' || content === '[STOP_TYPING]';
            if (isSignal) return null;

            let replyText = null;
            if (content.startsWith('[REPLY:')) {
              const replyEndIndex = content.indexOf(']');
              replyText = content.substring(7, replyEndIndex);
              content = content.substring(replyEndIndex + 1);
            }

            const isImg = content.startsWith('[MEDIA_IMG]');
            const isVid = content.startsWith('[MEDIA_VID]');
            const isAudio = content.startsWith('[MEDIA_AUDIO]');
            const isMissedCall = content === '[CALL_MISSED]';
            const rawMediaUrl = (isImg || isVid || isAudio) ? content.replace(/^\[MEDIA_IMG\]|^\[MEDIA_VID\]|^\[MEDIA_AUDIO\]/, '') : null;

            const msgReactions = reactionsMap[msgId] || {};
            const reactionUsers = Object.keys(msgReactions);
            const totalReactionsCount = reactionUsers.length;
            const uniqueEmojis = Array.from(new Set(Object.values(msgReactions)));

            const senderIsAdmin = isUserAdmin(msg.sender);

            return (
              <div
                key={msgId}
                style={{
                  ...styles.messageWrapper,
                  flexDirection: isMe ? 'row-reverse' : 'row',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '65%', position: 'relative' }}>
                  <div
                    style={{
                      ...styles.messageBubble,
                      backgroundColor: isDeleted && isAdmin
                        ? (isDarkMode ? '#5c1d1d' : '#ffebee')
                        : isMissedCall
                        ? (isDarkMode ? '#5c3c1d' : '#fff3e0')
                        : isMe
                        ? '#0288d1'
                        : (isDarkMode ? '#333' : '#e0e0e0'),
                      color: isDeleted && isAdmin
                        ? '#ef5350'
                        : isMe
                        ? '#fff'
                        : (isDarkMode ? '#fff' : '#333'),
                      border: isDeleted && isAdmin ? '2px solid #ef5350' : 'none',
                    }}
                  >
                    {isDeleted && isAdmin && (
                      <div style={{ fontSize: '10px', color: '#ef5350', fontWeight: 'bold', marginBottom: '4px' }}>
                        🚫 Message supprimé (Admin)
                      </div>
                    )}

                    {replyText && (
                      <div
                        style={{
                          ...styles.replyBoxPreview,
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                        }}
                      >
                        <small style={{ fontWeight: 'bold' }}>Réponse à :</small>
                        <div style={{ fontSize: '11px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {replyText}
                        </div>
                      </div>
                    )}

                    <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '2px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      {getUserDisplayName(msg.sender)} {senderIsAdmin && <VerifiedBadge />}
                    </div>

                    {isMissedCall ? (
                      <div style={{ fontWeight: 'bold', color: '#ef5350' }}>📞 Appel manqué</div>
                    ) : isImg ? (
                      <img src={rawMediaUrl} alt="Photo" style={styles.mediaContent} />
                    ) : isVid ? (
                      <video src={rawMediaUrl} controls style={styles.mediaContent} />
                    ) : isAudio ? (
                      <audio src={rawMediaUrl} controls style={{ width: '200px', marginTop: '5px' }} />
                    ) : (
                      <div>{content}</div>
                    )}

                    <small style={styles.msgTime}>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </small>

                    {totalReactionsCount > 0 && (
                      <div
                        onClick={() => setActiveReactionDetailsMsgId(activeReactionDetailsMsgId === msgId ? null : msgId)}
                        style={{
                          ...styles.reactionBadge,
                          backgroundColor: isDarkMode ? '#444' : '#fff',
                          color: isDarkMode ? '#fff' : '#333',
                          left: isMe ? '-10px' : 'auto',
                          right: isMe ? 'auto' : '-10px',
                        }}
                        title="Cliquer pour voir les réactions"
                      >
                        {uniqueEmojis.join('')} <span style={{ fontSize: '11px', marginLeft: '2px', fontWeight: 'bold' }}>{totalReactionsCount}</span>
                      </div>
                    )}
                  </div>

                  {activeReactionDetailsMsgId === msgId && (
                    <div
                      style={{
                        ...styles.reactionDetailsModal,
                        backgroundColor: isDarkMode ? '#333' : '#fff',
                        color: isDarkMode ? '#fff' : '#333',
                        left: isMe ? '0' : 'auto',
                        right: isMe ? 'auto' : '0',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '12px', borderBottom: '1px solid #ccc', pb: '4px' }}>
                        Réactions ({totalReactionsCount})
                      </div>
                      {reactionUsers.map((userEmail) => (
                        <div key={userEmail} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', fontSize: '12px', margin: '4px 0' }}>
                          <span>{getUserDisplayName(userEmail)}</span>
                          <span style={{ fontSize: '14px' }}>{msgReactions[userEmail]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative', margin: '0 5px' }}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === msgId ? null : msgId)}
                    style={{ ...styles.btnThreeDots, color: isDarkMode ? '#aaa' : '#888' }}
                  >
                    ⋮
                  </button>

                  {openMenuId === msgId && (
                    <div
                      style={{
                        ...styles.actionMenuPop,
                        backgroundColor: isDarkMode ? '#333' : '#fff',
                        color: isDarkMode ? '#fff' : '#333',
                        right: isMe ? '0' : 'auto',
                        left: isMe ? 'auto' : '0',
                      }}
                    >
                      <div style={styles.emojiRow}>
                        {reactionsList.map((emoji) => (
                          <span key={emoji} onClick={() => handleAddReaction(msgId, emoji)} style={styles.reactionEmoji}>
                            {emoji}
                          </span>
                        ))}
                      </div>
                      <hr style={{ margin: '4px 0', border: 'none', borderTop: `1px solid ${isDarkMode ? '#444' : '#eee'}` }} />
                      <div onClick={() => handleReplyMessage(msg)} style={styles.menuItem}>
                        ↩️ Répondre
                      </div>
                      <div onClick={() => handleDeleteMessage(msgId)} style={{ ...styles.menuItem, color: '#ef5350' }}>
                        🗑️ Supprimer
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTypingRemote && (
            <div style={styles.typingIndicator}>
              <span>●</span><span>●</span><span>●</span>
              <small style={{ marginLeft: '6px', color: isDarkMode ? '#aaa' : '#666' }}>est en train d'écrire...</small>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* EMOJIS / STICKERS */}
        {showStickers && (
          <div style={{ ...styles.stickerBar, backgroundColor: isDarkMode ? '#252526' : '#fff', borderTopColor: isDarkMode ? '#333' : '#eee' }}>
            {stickers.map((stk, i) => (
              <span key={i} onClick={() => setInputMessage((prev) => prev + stk)} style={{ cursor: 'pointer', fontSize: '20px' }}>
                {stk}
              </span>
            ))}
          </div>
        )}

        {/* CITER LE MESSAGE */}
        {replyingTo && (
          <div style={{ ...styles.replyBar, backgroundColor: isDarkMode ? '#1a365d' : '#e3f2fd', borderTopColor: isDarkMode ? '#2b6cb0' : '#bbdefb' }}>
            <div>
              <small style={{ fontWeight: 'bold' }}>Réponse à {getUserDisplayName(replyingTo.sender)} :</small>
              <div style={{ fontSize: '12px', color: isDarkMode ? '#ccc' : '#555' }}>{replyingTo.content}</div>
            </div>
            <button onClick={() => setReplyingTo(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', color: isDarkMode ? '#fff' : '#000' }}>
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
            placeholder={selectedUser ? `Message à ${selectedUser.prenom || 'membre'}...` : 'Écrire au groupe...'}
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

      {/* POP-UPS D'APPEL ENTRANT & EN COURS */}
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