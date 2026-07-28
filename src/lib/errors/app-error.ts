export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "FARM_NOT_FOUND"
  | "DEVICE_OFFLINE"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = "AppError";
  }
}
