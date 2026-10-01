export function groupByBook(reviews) {
  const grouped = new Map();

  for (const review of reviews) {
    if (!grouped.has(review.bookId)) grouped.set(review.bookId, []);
    grouped.get(review.bookId).push(review);
  }

  return grouped;
}

// books.json holds a starting rating and review count for each book.
// Real reviews are blended into them: the average and the count both move
// as people review. Set a book's "rating" and "reviews" to 0 in books.json
// to make its numbers come only from real reviews.
export function withStats(book, bookReviews = []) {
  const baseCount = book.reviews ?? 0;
  const baseRating = book.rating ?? 0;

  const total = baseCount + bookReviews.length;
  const sum = bookReviews.reduce((t, review) => t + review.rating, 0);

  const rating = total
    ? Math.round(((baseRating * baseCount + sum) / total) * 10) / 10
    : 0;

  return { ...book, rating, reviews: total };
}
