const heroPanel = document.getElementById('heroPanel');
const authPanel = document.getElementById('authPanel');
const dashboardPanel = document.getElementById('dashboardPanel');
const overlay = document.getElementById('overlay');
const registerModal = document.getElementById('registerModal');
const forgotModal = document.getElementById('forgotModal');
const dashboardName = document.getElementById('dashboardName');

const startLogin = document.getElementById('startLogin');
const startRegister = document.getElementById('startRegister');
const openRegisterBtn = document.getElementById('openRegisterBtn');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
const closeRegister = document.getElementById('closeRegister');
const closeForgot = document.getElementById('closeForgot');
const logoutBtn = document.getElementById('logoutBtn');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const forgotMessage = document.getElementById('forgotMessage');

function showSection(section) {
  [heroPanel, authPanel, dashboardPanel].forEach((panel) => panel.classList.remove('active'));
  section.classList.add('active');
}

function showModal(modal) {
  overlay.classList.add('visible');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  overlay.classList.remove('visible');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

function displayMessage(container, text, isError = true) {
  container.textContent = text;
  container.style.color = isError ? 'var(--danger)' : 'var(--primary)';
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function activateDashboard(user) {
  dashboardName.textContent = user.name || user.email;
  sessionStorage.setItem('authUser', JSON.stringify(user));
  showSection(dashboardPanel);
  renderDashboardCharts();
}

function loadSavedUser() {
  const stored = sessionStorage.getItem('authUser');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function clearMessages() {
  loginMessage.textContent = '';
  registerMessage.textContent = '';
  forgotMessage.textContent = '';
}

showSection(heroPanel);

const savedUser = loadSavedUser();
if (savedUser) {
  activateDashboard(savedUser);
}

startRegister.addEventListener('click', () => showModal(registerModal));
startLogin.addEventListener('click', () => {
  heroPanel.classList.add('leave');
  setTimeout(() => showSection(authPanel), 320);
});
openRegisterBtn.addEventListener('click', () => showModal(registerModal));
forgotPasswordBtn.addEventListener('click', () => showModal(forgotModal));
closeRegister.addEventListener('click', () => closeModal(registerModal));
closeForgot.addEventListener('click', () => closeModal(forgotModal));
logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('authUser');
  clearMessages();
  showSection(heroPanel);
});
overlay.addEventListener('click', () => {
  closeModal(registerModal);
  closeModal(forgotModal);
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!validateEmail(email)) {
    return displayMessage(loginMessage, 'Please enter a valid email address.');
  }
  if (password.length < 6) {
    return displayMessage(loginMessage, 'Password must be at least 6 characters.');
  }

  displayMessage(loginMessage, 'Signing in...', false);

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json();

    if (!payload.success) {
      displayMessage(loginMessage, payload.message || 'Login failed.');
      return;
    }

    activateDashboard(payload.user);
  } catch (error) {
    displayMessage(loginMessage, 'Unable to login. Try again later.');
  }
});

function renderDashboardCharts() {
  drawSignupChart('signupChart', [18, 24, 22, 30, 28, 35, 42]);
  drawActivityChart('activityChart', [55, 62, 68, 75, 82, 88, 83]);
}

function drawSignupChart(canvasId, values) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 36;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...values, 10);
  ctx.clearRect(0, 0, width, height);

  const barWidth = (width - padding * 2) / values.length * 0.7;
  values.forEach((value, index) => {
    const x = padding + index * ((width - padding * 2) / values.length) + ((width - padding * 2) / values.length - barWidth) / 2;
    const barHeight = (value / maxValue) * chartHeight;
    const y = height - padding - barHeight;

    const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
    gradient.addColorStop(0, 'rgba(96, 165, 250, 0.95)');
    gradient.addColorStop(1, 'rgba(248, 113, 113, 0.85)');

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${value}k`, x + barWidth / 2, y - 10);
  });

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Inter, system-ui, sans-serif';
  labels.forEach((label, index) => {
    const x = padding + index * ((width - padding * 2) / values.length) + ((width - padding * 2) / values.length) / 2;
    ctx.fillText(label, x, height - padding + 18);
  });
}

function drawActivityChart(canvasId, values) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const padding = 36;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...values, 10);
  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(96, 165, 250, 0.24)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  ctx.beginPath();
  values.forEach((value, index) => {
    const x = padding + (index * (width - padding * 2)) / (values.length - 1);
    const y = height - padding - (value / maxValue) * chartHeight;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  const gradientLine = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradientLine.addColorStop(0, '#60a5fa');
  gradientLine.addColorStop(1, '#f472b6');
  ctx.strokeStyle = gradientLine;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#60a5fa';
  values.forEach((value, index) => {
    const x = padding + (index * (width - padding * 2)) / (values.length - 1);
    const y = height - padding - (value / maxValue) * chartHeight;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  labels.forEach((label, index) => {
    const x = padding + (index * (width - padding * 2)) / (values.length - 1);
    ctx.fillText(label, x, height - padding + 18);
  });
}

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessages();

  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!name) {
    return displayMessage(registerMessage, 'Please enter your full name.');
  }
  if (!validateEmail(email)) {
    return displayMessage(registerMessage, 'Please enter a valid email address.');
  }
  if (password.length < 6) {
    return displayMessage(registerMessage, 'Password must be at least 6 characters long.');
  }

  displayMessage(registerMessage, 'Creating your account...', false);

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const payload = await response.json();

    if (!payload.success) {
      displayMessage(registerMessage, payload.message || 'Registration failed.');
      return;
    }

    displayMessage(registerMessage, payload.message, false);
    setTimeout(() => {
      closeModal(registerModal);
      showSection(authPanel);
      loginForm.querySelector('#loginEmail').value = email;
    }, 1200);
  } catch (error) {
    displayMessage(registerMessage, 'Unable to create account right now.');
  }
});

forgotForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById('forgotEmail').value.trim();
  if (!validateEmail(email)) {
    return displayMessage(forgotMessage, 'Please enter a valid email address.');
  }

  displayMessage(forgotMessage, 'Sending recovery request...', false);

  try {
    const response = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const payload = await response.json();

    if (!payload.success) {
      displayMessage(forgotMessage, payload.message || 'Unable to recover password.');
      return;
    }

    displayMessage(forgotMessage, payload.message, false);
  } catch (error) {
    displayMessage(forgotMessage, 'Unable to send recovery request.');
  }
});
