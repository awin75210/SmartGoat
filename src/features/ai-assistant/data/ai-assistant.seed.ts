import type { AiResponseRow, AiSuggestedPrompt } from "../types/ai-assistant.types";

export const AI_RESPONSES_SEED: AiResponseRow[] = [
  {
    id: "ai-r-diarrhea-cause",
    prompt_keywords: "tiêu chảy,nguyên nhân",
    response:
      "Tiêu chảy ở dê con thường do nhiễm khuẩn (E. coli, Salmonella), ký sinh trùng, thay đổi thức ăn đột ngột hoặc uống sữa lạnh. Kiểm tra vệ sinh chuồng, nguồn nước và thức ăn trong 24 giờ qua.",
  },
  {
    id: "ai-r-diarrhea-prevent",
    prompt_keywords: "tiêu chảy,phòng",
    response:
      "Phòng tiêu chảy: vệ sinh chuồng khô ráo, cho uống sữa ấm, tránh thay đổi khẩu phần đột ngột, tiêm phòng đúng lịch và tách dê yếu ra chuồng riêng.",
  },
  {
    id: "ai-r-vaccine",
    prompt_keywords: "tiêm phòng,lịch",
    response:
      "Lịch tiêm phòng tham khảo: tả dê (Clostridium) 2–3 tháng/lần, PPR theo khuyến cáo địa phương, tẩy giun định kỳ 3 tháng. Ghi nhận trên hồ sơ từng con trong CapraCare.",
  },
  {
    id: "ai-r-diarrhea-treat",
    prompt_keywords: "tiêu chảy,dê con,xử lý",
    response:
      "Đánh giá mức độ: dê còn ăn uống → bù dịch điện giải (ORS dê), sữa loãng ấm, probiotic; dê lờ đờ, mất nước → cách ly ngay và liên hệ bác sĩ thú y. Theo dõi phân và nhiệt độ 4–6 giờ/lần.",
  },
  {
    id: "ai-r-1",
    prompt_keywords: "nhiệt độ,chuồng",
    response:
      "Nhiệt độ lý tưởng cho dê thịt là 18–26°C. Nếu vượt 28°C, tăng thông gió và cung cấp nước mát. Theo dõi biểu đồ IoT 7 ngày để phát hiện xu hướng tăng.",
  },
  {
    id: "ai-r-default",
    prompt_keywords: "default",
    response:
      "CapraCare AI (demo) có thể gợi ý về môi trường chuồng, dinh dưỡng và sức khỏe đàn. Hãy mô tả triệu chứng hoặc chọn gợi ý bên trên.",
  },
];

export const AI_SUGGESTED_PROMPTS_SEED: AiSuggestedPrompt[] = [
  { id: "sp-1", label: "Nguyên nhân tiêu chảy", prompt: "Nguyên nhân tiêu chảy ở dê con là gì?" },
  { id: "sp-2", label: "Phòng bệnh tiêu chảy", prompt: "Cách phòng bệnh tiêu chảy cho dê?" },
  { id: "sp-3", label: "Lịch tiêm phòng", prompt: "Lịch tiêm phòng dê nên thực hiện thế nào?" },
];
