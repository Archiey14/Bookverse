function MiniCover({ book }) {
  return (
    <div className={`mini-cover cover-${book.id % 5}`}>
      ▤
      <img
        src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`}
        alt={`Cover of ${book.title}`}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

function SidePanel({
  panel,
  onClose,
  cart,
  books,
  cartCount,
  cartTotal,
  wishlistBooks,
  orders,
  onChangeQuantity,
  onAddToCart,
  onCheckout,
}) {
  if (!panel) return null;

  const title = {
    cart: "Your bag",
    wishlist: "Your wishlist",
    orders: "Your orders",
  }[panel];

  return (
    <div className="overlay" onClick={onClose}>
      <aside
        className="side-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <h2 id="panel-title">{title}</h2>
          <button onClick={onClose} aria-label="Close panel">
            ×
          </button>
        </div>

        {panel === "cart" && (
          <>
            {cartCount === 0 ? (
              <p className="panel-empty">
                Your bag is waiting for a good story.
              </p>
            ) : (
              <div className="panel-items">
                {Object.entries(cart).map(([id, quantity]) => {
                  const book = books.find((item) => item.id === Number(id));
                  if (!book) return null;

                  return (
                    <div className="panel-item" key={id}>
                      <MiniCover book={book} />
                      <div className="panel-item-info">
                        <b>{book.title}</b>
                        <small>{book.author}</small>
                        <strong>${(book.price * quantity).toFixed(2)}</strong>
                        <div className="quantity">
                          <button onClick={() => onChangeQuantity(id, -1)}>
                            −
                          </button>
                          <span>{quantity}</span>
                          <button onClick={() => onChangeQuantity(id, 1)}>
                            ＋
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="checkout">
              <div>
                <span>Subtotal</span>
                <b>${cartTotal.toFixed(2)}</b>
              </div>
              <small>Shipping is calculated at checkout.</small>
              <button disabled={cartCount === 0} onClick={onCheckout}>
                Place demo order <span>→</span>
              </button>
              <small className="demo-note">
                Demo only — no payment will be taken.
              </small>
            </div>
          </>
        )}

        {panel === "wishlist" && (
          <div className="panel-items">
            {wishlistBooks.length === 0 ? (
              <p className="panel-empty">
                Tap ♡ on a book to save it here.
              </p>
            ) : (
              wishlistBooks.map((book) => (
                <div className="panel-item" key={book.id}>
                  <MiniCover book={book} />
                  <div className="panel-item-info">
                    <b>{book.title}</b>
                    <small>{book.author}</small>
                    <button
                      className="text-action"
                      onClick={() => onAddToCart(book)}
                    >
                      Add to bag · ${book.price.toFixed(2)}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {panel === "orders" && (
          <div>
            {orders.length === 0 ? (
              <p className="panel-empty">
                Your placed demo orders will show up here.
              </p>
            ) : (
              orders.map((order) => (
                <div className="order-row" key={order.id}>
                  <b>Order #{String(order.id).slice(-6)}</b>
                  <span>
                    {order.date} · {order.status}
                  </span>
                  <strong>${order.total.toFixed(2)}</strong>
                </div>
              ))
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

export default SidePanel;
