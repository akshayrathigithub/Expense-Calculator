import { useEffect, useRef, useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import clsx from "clsx";
import styles from "./datepicker.module.scss";
import DownIcon from "@src/assets/down.svg?react";
import { format } from "date-fns";

// Single date picker props
type SingleDatePickerProps = {
  mode?: "single";
  label?: string;
  onChange?: (date: Date) => void;
  defaultValue?: number | null;
  showTrigger?: boolean;
  alwaysOpen?: boolean;
};

// Date range picker props
type DateRangePickerProps = {
  mode: "range";
  label?: string;
  onChange?: (range: { from: Date; to?: Date }) => void;
  defaultValue?: { from: number; to?: number } | null;
  showTrigger?: boolean;
  alwaysOpen?: boolean;
};

type DatePickerProps = SingleDatePickerProps | DateRangePickerProps;

export const DatePicker = (props: DatePickerProps) => {
  const {
    label,
    showTrigger = true,
    alwaysOpen = false,
    mode = "single",
  } = props;

  const [open, setOpen] = useState(alwaysOpen);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Single mode state
  const [selectedSingle, setSelectedSingle] = useState<number | null>(() => {
    if (mode === "single") {
      const singleProps = props as SingleDatePickerProps;
      return singleProps.defaultValue ?? null;
    }
    return null;
  });

  // Range mode state
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    () => {
      if (mode === "range") {
        const rangeProps = props as DateRangePickerProps;
        if (rangeProps.defaultValue) {
          return {
            from: new Date(rangeProps.defaultValue.from),
            to: rangeProps.defaultValue.to
              ? new Date(rangeProps.defaultValue.to)
              : undefined,
          };
        }
      }
      return undefined;
    }
  );

  useEffect(() => {
    if (alwaysOpen) return;

    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (!wrapperRef.current) return;
      if (e.target instanceof Node && wrapperRef.current.contains(e.target)) {
        return;
      }
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, alwaysOpen]);

  // Format display text
  const getDisplayText = () => {
    if (mode === "single") {
      return selectedSingle
        ? format(selectedSingle, "MMM d, yyyy")
        : "Select date";
    } else {
      if (!selectedRange?.from) return "Select date range";
      if (!selectedRange.to) {
        return format(selectedRange.from, "MMM d, yyyy");
      }
      return `${format(selectedRange.from, "MMM d, yyyy")} - ${format(
        selectedRange.to,
        "MMM d, yyyy"
      )}`;
    }
  };

  const displayText = getDisplayText();
  const hasValue =
    mode === "single" ? selectedSingle !== null : selectedRange?.from != null;

  // Render the picker content
  const renderPicker = () => {
    if (mode === "single") {
      return (
        <DayPicker
          animate
          mode="single"
          selected={selectedSingle ? new Date(selectedSingle) : undefined}
          onSelect={(d) => {
            if (!d) return;
            setSelectedSingle(d.getTime());
            if (!alwaysOpen) setOpen(false);
            if (props.mode === "single" || props.mode === undefined) {
              props.onChange?.(d);
            }
          }}
        />
      );
    } else {
      return (
        <DayPicker
          animate
          mode="range"
          selected={selectedRange}
          onSelect={(range) => {
            setSelectedRange(range);

            // Check if both dates are selected AND they are different
            const isComplete =
              range?.from &&
              range?.to &&
              range.from.getTime() !== range.to.getTime();

            if (isComplete && !alwaysOpen) {
              setOpen(false);
            }

            if (range?.from && props.mode === "range") {
              props.onChange?.({
                from: range.from,
                to: isComplete ? range.to : undefined,
              });
            }
          }}
        />
      );
    }
  };

  return (
    <div ref={wrapperRef} className={styles.container}>
      {label ? <div className="fs-1 text-slate-400 mb-1">{label}</div> : null}

      {showTrigger ? (
        <button
          type="button"
          className={clsx(styles.trigger, open && styles.open)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="date-popover"
          onClick={() => !alwaysOpen && setOpen((v) => !v)}
        >
          <span className={clsx(hasValue ? styles.label : styles.placeholder)}>
            {displayText}
          </span>
          <span className={styles.caret} aria-hidden>
            <DownIcon width={16} height={16} />
          </span>
        </button>
      ) : null}

      {open || alwaysOpen ? (
        <div
          id="date-popover"
          role="dialog"
          className={clsx(styles.popover, alwaysOpen && styles.alwaysOpen)}
        >
          {renderPicker()}
        </div>
      ) : null}
    </div>
  );
};
