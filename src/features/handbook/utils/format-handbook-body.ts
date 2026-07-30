export type HandbookBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullet"; text: string; emphasis?: boolean };

const BULLET_PATTERNS = [
  /^Tuần\s/i,
  /^Triệu chứng:/i,
  /^Xử lý:/i,
  /^Giai đoạn/i,
  /^Bước\s/i,
];

function isBulletSentence(sentence: string): boolean {
  return BULLET_PATTERNS.some((pattern) => pattern.test(sentence.trim()));
}

function splitSentences(body: string): string[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  return trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Chuyển plain text body thành các khối dễ đọc trên UI. */
export function formatHandbookBody(body: string): HandbookBodyBlock[] {
  const sentences = splitSentences(body);
  if (sentences.length === 0) {
    return body.trim() ? [{ type: "paragraph", text: body.trim() }] : [];
  }

  const blocks: HandbookBodyBlock[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ") });
    paragraphBuffer = [];
  };

  for (const sentence of sentences) {
    if (isBulletSentence(sentence)) {
      flushParagraph();
      blocks.push({
        type: "bullet",
        text: sentence,
        emphasis: /^Triệu chứng:|^Xử lý:/i.test(sentence),
      });
    } else {
      paragraphBuffer.push(sentence);
    }
  }

  flushParagraph();
  return blocks;
}
