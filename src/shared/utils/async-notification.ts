import { notifications } from "@mantine/notifications";

export type AsyncNotificationMessages = {
  loading: string;
  success: string;
  error?: string;
};

export async function runWithNotification<T>(
  id: string,
  messages: AsyncNotificationMessages,
  asyncFn: () => Promise<{ ok: true; data: T } | { ok: false; message: string }>,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  notifications.show({
    id,
    loading: true,
    title: messages.loading,
    message: "Vui lòng chờ trong giây lát…",
    autoClose: false,
    withCloseButton: false,
  });

  try {
    const result = await asyncFn();
    if (result.ok) {
      notifications.update({
        id,
        color: "green",
        title: "Thành công",
        message: messages.success,
        loading: false,
        autoClose: 4000,
        withCloseButton: true,
      });
    } else {
      notifications.update({
        id,
        color: "red",
        title: "Không thực hiện được",
        message: result.message,
        loading: false,
        autoClose: 6000,
        withCloseButton: true,
      });
    }
    return result;
  } catch {
    const message = messages.error ?? "Đã xảy ra lỗi không mong muốn";
    notifications.update({
      id,
      color: "red",
      title: "Lỗi",
      message,
      loading: false,
      autoClose: 6000,
      withCloseButton: true,
    });
    return { ok: false, message };
  }
}
