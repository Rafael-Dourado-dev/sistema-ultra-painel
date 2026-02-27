// ═══════════════════════════════════════════════════════════
// SISTEMA ULTRA v3.0 - Sidebar Component (DRY)
// ═══════════════════════════════════════════════════════════

function renderSidebar(activePage) {
    const pages = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', href: 'dashboard.html' },
        { id: 'lojas', icon: '🏪', label: 'Lojas', href: 'lojas.html' },
        { id: 'modulos', icon: '🧩', label: 'Módulos', href: 'modulos.html' },
        { id: 'relatorios', icon: '📈', label: 'Relatórios', href: 'relatorios.html' },
    ];

    const sistema = [
        { id: 'configuracoes', icon: '⚙️', label: 'Configurações', href: 'configuracoes.html' },
    ];

    let html = `
    <div class="sidebar-header">
        <div class="sidebar-logo">
            <span class="sidebar-logo-icon">🚀</span>
            <h2>ULTRA</h2>
        </div>
        <div class="sidebar-version">v3.0 — Modular</div>
        <div class="sidebar-user">
            <div class="sidebar-user-avatar" id="userAvatar">A</div>
            <div class="sidebar-user-info">
                <div class="sidebar-user-name" id="userName">Admin</div>
                <div class="sidebar-user-role">Administrador</div>
            </div>
        </div>
    </div>
    <nav class="sidebar-nav">
        <div class="nav-section">
            <div class="nav-section-title">Menu</div>`;

    pages.forEach(p => {
        const active = p.id === activePage ? ' active' : '';
        html += `<a href="${p.href}" class="nav-item${active}">
            <span class="nav-item-icon">${p.icon}</span><span>${p.label}</span>
        </a>`;
    });

    html += `</div><div class="nav-section"><div class="nav-section-title">Sistema</div>`;

    sistema.forEach(p => {
        const active = p.id === activePage ? ' active' : '';
        html += `<a href="${p.href}" class="nav-item${active}">
            <span class="nav-item-icon">${p.icon}</span><span>${p.label}</span>
        </a>`;
    });

    html += `<a href="#" class="nav-item" onclick="logout()">
        <span class="nav-item-icon">🚪</span><span>Sair</span>
    </a></div></nav>`;

    document.querySelector('.sidebar').innerHTML = html;

    // Load user info
    const token = localStorage.getItem('token');
    if (token) {
        fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ME, {
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(r => r.json()).then(data => {
            const el = document.getElementById('userName');
            if (el) el.textContent = data.nome || 'Admin';
            const av = document.getElementById('userAvatar');
            if (av) av.textContent = (data.nome || 'A')[0].toUpperCase();
        }).catch(() => {});
    }
}
