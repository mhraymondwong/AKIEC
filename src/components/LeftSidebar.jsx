import React, { useRef, useState } from 'react';

function UploadZone({ onUpload, processing }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);

  return (
    <div
      className={'upload-zone' + (dragOver ? ' dragover' : '')}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <div className="upload-title">Upload PDF</div>
      <div className="upload-sub">Drag & drop a PDF here, or choose a file.</div>
      <div className="upload-actions">
        <button className="btn" onClick={() => inputRef.current?.click()}>
          📄 Choose PDF
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f);
            e.target.value = '';
          }}
        />
      </div>
      <div style={{ marginTop: 10 }} className="status">
        <span
          className={
            'badge ' +
            (processing === 'processing'
              ? 'proc'
              : processing === 'ready'
              ? 'good'
              : 'idle')
          }
        >
          {processing === 'processing'
            ? 'Processing (mock)…'
            : processing === 'ready'
            ? 'Ready'
            : 'Idle'}
        </span>
        <span>Phase 1: mock text extraction (no real PDF parsing)</span>
      </div>
    </div>
  );
}

function SnippetItem({ snippet, onPin }) {
  const onDragStart = (e) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'snippet',
        id: snippet.id,
        text: snippet.text
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };
  return (
    <div className="snippet" draggable onDragStart={onDragStart}>
      <div className="snippet-content" title={snippet.text}>
        {snippet.text}
      </div>
      <div className="snippet-actions">
        <button className="pill add" onClick={() => onPin(snippet)}>
          Pin
        </button>
      </div>
    </div>
  );
}

export default function LeftSidebar({
  isOpenMobile,
  onCloseMobile,
  currentDoc,
  processing,
  onUpload,
  onPinSnippet,
  onClearDoc
}) {
  return (
    <>
      <div
        className="drawer-scrim"
        style={{ display: isOpenMobile ? 'block' : 'none' }}
        onClick={onCloseMobile}
      />
      <aside className={'sidebar left ' + (isOpenMobile ? 'open' : '')}>
        <div className="sidebar-header">
          <div className="sidebar-title">Documents & Snippets</div>
          <div className="sidebar-subtitle">Upload → Process → Select → Act</div>
        </div>
        <div className="sidebar-body">
          <UploadZone onUpload={onUpload} processing={processing} />
          <div className="status" style={{ justifyContent: 'space-between' }}>
            <div>
              <strong>Current:</strong> {currentDoc ? currentDoc.name : '—'}
            </div>
            <button className="btn warning" onClick={onClearDoc} disabled={!currentDoc}>
              Clear
            </button>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Snippets</div>
            <div className="snippet-list">
              {(currentDoc?.snippets || []).map((s) => (
                <SnippetItem key={s.id} snippet={s} onPin={onPinSnippet} />
              ))}
              {!currentDoc && (
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                  No document loaded. Upload a PDF to generate mock snippets.
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}