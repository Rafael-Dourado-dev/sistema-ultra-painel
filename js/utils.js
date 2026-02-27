// ═══════════════════════════════════════════════════════════
// SISTEMA ULTRA - Utilitários
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

function isAuthenticated() {
    return !!getToken();
}

function logout() {
    if (confirm('Deseja realmente sair?')) {
        removeToken();
        window.location.href = 'login.html';
    }
}

// ═══════════════════════════════════════════════════════════
// HTTP REQUESTS
// ═══════════════════════════════════════════════════════════

async function request(url, options = {}) {
    const token = getToken();
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
    };
    
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, mergedOptions);
        
        if (response.status === 401) {
            removeToken();
            window.location.href = 'login.html';
            return null;
        }
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
            throw new Error(error.detail || `Erro HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}

async function get(url) {
    return request(url, { method: 'GET' });
}

async function post(url, data) {
    return request(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function put(url, data) {
    return request(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

async function patch(url, data) {
    return request(url, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}

async function del(url) {
    return request(url, { method: 'DELETE' });
}

// ═══════════════════════════════════════════════════════════
// FORMATAÇÃO
// ═══════════════════════════════════════════════════════════

function formatMoney(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(date);
}

function formatCNPJ(cnpj) {
    if (!cnpj) return '-';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatPhone(phone) {
    if (!phone) return '-';
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}

// ═══════════════════════════════════════════════════════════
// MODAIS
// ═══════════════════════════════════════════════════════════

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Fechar modal ao clicar fora
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ═══════════════════════════════════════════════════════════
// NOTIFICAÇÕES
// ═══════════════════════════════════════════════════════════

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${getAlertIcon(type)}</span>
        <span>${message}</span>
    `;
    
    const container = document.querySelector('.content') || document.body;
    container.insertBefore(alert, container.firstChild);
    
    setTimeout(() => alert.remove(), 5000);
}

function getAlertIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

// ═══════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ═══════════════════════════════════════════════════════════
// PROTEÇÃO DE ROTAS
// ═══════════════════════════════════════════════════════════

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

// Inicializar proteções
if (window.location.pathname.includes('login.html')) {
    if (isAuthenticated()) {
        window.location.href = 'dashboard.html';
    }
} else if (!window.location.pathname.includes('login.html')) {
    requireAuth();
}

// Inicializar tema
initTheme();

// ═══════════════════════════════════════════════════════════
// v3.0 ALIASES
// ═══════════════════════════════════════════════════════════

const apiGet = get;
const apiPost = post;
const apiPut = put;
const apiPatch = patch;
const apiDelete = del;

function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}
