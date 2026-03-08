"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";
import {
  Action,
  Toaster as Sonner,
  toast as sonnerToast,
  type ExternalToast,
  type ToasterProps,
} from "sonner";
import { Spinner } from "./spinner";

const toastVariants = cva(
  "relative flex w-full items-start gap-2.5 border px-4 py-3 font-mono text-sm before:absolute before:top-0 before:left-0 before:h-full before:w-[3px] before:bg-current before:content-[''] sm:w-[356px]",
  {
    variants: {
      variant: {
        default:
          "text-popover-foreground border-border bg-popover before:bg-border",
        success: "text-success border-success/20 bg-success/10",
        error: "text-destructive border-destructive/20 bg-destructive/10",
        warning: "text-warning border-warning/20 bg-warning/10",
        info: "text-info border-info/20 bg-info/10",
        loading: "text-muted-foreground border-border bg-muted/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type ToastVariant = NonNullable<VariantProps<typeof toastVariants>["variant"]>;

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: null,
  success: <CircleCheckIcon className="size-4 shrink-0" />,
  error: <CircleXIcon className="size-4 shrink-0" />,
  warning: <TriangleAlertIcon className="size-4 shrink-0" />,
  info: <InfoIcon className="size-4 shrink-0" />,
  loading: <Spinner className="size-4 shrink-0" />,
};

interface ToastProps {
  id: string | number;
  title: string;
  description?: string;
  variant?: ToastVariant;
  icon?: React.ReactNode;
  action?: Action;
}
function Toast({
  id,
  title,
  description,
  variant = "default",
  icon,
  action,
}: ToastProps) {
  const defaultIcon = variantIcons[variant];

  return (
    <div className="bg-background">
      <div className={cn(toastVariants({ variant }))}>
        {(icon ?? defaultIcon) && (
          <span className="mt-px shrink-0">{icon ?? defaultIcon}</span>
        )}
        <div className="flex flex-1 flex-col gap-0.5">
          <p className="leading-snug font-medium">{title}</p>
          {description && (
            <p className={cn("text-foreground/60 text-[0.8rem]")}>
              {description}
            </p>
          )}
          {action && (
            <button
              onClick={(e) => {
                action.onClick(e);
                sonnerToast.dismiss(id);
              }}
              className="mt-1.5 self-start text-xs font-semibold underline-offset-2 opacity-90 transition-opacity hover:underline hover:opacity-100"
            >
              {action.label}
            </button>
          )}
        </div>

        {variant !== "loading" && (
          <button
            onClick={() => sonnerToast.dismiss(id)}
            className="mt-px ml-auto shrink-0 cursor-pointer transition-opacity hover:opacity-75"
            aria-label="Dismiss"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

type ToastOptions = ExternalToast & {
  variant?: ToastVariant;
  icon?: React.ReactNode;
};

function toast(title: string, options?: ToastOptions) {
  const {
    variant = "default",
    icon,
    description,
    action,
    ...rest
  } = options ?? {};
  const typedAction = action as Action | undefined;

  return sonnerToast.custom(
    (id) => (
      <Toast
        id={id}
        title={title}
        description={description as string | undefined}
        variant={variant}
        icon={icon}
        action={
          typedAction
            ? { label: typedAction.label, onClick: typedAction.onClick }
            : undefined
        }
      />
    ),
    rest,
  );
}

toast.success = (title: string, options?: Omit<ToastOptions, "variant">) =>
  toast(title, { ...options, variant: "success" });

toast.error = (title: string, options?: Omit<ToastOptions, "variant">) =>
  toast(title, { ...options, variant: "error" });

toast.warning = (title: string, options?: Omit<ToastOptions, "variant">) =>
  toast(title, { ...options, variant: "warning" });

toast.info = (title: string, options?: Omit<ToastOptions, "variant">) =>
  toast(title, { ...options, variant: "info" });

toast.loading = (title: string, options?: Omit<ToastOptions, "variant">) =>
  toast(title, { ...options, variant: "loading" });

toast.dismiss = sonnerToast.dismiss;

type ToastMessage = string | { message: string; description?: string };

interface PromiseData<T = unknown> {
  loading: ToastMessage;
  success: ToastMessage | ((data: T) => ToastMessage);
  error: ToastMessage | ((error: unknown) => ToastMessage);
  finally?: () => void | Promise<void>;
}

function resolveMessage(value: ToastMessage): {
  title: string;
  description?: string;
} {
  if (typeof value === "string") return { title: value };
  return { title: value.message, description: value.description };
}

toast.promise = <T,>(
  promise: Promise<T> | (() => Promise<T>),
  data: PromiseData<T>,
  options?: Omit<ToastOptions, "variant">,
): string | number => {
  const { title: loadingTitle, description: loadingDescription } =
    resolveMessage(data.loading);
  const id = toast(loadingTitle, {
    ...options,
    variant: "loading",
    description: loadingDescription,
  });

  const p = typeof promise === "function" ? promise() : promise;

  p.then((result) => {
    const raw =
      typeof data.success === "function" ? data.success(result) : data.success;
    const { title, description } = resolveMessage(raw);
    toast.success(title, { ...options, id, description });
  })
    .catch((error) => {
      const raw =
        typeof data.error === "function" ? data.error(error) : data.error;
      const { title, description } = resolveMessage(raw);
      toast.error(title, { ...options, id, description });
    })
    .finally(() => {
      data.finally?.();
    });

  return id;
};

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner className="toaster group" position="bottom-right" {...props} />
  );
};

export { toast, Toaster };
export type { ToastOptions, ToastVariant };
