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
  const email = document.querySelector("[data-email]");
  const street = document.querySelector("[data-street]");
  const city = document.querySelector("[data-city]");
  const postcode = document.querySelector("[data-postcode]");

  const state = { qty: 1, cartQty: 0, variant: "Fog", added: false };

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

  addBtn.addEventListener("click", () => {
    state.variant = selectedVariant();
    state.cartQty = state.qty;
    state.added = true;
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
  });

  delivery.addEventListener("change", () => {
    renderOrderTotal();
  });

  placeBtn.addEventListener("click", () => {
    const bad = [];
    if (!email.value.includes("@") || !email.value.trim()) bad.push(email);
    for (const f of [street, city, postcode]) if (!f.value.trim()) bad.push(f);
    for (const f of [email, street, city, postcode]) f.removeAttribute("aria-invalid");
    if (bad.length) {
      for (const f of bad) f.setAttribute("aria-invalid", "true");
      errBanner.hidden = false;
      okBanner.hidden = true;
      return;
    }
    errBanner.hidden = true;
    const ref = `DG-${state.added ? state.cartQty : state.qty}${selectedVariant()[0].toUpperCase()}${fee()}`;
    okBanner.querySelector("[data-ref]").textContent = ref;
    okBanner.childNodes[0].textContent = "Order confirmed. Reference ";
    okBanner.hidden = false;
  });

  renderQty();
  orderTotal.textContent = money(0);
})();
