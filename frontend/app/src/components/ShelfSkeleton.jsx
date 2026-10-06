// Grey placeholder shelf shown while the catalog loads, so the page keeps its
// shape instead of jumping when the books arrive.
function ShelfSkeleton({ count = 6, title = "Loading books" }) {
  return (
    <section className="shelf-section" aria-busy="true" aria-label={title}>
      <div className="shelf-head">
        <div className="sk sk-heading" />
      </div>

      <div className="shelf-track">
        {Array.from({ length: count }, (_, index) => (
          <div className="shelf-item" key={index}>
            <div className="pcard pcard-skeleton" aria-hidden="true">
              <div className="sk sk-cover" />
              <div className="sk sk-line" />
              <div className="sk sk-line short" />
              <div className="sk sk-line tiny" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ShelfSkeleton;
