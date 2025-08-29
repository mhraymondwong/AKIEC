import React, { useEffect, useRef, useState } from 'react';

export default function Chat({ isOpenMobile, onCloseMobile, messages, onSend, collapsed }) {
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };

  return (
    <>
      <div
        className="drawer-scrim"
        style={{ display: isOpenMobile ? 'block' : 'none' }}
        onClick={onCloseMobile}
      />
      <aside className={'sidebar right chat ' + (isOpenMobile ? 'open' : '') + (collapsed ? ' collapsed' : '')}>
        <div className="sidebar-header">
          <div className="sidebar-title">AI Assistant</div>
          <div className="sidebar-subtitle">Basic (simulated) chat</div>
        </div>
        <div className="chat-messages">
          {messages.map((m) => (
            <div key={m.id} className={'msg ' + m.role}>
              {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form className="chat-input" onSubmit={submit}>
          <input
            placeholder="Ask for help organizing, summarizing, or exporting…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn primary" type="submit">
            Send
          </button>
        </form>
      </aside>
    </>
  );
}