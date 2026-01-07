const cartKey = "cart";
let allProducts = [];

/* ================= CART HELPERS ================= */

// GET CART
function getCart() {
  return JSON.parse(localStorage.getItem(cartKey)) || [];
}

// SAVE CART
function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

/* ================= POPUP ================= */

function showPopup() {
  const popup = document.getElementById("checkoutPopup");
  if (!popup) return;

  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 4000);
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
            : `<button onclick="addToCart('${p._id}')">Add to Cart</button>`
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
  });

/* ================= CART ACTIONS ================= */

// ADD TO CART
function addToCart(id) {
  const cart = getCart();
  const product = allProducts.find(p => p._id === id);

  cart.push({ ...product, qty: 1 });
  saveCart(cart);

  renderProducts(allProducts);
  showPopup();
}

// INCREASE QTY
function increase(id) {
  const cart = getCart();
  const item = cart.find(i => i._id === id);

  if (item) item.qty += 1;
  saveCart(cart);

  renderProducts(allProducts);
  showPopup();
}

// DECREASE QTY
function decrease(id) {
  let cart = getCart();
  const item = cart.find(i => i._id === id);

  if (!item) return;

  if (item.qty > 1) {
    item.qty -= 1;
  } else {
    cart = cart.filter(i => i._id !== id);
  }

  saveCart(cart);
  renderProducts(allProducts);
}
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
    body: JSON.stringify({
      name,
      price,
      category,
      image,
      description
    })
  })
    .then(res => res.json())
    .then(() => {
      alert("✅ Product added");
      location.reload();
    })
    .catch(() => alert("❌ Failed to add product"));
}
