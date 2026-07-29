import { AppError, type AppErrorCode } from "./app-error";
import { getErrorMessageVi } from "./error-messages";

export type ActionSuccess<T> = { ok: true; data: T };
export type ActionFailure = { ok: false; code: AppErrorCode; message: string };
export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export function actionSuccess<T>(data: T): ActionSuccess<T> {
  return { ok: true, data };
}

export function actionFailure(code: AppErrorCode, message?: string): ActionFailure {
  return { ok: false, code, message: message ?? getErrorMessageVi(code) };
}

export function toActionResult<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  return fn()
    .then((data) => actionSuccess(data))
    .catch((error: unknown) => {
      if (error instanceof AppError) {
        const custom =
          error.message && error.message !== error.code ? error.message : undefined;
        return actionFailure(error.code, custom ?? getErrorMessageVi(error.code));
      }
      return actionFailure("INTERNAL_ERROR");
    });
}
