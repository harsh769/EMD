document.addEventListener('DOMContentLoaded', () => {
  const loginOverlay = document.getElementById('loginOverlay');
  const dashboardContent = document.getElementById('dashboardContent');
  const statusEl = document.getElementById('loginStatus');

  // Predefined admin credentials
  const ADMIN_CREDENTIALS = {
    email: "admin@emd.com",
    password: "Admin@123"
  };

  // Check if already logged in
  if (localStorage.getItem('isLoggedIn') === 'true') {
    showDashboard();
  }

  // Login form handler
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      statusEl.textContent = 'Please fill in all fields';
      return;
    }

    // Check against predefined admin credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAdmin', 'true');
      showDashboard();
      return;
    }

    // Check against registered users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      showDashboard();
    } else {
      statusEl.textContent = 'Invalid email or password';
    }
  });

  // Registration form handler
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    if (!name || !email || !password) {
      statusEl.textContent = 'Please fill in all fields';
      return;
    }

    // Prevent registration with admin email
    if (email === ADMIN_CREDENTIALS.email) {
      statusEl.textContent = 'This email is reserved for admin';
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.some(u => u.email === email)) {
      statusEl.textContent = 'Email already registered';
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    showDashboard();
  });

  // Logout handler
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    loginOverlay.style.display = 'flex';
    dashboardContent.classList.add('hidden');
  });

  function showDashboard() {
    loginOverlay.style.display = 'none';
    dashboardContent.classList.remove('hidden');
    
    // Initialize dashboard if not already initialized
    if (!window.dashboardInitialized) {
      initDashboard();
      window.dashboardInitialized = true;
    }
  }
});

// This will be called from auth.js after successful login
function initDashboard() {
  // Show admin features if admin is logged in
  if (localStorage.getItem('isAdmin') === 'true') {
    document.getElementById('admin').style.display = 'block';
  } else {
    document.getElementById('admin').style.display = 'none';
  }
}