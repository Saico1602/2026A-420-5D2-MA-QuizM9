import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
// …

export function useGame(code) {
  const [game, setGame] = useState(null);
  const [chat, setChat] = useState({ enabled: true, messages: [] }); // Ajout 1
  const socketRef = useRef(null); // Ajout 2

  useEffect(() => {
    if (!code) return;

    const socket = io({ transports: ['websocket'] });
    socketRef.current = socket; // Ajout 2

    // … les gestionnaires de 'connect' et 'state', inchangés
    socket.on('connect', () => {
      socket.emit('join', code, (reply) => {
        if (reply.game) setGame(reply.game);
      });
    });

    socket.on('state', setGame);

    // Ajout 3
    socket.on('chat:message', (message) => {
      setChat((chat) => ({ ...chat, messages: [...chat.messages, message] }));
    });

    return () => {
      socket.disconnect();
    };
  }, [code]);

  // Ajout 4
  /** Envoie un message au chat. Retourne une promesse de la réponse, {} ou { error }. */
  function sendMessage(nickname, text) {
    return socketRef.current.emitWithAck('chat:send', { nickname, text });
  }

  return { game, chat, sendMessage };
}
