import {QueryKey, useQuery} from "@tanstack/react-query";
import {useAuth} from "../contexts/auth-context";
import {useConfirmModal} from "../contexts/confirm-modal-context";
import {useLoader} from "../contexts/loading-context";
import {useToaster} from "../contexts/toast-context";

interface useApiOptions<T> {
  body?: Record<string, any>;
  formData?: FormData;
  onSuccess?: (response: T) => void;
  onError?: (error: string, data?: any) => boolean;
  hideLoader?: boolean;
}

let sessionExpiredHandled = false;

export function resetSessionExpiredFlag() {
  sessionExpiredHandled = false;
}

class ApiError extends Error {
  constructor(
    public errorKey: string,
    public status: number,
    public data?: any,
  ) {
    super(errorKey);
  }
}

async function fetchInternal<T = any>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  route: string,
  options?: {body?: Record<string, any>; formData?: FormData},
): Promise<T> {
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

  if (response.status === 200 || response.status === 201) {
    const json = await response.json();
    return json.data !== undefined ? json.data : json;
  }

  if (response.status === 401) {
    throw new ApiError("api.errors.expiredSession", 401);
  }

  try {
    const errorBody = await response.json();
    const errorKey = errorBody.error || "api.errors.somethingWentWrong";
    throw new ApiError(errorKey, response.status, errorBody.data);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("api.errors.somethingWentWrong", response.status);
  }
}

function useApiErrorHandler() {
  const {logout} = useAuth();
  const toast = useToaster();
  const confirmModal = useConfirmModal();

  return function handleError(e: unknown, onError?: (errorKey: string, data?: any) => boolean) {
    if (e instanceof ApiError) {
      if (e.status === 401) {
        if (!sessionExpiredHandled) {
          sessionExpiredHandled = true;
          logout();
          toast.errorToast("api.errors.expiredSession");
        }
        return;
      }

      if (onError?.(e.errorKey, e.data)) return;

      const messageVars = e.data ? Object.fromEntries(Object.entries(e.data).map(([k, v]) => [k, String(v)])) : undefined;

      confirmModal.show({
        message: e.errorKey,
        messageVars,
        hideCancel: true,
      });
    } else {
      confirmModal.show({
        message: "api.errors.somethingWentWrong",
        hideCancel: true,
      });
    }
  };
}

export function useApi() {
  const loader = useLoader();
  const handleError = useApiErrorHandler();

  async function fetchApi<T = any>(method: "GET" | "POST" | "PUT" | "DELETE", route: string, options?: useApiOptions<T>): Promise<T | undefined> {
    if (!options?.hideLoader) loader.show();

    try {
      const result = await fetchInternal<T>(method, route, {
        body: options?.body,
        formData: options?.formData,
      });

      if (!options?.hideLoader) loader.hide();
      if (options?.onSuccess) options.onSuccess(result);
      return result;
    } catch (e) {
      if (!options?.hideLoader) loader.hide();
      handleError(e, options?.onError);
      return undefined;
    }
  }

  return {fetch: fetchApi};
}

export function useApiQuery<T = any>(options: {queryKey: QueryKey; route: string; enabled?: boolean}) {
  const handleError = useApiErrorHandler();

  return useQuery<T>({
    queryKey: options.queryKey,
    queryFn: async () => {
      try {
        return await fetchInternal<T>("GET", options.route);
      } catch (e) {
        handleError(e);
        throw e;
      }
    },
    enabled: options.enabled,
  });
}
