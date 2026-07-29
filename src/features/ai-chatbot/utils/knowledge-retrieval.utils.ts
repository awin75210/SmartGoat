import { normalizeKnowledgeCategory } from "../constants/knowledge-categories";
import type { QueryIntent } from "../services/query-intent.service";
import type { KnowledgeArticle, KnowledgeFaq } from "../types/chatbot.types";

const VI_STOP_WORDS = new Set([
  "là",
  "gì",
  "có",
  "không",
  "nên",
  "cần",
  "các",
  "cho",
  "của",
  "và",
  "với",
  "trong",
  "khi",
  "thì",
  "một",
  "được",
  "bị",
  "bạn",
  "tôi",
  "nhà",
  "hay",
  "hoặc",
  "the",
  "what",
  "how",
  "why",
]);

export function tokenizeKnowledgeQuery(text: string): string[] {
  const lower = text.toLowerCase();
  const tokens = lower
    .split(/[\s,.;:!?()\-–—/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !VI_STOP_WORDS.has(t));

  const phrases: string[] = [];
  if (lower.includes("dê con")) phrases.push("dê con");
  if (lower.includes("tiêu chảy") || lower.includes("tieu chay")) phrases.push("tiêu chảy");
  if (lower.includes("khẩu phần") || lower.includes("khau phan")) phrases.push("khẩu phần");
  if (lower.includes("dinh dưỡng")) phrases.push("dinh dưỡng");

  return [...new Set([...tokens, ...phrases])];
}

function scoreText(queryTokens: string[], haystack: string): number {
  const lower = haystack.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (lower.includes(token)) score += 2;
  }
  return score;
}

function phraseBonus(query: string, haystack: string): number {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return 0;
  const h = haystack.toLowerCase();
  if (h.includes(q)) return 12;
  return 0;
}

export function knowledgeCategoryRetrievalBoost(
  intent: QueryIntent,
  query: string,
  category: string,
): number {
  const slug = normalizeKnowledgeCategory(category);
  let boost = 0;
  if (intent.isHealthRelated && slug === "common_diseases") boost += 8;
  const lower = query.toLowerCase();
  const kidLike = ["dê con", "sơ sinh", "weaning", "cai sữa", "cai sua", "1 tháng", "2 tháng"].some((k) =>
    lower.includes(k),
  );
  if (kidLike && slug === "kid_care_stages") boost += 8;
  if (intent.isNutritionRelated && slug === "nutrition") boost += 5;
  return boost;
}

export function scoreKnowledgeArticle(
  queryTokens: string[],
  article: KnowledgeArticle,
  intent: QueryIntent,
  query: string,
): number {
  const haystack = [article.title, article.summary, article.content, article.keywords.join(" ")].join("\n");
  return (
    scoreText(queryTokens, article.title) * 3 +
    scoreText(queryTokens, article.summary) * 2 +
    scoreText(queryTokens, article.content) +
    scoreText(queryTokens, article.keywords.join(" ")) * 2 +
    phraseBonus(query, article.title) * 2 +
    phraseBonus(query, article.summary) +
    knowledgeCategoryRetrievalBoost(intent, query, article.category)
  );
}

export function scoreKnowledgeFaq(queryTokens: string[], faq: KnowledgeFaq, query: string): number {
  return (
    scoreText(queryTokens, faq.question) * 4 +
    scoreText(queryTokens, faq.answer) * 2 +
    scoreText(queryTokens, faq.keywords.join(" ")) * 2 +
    phraseBonus(query, faq.question) * 3 +
    phraseBonus(query, faq.answer) +
    faq.priority * 0.15
  );
}

export function rankPublishedKnowledge(
  articles: KnowledgeArticle[],
  faqs: KnowledgeFaq[],
  query: string,
  intent: QueryIntent,
  limit: number,
): { articles: KnowledgeArticle[]; faqs: KnowledgeFaq[] } {
  const queryTokens = tokenizeKnowledgeQuery(query);
  const hasQuerySignal = queryTokens.length > 0 || query.trim().length >= 3;

  const rankedArticles = articles
    .map((a) => ({ item: a, score: scoreKnowledgeArticle(queryTokens, a, intent, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const rankedFaqs = faqs
    .map((f) => ({ item: f, score: scoreKnowledgeFaq(queryTokens, f, query) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  let pickedArticles = rankedArticles.slice(0, limit).map((r) => r.item);
  let remaining = Math.max(0, limit - pickedArticles.length);
  let pickedFaqs = rankedFaqs.slice(0, remaining > 0 ? remaining : limit).map((r) => r.item);

  if (hasQuerySignal && pickedArticles.length === 0 && pickedFaqs.length === 0) {
    const intentFaqs = faqs
      .filter((f) => {
        if (intent.isHealthRelated) {
          return /bệnh|tiêu|sốt|ho|triệu|thú y/i.test(`${f.question} ${f.keywords.join(" ")}`);
        }
        if (intent.isNutritionRelated) {
          return /dinh dưỡng|khẩu phần|thức ăn|ăn/i.test(`${f.question} ${f.keywords.join(" ")}`);
        }
        return false;
      })
      .sort((a, b) => b.priority - a.priority)
      .slice(0, Math.min(2, limit));
    if (intentFaqs.length) {
      pickedFaqs = intentFaqs;
    }
  }

  if (pickedArticles.length + pickedFaqs.length < limit && articles.length > 0 && pickedArticles.length === 0) {
    const byIntent = articles
      .filter((a) => {
        const slug = normalizeKnowledgeCategory(a.category);
        if (intent.isHealthRelated) return slug === "common_diseases";
        if (intent.isNutritionRelated) return slug === "nutrition";
        return false;
      })
      .slice(0, 1);
    pickedArticles = byIntent;
  }

  pickedFaqs = pickedFaqs.slice(0, Math.max(0, limit - pickedArticles.length));

  return { articles: pickedArticles, faqs: pickedFaqs };
}

export function isSmallTalkQuery(question: string): boolean {
  const q = question.trim().toLowerCase();
  return /^(hello|hi|hey|xin chào|chào bạn|chào|alo)\b/.test(q) || q === "test";
}

export function pickBestFaqForQuestion(
  faqs: { question: string; answer: string }[],
  userQuestion: string,
): { question: string; answer: string } | null {
  if (!faqs.length) return null;
  const tokens = tokenizeKnowledgeQuery(userQuestion);
  let best: { question: string; answer: string; score: number } | null = null;
  for (const f of faqs) {
    const score = scoreText(tokens, f.question) * 4 + phraseBonus(userQuestion, f.question) * 3;
    if (!best || score > best.score) {
      best = { ...f, score };
    }
  }
  return best && best.score > 0 ? { question: best.question, answer: best.answer } : null;
}
