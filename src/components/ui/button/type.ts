export type ButtonVariant = "primary" | "secondary" | "link";

export type ButtonProps = {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  backgroundColor?: string; // custom background override
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};
