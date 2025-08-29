import React from 'react';

export default function Topbar({ onToggleLeft, onToggleRight, onExport }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-logo">A</div>
        <div>
          <div className="brand-title">AKIEC</div>
          <div className="brand-sub">Source → Process → Interact</div>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="tbtn ghost" onClick={onToggleLeft} title="Toggle Documents">
          ☰ Docs
        </button>
        <button className="tbtn ghost" onClick={onToggleRight} title="Toggle Chat">
          💬 Chat
        </button>
        <button className="tbtn primary" onClick={onExport} title="Prepare Export">
          ⬇ Export
        </button>
      </div>
    </div>
  );
}