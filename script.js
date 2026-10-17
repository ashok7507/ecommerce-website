// ShopNova - E-commerce Website

const products = [
  {
    id: 1,
    name: "Pebble Ceramic Vase",
    category: "Home",
    price: 899,
    oldPrice: 1199,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 2,
    name: "Studio Wireless Headphones",
    category: "Tech",
    price: 2499,
    oldPrice: null,
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 3,
    name: "Everyday Canvas Tote",
    category: "Accessories",
    price: 649,
    oldPrice: null,
    badge: null,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 4,
    name: "Soft Glow Table Lamp",
    category: "Home",
    price: 1899,
    oldPrice: 2299,
    badge: "SALE",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 5,
    name: "Pocket Bluetooth Speaker",
    category: "Tech",
    price: 1599,
    oldPrice: null,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 6,
    name: "Sunday Stoneware Mug",
    category: "Home",
    price: 499,
    oldPrice: null,
    badge: null,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558f4b5c4?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 7,
    name: "Daily Carry Watch",
    category: "Accessories",
    price: 2199,
    oldPrice: 2799,
    badge: "FAVOURITE",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 8,
    name: "Arc Wireless Earbuds",
    category: "Tech",
    price: 1299,
    oldPrice: null,
    badge: null,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=700&q=85"
  }
];

// DOM shortcuts
const $ = (selector) => document.querySelector(selector);

// Application state
let activeCategory = "All";
let searchTerm = "";
let sortBy = "featured";
let toastTimer;

// Format prices in Indian rupees
function money(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

// Load cart from localStorage
function loadCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("shopnova-cart") || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved.filter(item =>
      products.some(product => product.id === item.id) &&
      Number.isInteger(item.qty) &&
      item.qty > 0
    );
  } catch {
    return [];
  }
}

let cart = loadCart();

// Save cart
function saveCart() {
  try {
    localStorage.setItem(
      "shopnova-cart",
      JSON.stringify(cart)
    );
  } catch {
    // Cart remains available until the page is refreshed.
  }
}

// Filter and sort products
function getVisibleProducts() {
  let result = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  if (sortBy === "low") {
    result.sort((a, b) => a.price - b.price);
  }

  if (sortBy === "high") {
    result.sort((a, b) => b.price - a.price);
  }

  if (sortBy === "name") {
    result.sort((a, b) => a.name.localeCompare(b.name));
  }

  return result;
}

// Display products
function renderProducts() {
  const list = getVisibleProducts();
  const grid = $("#product-grid");

  grid.innerHTML = list.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img
          class="product-image"
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        >

        ${
          product.badge
            ? `<span class="product-badge">${product.badge}</span>`
            : ""
        }

        <button
          class="quick-add"
          data-add="${product.id}"
          aria-label="Add ${product.name} to bag"
        >
          + Add to bag
        </button>
      </div>

      <div class="product-info">
        <div>
          <h3 class="product-name">${product.name}</h3>
          <span class="product-category">
            ${product.category}
          </span>
        </div>

        <div class="product-price">
          ${
            product.oldPrice
              ? `<span class="old-price">${money(product.oldPrice)}</span>`
              : ""
          }
          ${money(product.price)}
        </div>
      </div>
    </article>
  `).join("");

  $("#empty-state").hidden = list.length !== 0;
  grid.hidden = list.length === 0;
}

// Change active category
function setCategory(category) {
  activeCategory = category;

  document.querySelectorAll(".category").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === category
    );
  });

  renderProducts();
}

// Calculate cart quantity
function getCartCount() {
  return cart.reduce((total, item) => total + item.qty, 0);
}

// Calculate subtotal
function getSubtotal() {
  return cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.id);

    return total + product.price * item.qty;
  }, 0);
}

// Add product to cart
function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }

  saveCart();
  renderCart();

  const product = products.find(p => p.id === id);

  showToast(`${product.name} added to your bag!`);
}

// Update product quantity
function changeQuantity(id, change) {
  const item = cart.find(item => item.id === id);

  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  saveCart();
  renderCart();
}

// Remove product from cart
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);

  saveCart();
  renderCart();
}

// Display cart
function renderCart() {
  const count = getCartCount();

  $("#cart-count").textContent = count;
  $("#drawer-count").textContent = count;
  $("#cart-subtotal").textContent = money(getSubtotal());

  const cartItems = $("#cart-items");
  const checkout = $("#checkout-button");

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <h3>Your bag is empty.</h3>
        <p>Find something lovely to bring home.</p>
        <button class="button outline-button" id="empty-shop">
          Explore collection
        </button>
      </div>
    `;

    checkout.disabled = true;
    checkout.style.opacity = "0.5";
    return;
  }

  checkout.disabled = false;
  checkout.style.opacity = "1";

  cartItems.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);

    return `
      <article class="cart-row">
        <img src="${product.image}" alt="${product.name}">

        <div>
          <h3>${product.name}</h3>

          <span class="cart-category">
            ${product.category}
          </span>

          <div class="qty-control">
            <button
              data-qty="${product.id}"
              data-change="-1"
              aria-label="Decrease quantity"
            >−</button>

            <span>${item.qty}</span>

            <button
              data-qty="${product.id}"
              data-change="1"
              aria-label="Increase quantity"
            >+</button>
          </div>

          <button
            class="remove-item"
            data-remove="${product.id}"
          >
            Remove
          </button>
        </div>

        <span class="cart-line-price">
          ${money(product.price * item.qty)}
        </span>
      </article>
    `;
  }).join("");
}

