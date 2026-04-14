"use client";

import { format, isValid, parse } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  "aria-invalid"?: boolean;
  className?: string;
}

function DatePicker({
  id,
  value,
  onValueChange,
  placeholder = "Selecciona una fecha",
  disabled,
  minDate,
  maxDate,
  className,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const startMonth = minDate
    ? new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    : undefined;
  const endMonth = maxDate
    ? new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
    : undefined;
  const disabledDays = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            id={id}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            className={cn(
              "bg-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-10 w-full min-w-0 border px-3.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3",
              "flex items-center justify-between gap-2 text-left",
              !selectedDate && "text-muted-foreground",
              className,
            )}
          >
            <span>
              {selectedDate
                ? format(selectedDate, "PPP", { locale: es })
                : placeholder}
            </span>
            <CalendarIcon className="text-muted-foreground size-4" />
          </button>
        }
      />
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabledDays.length > 0 ? disabledDays : undefined}
          selected={selectedDate}
          defaultMonth={selectedDate}
          onSelect={(date) => {
            onValueChange(date ? format(date, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
