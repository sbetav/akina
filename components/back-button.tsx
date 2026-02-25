"use client";

import { useGoBack } from "@/hooks/use-go-back";
import { ArrowLeftIcon } from "lucide-react";
import type { FC } from "react";
import { Button } from "./ui/button";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

const BackButton: FC<BackButtonProps> = ({
  fallbackHref = "/",
  label = "Volver",
  className,
  onClick,
}) => {
  const { goBack } = useGoBack();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      goBack(fallbackHref);
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
