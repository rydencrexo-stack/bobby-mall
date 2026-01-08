/* ================= ADMIN ADD PRODUCT ================= */

function addProduct() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const category = document.getElementById("category").value;
  const image = document.getElementById("image").value;
  const description = document.getElementById("description").value;

  if (!name || !price) {
    alert("Name and price required");
    return;
  }

  fetch("/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, category, image, description })
  })
    .then(res => res.json())
    .then(() => {
      alert("✅ Product added");
      location.reload();
    })
    .catch(() => alert("❌ Failed to add product"));
}

/* ================= GLOBAL ================= */

const cartKey = "cart";
let allProducts = [];
let pendingProductId = null;

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
  let totalQty = 0;
  cart.forEach(item => totalQty += item.qty);

  const countEl = document.getElementById("cartCount");
  if (countEl) {
    countEl.innerText = totalQty;
    countEl.classList.remove("bump");
    void countEl.offsetWidth;
    countEl.classList.add("bump");
  }
}

/* ================= MINI CART ================= */

function updateMiniCart() {
  const cart = getCart();
  const miniItems = document.querySelector(".mini-items");
  const miniTotal = document.getElementById("miniTotal");
  const emptyText = document.querySelector(".mini-empty");

  if (!miniItems || !miniTotal || !emptyText) return;

  let total = 0;

  if (cart.length === 0) {
    emptyText.style.display = "block";
    miniItems.innerHTML = "";
    miniTotal.innerText = "0";
    return;
  }

  emptyText.style.display = "none";

  miniItems.innerHTML = cart.map(item => {
    total += item.price * item.qty;
    return `
      <div class="mini-item">
        <span>${item.name} × ${item.qty}</span>
        <span>₹${item.price * item.qty}</span>
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

  if (user && userNameEl && logoutBtn) {
    userNameEl.innerText = `Hi, ${user.name}`;
    userNameEl.style.display = "inline-block";
    logoutBtn.style.display = "inline-block";
  } else {
    if (userNameEl) userNameEl.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "none";
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

/* ================= RENDER PRODUCTS ================= */

function renderProducts(products) {
  const container = document.getElementById("products");
  if (!container) return;

  const cart = getCart();

  container.innerHTML = products.map(p => {
    const item = cart.find(i => i._id === p._id);

    return `
      <div class="card">
        <img src="${p.image || 'https://via.placeholder.com/300'}" />
        <h3>${p.name}</h3>
        <p>₹${p.price}</p>

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
    allProducts = products;
    renderProducts(products);
    updateCartCount();
    updateMiniCart();
    updateUserUI();
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

  cart.push({ ...product, qty: 1 });
  saveCart(cart);

  saveScroll();
  renderProducts(allProducts);
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
  renderProducts(allProducts);
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
  renderProducts(allProducts);
  updateCartCount();
  updateMiniCart();
}

/* ================= LOGIN SUBMIT (UPDATED PHONE LOGIC ONLY) ================= */

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector(".modal-btn");
  const closeBtn = document.querySelector(".modal-close");

  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const name = document.getElementById("loginName").value.trim();
      let phone = document.getElementById("loginPhone").value.trim();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!name || !phone || !email || !password) {
        alert("Please fill all details");
        return;
      }

      if (!email.toLowerCase().endsWith("@gmail.com")) {
        alert("Please use a Gmail address ending with @gmail.com");
        return;
      }

      // ✅ NEW: phone must be exactly 10 digits
      if (!/^\d{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit mobile number");
        return;
      }

      // attach +91 internally
      phone = "+91" + phone;

      saveUser({ name, phone, email, password });
      closeLoginModal();
      updateUserUI();

      if (pendingProductId) {
        addToCart(pendingProductId);
        pendingProductId = null;
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener("click", closeLoginModal);

  updateUserUI();
  updateCartCount();
  updateMiniCart();
});

/* ================= LOGOUT ================= */

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      alert("You have been logged out");
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
