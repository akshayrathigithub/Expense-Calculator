export type TextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size"
> & {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
};
