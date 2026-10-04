export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function calculateDiscount(basePaise: number, comparePaise?: number): number {
  if (!comparePaise || comparePaise <= basePaise) return 0;
  return Math.round(((comparePaise - basePaise) / comparePaise) * 100);
}
