function SidePanel({
  panel,
  onClose,
  cart,
  cartCount,
  cartTotal,
  wishlistBooks,
  orders,
  onChangeQuantity,
  onAddToCart,
  onCheckout,
  onNotify,
  onOpenPanel,
  catalogCount,
}) {
  if (!panel) return null;

  const title = {
    cart: "Your bag",
    wishlist: "Your wishlist",
    account: "Welcome, reader",
    orders: "Your orders",
    admin: "Bookverse dashboard",
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
                  const book = cart.books.find(
                    (item) => item.id === Number(id),
                  );
                  if (!book) return null;

                  return (
                    <div className="panel-item" key={id}>
                      <div className={`mini-cover cover-${book.id % 5}`}>▤</div>
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
                  <div className={`mini-cover cover-${book.id % 5}`}>▤</div>
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

        {panel === "account" && (
          <form
            className="account-form"
            onSubmit={(event) => {
              event.preventDefault();
              onClose();
              onNotify("Signed in for this demo!");
            }}
          >
            <p>Sign in to keep your reading list and orders together.</p>

            <label>
              Email address
              <input type="email" placeholder="you@example.com" required />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="At least 6 characters"
                minLength="6"
                required
              />
            </label>

            <button className="primary-button">Sign in →</button>
            <small>Demo only. This form does not create an account.</small>

            <button
              type="button"
              className="text-action"
              onClick={() =>
                onNotify("Connect an account service to enable registration.")
              }
            >
              Create an account
            </button>

            <button
              type="button"
              className="text-action"
              onClick={() => onOpenPanel("orders")}
            >
              View order history
            </button>

            <button
              type="button"
              className="text-action"
              onClick={() => onOpenPanel("admin")}
            >
              Open admin preview
            </button>
          </form>
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

        {panel === "admin" && (
          <div className="admin-preview">
            <p>Sample inventory overview</p>
            <div>
              <b>{catalogCount}</b>
              <span>Books in catalog</span>
            </div>
            <div>
              <b>{orders.length}</b>
              <span>Demo orders</span>
            </div>
            <small>
              This is a display preview. Managing real books and inventory
              requires a backend.
            </small>
          </div>
        )}
      </aside>
    </div>
  );
}

export default SidePanel;