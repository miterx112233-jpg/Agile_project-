const APP_KEYS = {
    users: 'dazUsers',
    cart: 'dazCart',
    orders: 'dazOrders'
};

const PRODUCTS = [
    { id: 'cotton-round', name: 'เสื้อยืดคอกลม Cotton 100%', category: 'เสื้อยืด', fabric: 'Cotton 100% (No.32)', min: 10, price: 120 },
    { id: 'v-neck-tk', name: 'เสื้อยืดคอวี ผ้า TK', category: 'เสื้อยืด', fabric: 'Polyester (TK)', min: 20, price: 85 },
    { id: 'oversize', name: 'เสื้อยืดทรง Oversize', category: 'เสื้อยืด', fabric: 'Cotton 100% (No.20)', min: 10, price: 160 },
    { id: 'polo-cvc', name: 'เสื้อโปโล จั๊มครึ่งรอบ', category: 'เสื้อโปโล', fabric: 'CVC (Cotton ผสม)', min: 30, price: 220 },
    { id: 'sport-polo', name: 'เสื้อโปโล สปอร์ต', category: 'เสื้อโปโล', fabric: 'Micro Polyester', min: 20, price: 180 }
];

function readStore(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
        return fallback;
    }
}

function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getCart() {
    return readStore(APP_KEYS.cart, []);
}

function clearCart() {
    writeStore(APP_KEYS.cart, []);
    updateCartCount();
}

function addToCart(productId) {
    const product = PRODUCTS.find(item => item.id === productId);
    if (!product) return;
    const cart = getCart();
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.quantity += product.min;
    else cart.push({ ...product, quantity: product.min });
    writeStore(APP_KEYS.cart, cart);
    updateCartCount();
    alert(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach(element => {
        element.textContent = count;
    });
    document.querySelectorAll('[data-clear-cart]').forEach(button => {
        button.classList.toggle('hidden', cart.length === 0);
    });
}

function startOrder(productId) {
    const product = PRODUCTS.find(item => item.id === productId);
    if (!product) return;
    sessionStorage.removeItem('dazActiveOrder');
    sessionStorage.setItem('dazSelectedProduct', JSON.stringify(product));
    window.location.href = 'CustomerPortal.html';
}

function getCurrentUser() {
    return localStorage.getItem('dazUser') || sessionStorage.getItem('dazUser') || '';
}

function registerUser() {
    const email = prompt('กรุณาระบุอีเมลสำหรับสมัครสมาชิก');
    if (!email) return;
    const password = prompt('กรุณากำหนดรหัสผ่าน');
    if (!password) return;
    const users = readStore(APP_KEYS.users, []);
    if (users.some(user => user.email === email)) {
        alert('อีเมลนี้มีบัญชีอยู่แล้ว');
        return;
    }
    users.push({ email, password });
    writeStore(APP_KEYS.users, users);
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
    alert('สมัครสมาชิกสำเร็จ กรุณากดเข้าสู่ระบบ');
}

function createOrder(order) {
    const orders = readStore(APP_KEYS.orders, []);
    const savedOrder = {
        ...order,
        id: `DZ-${Date.now().toString().slice(-8)}`,
        user: getCurrentUser(),
        status: 'รอตรวจแบบ',
        createdAt: new Date().toISOString()
    };
    orders.push(savedOrder);
    writeStore(APP_KEYS.orders, orders);
    return savedOrder;
}

function updateOrderStatus(orderId, status) {
    const orders = readStore(APP_KEYS.orders, []);
    const order = orders.find(item => item.id === orderId && item.user === getCurrentUser());
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    writeStore(APP_KEYS.orders, orders);
    return order;
}

function getUserOrders() {
    return readStore(APP_KEYS.orders, []).filter(order => order.user === getCurrentUser());
}

document.addEventListener('DOMContentLoaded', updateCartCount);
