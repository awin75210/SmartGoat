import { SEED_REFERENCE_ISO } from "@/shared/utils/format";
import type {
  ChatSuggestedPrompt,
  KnowledgeArticleRow,
  KnowledgeFaqRow,
} from "../types/chatbot.types";

export const KNOWLEDGE_ARTICLES_SEED: KnowledgeArticleRow[] = [
  {
    id: "ka-001",
    title: "Khẩu phần cho dê thịt",
    content:
      "Dê thịt cần khoảng 2–3% trọng lượng cơ thể thức ăn thô mỗi ngày. Bổ sung khẩu phần tinh 0.3–0.5% khi tăng trưởng nhanh. Luôn có nước sạch và khoáng liên tục.",
    category: "nutrition",
    keywords: "dinh dưỡng,thức ăn,khẩu phần",
    status: "published",
    created_at: SEED_REFERENCE_ISO,
    updated_at: SEED_REFERENCE_ISO,
  },
  {
    id: "ka-002",
    title: "Nhiệt độ và thông gió chuồng nuôi",
    content:
      "Nhiệt độ lý tưởng cho dê thịt là 18–26°C. Nếu vượt 28°C, tăng thông gió và cung cấp nước mát. Theo dõi biểu đồ IoT để phát hiện xu hướng tăng. Độ ẩm nên duy trì 55–70%, NH₃ dưới 10 ppm.",
    category: "housing",
    keywords: "nhiệt độ,chuồng,thông gió,IoT,độ ẩm,cảm biến",
    status: "published",
    created_at: SEED_REFERENCE_ISO,
    updated_at: SEED_REFERENCE_ISO,
  },
  {
    id: "ka-003",
    title: "Xử lý ban đầu khi dê con tiêu chảy",
    content:
      "Cách ly khỏi đàn, bù dịch bằng dung dịch điện giải uống tự do, vệ sinh chuồng và đồ uống. Nếu dê yếu, không uống hoặc phân có máu — liên hệ thú y ngay. Theo dõi nhiệt độ và phân 4–6 giờ/lần.",
    category: "health",
    keywords: "tiêu chảy,dê con,bệnh,sức khỏe",
    status: "published",
    created_at: SEED_REFERENCE_ISO,
    updated_at: SEED_REFERENCE_ISO,
  },
];

export const KNOWLEDGE_FAQS_SEED: KnowledgeFaqRow[] = [
  {
    id: "kf-001",
    question: "Nguyên nhân tiêu chảy ở dê con là gì?",
    answer:
      "Thường do nhiễm khuẩn, ký sinh trùng, thay đổi thức ăn đột ngột hoặc vệ sinh kém. Kiểm tra nguồn nước và khẩu phần trong 24 giờ qua.",
    keywords: "tiêu chảy,nguyên nhân,dê con",
    priority: 10,
    status: "published",
    created_at: SEED_REFERENCE_ISO,
  },
  {
    id: "kf-002",
    question: "Lịch tiêm phòng dê tham khảo?",
    answer:
      "Tả dê (Clostridium) 2–3 tháng/lần, PPR theo khuyến cáo địa phương, tẩy giun định kỳ 3 tháng. Ghi nhận trên hồ sơ từng con.",
    keywords: "tiêm phòng,lịch,vaccine",
    priority: 8,
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
];

export const CHAT_SUGGESTED_PROMPTS_SEED: ChatSuggestedPrompt[] = [
  { id: "sp-1", label: "Nguyên nhân tiêu chảy", prompt: "Nguyên nhân tiêu chảy ở dê con là gì?" },
  { id: "sp-2", label: "Phòng bệnh tiêu chảy", prompt: "Cách phòng bệnh tiêu chảy cho dê?" },
  { id: "sp-3", label: "Môi trường chuồng", prompt: "Nhiệt độ và độ ẩm chuồng hiện tại có ổn không?" },
];
