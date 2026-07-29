export type KnowledgeStatus = "draft" | "published" | "hidden";

export type KnowledgeArticleRow = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  keywords: string;
  status: KnowledgeStatus;
  created_at: string;
  updated_at: string;
};

export type KnowledgeFaqRow = {
  id: string;
  question: string;
  answer: string;
  keywords: string;
  priority: number;
  status: KnowledgeStatus;
  created_at: string;
};

export type KnowledgeArticle = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  keywords: string[];
  status: KnowledgeStatus;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeFaq = {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  priority: number;
  status: KnowledgeStatus;
  createdAt: string;
};

export type ChatSourceRef = {
  type: "article" | "faq";
  id: string;
  title: string;
};

export type ChatMessageRole = "user" | "assistant" | "system";

export type ChatConversation = {
  id: string;
  userId: string;
  farmId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  role: ChatMessageRole;
  content: string;
  sources: ChatSourceRef[];
  createdAt: string;
};

export type RetrievedKnowledge = {
  articles: KnowledgeArticle[];
  faqs: KnowledgeFaq[];
  sources: ChatSourceRef[];
};

export type ChatSuggestedPrompt = {
  id: string;
  label: string;
  prompt: string;
};

export type ChatApiResponse = {
  conversationId: string;
  message: ChatMessage;
  sources: ChatSourceRef[];
};
