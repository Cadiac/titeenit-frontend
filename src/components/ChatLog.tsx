import { Channel } from 'phoenix';
import { useEffect, useRef, useState } from 'react';
import chatbubble from '../assets/chat.svg';
import { ChatMsgType } from '../model';
import { useStoreActions, useStoreState } from '../store';

const guildColors = ['red', 'blue', 'green', 'orange', 'white', 'pink'];

export function ChatLog(props: { chatchannel: Channel }) {
  const chatlog = useStoreState((state) => state.game.chatlog);
  const combatlog = useStoreState((state) => state.game.combatlog);
  const pushToChat = useStoreActions((state) => state.game.pushToChat);
  const chatlogStates = ['hide', 'normal', 'full'];
  const [chatStyle, setChatStyle] = useState('normal');
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [handler, setHandler] = useState<any>(null);
  const [chatTab, setchatTab] = useState('chat');
  const { chatchannel } = props;

  const toggleChatModes = () => {
    if (chatStyle === 'full') {
      setChatStyle('hide');
    } else {
      setChatStyle(chatlogStates[chatlogStates.indexOf(chatStyle) + 1]);
      setTimeout(() => {
        if (scrollRef && scrollRef.current) {
          scrollRef.current.scrollIntoView();
        }
      }, 0);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef && scrollRef.current) {
        scrollRef.current.scrollIntoView();
      }
    }, 0);
  }, [chatlog, combatlog, scrollRef]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === `Enter` && text.length > 0) {
        handleMessage();
      }
    };
    if (!handler) {
      setHandler(window.addEventListener('keypress', handleKeyPress));
    }
    return function cleanup() {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [text, chatchannel, handler]);

  const handleMessage = () => {
    if (text === '/audio') {
      const audio = new Audio('/audio.wav');
      audio.play();
      setText('');
      return;
    }
    if (text.includes('/gkick')) {
      window.location.assign('https://eu.battle.net/support/en/article/32221');
      return;
    }
    if (text === '/chat' || text === '/chathelp') {
      pushToChat({ text: 'oading chat.txt failed', type: ChatMsgType.Announcement });
      setText('');
      return;
    }

    chatchannel.push('chat:send_global_message', { text });
    setText('');
  };

  return (
    <div className={`chatlog ${chatStyle}`}>
      {chatStyle !== 'hide' && (
        <div className="chattabs">
          <button
            className="chattab"
            disabled={chatTab === 'chat'}
            onClick={() => setchatTab('chat')}
          >
            Chat
          </button>
          <button
            className="chattab"
            disabled={chatTab === 'combatlog'}
            onClick={() => setchatTab('combatlog')}
          >
            CombatLog
          </button>
        </div>
      )}

      <div className="close" onClick={toggleChatModes}>
        {chatStyle === 'hide' ? (
          <img src={chatbubble} alt="open chat" />
        ) : (
          <span className="closetext">{chatStyle === 'full' ? '<<' : '>>'}</span>
        )}
      </div>
      <div className={`inner ${chatTab === 'combatlog' ? 'combat' : ''}`}>
        <div className="scrollblock">
          {chatStyle !== 'hide' &&
            chatTab === 'chat' &&
            chatlog.map((one) => {
              return (
                <div key={one.text + one.timestamp?.toISOString()} className={one.type}>
                  <span>
                    {`[${one.timestamp?.format('HH:mm:ss')}] ${one.text.split('_USER_')[0]}`}
                  </span>
                  <span style={{ color: guildColors[one.guildId! - 1] }}>{one.user}</span>
                  <span>{one.text.split('_USER_')[1]}</span>
                </div>
              );
            })}

          {chatStyle !== 'hide' &&
            chatTab === 'combatlog' &&
            combatlog.map((one) => {
              return (
                <div
                  key={one.text + one.timestamp?.toISOString()}
                  className={one.type}
                >{`[${one.timestamp?.format('HH:mm:ss')}] ${one.text}`}</div>
              );
            })}
          <div className="scroll" ref={scrollRef} />
        </div>
      </div>
      {chatStyle !== 'hide' && chatTab === 'chat' && (
        <div className="chatinput">
          <input value={text} onChange={(e) => setText(e.target.value)} type="text" />
          {chatchannel && (
            <button type="button" disabled={text.length <= 0} onClick={handleMessage}>
              Send
            </button>
          )}
        </div>
      )}
    </div>
  );
}
