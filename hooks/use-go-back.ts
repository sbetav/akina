import { useRouter } from "@bprogress/next";

export const useGoBack = () => {
  const router = useRouter();

  const goBack = (fallbackHref: string = "/") => {
    if (window.history?.length && window.history.length > 2) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  };

  return { goBack };
};
