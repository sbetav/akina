import useDelayedFalse from "@/hooks/ui/use-delayed-false";
import { cn } from "@/lib/utils";
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp";
import { MinusIcon } from "lucide-react";
import * as React from "react";

function InputOTP({
  className,
  containerClassName,
  pattern = REGEXP_ONLY_DIGITS,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "cn-input-otp xs:gap-2 flex min-w-0 items-center gap-1.5 has-disabled:opacity-50",
        containerClassName,
      )}
      spellCheck={false}
      className={cn("disabled:cursor-not-allowed", className)}
      pattern={pattern}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn(
        "has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive xs:gap-2 flex min-w-0 items-center gap-1.5",
        className,
      )}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  const showCaret = hasFakeCaret || (isActive && !char);
  const delayedShowCaret = useDelayedFalse(showCaret, 100);

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "bg-card data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive xs:h-13 xs:w-11 xs:text-base relative flex h-11 w-9 min-w-0 shrink items-center justify-center border text-sm shadow-xs transition-all outline-none data-[active=true]:z-10 data-[active=true]:ring-3",
        className,
      )}
      {...props}
    >
      {delayedShowCaret && !char ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      ) : char ? (
        <span>{char}</span>
      ) : (
        !isActive && <span className="text-muted-foreground/30">—</span>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
