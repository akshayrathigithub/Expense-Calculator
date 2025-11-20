import React, { forwardRef } from "react";
import styles from "./input.module.scss";
import { InputProps } from "./type";
import clsx from "clsx";

export const Input = forwardRef<HTMLInputElement, InputProps>(
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
      ...rest
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const describedById = error
      ? `${inputId}-error`
      : helperText
      ? `${inputId}-help`
      : undefined;

    const containerClass = clsx(
      "inline-flex flex-col gap-1",
      fullWidth && "w-full",
      containerClassName
    );

    const inputClass = clsx(
      styles.input,
      error && styles.inputError,
      fullWidth && "w-full",
      "py-1 px-2",
      leftIcon && "pl-8",
      className
    );

    return (
      <div className={containerClass}>
        {label ? (
          <label className="fs-1 text-slate-400" htmlFor={inputId}>
            {label}
          </label>
        ) : null}

        <div className="relative">
          {leftIcon ? (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px] inline-flex items-center justify-center">
              {leftIcon}
            </span>
          ) : null}
          <input
            id={inputId}
            ref={ref}
            className={inputClass}
            aria-invalid={!!error}
            aria-describedby={describedById}
            {...rest}
          />
        </div>

        {error ? (
          <div
            id={`${inputId}-error`}
            className="text-xs text-red-500"
            role="alert"
          >
            {error}
          </div>
        ) : helperText ? (
          <div id={`${inputId}-help`} className="text-xs text-slate-400">
            {helperText}
          </div>
        ) : null}
      </div>
    );
  }
);
