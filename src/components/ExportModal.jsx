import React from 'react';
import { copyText, downloadJSON } from '../utils';

// Modal for exporting canvas content as JSON
export function ExportModal({ open, onClose, boxes, doc }) {
  if (!open) return null;
  const payload = {
    document: doc ? { id: doc.id, name: doc.name } : null,
    canvas: {
      items: boxes.map((b) => ({
        id: b.id,
        text: b.text,
        x: b.x,
        y: b.y,
        w: b.w,
        h: b.h
      }))
    },
    exportedAt: new Date().toISOString(),
    version: 'phase-1'
  };
  const json = JSON.stringify(payload, null, 2);

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ fontWeight: 700 }}>Prepare Export</div>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="modal-body">
          <div>
            <strong>Summary</strong>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              {boxes.length} info box(es) from {doc ? `"${doc.name}"` : '—'}
            </div>
          </div>
          <div>
            <strong>JSON Preview</strong>
          </div>
          <pre className="codeblock">{json}</pre>
        </div>
        <div className="modal-actions">
          <button
            className="btn"
            onClick={async () => {
              const ok = await copyText(json);
              alert(ok ? 'Copied to clipboard' : 'Copy failed');
            }}
          >
            Copy JSON
          </button>
          <button
            className="btn primary"
            onClick={() => downloadJSON('akiec-export.json', payload)}
          >
            Download JSON
          </button>
        </div>
      </div>
    </div>
  );
}