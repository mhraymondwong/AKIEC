import React from 'react';

export default function Topbar({
  onToggleLeft,
  onToggleRight,
  onExport,
  leftCollapsed,
  rightCollapsed,
  onToggleLeftCollapsed,
  onToggleRightCollapsed
}) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <button
          className="tbtn ghost"
          onClick={onToggleLeftCollapsed}
          title={leftCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {leftCollapsed ? '»' : '«'}
        </button>
        <div className="brand">
          <div className="brand-logo">A</div>
          <div>
            <div className="brand-title">AKIEC</div>
            <div className="brand-sub">Source → Process → Interact</div>
          </div>
        </div>
      </div>

      <div className="topbar-actions">
        <button className="tbtn ghost mobile-only" onClick={onToggleLeft} title="Toggle Documents">
          ☰ Docs
        </button>
        <button className="tbtn primary" onClick={onExport} title="Prepare Export">
          ⬇ Export
        </button>
        <button className="tbtn ghost mobile-only" onClick={onToggleRight} title="Toggle Chat">
          💬 Chat
        </button>
        <button
          className="tbtn ghost"
          onClick={onToggleRightCollapsed}
          title={rightCollapsed ? 'Expand Chat' : 'Collapse Chat'}
        >
          {rightCollapsed ? '«' : '»'}
        </button>
      </div>
    </div>
  );
}