export function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}
