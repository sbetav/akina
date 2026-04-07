import { AlertTriangleIcon, ArrowLeftIcon, RefreshCcwIcon } from "lucide-react";
import type { FC } from "react";
import { useGoBack } from "@/hooks/ui/use-go-back";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  showBack?: boolean;
}

const ErrorFallback: FC<ErrorFallbackProps> = ({
  title = "Algo salio mal",
  message = "No pudimos completar esta acción. Intenta de nuevo más tarde.",
  onRetry,
  isRetrying = false,
  showBack = false,
}) => {
  const { goBack } = useGoBack();
  return (
    <div className="border-destructive/20 bg-destructive/5 flex w-full flex-1 items-center justify-center border">
      <div className="flex max-w-[350px] flex-col items-center justify-center gap-5 text-center">
        <div className="border-destructive/30 bg-destructive/20 flex items-center justify-center border p-4">
          <AlertTriangleIcon className="text-destructive size-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-sans text-xl font-semibold tracking-tight text-pretty">
            {title}
          </h2>
          <p className="text-muted-foreground font-mono text-xs leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="outline" size="lg" onClick={goBack}>
              <ArrowLeftIcon />
              Volver
            </Button>
          )}
          <Button
            variant="secondary"
            size="lg"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? <Spinner /> : <RefreshCcwIcon />}
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
