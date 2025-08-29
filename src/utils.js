export const uid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

export async function copyText(txt) {
  try {
    await navigator.clipboard.writeText(txt);
    return true;
  } catch {
    return false;
  }
}

const SAMPLE_SENTENCES = [
  'Problem statement: clarify scope and constraints.',
  'Key insight: cluster related ideas spatially.',
  'Consider edge cases and non-happy paths.',
  'User journey suggests progressive disclosure.',
  'Prioritize readability and navigation.',
  'Use pinning to externalize working memory.',
  'Zoom in for detail, out for structure.',
  'Connections to be added in a future phase.',
  'Simulated AI can suggest organization tactics.',
  'Export prepares artifacts for sharing.'
];

export function mockExtractSnippets(fileName, count = 12) {
  const seedBase =
    Array.from(fileName).reduce((a, c) => a + c.charCodeAt(0), 0) ||
    Math.floor(Math.random() * 1000);
  const rng = (i) => (Math.sin(seedBase + i * 999) + 1) / 2; // 0..1
  const out = [];
  for (let i = 0; i < count; i++) {
    const s1 = SAMPLE_SENTENCES[Math.floor(rng(i) * SAMPLE_SENTENCES.length)];
    const s2 =
      SAMPLE_SENTENCES[Math.floor(rng(i + 13) * SAMPLE_SENTENCES.length)];
    const s3 =
      SAMPLE_SENTENCES[Math.floor(rng(i + 29) * SAMPLE_SENTENCES.length)];
    out.push({
      id: uid(),
      text: `(${i + 1}) ${s1} ${s2} ${s3}`
    });
  }
  return out;
}