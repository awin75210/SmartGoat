import { HANDBOOK_ARTICLES_SEED } from "@/features/handbook/data/handbook.seed";
import { SEED_REFERENCE_ISO } from "@/shared/utils/format";
import type {
  ChatSuggestedPrompt,
  KnowledgeArticleRow,
  KnowledgeFaqRow,
} from "../types/chatbot.types";

/** Single source: handbook seed rows → knowledge articles (sổ tay + AI chat). */
function handbookRowsToKnowledge(): KnowledgeArticleRow[] {
  return HANDBOOK_ARTICLES_SEED.map((hb) => ({
    id: hb.id.replace(/^hb-/, "ka-"),
    title: hb.title,
    summary: hb.summary,
    content: hb.body,
    category: hb.category,
    keywords: hb.tags,
    status: "published" as const,
    created_at: hb.updated_at,
    updated_at: hb.updated_at,
  }));
}

export const KNOWLEDGE_ARTICLES_SEED: KnowledgeArticleRow[] = handbookRowsToKnowledge();

export const KNOWLEDGE_FAQS_SEED: KnowledgeFaqRow[] = [
  {
    id: "kf-001",
    question: "Nguyên nhân tiêu chảy ở dê con là gì?",
    answer:
      "Thường do nhiễm khuẩn, ký sinh trùng, thay đổi thức ăn đột ngột hoặc vệ sinh kém. Kiểm tra nguồn nước và khẩu phần trong 24 giờ qua. Cách ly dê yếu và liên hệ thú y nếu phân có máu hoặc dê không uống.",
    keywords: "tiêu chảy,nguyên nhân,dê con,bệnh",
    priority: 10,
    status: "published",
    created_at: SEED_REFERENCE_ISO,
  },
  {
    id: "kf-002",
    question: "Dê ho sốt thở nhanh có thể bị gì?",
    answer:
      "Có thể nghi ngờ viêm phổi hoặc nhiễm trùng đường hô hấp. Cách ly, thông gió chuồng, đo thân nhiệt và gọi thú y để chẩn đoán. Không tự ý dùng kháng sinh nếu chưa có chỉ định.",
    keywords: "ho,sốt,viêm phổi,bệnh,dê",
    priority: 11,
    status: "published",
    created_at: SEED_REFERENCE_ISO,
  },
  {
    id: "kf-003",
    question: "Cách phòng bệnh tiêu chảy cho dê?",
    answer:
      "Giữ chuồng khô ráo, sữa/con uống ấm, tránh đổi khẩu phần đột ngột, tiêm phòng đúng lịch và tách dê yếu ra chuồng riêng.",
    keywords: "tiêu chảy,phòng,bệnh",
    priority: 9,
    status: "published",
    created_at: SEED_REFERENCE_ISO,
  },
  {
    id: "kf-004",
    question: "Chăm dê con 1 tháng tuổi cần lưu ý gì?",
    answer:
      "Đảm bảo sữa/khẩu phần đủ, nước sạch, ổ ấm khô. Bắt đầu cỏ mềm và thức ăn tinh pha loãng. Cân nặng hàng tuần; tiêu chảy hoặc bỏ ăn — cách ly và gọi thú y sớm.",
    keywords: "dê con,1 tháng,chăm sóc,giai đoạn",
    priority: 10,
    status: "published",
    created_at: SEED_REFERENCE_ISO,
  },
  {
    id: "kf-005",
    question: "Khẩu phần dinh dưỡng cơ bản cho dê thịt?",
    answer:
      "2–3% trọng lượng thức ăn thô/ngày, bổ sung tinh khi tăng trưởng, khoáng và nước liên tục. Điều chỉnh theo mùa và tình trạng thể trạng.",
    keywords: "dinh dưỡng,khẩu phần,dê thịt",
    priority: 7,
    status: "published",
    created_at: SEED_REFERENCE_ISO,
  },
];

export const CHAT_SUGGESTED_PROMPTS_SEED: ChatSuggestedPrompt[] = [
  {
    id: "sp-1",
    label: "Khẩu phần dê thịt",
    prompt: "Khẩu phần dinh dưỡng cơ bản cho dê thịt là gì?",
  },
  {
    id: "sp-2",
    label: "Dê ho sốt",
    prompt: "Dê con ho sốt thở nhanh có thể bị bệnh gì và xử lý ban đầu thế nào?",
  },
  {
    id: "sp-3",
    label: "Dê con 1 tháng",
    prompt: "Chăm dê con 1 tháng tuổi cần lưu ý gì?",
  },
  {
    id: "sp-4",
    label: "Tiêu chảy dê con",
    prompt: "Nguyên nhân tiêu chảy ở dê con là gì và cần làm gì trước khi gọi thú y?",
  },
];
