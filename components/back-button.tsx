"use client";

import { useGoBack } from "@/hooks/use-go-back";
import { useRouter } from "@bprogress/next";
import { ArrowLeftIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "./ui/button";

interface BackButtonProps {
  label?: string;
  className?: string;
  mode?: "back" | "redirect";
  href?: string;
}

const BackButton: FC<BackButtonProps> = ({
  label = "Volver",
  className,
  mode = "back",
  href = "/",
}) => {
  const router = useRouter();
  const { goBack } = useGoBack({
    fallbackHref: href,
  });

  const handleClick = () => {
    if (mode === "redirect") {
      router.push(href);
    } else {
      goBack();
    }
  };

  return (
    <Button variant="link" onClick={handleClick} className={className}>
      <ArrowLeftIcon />
      {label}
    </Button>
  );
};

export default BackButton;
