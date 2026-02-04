import {useRouter} from "nextjs-toploader/app";

export function useNavigate() {
  const router = useRouter();

  function navigate(route: string, params?: Record<string, any>) {
    if (params) {
      const queryString = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join("&");
      const finalRoute = `${route}?${queryString}`;
      router.push(finalRoute);
    } else {
      router.push(route);
    }
  }

  function goBack() {
    router.back();
  }

  return {
    navigate,
    goBack,
  };
}
