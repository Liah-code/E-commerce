 document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  // Setup mobile menu
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Close mobile menu
  window.closeMobileMenu = () => {
    if (mobileMenu) mobileMenu.classList.add('hidden');
  };

  // Load products on homepage
  if (document.getElementById('product-list')) {
    loadProducts();
  }

  // Load product detail
  if (document.getElementById('product-title')) {
    loadProductDetail();
  }

  // Render cart
  if (document.getElementById('cart-items')) {
    renderCart();
  }

  // Render checkout
  if (document.getElementById('checkout-items')) {
    renderCheckout();
  }
});

//  Load Products 
async function loadProducts() {
  try {
    const res = await fetch('https://api.escuelajs.co/api/v1/products');
    const products = await res.json();
    const container = document.getElementById('product-list');
    container.innerHTML = '';

    products.slice(0, 8).forEach(product => {
      const price = product.price.toFixed(2);
      const img = product.images?.[0] || 'https://i.imgur.com/QkIa5tT.jpeg';

      const el = document.createElement('div');
      el.className = 'bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition';
      el.innerHTML = `
        <img src="${img}" alt="${product.title}" onerror="this.src='https://i.imgur.com/QkIa5tT.jpeg'" class="w-full h-64 object-cover">
        <div class="p-4">
          <h3 class="font-semibold">${product.title}</h3>
          <p class="text-gray-600 font-bold">$${price}</p>
          <a href="product.html?id=${product.id}" class="mt-2 block bg-gray-900 text-white text-center py-2 rounded hover:bg-gray-800">
            View Details
          </a>
        </div>
      `;
      container.appendChild(el);
    });
  } catch (err) {
    console.error('Failed to load products:', err);
    document.getElementById('product-list').innerHTML = '<p class="col-span-full text-center py-6 text-red-500">Failed to load products.</p>';
  }
  
}

// Load Product Detail
function loadProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const titleEl = document.getElementById('product-title');

  if (!id) {
    titleEl.textContent = 'Product Not Found';
    return;
  }

  fetch(`https://api.escuelajs.co/api/v1/products/${id}`)
    .then(res => res.json())
    .then(product => {
      document.getElementById('product-title').textContent = product.title;
      document.getElementById('product-description').textContent = product.description || 'No description';
      document.getElementById('product-price').textContent = `$${product.price.toFixed(2)}`;
      document.getElementById('product-image').src = product.images?.[0] || 'https://i.imgur.com/QkIa5tT.jpeg';

      const btn = document.getElementById('add-to-cart-btn');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-cart-plus mr-2"></i> Add to Cart';
      btn.onclick = () => addToCart(product.id, product.title, product.price, product.images?.[0]);
    })
    .catch(err => {
      console.error('Error:', err);
      titleEl.textContent = 'Product Not Found';
    });
}

//  Add to Cart 
function addToCart(id, title, price, image) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push({ id, title, price, image });
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(`${title} added to cart!`);
}

//  Update Cart Count 
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.length;
  const elem = document.getElementById('cart-count');
  if (elem) elem.textContent = count;
}

//  Render Cart
function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const container = document.getElementById('cart-items');
  const empty = document.getElementById('cart-empty');
  const totalEl = document.getElementById('cart-total');

  if (cart.length === 0) {
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  let total = 0;
  container.innerHTML = '';
  cart.forEach((item, index) => {
    const itemTotal = item.price;
    total += itemTotal;
    const el = document.createElement('div');
    el.className = 'flex items-center bg-white p-4 rounded shadow';
    el.innerHTML = `
      <img src="${item.image}" onerror="this.src='https://i.imgur.com/QkIa5tT.jpeg'" alt="${item.title}" class="w-16 h-16 object-cover rounded">
      <div class="ml-4 flex-1">
        <h3 class="font-semibold">${item.title}</h3>
        <p>$${item.price}</p>
      </div>
      <button onclick="removeFromCart(${index})" class="text-red-500 text-sm">Remove</button>
    `;
    container.appendChild(el);
  });
  totalEl.textContent = total.toFixed(2);
}

// Remove from Cart
function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

// Render Checkout 
function renderCheckout() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const container = document.getElementById('checkout-items');
  const totalEl = document.getElementById('checkout-total');
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    totalEl.textContent = '0.00';
    return;
  }

  cart.forEach(item => {
    total += item.price;
    const el = document.createElement('div');
    el.className = 'flex justify-between';
    el.textContent = `${item.title} = $${item.price.toFixed(2)}`;
    container.appendChild(el);
  });

  totalEl.textContent = total.toFixed(2);

  document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your order!');
    localStorage.removeItem('cart');
    location.href = 'index.html';
  });
}