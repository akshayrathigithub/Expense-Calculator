export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
};
