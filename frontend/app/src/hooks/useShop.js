import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";

function readSaved(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// MongoDB stores each signed-in user's bag, wishlist, and orders separately.
export function useShop(books) {
  const [cart, setCart] = useState({});
  const [wishlist, setWishlist] = useState(() =>
    readSaved("bookverse-wishlist-guest", []),
  );
  const [orders, setOrders] = useState([]);
  const [panel, setPanel] = useState("");
  const [toast, setToast] = useState("");
  const [toastKey, setToastKey] = useState(0);
  const toastTimer = useRef(null);

  useEffect(() => {
    const timer = toastTimer;
    return () => window.clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    let active = true;
    let loadVersion = 0;

    async function loadAccountData() {
      const version = ++loadVersion;
      const token = localStorage.getItem("bookverse-token");

      if (!token) {
        if (active && version === loadVersion) {
          setCart({});
          setWishlist(readSaved("bookverse-wishlist-guest", []));
          setOrders([]);
        }
        return;
      }

      try {
        const headers = { Authorization: "Bearer " + token };
        const [stateResponse, ordersResponse] = await Promise.all([
          axios.get("/api/account/state", { headers }),
          axios.get("/api/payments/orders", { headers }),
        ]);

        if (active && version === loadVersion) {
          setCart(stateResponse.data.cart ?? {});
          setWishlist(stateResponse.data.wishlist ?? []);
          setOrders(ordersResponse.data ?? []);
        }
      } catch {
        if (active && version === loadVersion) {
          setCart({});
          setWishlist([]);
          setOrders([]);
        }
      }
    }

    function handleAuthChange() {
      loadVersion += 1;
      setCart({});
      setWishlist(readSaved("bookverse-wishlist-guest", []));
      setOrders([]);
      loadAccountData();
    }

    window.addEventListener("bookverse-auth-change", handleAuthChange);
    loadAccountData();

    return () => {
      active = false;
      window.removeEventListener("bookverse-auth-change", handleAuthChange);
    };
  }, []);

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const cartTotal = Object.entries(cart).reduce((total, [id, quantity]) => {
    const book = books.find((item) => item.id === Number(id));
    return total + (book ? book.price * quantity : 0);
  }, 0);

  const wishlistBooks = useMemo(
    () => books.filter((book) => wishlist.includes(book.id)),
    [books, wishlist],
  );

  function notify(message) {
    setToast(message);
    setToastKey((key) => key + 1);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  }

  async function saveShoppingState(nextCart, nextWishlist) {
    const token = localStorage.getItem("bookverse-token");
    if (!token) return;

    await axios.put(
      "/api/account/state",
      { cart: nextCart, wishlist: nextWishlist },
      { headers: { Authorization: "Bearer " + token } },
    );
  }

  function addToCart(book) {
    if (!localStorage.getItem("bookverse-token")) {
      notify("Please sign in before adding books to your bag.");
      return;
    }

    const inCart = cart[book.id] || 0;

    if (typeof book.stock === "number" && inCart >= book.stock) {
      notify(
        book.stock === 0
          ? book.title + " is out of stock"
          : "Only " + book.stock + " in stock",
      );
      return;
    }

    const nextCart = { ...cart, [book.id]: inCart + 1 };
    setCart(nextCart);
    saveShoppingState(nextCart, wishlist).catch(() =>
      notify("Could not save your bag. Please try again."),
    );
    notify(book.title + " added to your bag");
  }

  function changeQuantity(id, amount) {
    if (!localStorage.getItem("bookverse-token")) {
      notify("Please sign in to update your bag.");
      return;
    }

    const book = books.find((item) => item.id === Number(id));
    const current = cart[id] || 0;

    if (amount > 0 && book && current >= book.stock) {
      notify("Only " + book.stock + " in stock");
      return;
    }

    const nextCart = { ...cart };
    nextCart[id] = current + amount;

    if (nextCart[id] <= 0) {
      delete nextCart[id];
    }

    setCart(nextCart);
    saveShoppingState(nextCart, wishlist).catch(() =>
      notify("Could not save your bag. Please try again."),
    );
  }

  function toggleWishlist(book) {
    const nextWishlist = wishlist.includes(book.id)
      ? wishlist.filter((id) => id !== book.id)
      : [...wishlist, book.id];

    setWishlist(nextWishlist);

    if (localStorage.getItem("bookverse-token")) {
      saveShoppingState(cart, nextWishlist).catch(() =>
        notify("Could not save your wishlist. Please try again."),
      );
    } else {
      save("bookverse-wishlist-guest", nextWishlist);
    }

    notify(
      nextWishlist.includes(book.id)
        ? "Saved to your wishlist"
        : "Removed from wishlist",
    );
  }

  async function checkout() {
    const token = localStorage.getItem("bookverse-token");
    if (!token) {
      notify("Please sign in before paying.");
      return;
    }

    if (cartCount === 0) return;

    try {
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Could not load Razorpay."));
          document.body.appendChild(script);
        });
      }

      const items = Object.entries(cart).map(([bookId, quantity]) => ({
        bookId: Number(bookId),
        quantity: Number(quantity),
      }));

      const headers = { Authorization: "Bearer " + token };
      const { data: order } = await axios.post(
        "/api/payments/create-order",
        { items },
        { headers },
      );

      const paymentWindow = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Bookverse",
        description: "Book order",
        order_id: order.orderId,

        handler: async (paymentResponse) => {
          try {
            const { data: result } = await axios.post(
              "/api/payments/verify",
              paymentResponse,
              { headers },
            );

            if (!result.success) {
              throw new Error("Payment could not be verified.");
            }

            const fallbackOrder = {
              id: paymentResponse.razorpay_order_id,
              date: new Date().toLocaleDateString(),
              total: order.amount / 100,
              status: "Paid",
            };
            setOrders((current) => [
              fallbackOrder,
              ...current.filter((entry) => entry.id !== fallbackOrder.id),
            ]);

            try {
              const { data: userOrders } = await axios.get(
                "/api/payments/orders",
                { headers },
              );
              setOrders(userOrders);
            } catch {
              // Keep the verified order visible if refreshing the list fails.
            }

            setCart({});
            let cartSyncWarning = "";
            try {
              await saveShoppingState({}, wishlist);
            } catch {
              cartSyncWarning = " Your bag may need refreshing.";
            }

            setPanel("");
            notify(
              "Payment successful! Your order is placed." +
                (result.emailSent
                  ? " Confirmation sent to your email."
                  : " Email confirmation could not be sent; check the email settings." ) +
                cartSyncWarning,
            );
          } catch (error) {
            notify(
              error.response?.data?.message ||
                error.message ||
                "Payment verification failed.",
            );
          }
        },

        modal: {
          ondismiss: () => notify("Payment window closed."),
        },
      });

      paymentWindow.on("payment.failed", (event) => {
        notify(event.error?.description || "Payment failed. Please try again.");
      });

      paymentWindow.open();
    } catch (error) {
      notify(
        error.response?.data?.message ||
          error.message ||
          "Could not start checkout.",
      );
    }
  }

  return {
    cart,
    wishlist,
    orders,
    panel,
    setPanel,
    toast,
    toastKey,
    notify,
    cartCount,
    cartTotal,
    wishlistBooks,
    addToCart,
    changeQuantity,
    toggleWishlist,
    checkout,
  };
}
