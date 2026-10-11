/* Storefront demo behavior: gallery switching, quantity stepper (1-9), a bag with one
   line per color (each line editable and removable), and order totals recomputed from
   state on every render (never parsed from the DOM). Pricing: base $148, express +$12.
   Reference: DG-<bag qty><first variant initial><fee>. No network, no storage. */
(() => {
  "use strict";
  const BASE = 148;
  const MAX_LINE = 9;
  const FEES = { standard: 0, express: 12 };
  const money = (n) => `$${n.toFixed(2)}`;

  const main = document.querySelector("[data-main-image]");
  const thumbBtns = [...document.querySelectorAll("[data-thumb]")];
  const minus = document.querySelector("[data-qty-minus]");
  const plus = document.querySelector("[data-qty-plus]");
  const qtyOut = document.querySelector("[data-qty]");
  const lineTotal = document.querySelector("[data-line-total]");
  const addBtn = document.querySelector("[data-add]");
  const cart = document.querySelector("[data-cart]");
  const bagHeading = document.querySelector("[data-bag-heading]");
  const emptyState = document.querySelector("[data-cart-empty]");
  const linesList = document.querySelector("[data-cart-lines]");
  const cartTotalWrap = document.querySelector("[data-cart-total-wrap]");
  const cartTotalEl = document.querySelector("[data-cart-total]");
  const statusEl = document.querySelector("[data-bag-status]");
  const delivery = document.querySelector("[data-delivery]");
  const orderLines = document.querySelector("[data-order-lines]");
  const orderTotal = document.querySelector("[data-order-total]");
  const placeBtn = document.querySelector("[data-place]");
  const okBanner = document.querySelector("[data-order-ok]");
  const errBanner = document.querySelector("[data-order-error]");
  const confirmDetail = document.querySelector("[data-confirm-detail]");
  const againBtn = document.querySelector("[data-again]");
  const refPrefix = document.querySelector("[data-ref-prefix]");
  const refEl = document.querySelector("[data-ref]");
  const email = document.querySelector("[data-email]");
  const street = document.querySelector("[data-street]");
  const city = document.querySelector("[data-city]");
  const postcode = document.querySelector("[data-postcode]");

  if (!main || !minus || !plus || !qtyOut || !lineTotal || !addBtn || !cart || !bagHeading ||
      !emptyState || !linesList || !cartTotalWrap || !cartTotalEl || !statusEl || !delivery ||
      !orderLines || !orderTotal || !placeBtn || !okBanner || !errBanner || !confirmDetail ||
      !againBtn || !refPrefix || !refEl || !email || !street || !city || !postcode) return;

  const state = { qty: 1, lines: [] };

  const cartQty = () => state.lines.reduce((n, l) => n + l.qty, 0);
  const cartSum = () => BASE * cartQty();
  const fee = () => {
    const sel = delivery.querySelector('input[name="delivery"]:checked');
    return FEES[sel ? sel.value : "standard"] ?? 0;
  };
  const deliveryName = () => {
    const sel = delivery.querySelector('input[name="delivery"]:checked');
    return sel && sel.value === "express" ? "Express" : "Standard";
  };

  function renderQty() {
    qtyOut.textContent = String(state.qty);
    lineTotal.textContent = money(BASE * state.qty);
  }

  function announce(msg) {
    statusEl.textContent = msg;
  }

  function lineRow(variant, qty) {
    const dt = document.createElement("dt");
    dt.textContent = "Product";
    const ddProduct = document.createElement("dd");
    ddProduct.textContent = "Drift Wool Runner";
    const dtV = document.createElement("dt");
    dtV.textContent = "Variant";
    const ddV = document.createElement("dd");
    ddV.textContent = variant;
    const dtQ = document.createElement("dt");
    dtQ.textContent = "Qty";
    const ddQ = document.createElement("dd");
    ddQ.textContent = String(qty);
    return [dt, ddProduct, dtV, ddV, dtQ, ddQ];
  }

  function renderCart(focusSel) {
    const empty = state.lines.length === 0;
    emptyState.hidden = empty ? false : true;
    linesList.hidden = empty;
    cartTotalWrap.hidden = empty;
    linesList.innerHTML = "";
    if (!empty) {
      for (const line of state.lines) {
        const li = document.createElement("li");
        li.setAttribute("data-parts", "ListItem");
        li.setAttribute("data-line", line.variant);
        const meta = document.createElement("dl");
        meta.setAttribute("data-parts", "MetadataList");
        for (const node of lineRow(line.variant, line.qty)) meta.appendChild(node);
        li.appendChild(meta);
        const stepper = document.createElement("div");
        stepper.setAttribute("data-parts", "Stepper");
        stepper.setAttribute("role", "group");
        stepper.setAttribute("aria-label", `${line.variant} quantity`);
        const dec = document.createElement("button");
        dec.type = "button";
        dec.setAttribute("data-line-dec", line.variant);
        dec.setAttribute("data-parts", "Step");
        dec.setAttribute("aria-label", `One fewer ${line.variant} runner`);
        dec.textContent = "−";
        const out = document.createElement("output");
        out.setAttribute("aria-label", `${line.variant} quantity`);
        out.textContent = String(line.qty);
        const inc = document.createElement("button");
        inc.type = "button";
        inc.setAttribute("data-line-inc", line.variant);
        inc.setAttribute("data-parts", "Step");
        inc.setAttribute("aria-label", `One more ${line.variant} runner`);
        inc.textContent = "+";
        stepper.append(dec, out, inc);
        li.appendChild(stepper);
        const total = document.createElement("p");
        total.setAttribute("data-parts", "Text");
        total.textContent = `Line total ${money(BASE * line.qty)}`;
        li.appendChild(total);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.setAttribute("data-line-remove", line.variant);
        remove.setAttribute("aria-label", `Remove ${line.variant} runner from bag`);
        remove.textContent = "Remove";
        li.appendChild(remove);
        linesList.appendChild(li);
      }
      cartTotalEl.textContent = money(cartSum());
    }
    renderSummary();
    syncPlace();
    if (focusSel) {
      const target = cart.querySelector(focusSel);
      if (target) target.focus();
      else bagHeading.focus();
    }
  }

  function renderSummary() {
    orderLines.innerHTML = "";
    if (state.lines.length === 0) {
      const wrap = document.createElement("div");
      const dt = document.createElement("dt");
      dt.textContent = "No items yet";
      const dd = document.createElement("dd");
      dd.textContent = "—";
      wrap.append(dt, dd);
      orderLines.appendChild(wrap);
    } else {
      for (const line of state.lines) {
        const wrap = document.createElement("div");
        const dt = document.createElement("dt");
        dt.textContent = `Drift Wool Runner · ${line.variant} × ${line.qty}`;
        const dd = document.createElement("dd");
        dd.textContent = money(BASE * line.qty);
        wrap.append(dt, dd);
        orderLines.appendChild(wrap);
      }
      const feeWrap = document.createElement("div");
      const feeDt = document.createElement("dt");
      feeDt.textContent = `Delivery (${deliveryName()})`;
      const feeDd = document.createElement("dd");
      feeDd.textContent = money(fee());
      feeWrap.append(feeDt, feeDd);
      orderLines.appendChild(feeWrap);
    }
    orderTotal.textContent = money(state.lines.length ? cartSum() + fee() : 0);
  }

  function selectedVariant() {
    const sel = document.querySelector('input[name="color"]:checked');
    return sel ? sel.value : "Fog";
  }

  function syncPlace() {
    // An empty bag cannot order; the button says so before any click.
    placeBtn.disabled = cartQty() === 0;
  }

  for (const btn of thumbBtns) {
    btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      if (!img) return;
      main.src = img.dataset.src;
      main.alt = img.dataset.alt;
      for (const b of thumbBtns) b.setAttribute("aria-pressed", String(b === btn));
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

  addBtn.addEventListener("click", () => {
    const variant = selectedVariant();
    const found = state.lines.find((l) => l.variant === variant);
    // Re-adding the same color accumulates on its line; a new color starts its own line.
    if (found) found.qty += state.qty;
    else state.lines.push({ variant, qty: state.qty });
    hideConfirmation();
    renderCart();
    announce(`Added ${state.qty} × ${variant} to your bag. The bag holds ${cartQty()} items.`);
  });

  cart.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-line-inc], button[data-line-dec], button[data-line-remove]");
    if (!btn || !cart.contains(btn)) return;
    const variant = btn.getAttribute("data-line-inc") ?? btn.getAttribute("data-line-dec") ?? btn.getAttribute("data-line-remove");
    const line = state.lines.find((l) => l.variant === variant);
    if (!line) return;
    if (btn.hasAttribute("data-line-inc")) {
      if (line.qty >= MAX_LINE) {
        announce(`${variant} is already at the most per line (${MAX_LINE}).`);
        return;
      }
      line.qty += 1;
      announce(`${variant} is now ${line.qty}.`);
      renderCart(`[data-line-inc="${variant}"]`);
    } else if (btn.hasAttribute("data-line-dec")) {
      line.qty -= 1;
      if (line.qty <= 0) {
        state.lines = state.lines.filter((l) => l !== line);
        hideConfirmation();
        renderCart();
        announce(state.lines.length
          ? `Removed ${variant}. The bag holds ${cartQty()} items.`
          : "Removed the last line. Your bag is empty.");
      } else {
        announce(`${variant} is now ${line.qty}.`);
        renderCart(`[data-line-dec="${variant}"]`);
      }
    } else {
      state.lines = state.lines.filter((l) => l !== line);
      hideConfirmation();
      renderCart();
      announce(state.lines.length
        ? `Removed ${variant}. The bag holds ${cartQty()} items.`
        : "Removed the last line. Your bag is empty.");
    }
  });

  delivery.addEventListener("change", () => {
    renderSummary();
  });

  const fields = [
    {
      el: email,
      key: "email",
      message: "Enter an email like you@example.com.",
      valid: () => {
        const v = email.value.trim();
        const at = v.indexOf("@");
        if (at <= 0 || at >= v.length - 1) return false;
        const dot = v.indexOf(".", at);
        return dot > at + 1 && dot < v.length - 1;
      },
    },
    {
      el: street,
      key: "street",
      message: "Enter the street address.",
      valid: () => street.value.trim().length > 0,
    },
    {
      el: city,
      key: "city",
      message: "Enter the city.",
      valid: () => city.value.trim().length > 0,
    },
    {
      el: postcode,
      key: "postcode",
      message: "Enter the postcode.",
      valid: () => postcode.value.trim().length > 0,
    },
  ];

  function statusFor(key) {
    return document.querySelector(`[data-error-for="${key}"]`);
  }

  function setFieldError(field, on) {
    const status = statusFor(field.key);
    if (on) {
      if (status) {
        status.textContent = field.message;
        status.hidden = false;
      }
      field.el.setAttribute("aria-invalid", "true");
      field.el.setAttribute("aria-describedby", status ? status.id : "order-error");
    } else {
      if (status) status.hidden = true;
      field.el.removeAttribute("aria-invalid");
      field.el.removeAttribute("aria-describedby");
    }
  }

  function hideConfirmation() {
    okBanner.hidden = true;
    confirmDetail.hidden = true;
  }

  for (const field of fields) {
    field.el.addEventListener("input", () => {
      // Each fix clears its own message while typing; the banner lifts once all read valid.
      if (field.valid()) {
        setFieldError(field, false);
        if (fields.every((f) => f.valid()) && cartQty() > 0) errBanner.hidden = true;
      }
    });
    field.el.addEventListener("blur", () => {
      if (field.el.value !== "" || field.el.hasAttribute("aria-invalid")) {
        setFieldError(field, !field.valid());
      }
    });
  }

  placeBtn.addEventListener("click", () => {
    // An empty bag cannot order, even if the button is somehow reachable while disabled.
    if (cartQty() === 0) {
      errBanner.textContent = "Your bag is empty — add something before placing an order.";
      errBanner.hidden = false;
      okBanner.hidden = true;
      confirmDetail.hidden = true;
      addBtn.focus();
      return;
    }
    const bad = fields.filter((f) => !f.valid());
    for (const f of fields) setFieldError(f, !f.valid());
    if (bad.length) {
      errBanner.textContent = "Check the highlighted fields.";
      errBanner.hidden = false;
      okBanner.hidden = true;
      confirmDetail.hidden = true;
      bad[0].el.focus();
      return;
    }
    errBanner.hidden = true;
    // Reference reflects the bag (total qty + first line variant), never the picker selection.
    const first = state.lines[0].variant;
    const ref = `DG-${cartQty()}${first[0].toUpperCase()}${fee()}`;
    refPrefix.textContent = "Order confirmed. Reference ";
    refEl.textContent = ref;
    okBanner.hidden = false;
    confirmDetail.hidden = false;
    okBanner.focus();
  });

  againBtn.addEventListener("click", () => {
    state.lines = [];
    state.qty = 1;
    for (const f of [email, street, city, postcode]) f.value = "";
    for (const field of fields) setFieldError(field, false);
    errBanner.hidden = true;
    hideConfirmation();
    renderQty();
    renderCart();
    announce("Started a new order. Your bag is empty.");
    bagHeading.focus();
  });

  renderQty();
  renderSummary();
  syncPlace();
})();
