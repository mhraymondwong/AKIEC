import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { clamp } from '../utils';

function Toolbar({ tool, setTool, zoom, setZoom, fitToContent, resetView }) {
  return (
    <div className="toolbar">
      <div className="tool-group">
        <div className="segmented">
          <button
            className={tool === 'pan' ? 'active' : ''}
            onClick={() => setTool('pan')}
            title="Pan mode (drag canvas)"
          >
            ✋ Pan
          </button>
          <button
            className={tool === 'select' ? 'active' : ''}
            onClick={() => setTool('select')}
            title="Select/Manipulate"
          >
            ⌖ Select
          </button>
        </div>
      </div>
      <div className="tool-group">
        <div className="zoom">
          <button className="zbtn" onClick={() => setZoom('out')} title="Zoom out">
            −
          </button>
          <div className="zlabel">{Math.round(zoom.scale * 100)}%</div>
          <button className="zbtn" onClick={() => setZoom('in')} title="Zoom in">
            +
          </button>
          <button className="zbtn" onClick={fitToContent} title="Fit to content">
            Fit
          </button>
          <button className="zbtn" onClick={resetView} title="Reset view">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({
  box,
  selected,
  onSelect,
  onMove,
  onResize,
  onDelete,
  onDuplicate,
  onUpdateText,
  scale,
  canDrag
}) {
  const [editing, setEditing] = useState(false);
  const startRef = useRef({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    px: 0,
    py: 0,
    moving: false,
    resizing: false
  });

  const onPointerDownHeader = (e) => {
    if (!canDrag) return;
    e.stopPropagation();
    e.preventDefault();
    startRef.current = {
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h,
      px: e.clientX,
      py: e.clientY,
      moving: true,
      resizing: false
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onSelect(box.id, true);
  };

  const onPointerMove = (e) => {
    const st = startRef.current;
    if (st.moving) {
      const dx = (e.clientX - st.px) / scale;
      const dy = (e.clientY - st.py) / scale;
      onMove(box.id, st.x + dx, st.y + dy);
    } else if (st.resizing) {
      const dx = (e.clientX - st.px) / scale;
      const dy = (e.clientY - st.py) / scale;
      onResize(box.id, clamp(st.w + dx, 140, 1200), clamp(st.h + dy, 80, 1000));
    }
  };

  const endDrag = (e) => {
    startRef.current.moving = false;
    startRef.current.resizing = false;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  const onPointerDownResize = (e) => {
    e.stopPropagation();
    e.preventDefault();
    startRef.current = {
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h,
      px: e.clientX,
      py: e.clientY,
      moving: false,
      resizing: true
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onSelect(box.id, true);
  };

  return (
    <div
      className={'infobox' + (selected ? ' selected' : '')}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect(box.id, false);
      }}
      onDoubleClick={() => setEditing((v) => !v)}
    >
      <div
        className="ibox-header"
        onPointerDown={onPointerDownHeader}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 700, color: '#334155' }}>Info</span>
          <span className="badge" title="Drag in Select mode">
            drag
          </span>
        </div>
        <div className="ibox-actions">
          <button className="ibox-btn" onClick={() => setEditing((v) => !v)} title="Edit">
            ✏️
          </button>
          <button className="ibox-btn" onClick={() => onDuplicate(box.id)} title="Duplicate">
            ⎘
          </button>
          <button
            className="ibox-btn"
            style={{ color: 'var(--danger)' }}
            onClick={() => onDelete(box.id)}
            title="Delete"
          >
            🗑
          </button>
        </div>
      </div>
      <div className="ibox-body">
        {editing ? (
          <textarea
            className="edit-area"
            defaultValue={box.text}
            onBlur={(e) => {
              onUpdateText(box.id, e.target.value);
              setEditing(false);
            }}
            autoFocus
          />
        ) : (
          box.text
        )}
      </div>
      <div
        className="resize-handle"
        onPointerDown={onPointerDownResize}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        title="Resize"
      />
    </div>
  );
}

export default function Canvas({
  boxes,
  setBoxes,
  tool,
  setTool,
  camera,
  setCamera,
  onDropSnippet
}) {
  const viewportRef = useRef(null);
  const worldRef = useRef(null);
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const panRef = useRef({ panning: false, px: 0, py: 0, ox: 0, oy: 0 });

  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (rect) setViewportSize({ w: rect.width, h: rect.height });
    });
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (viewportSize.w && viewportSize.h) {
      setCamera((c) => {
        if (c.initialized) return c;
        const worldW = worldRef.current?.offsetWidth || 8000;
        const worldH = worldRef.current?.offsetHeight || 8000;
        const offsetX = viewportSize.w / 2 - worldW / 2;
        const offsetY = viewportSize.h / 2 - worldH / 2;
        return { ...c, offsetX, offsetY, scale: 1, initialized: true };
      });
    }
  }, [viewportSize.w, viewportSize.h, setCamera]);

  const onViewportPointerDown = (e) => {
    if (tool !== 'pan') return;
    if (e.button !== 0) return;
    e.preventDefault();
    panRef.current = {
      panning: true,
      px: e.clientX,
      py: e.clientY,
      ox: camera.offsetX,
      oy: camera.offsetY
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onViewportPointerMove = (e) => {
    if (!panRef.current.panning) return;
    const dx = e.clientX - panRef.current.px;
    const dy = e.clientY - panRef.current.py;
    setCamera((c) => ({
      ...c,
      offsetX: panRef.current.ox + dx,
      offsetY: panRef.current.oy + dy
    }));
  };

  const onViewportPointerUp = (e) => {
    panRef.current.panning = false;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  const screenToWorld = (clientX, clientY) => {
    const rect = viewportRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - camera.offsetX) / camera.scale;
    const y = (clientY - rect.top - camera.offsetY) / camera.scale;
    return { x, y };
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onDrop = (e) => {
    e.preventDefault();
    const json = e.dataTransfer.getData('application/json');
    if (json) {
      try {
        const data = JSON.parse(json);
        if (data.type === 'snippet') {
          const { x, y } = screenToWorld(e.clientX, e.clientY);
          onDropSnippet(data, x, y);
          setTool('select');
        }
      } catch {}
    }
  };

  const setZoom = (dir) => {
    const factor = dir === 'in' ? 1.15 : 1 / 1.15;
    const newScale = clamp(camera.scale * factor, 0.2, 3);
    const cx = viewportSize.w / 2;
    const cy = viewportSize.h / 2;
    const wx = (cx - camera.offsetX) / camera.scale;
    const wy = (cy - camera.offsetY) / camera.scale;
    const offsetX = cx - wx * newScale;
    const offsetY = cy - wy * newScale;
    setCamera({ ...camera, scale: newScale, offsetX, offsetY });
  };

  const fitToContent = () => {
    if (!boxes.length) {
      resetView();
      return;
    }
    const padding = 60;
    const minW = 300,
      minH = 200;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    boxes.forEach((b) => {
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.w);
      maxY = Math.max(maxY, b.y + b.h);
    });
    const contentW = Math.max(maxX - minX, minW);
    const contentH = Math.max(maxY - minY, minH);
    const scaleX = (viewportSize.w - padding * 2) / contentW;
    const scaleY = (viewportSize.h - padding * 2) / contentH;
    const newScale = clamp(Math.min(scaleX, scaleY), 0.2, 2.5);
    const cx = viewportSize.w / 2,
      cy = viewportSize.h / 2;
    const contentCenterX = minX + contentW / 2;
    const contentCenterY = minY + contentH / 2;
    const offsetX = cx - contentCenterX * newScale;
    const offsetY = cy - contentCenterY * newScale;
    setCamera((c) => ({ ...c, scale: newScale, offsetX, offsetY }));
  };

  const resetView = () => {
    const worldW = worldRef.current?.offsetWidth || 8000;
    const worldH = worldRef.current?.offsetHeight || 8000;
    const offsetX = viewportSize.w / 2 - worldW / 2;
    const offsetY = viewportSize.h / 2 - worldH / 2;
    setCamera((c) => ({ ...c, scale: 1, offsetX, offsetY }));
  };

  const setZoomExternal = (dir) => {
    if (dir === 'in' || dir === 'out') setZoom(dir);
  };

  const selectBox = (id, bringToFront) => {
    setSelectedId(id);
    if (bringToFront) {
      setBoxes((arr) => {
        const idx = arr.findIndex((b) => b.id === id);
        if (idx === -1) return arr;
        const copy = arr.slice();
        const [box] = copy.splice(idx, 1);
        copy.push(box);
        return copy;
      });
    }
  };
  const moveBox = (id, x, y) => {
    setBoxes((arr) => arr.map((b) => (b.id === id ? { ...b, x, y } : b)));
  };
  const resizeBox = (id, w, h) => {
    setBoxes((arr) => arr.map((b) => (b.id === id ? { ...b, w, h } : b)));
  };
  const deleteBox = (id) => {
    setBoxes((arr) => arr.filter((b) => b.id !== id));
    setSelectedId((sid) => (sid === id ? null : sid));
  };
  const duplicateBox = (id) => {
    setBoxes((arr) => {
      const b = arr.find((b) => b.id === id);
      if (!b) return arr;
      const dupe = { ...b, id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2), x: b.x + 24, y: b.y + 24 };
      return [...arr, dupe];
    });
  };
  const updateText = (id, text) => {
    setBoxes((arr) => arr.map((b) => (b.id === id ? { ...b, text } : b)));
  };

  return (
    <div className="canvas-wrap">
      <Toolbar
        tool={tool}
        setTool={setTool}
        zoom={camera}
        setZoom={setZoomExternal}
        fitToContent={fitToContent}
        resetView={resetView}
      />
      <div
        className="viewport"
        ref={viewportRef}
        onPointerDown={onViewportPointerDown}
        onPointerMove={onViewportPointerMove}
        onPointerUp={onViewportPointerUp}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => setSelectedId(null)}
      >
        <div
          className="world"
          ref={worldRef}
          style={{
            transform: `translate(${camera.offsetX}px, ${camera.offsetY}px) scale(${camera.scale})`
          }}
        >
          {boxes.map((b) => (
            <InfoBox
              key={b.id}
              box={b}
              selected={b.id === selectedId}
              onSelect={selectBox}
              onMove={moveBox}
              onResize={resizeBox}
              onDelete={deleteBox}
              onDuplicate={duplicateBox}
              onUpdateText={updateText}
              scale={camera.scale}
              canDrag={tool === 'select'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}