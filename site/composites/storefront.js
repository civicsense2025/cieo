/* Storefront demo behavior: gallery switching, quantity stepper (1-9), bag accumulation
   keyed by variant, and order totals recomputed from state on every render (never parsed
   from the DOM). Pricing: base $148, express +$12. Reference: DG-<bag qty><variant initial><fee>. */
(() => {
  "use strict";
  const BASE = 148;
  const FEES = { standard: 0, express: 12 };
  const money = (n) => `$${n.toFixed(2)}`;

  const main = document.querySelector("[data-main-image]");
  const thumbs = [...document.querySelectorAll("[data-thumb] img")];
  const minus = document.querySelector("[data-qty-minus]");
  const plus = document.querySelector("[data-qty-plus]");
  const qtyOut = document.querySelector("[data-qty]");
  const lineTotal = document.querySelector("[data-line-total]");
  const addBtn = document.querySelector("[data-add]");
  const cart = document.querySelector("[data-cart]");
  const delivery = document.querySelector("[data-delivery]");
  const orderTotal = document.querySelector("[data-order-total]");
  const placeBtn = document.querySelector("[data-place]");
  const okBanner = document.querySelector("[data-order-ok]");
  const errBanner = document.querySelector("[data-order-error]");
  const refPrefix = document.querySelector("[data-ref-prefix]");
  const refEl = document.querySelector("[data-ref]");
  const email = document.querySelector("[data-email]");
  const street = document.querySelector("[data-street]");
  const city = document.querySelector("[data-city]");
  const postcode = document.querySelector("[data-postcode]");

  if (!main || !minus || !plus || !qtyOut || !lineTotal || !addBtn || !cart || !delivery ||
      !orderTotal || !placeBtn || !okBanner || !errBanner || !refPrefix || !refEl ||
      !email || !street || !city || !postcode) return;

  const state = { qty: 1, cartQty: 0, variant: "Fog", added: false };
  // Variant shown on the current bag line. Add replaces the line on variant change, accumulates otherwise.
  let lineVariant = null;

  const cartTotal = () => BASE * state.cartQty;
  const fee = () => {
    const sel = delivery.querySelector('input[name="delivery"]:checked');
    return FEES[sel ? sel.value : "standard"] ?? 0;
  };

  function renderQty() {
    qtyOut.textContent = String(state.qty);
    lineTotal.textContent = money(BASE * state.qty);
  }

  function renderOrderTotal() {
    orderTotal.textContent = money(state.added ? cartTotal() + fee() : 0);
  }

  function selectedVariant() {
    const sel = document.querySelector('input[name="color"]:checked');
    return sel ? sel.value : "Fog";
  }

  for (const img of thumbs) {
    img.closest("button").addEventListener("click", () => {
      main.src = img.dataset.src;
      main.alt = img.dataset.alt;
    });
  }

  minus.addEventListener("click", () => {
    state.qty = Math.max(1, state.qty - 1);
    renderQty();
  });
  plus.addEventListener("click", () => {
    state.qty = Math.min(9, state.qty + 1);
    renderQty();
  });

  document.querySelectorAll('input[name="color"]').forEach((r) =>
    r.addEventListener("change", () => {
      state.variant = selectedVariant();
    }),
  );

  function syncPlace() {
    // An empty bag cannot order; the button says so before any click.
    placeBtn.disabled = !(state.added && state.cartQty > 0);
  }

  function syncCart() {
    let list = cart.querySelector("[data-cart-list]");
    if (!list) {
      cart.querySelector("p").remove();
      list = document.createElement("dl");
      list.setAttribute("data-cart-list", "");
      list.setAttribute("data-parts", "MetadataList");
      cart.appendChild(list);
      const total = document.createElement("p");
      total.setAttribute("data-cart-total", "");
      total.setAttribute("data-parts", "Text");
      cart.appendChild(total);
    }
    list.innerHTML = "";
    const rows = [
      ["Product", "Drift Wool Runner"],
      ["Variant", state.variant],
      ["Qty", String(state.cartQty)],
    ];
    for (const [k, v] of rows) {
      const dt = document.createElement("dt");
      dt.textContent = k;
      const dd = document.createElement("dd");
      dd.textContent = v;
      list.appendChild(dt);
      list.appendChild(dd);
    }
    cart.querySelector("[data-cart-total]").textContent = money(cartTotal());
    renderOrderTotal();
    syncPlace();
  }

  addBtn.addEventListener("click", () => {
    state.variant = selectedVariant();
    // A new variant starts a fresh line; re-adding the same variant accumulates, as real bags do.
    if (!state.added || state.variant !== lineVariant) {
      state.cartQty = state.qty;
      lineVariant = state.variant;
    } else {
      state.cartQty += state.qty;
    }
    state.added = true;
    syncCart();
  });

  delivery.addEventListener("change", () => {
    renderOrderTotal();
  });

  placeBtn.addEventListener("click", () => {
    // An empty bag cannot order, even if the button is somehow reachable while disabled.
    if (!state.added || state.cartQty === 0) {
      errBanner.textContent = "Your bag is empty — add something before placing an order.";
      errBanner.hidden = false;
      okBanner.hidden = true;
      return;
    }
    const emailValue = email.value.trim();
    const bad = [];
    // Both sides of @ must hold text; "@" alone or "a@" never passes.
    if (emailValue.indexOf("@") <= 0 || emailValue.indexOf("@") >= emailValue.length - 1) bad.push(email);
    for (const f of [street, city, postcode]) if (!f.value.trim()) bad.push(f);
    for (const f of [email, street, city, postcode]) { f.removeAttribute("aria-invalid"); f.removeAttribute("aria-describedby"); }
    if (bad.length) {
      for (const f of bad) { f.setAttribute("aria-invalid", "true"); f.setAttribute("aria-describedby", "order-error"); }
      errBanner.textContent = "Check the highlighted fields.";
      errBanner.hidden = false;
      okBanner.hidden = true;
      bad[0].focus();
      return;
    }
    errBanner.hidden = true;
    // Reference reflects the bag (cartQty + line variant), never the current picker selection.
    const ref = `DG-${state.cartQty}${lineVariant[0].toUpperCase()}${fee()}`;
    refPrefix.textContent = "Order confirmed. Reference ";
    refEl.textContent = ref;
    okBanner.hidden = false;
  });

  renderQty();
  orderTotal.textContent = money(0);
  syncPlace();
})();
