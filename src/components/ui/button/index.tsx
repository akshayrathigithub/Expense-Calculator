import React from "react";
import clsx from "clsx";
import styles from "./button.module.scss";
import { ButtonProps } from "./type";

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  disabled = false,
  leftIcon,
  backgroundColor,
  className,
  style,
  type = "button",
  onClick,
}) => {
  const classNames = clsx(
    styles.button,
    {
      [styles.primary]: variant === "primary",
      [styles.link]: variant === "link",
      [styles.disabled]: disabled,
    },
    className
  );

  const mergedStyle: React.CSSProperties = {
    ...(backgroundColor
      ? ({ ["--btn-bg" as any]: backgroundColor } as React.CSSProperties)
      : {}),
    ...style,
  };

  return (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      style={mergedStyle}
    >
      {leftIcon ? <div className={styles.icon}>{leftIcon}</div> : null}
      <span className={styles.label}>{children}</span>
    </button>
  );
};
