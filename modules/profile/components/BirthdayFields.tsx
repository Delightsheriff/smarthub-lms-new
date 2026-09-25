"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BIRTH_MONTHS, daysInBirthMonth } from "../lib/birthday";

interface BirthdayFieldsProps {
  /** Day as a string ("" = unset) so a cleared picker is never NaN. */
  day: string;
  month: string;
  onDayChange: (day: string) => void;
  onMonthChange: (month: string) => void;
  disabled?: boolean;
}

/**
 * Day + month pickers shared by BirthdayGate and the profile edit
 * dialog. The day list follows the chosen month (Feb stops at 29 — no
 * year, so leap days are allowed), and picking a shorter month clears a
 * day that no longer fits rather than sending a date the API refuses.
 */
export function BirthdayFields({
  day,
  month,
  onDayChange,
  onMonthChange,
  disabled,
}: BirthdayFieldsProps) {
  const dayCount = daysInBirthMonth(Number(month) || undefined);

  const handleMonth = (next: string) => {
    onMonthChange(next);
    if (day && Number(day) > daysInBirthMonth(Number(next) || undefined)) {
      onDayChange("");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Select
        value={day || null}
        onValueChange={(v) => onDayChange(v ?? "")}
        disabled={disabled}
      >
        <SelectTrigger className="w-full" aria-label="Birth day">
          <SelectValue placeholder="Day">
            {(v: string | null) => v || "Day"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: dayCount }, (_, i) => String(i + 1)).map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={month || null}
        onValueChange={(v) => handleMonth(v ?? "")}
        disabled={disabled}
      >
        <SelectTrigger className="w-full" aria-label="Birth month">
          <SelectValue placeholder="Month">
            {(v: string | null) => (v ? BIRTH_MONTHS[Number(v) - 1] : "Month")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {BIRTH_MONTHS.map((m, i) => (
            <SelectItem key={m} value={String(i + 1)}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