// Open shopping cart
function openCart() {
  $("#cart-drawer").classList.add("open");
  $("#overlay").classList.add("visible");
  document.body.classList.add("no-scroll");
  $("#close-cart").focus();
}

// Close shopping cart
function closeCart() {
  $("#cart-drawer").classList.remove("open");
  $("#overlay").classList.remove("visible");
  document.body.classList.remove("no-scroll");
}

// Notification message
function showToast(message) {
  const toast = $("#toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

// Category buttons
$("#categories").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");

  if (button) {
    setCategory(button.dataset.category);
  }
});

// Product add-to-cart buttons
$("#product-grid").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");

  if (button) {
    addToCart(Number(button.dataset.add));
  }
});

// Search
$("#search-input").addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});

// Sorting
$("#sort-select").addEventListener("change", event => {
  sortBy = event.target.value;
  renderProducts();
});

// Clear filters
$("#clear-filters").addEventListener("click", () => {
  searchTerm = "";
  $("#search-input").value = "";

  setCategory("All");
});

// Focus search
$("#search-focus").addEventListener("click", () => {
  $("#products").scrollIntoView({ behavior: "smooth" });

  setTimeout(() => $("#search-input").focus(), 300);
});

// Cart controls
$("#open-cart").addEventListener("click", openCart);
$("#close-cart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
$("#continue-shopping").addEventListener("click", closeCart);

// Handle cart quantity changes and remove buttons
$("#cart-items").addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    changeQuantity(
      Number(quantityButton.dataset.qty),
      Number(quantityButton.dataset.change)
    );
  }

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.remove));
  }

  if (event.target.closest("#empty-shop")) {
    closeCart();

    $("#products").scrollIntoView({
      behavior: "smooth"
    });
  }
});

// Close cart with Escape
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
  }
});

// Mobile navigation
$("#menu-toggle").addEventListener("click", () => {
  $("#nav").classList.toggle("nav-open");
});

$("#nav").addEventListener("click", event => {
  if (event.target.closest("a")) {
    $("#nav").classList.remove("nav-open");
  }
});

// Demo checkout
$("#checkout-button").addEventListener("click", () => {
  if (cart.length === 0) return;

  showToast(
    "Demo checkout only. Connect a payment gateway to accept payments."
  );
});

// Demo newsletter form
$("#newsletter-form").addEventListener("submit", event => {
  event.preventDefault();

  const email = $("#email-input").value.trim();

  if (!email) return;

  $("#newsletter-message").textContent =
    "Thanks for subscribing! This is a demo form.";

  event.target.reset();
});

// Footer year
$("#year").textContent = new Date().getFullYear();

// Initial render
renderProducts();
renderCart();
