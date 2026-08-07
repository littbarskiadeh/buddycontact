"use client";

import { Clock } from "lucide-react";
import { SNOOZE_PRESETS } from "@/lib/followup";

type SnoozeSelectProps = {
  onSnooze: (days: number) => void;
  disabled?: boolean;
  className?: string;
};

export function SnoozeSelect({
  onSnooze,
  disabled,
  className = "",
}: SnoozeSelectProps) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Clock
        className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-stone-500 dark:text-stone-400"
        aria-hidden="true"
      />
      <select
        aria-label="Snooze reminder"
        disabled={disabled}
        defaultValue=""
        onChange={(e) => {
          const days = Number(e.target.value);
          if (days > 0) onSnooze(days);
          e.target.value = "";
        }}
        className="cursor-pointer rounded-full border border-stone-300 bg-surface py-1.5 pr-3 pl-7 text-sm text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 disabled:opacity-50 dark:border-stone-700 dark:text-stone-400"
      >
        <option value="" disabled>
          Snooze…
        </option>
        {SNOOZE_PRESETS.map((preset) => (
          <option key={preset.days} value={preset.days}>
            {preset.label}
          </option>
        ))}
      </select>
    </div>
  );
}
