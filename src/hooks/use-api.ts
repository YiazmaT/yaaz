import {useAuth} from "../contexts/auth-context";
import {useConfirmModal} from "../contexts/confirm-modal-context";
import {useLoader} from "../contexts/loading-context";
import {useToaster} from "../contexts/toast-context";

interface useApiOptions<T> {
  body?: Record<string, any>;
  formData?: FormData;
  onSuccess?: (response: T) => void;
  hideLoader?: boolean;
}

let sessionExpiredHandled = false;

export function resetSessionExpiredFlag() {
  sessionExpiredHandled = false;
}

export function useApi() {
  const {logout} = useAuth();
  const toast = useToaster();
  const loader = useLoader();
  const confirmModal = useConfirmModal();

  async function fetchApi<T = any>(method: "GET" | "POST" | "PUT" | "DELETE", route: string, options?: useApiOptions<T>): Promise<T | undefined> {
    if (!options?.hideLoader) loader.show();

    const isFormData = !!options?.formData;

    const response = await fetch(route, {
      method,
      ...(!isFormData && {
        headers: {
          "Content-Type": "application/json",
        },
      }),
      ...(options?.formData && {body: options.formData}),
      ...(options?.body && !isFormData && {body: JSON.stringify(options.body)}),
    });

    if (!options?.hideLoader) loader.hide();

    if (response.status === 200 || response.status === 201) {
      const r = await response.json();
      if (options?.onSuccess) options?.onSuccess(r);
      return r;
    }

    if (response.status === 401) {
      if (!sessionExpiredHandled) {
        sessionExpiredHandled = true;
        logout();
        toast.errorToast("api.errors.expiredSession");
      }
      return undefined;
    }

    try {
      const errorBody = await response.json();
      confirmModal.show({
        message: errorBody.error || "api.errors.somethingWentWrong",
        hideCancel: true,
      });
    } catch {
      confirmModal.show({
        message: "api.errors.somethingWentWrong",
        hideCancel: true,
      });
    }

    return undefined;
  }

  return {fetch: fetchApi};
}
