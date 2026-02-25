import { useRouter } from "@bprogress/next";

export const useGoBack = (options: { fallbackHref?: string } = {}) => {
  const { fallbackHref = "/" } = options;
  const router = useRouter();

  const goBack = () => {
    if (window.history?.length && window.history.length > 2) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  };

  return { goBack };
};
