import type { AppErrorCode } from "./app-error";

const ERROR_MESSAGES_VI: Record<AppErrorCode, string> = {
  UNAUTHORIZED: "Bạn cần đăng nhập để tiếp tục.",
  FORBIDDEN: "Bạn không có quyền truy cập tài nguyên này.",
  FARM_NOT_FOUND: "Không tìm thấy trang trại.",
  DEVICE_OFFLINE: "Thiết bị đang ngoại tuyến.",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  NOT_FOUND: "Không tìm thấy dữ liệu yêu cầu.",
  INTERNAL_ERROR: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
};

export function getErrorMessageVi(code: AppErrorCode): string {
  return ERROR_MESSAGES_VI[code];
}

export function resolveClientErrorMessage(error: unknown): string {
  if (error instanceof Error && error.name === "AppError") {
    const code = (error as { code?: AppErrorCode }).code;
    if (code && code in ERROR_MESSAGES_VI) {
      return ERROR_MESSAGES_VI[code];
    }
  }
  return ERROR_MESSAGES_VI.INTERNAL_ERROR;
}
