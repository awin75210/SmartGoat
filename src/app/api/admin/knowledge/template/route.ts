import { NextResponse } from "next/server";
import { requireAdminContext } from "@/lib/auth/server-context";
import { buildKnowledgeTemplateBuffer } from "@/features/ai-chatbot/lib/knowledge-import-xlsx";

export async function GET() {
  try {
    await requireAdminContext();
    const buffer = buildKnowledgeTemplateBuffer();
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="capracare-knowledge-template.xlsx"',
      },
    });
  } catch {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
}
