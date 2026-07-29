import * as XLSX from "xlsx";
import {
  knowledgeImportArticleRowSchema,
  knowledgeImportFaqRowSchema,
  type KnowledgeImportRowError,
  type ParsedKnowledgeImport,
} from "../schemas/knowledge-import.schema";

export const KNOWLEDGE_IMPORT_MAX_ROWS_PER_SHEET = 500;
export const KNOWLEDGE_IMPORT_MAX_FILE_BYTES = 5 * 1024 * 1024;

const ARTICLE_SHEET_NAMES = ["Articles", "BaiViet", "Bài viết"];
const FAQ_SHEET_NAMES = ["FAQs", "FAQ"];

const ARTICLE_HEADERS = ["title", "summary", "category", "keywords", "content", "status"] as const;
const FAQ_HEADERS = ["question", "answer", "keywords", "priority", "status"] as const;

function findSheetName(workbook: XLSX.WorkBook, candidates: string[]): string | null {
  const names = workbook.SheetNames;
  for (const candidate of candidates) {
    const found = names.find((n) => n.trim().toLowerCase() === candidate.trim().toLowerCase());
    if (found) return found;
  }
  return null;
}

function sheetToRows(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
}

function isBlankRow(row: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every((k) => coerceCell(row[k]) === "");
}

function coerceCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseArticleSheet(
  sheet: XLSX.WorkSheet,
  sheetLabel: "Articles",
): Pick<ParsedKnowledgeImport, "articles" | "parseErrors"> {
  const articles: ParsedKnowledgeImport["articles"] = [];
  const parseErrors: KnowledgeImportRowError[] = [];
  const rawRows = sheetToRows(sheet);

  if (rawRows.length > KNOWLEDGE_IMPORT_MAX_ROWS_PER_SHEET) {
    parseErrors.push({
      sheet: sheetLabel,
      row: 0,
      message: `Sheet vượt quá ${KNOWLEDGE_IMPORT_MAX_ROWS_PER_SHEET} dòng`,
    });
    return { articles, parseErrors };
  }

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (isBlankRow(row, ARTICLE_HEADERS)) return;

    const parsed = knowledgeImportArticleRowSchema.safeParse(row);
    if (!parsed.success) {
      parseErrors.push({
        sheet: sheetLabel,
        row: rowNumber,
        message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
      });
      return;
    }
    articles.push({ rowNumber, data: parsed.data });
  });

  return { articles, parseErrors };
}

function parseFaqSheet(
  sheet: XLSX.WorkSheet,
  sheetLabel: "FAQs",
): Pick<ParsedKnowledgeImport, "faqs" | "parseErrors"> {
  const faqs: ParsedKnowledgeImport["faqs"] = [];
  const parseErrors: KnowledgeImportRowError[] = [];
  const rawRows = sheetToRows(sheet);

  if (rawRows.length > KNOWLEDGE_IMPORT_MAX_ROWS_PER_SHEET) {
    parseErrors.push({
      sheet: sheetLabel,
      row: 0,
      message: `Sheet vượt quá ${KNOWLEDGE_IMPORT_MAX_ROWS_PER_SHEET} dòng`,
    });
    return { faqs, parseErrors };
  }

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (isBlankRow(row, FAQ_HEADERS)) return;

    const parsed = knowledgeImportFaqRowSchema.safeParse(row);
    if (!parsed.success) {
      parseErrors.push({
        sheet: sheetLabel,
        row: rowNumber,
        message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ",
      });
      return;
    }
    faqs.push({ rowNumber, data: parsed.data });
  });

  return { faqs, parseErrors };
}

export function parseKnowledgeWorkbook(buffer: ArrayBuffer): ParsedKnowledgeImport {
  const workbook = XLSX.read(buffer, { type: "array" });
  const articleSheetName = findSheetName(workbook, ARTICLE_SHEET_NAMES);
  const faqSheetName = findSheetName(workbook, FAQ_SHEET_NAMES);

  const parseErrors: KnowledgeImportRowError[] = [];

  if (!articleSheetName && !faqSheetName) {
    parseErrors.push({
      sheet: "Articles",
      row: 0,
      message: "Không tìm thấy sheet Articles hoặc FAQs trong file",
    });
    return { articles: [], faqs: [], parseErrors };
  }

  let articles: ParsedKnowledgeImport["articles"] = [];
  let faqs: ParsedKnowledgeImport["faqs"] = [];

  if (articleSheetName) {
    const sheet = workbook.Sheets[articleSheetName];
    if (sheet) {
      const parsed = parseArticleSheet(sheet, "Articles");
      articles = parsed.articles;
      parseErrors.push(...parsed.parseErrors);
    }
  }

  if (faqSheetName) {
    const sheet = workbook.Sheets[faqSheetName];
    if (sheet) {
      const parsed = parseFaqSheet(sheet, "FAQs");
      faqs = parsed.faqs;
      parseErrors.push(...parsed.parseErrors);
    }
  }

  return { articles, faqs, parseErrors };
}

export function buildKnowledgeTemplateBuffer(): Buffer {
  const workbook = XLSX.utils.book_new();

  const articleRows = [
    {
      title: "Ví dụ: Khẩu phần dê thịt",
      summary: "Tóm tắt hiển thị trên sổ tay điện tử",
      category: "nutrition",
      keywords: "dinh dưỡng,dê thịt",
      content: "Mô tả khẩu phần và lưu ý nuôi dưỡng...",
      status: "draft",
    },
    {
      title: "Ví dụ: Viêm phổi — triệu chứng",
      summary: "Ho, sốt, thở nhanh",
      category: "common_diseases",
      keywords: "bệnh,viêm phổi,ho",
      content: "Triệu chứng và xử lý ban đầu (cách ly, thông gió)...",
      status: "draft",
    },
    {
      title: "Ví dụ: Chăm dê con sơ sinh",
      summary: "Sữa, ấm ổ, theo dõi cân",
      category: "kid_care_stages",
      keywords: "dê con,sơ sinh",
      content: "Hướng dẫn theo tuần tuổi...",
      status: "draft",
    },
    {
      title: "Ví dụ: Thông gió chuồng",
      summary: "Mật độ và luồng gió",
      category: "farming_technique",
      keywords: "chuồng,thông gió",
      content: "Nguyên tắc thiết kế chuồng...",
      status: "draft",
    },
  ];
  const faqRows = [
    {
      question: "Ví dụ: Dê con tiêu chảy nên làm gì?",
      answer: "Gợi ý nội dung tham khảo cho AI (không copy nguyên văn khi trả lời).",
      keywords: "tiêu chảy,dê con",
      priority: 5,
      status: "draft",
    },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(articleRows, { header: [...ARTICLE_HEADERS] }),
    "Articles",
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(faqRows, { header: [...FAQ_HEADERS] }),
    "FAQs",
  );

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
