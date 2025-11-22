export function formatCurrency(amountInCents: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amountInCents / 100);
}
