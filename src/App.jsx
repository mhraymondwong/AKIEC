import React, { useMemo, useState } from 'react';
import Topbar from './components/Topbar.jsx';
import LeftSidebar from './components/LeftSidebar.jsx';
import Canvas from './components/Canvas.jsx';
import Chat from './components/Chat.jsx';
import { ExportModal } from './components/ExportModal.jsx';
import { mockExtractSnippets, sleep, uid } from './utils.js';

export default function App() {
  // Documents
  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);
  const currentDoc = useMemo(
    () => documents.find((d) => d.id === currentDocId) || null,
    [documents, currentDocId]
  );
  const [processing, setProcessing] = useState('idle'); // idle | processing | ready

  // Canvas
  const [boxes, setBoxes] = useState([]);
  const [tool, setTool] = useState('pan'); // pan | select
  const [camera, setCamera] = useState({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    initialized: false
  });

  // Chat
  const [messages, setMessages] = useState([
    {
      id: uid(),
      role: 'assistant',
      text:
        'Hi! I’m your simulated assistant. Upload a PDF to generate mock snippets, pin them to the canvas, then use Select to arrange. Ask me for help any time.'
    }
  ]);

  // UI (mobile drawers)
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Handlers
  const handleUpload = async (file) => {
    setProcessing('processing');
    await sleep(700);
    const snippets = mockExtractSnippets(file.name, 12 + Math.floor(Math.random() * 6));
    const doc = { id: uid(), name: file.name, size: file.size, snippets };
    setDocuments([doc]);
    setCurrentDocId(doc.id);
    setProcessing('ready');
  };

  const handleClearDoc = () => {
    setDocuments([]);
    setCurrentDocId(null);
    setProcessing('idle');
  };

  const addSnippetToCanvas = (snip, x, y) => {
    const defaultW = 260,
      defaultH = 140;
    let nx = x,
      ny = y;
    if (typeof nx !== 'number' || typeof ny !== 'number') {
      nx = 4000 + (Math.random() * 80 - 40);
      ny = 4000 + (Math.random() * 80 - 40);
    }
    setBoxes((b) => [
      ...b,
      { id: uid(), text: snip.text, x: nx, y: ny, w: defaultW, h: defaultH }
    ]);
  };

  const handleSendChat = async (text) => {
    setMessages((msgs) => [...msgs, { id: uid(), role: 'user', text }]);
    await sleep(550);
    const lower = text.toLowerCase();
    let reply = '';
    if (lower.includes('export')) {
      reply =
        'To export, click the Export button in the top bar. You’ll see a JSON preview of your info boxes.';
    } else if (lower.includes('summar')) {
      const preview = boxes
        .slice(-3)
        .map((b, i) => `${i + 1}. ${b.text.slice(0, 80)}${b.text.length > 80 ? '…' : ''}`)
        .join('\n');
      reply = boxes.length
        ? `Here’s a quick summary of your latest items:\n${preview}`
        : 'There’s nothing on the canvas yet. Pin snippets from the left, then ask me to summarize.';
    } else if (lower.includes('fit') || lower.includes('zoom')) {
      reply =
        'Use the toolbar in the canvas: −, +, Fit, and Reset. Pan mode lets you move the canvas; Select mode lets you drag boxes.';
    } else if (lower.includes('help') || lower.includes('how')) {
      reply =
        'Workflow: Upload a PDF → select snippets → Pin to canvas → Arrange in Select mode → Zoom as needed → Export JSON.';
    } else {
      reply =
        'Tip: Try dragging a snippet onto the canvas. Switch to Select to arrange, and use Fit to center your work.';
    }
    setMessages((msgs) => [...msgs, { id: uid(), role: 'assistant', text: reply }]);
  };

  const onDropSnippet = (data, x, y) => {
    addSnippetToCanvas({ text: data.text }, x, y);
  };

  const onPinSnippet = (snip) => addSnippetToCanvas(snip);

  return (
    <div className="app">
      <Topbar
        onToggleLeft={() => setLeftOpen((v) => !v)}
        onToggleRight={() => setRightOpen((v) => !v)}
        onExport={() => setExportOpen(true)}
      />
      <div className="content">
        <LeftSidebar
          isOpenMobile={leftOpen}
          onCloseMobile={() => setLeftOpen(false)}
          currentDoc={currentDoc}
          processing={processing}
          onUpload={handleUpload}
          onPinSnippet={onPinSnippet}
          onClearDoc={handleClearDoc}
        />
        <Canvas
          boxes={boxes}
          setBoxes={setBoxes}
          tool={tool}
          setTool={setTool}
          camera={camera}
          setCamera={setCamera}
          onDropSnippet={onDropSnippet}
        />
        <Chat
          isOpenMobile={rightOpen}
          onCloseMobile={() => setRightOpen(false)}
          messages={messages}
          onSend={handleSendChat}
        />
      </div>
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} boxes={boxes} doc={currentDoc} />
    </div>
  );
}