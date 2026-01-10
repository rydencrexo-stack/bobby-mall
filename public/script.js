/* ================= GLOBAL ================= */

const cartKey = "cart";
let allProducts = [];
let pendingProductId = null;
let activeCategory = "All";

/* ================= USER HELPERS ================= */

function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

/* ================= LOGIN MODAL ================= */

function openLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.style.display = "block";
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.style.display = "none";
}

/* ================= CART HELPERS ================= */

function getCart() {
  return JSON.parse(localStorage.getItem(cartKey)) || [];
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

/* ================= CART COUNT ================= */

function updateCartCount() {
  const cart = getCart();
  const countEl = document.getElementById("cartCount");
  if (!countEl) return;

  let totalQty = 0;
  cart.forEach(item => totalQty += item.qty || 0);

  if (totalQty === 0) {
    countEl.style.display = "none";
    countEl.innerText = "";
    return;
  }

  countEl.style.display = "inline-block";
  countEl.innerText = totalQty;

  countEl.classList.remove("bump");
  void countEl.offsetWidth;
  countEl.classList.add("bump");
}

/* ================= MINI CART ================= */

function updateMiniCart() {
  const cart = getCart();
  const miniItems = document.querySelector(".mini-items");
  const miniTotal = document.getElementById("miniTotal");
  const emptyText = document.querySelector(".mini-empty");

  if (!miniItems || !miniTotal || !emptyText) return;

  if (cart.length === 0) {
    emptyText.style.display = "block";
    miniItems.innerHTML = "";
    miniTotal.innerText = "0";
    return;
  }

  emptyText.style.display = "none";

  let total = 0;

  miniItems.innerHTML = cart.map(item => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    const itemTotal = price * qty;
    total += itemTotal;

    return `
      <div class="mini-item">
        <span>${item.name || "Item"} × ${qty}</span>
        <span>₹${itemTotal}</span>
      </div>
    `;
  }).join("");

  miniTotal.innerText = total;
}

/* ================= NAVBAR USER UI ================= */

function updateUserUI() {
  const user = getUser();
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");
  const ordersLink = document.getElementById("myOrdersLink");

  if (user) {
    if (userNameEl) {
      userNameEl.innerText = `Hi, ${user.name}`;
      userNameEl.style.display = "inline-block";
    }
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (ordersLink) ordersLink.style.display = "inline-block";
  } else {
    if (userNameEl) userNameEl.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (ordersLink) ordersLink.style.display = "none";
  }
}

/* ================= CATEGORY FILTER ================= */

function setCategory(category) {
  activeCategory = category;

  if (category === "All") {
    renderProducts(allProducts);
  } else {
    const filtered = allProducts.filter(
      p => p.category && p.category.toLowerCase() === category.toLowerCase()
    );
    renderProducts(filtered);
  }
}

/* ================= POPUP ================= */

function showPopup() {
  const popup = document.getElementById("checkoutPopup");
  if (!popup) return;

  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 4000);
}

function closePopup() {
  const popup = document.getElementById("checkoutPopup");
  if (popup) popup.classList.remove("show");
}

/* ================= RENDER PRODUCTS (FIXED & SAFE) ================= */

function renderProducts(products) {
  const container = document.getElementById("products");
  if (!container) return;

  const cart = getCart();

  container.innerHTML = products.map(p => {
    if (!p || !p._id) return "";

    const item = cart.find(i => i._id === p._id);
    const name = p.name || "Unnamed Product";
    const price = Number(p.price) || 0;
    const img = p.image ? p.image : "https://via.placeholder.com/300";

    return `
      <div class="card">
        <img src="${img}" alt="${name}">
        <h3>${name}</h3>
        <p>₹${price}</p>

        ${
          item
            ? `
              <div class="qty-controls">
                <button onclick="decrease('${p._id}')">−</button>
                <span>${item.qty}</span>
                <button onclick="increase('${p._id}')">+</button>
              </div>
            `
            : `<button onclick="handleAddToCart('${p._id}')">Add to Cart</button>`
        }
      </div>
    `;
  }).join("");
}

/* ================= LOAD PRODUCTS ================= */

fetch("/api/products")
  .then(res => res.json())
  .then(products => {
    allProducts = Array.isArray(products) ? products : [];
    setCategory("All");
    updateCartCount();
    updateMiniCart();
    updateUserUI();
  })
  .catch(() => {
    allProducts = [];
  });

/* ================= ADD TO CART WITH LOGIN ================= */

function handleAddToCart(id) {
  if (!getUser()) {
    pendingProductId = id;
    openLoginModal();
    return;
  }
  addToCart(id);
}

function addToCart(id) {
  const cart = getCart();
  const product = allProducts.find(p => p._id === id);

  if (!product) return;

  cart.push({ ...product, qty: 1 });
  saveCart(cart);

  saveScroll();
  setCategory(activeCategory);
  updateCartCount();
  updateMiniCart();
  showPopup();
}

/* ================= QTY ================= */

function increase(id) {
  const cart = getCart();
  const item = cart.find(i => i._id === id);
  if (item) item.qty += 1;

  saveCart(cart);
  saveScroll();
  setCategory(activeCategory);
  updateCartCount();
  updateMiniCart();
}

function decrease(id) {
  let cart = getCart();
  const item = cart.find(i => i._id === id);

  if (!item) return;

  if (item.qty > 1) item.qty -= 1;
  else cart = cart.filter(i => i._id !== id);

  saveCart(cart);
  saveScroll();
  setCategory(activeCategory);
  updateCartCount();
  updateMiniCart();
}

/* ================= LOGIN SUBMIT ================= */

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector(".modal-btn");
  const closeBtn = document.querySelector(".modal-close");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const name = loginName.value.trim();
      const phoneRaw = loginPhone.value.trim();
      const email = loginEmail.value.trim();
      const password = loginPassword.value.trim();

      if (!name || !phoneRaw || !email || !password) {
        alert("Please fill all details");
        return;
      }

      saveUser({
        name,
        phone: "+91" + phoneRaw,
        email,
        password
      });

      closeLoginModal();
      updateUserUI();

      if (pendingProductId) {
        addToCart(pendingProductId);
        pendingProductId = null;
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeLoginModal);
});

/* ================= LOGOUT ================= */

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      location.reload();
    });
  }
});

/* ================= SCROLL RESTORE ================= */

function saveScroll() {
  localStorage.setItem("scrollY", window.scrollY);
}

window.onload = () => {
  const y = localStorage.getItem("scrollY");
  if (y !== null) {
    window.scrollTo({ top: parseInt(y), behavior: "instant" });
  }
};
