// ═══════════════════════════════════════════════════════════
// SISTEMA ULTRA v3.1 - Configuração da API
// ═══════════════════════════════════════════════════════════
// IMPORTANTE: Altere a BASE_URL para o endereço do seu backend
// Se está testando local: http://localhost:8000
// Se subiu no Railway: https://seu-backend.up.railway.app
// ═══════════════════════════════════════════════════════════

const API_CONFIG = {
    // ⬇️ ALTERE AQUI para a URL do seu backend ⬇️
    BASE_URL: 'https://sistema-ultra-backend-production.up.railway.app',

    ENDPOINTS: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        ME: '/api/auth/me',
        LOJAS: '/api/lojas',
        LOJA: (id) => `/api/lojas/${id}`,
        LOJA_STATUS: (id) => `/api/lojas/${id}/status`,
        LOJA_HISTORICO: (id) => `/api/lojas/${id}/historico-bloqueios`,
        DASHBOARD_RESUMO: '/api/dashboard/resumo',
        DASHBOARD_VENCIMENTOS: '/api/dashboard/vencimentos-proximos',
        DASHBOARD_FATURAMENTO: '/api/dashboard/faturamento-mensal',
        RELATORIOS_FATURAMENTO: '/api/relatorios/faturamento',
        RELATORIOS_INADIMPLENCIA: '/api/relatorios/inadimplencia',
        RELATORIOS_RETENCAO: '/api/relatorios/retencao',
        RELATORIOS_EXECUTIVO: '/api/relatorios/executivo',
        MODULOS_SEGMENTOS: '/api/modulos/segmentos',
        MODULOS_TODOS: '/api/modulos/todos',
        MODULOS_SEGMENTO: (codigo) => `/api/modulos/segmento/${codigo}`,
        MODULOS_LOJA: (id) => `/api/modulos/loja/${id}`,
        MODULOS_TOGGLE: (id) => `/api/modulos/loja/${id}/toggle`,
        MODULOS_DEFINIR_SEG: (id, seg) => `/api/modulos/loja/${id}/definir-segmento/${seg}`,
        PAGAMENTOS: '/api/pagamentos',
    }
};
window.API_CONFIG = API_CONFIG;
