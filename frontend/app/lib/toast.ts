import { toast, type ToastOptions } from "react-toastify";

const base: ToastOptions = {
  position: "top-left", // visually left in an RTL page = "starts near the reader's eye path"
  rtl: true,
  autoClose: 3500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  theme: "colored",
};

export const notifySuccess = (message: string) => toast.success(message, base);

export const notifyError = (message: string) => toast.error(message, base);

export const notifyInfo = (message: string) => toast.info(message, base);

/** Normalizes thrown errors into a single Persian-friendly message for toasts. */
export function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}
