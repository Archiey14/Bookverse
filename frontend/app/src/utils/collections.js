// One place that defines every "collection" of books on the site.
// The homepage shelves, promo tiles, header links and the main catalog all
// use this, so "Under $15" means the same thing everywhere.
//
//   match: which books belong to the collection
//   sort:  how the catalog sorts it when you open it
export const BUDGET_LIMIT = 15;
export const SHORT_BOOK_PAGES = 250;

export const COLLECTIONS = {
  all: {
    eyebrow: "ALL BOOKS",
    title: "Find your next favorite",
    sort: "featured",
    match: () => true,
  },
  bestsellers: {
    eyebrow: "BESTSELLERS",
    title: "Readers’ favorites",
    sort: "featured",
    match: (book) => Boolean(book.bestseller),
  },
  new: {
    eyebrow: "NEW ARRIVALS",
    title: "Fresh on the shelves",
    sort: "newest",
    match: () => true,
  },
  toprated: {
    eyebrow: "TOP RATED",
    title: "Highest rated books",
    sort: "rating",
    match: () => true,
  },
  budget: {
    eyebrow: `UNDER $${BUDGET_LIMIT}`,
    title: "Great reads for less",
    sort: "price-low",
    match: (book) => book.price <= BUDGET_LIMIT,
  },
  hardcover: {
    eyebrow: "HARDCOVER",
    title: "Hardcover editions",
    sort: "featured",
    match: (book) => String(book.format || "").toLowerCase() === "hardcover",
  },
  short: {
    eyebrow: "QUICK READS",
    title: `Under ${SHORT_BOOK_PAGES} pages`,
    sort: "featured",
    match: (book) =>
      Number(book.pages) > 0 && Number(book.pages) <= SHORT_BOOK_PAGES,
  },
};

export function isCollection(key) {
  return Object.prototype.hasOwnProperty.call(COLLECTIONS, key);
}

export function compareNewest(a, b) {
  return String(b.addedAt || "").localeCompare(String(a.addedAt || ""));
}

export function compareRating(a, b) {
  return (
    (b.rating || 0) - (a.rating || 0) || (b.reviews || 0) - (a.reviews || 0)
  );
}
