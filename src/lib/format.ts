export const formatInr = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export const discountPercent = (price: number, mrp: number) =>
  Math.round(((mrp - price) / mrp) * 100);

export const getDeliveryFee = (subtotal: number) => (subtotal >= 999 ? 0 : 79);

export const getCartSubtotal = (
  lines: Array<{ product: { price: number }; quantity: number }>,
) => lines.reduce((total, line) => total + line.product.price * line.quantity, 0);
