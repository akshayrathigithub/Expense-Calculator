import React, { forwardRef } from "react";
import styles from "./textarea.module.scss";
import { TextareaProps } from "./type";
import clsx from "clsx";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      fullWidth,
      containerClassName,
      className,
      id,
      rows = 4,
      ...rest
    },
    ref
  ) => {
    const textareaId = id || React.useId();
    const describedById = error
      ? `${textareaId}-error`
      : helperText
      ? `${textareaId}-help`
      : undefined;

    const containerClass = clsx(
      "inline-flex flex-col gap-1",
      fullWidth && "w-full",
      containerClassName
    );

    const textareaClass = clsx(
      styles.textarea,
      error && styles.textareaError,
      fullWidth && "w-full",
      "min-h-20 p-2 resize-y",
      className
    );

    return (
      <div className={containerClass}>
        {label ? (
          <label className="fs-2 text-slate-400" htmlFor={textareaId}>
            {label}
          </label>
        ) : null}

        <div className="relative">
          {leftIcon ? (
            <span className="absolute left-2.5 top-2.5 text-slate-400 w-[18px] h-[18px] inline-flex items-center justify-center">
              {leftIcon}
            </span>
          ) : null}
          <textarea
            id={textareaId}
            ref={ref}
            className={textareaClass}
            aria-invalid={!!error}
            aria-describedby={describedById}
            rows={rows}
            {...rest}
          />
        </div>

        {error ? (
          <div
            id={`${textareaId}-error`}
            className="text-xs text-red-500"
            role="alert"
          >
            {error}
          </div>
        ) : helperText ? (
          <div id={`${textareaId}-help`} className="text-xs text-slate-400">
            {helperText}
          </div>
        ) : null}
      </div>
    );
  }
);
