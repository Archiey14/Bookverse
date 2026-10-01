// One place that decides how a book's stock is described.
export function getStockStatus(book) {
  const outOfStock = book.stock === 0;
  const lowStock =
    !outOfStock &&
    typeof book.stock === "number" &&
    book.stock <= (book.lowStockThreshold ?? 5);

  let message = "In stock · ships in 1–2 days";
  if (outOfStock) message = "Currently out of stock";
  else if (lowStock) message = `Only ${book.stock} left · ships in 1–2 days`;

  return { outOfStock, lowStock, message };
}
