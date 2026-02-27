// ═══════════════════════════════════════════════════════════
// SISTEMA ULTRA v3.1 - Lojas (Reconstruído - Corrigido)
// ═══════════════════════════════════════════════════════════

renderSidebar('lojas');
checkAuth();

let todasLojas = [];
let segmentos = [];

const statusBadge = {
    ativo: '<span class="badge badge-success">✅ Ativo</span>',
    inadimplente: '<span class="badge badge-warning">⚠️ Inadimplente</span>',
    bloqueado: '<span class="badge badge-danger">🚫 Bloqueado</span>',
    cancelado: '<span class="badge badge-dark">❌ Cancelado</span>',
};

// ═══════════════════════════════════════════════════
// INICIALIZAÇÃO
// ═══════════════════════════════════════════════════

async function init() {
    // Bind botão Nova Loja via addEventListener (não depende de onclick)
    const btnNova = document.getElementById('btnNovaLoja');
    if (btnNova) {
        btnNova.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('[DEBUG] Botão Nova Loja clicado');
            abrirModalNovaLoja();
        });
    }

    // Bind botão Salvar
    const btnSalvar = document.getElementById('btnSalvar');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', function(e) {
            e.preventDefault();
            salvarLoja();
        });
    }

    // Fechar modal ao clicar no overlay (fora da box)
    document.getElementById('modalLoja').addEventListener('click', function(e) {
        if (e.target === this) fecharModal();
    });
    document.getElementById('modalDetalhes').addEventListener('click', function(e) {
        if (e.target === this) fecharModalDetalhes();
    });

    // Máscara CNPJ
    const cnpjInput = document.getElementById('fCnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', function () {
            let v = this.value.replace(/\D/g, '');
            if (v.length > 14) v = v.slice(0, 14);
            if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
            else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
            else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
            else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
            this.value = v;
        });
    }

    // Carregar segmentos
    try {
        segmentos = await apiGet(API_CONFIG.ENDPOINTS.MODULOS_SEGMENTOS) || [];
        const filtroSeg = document.getElementById('filtroSegmento');
        const selSeg = document.getElementById('fSegmento');
        segmentos.forEach(s => {
            filtroSeg.innerHTML += `<option value="${s.id}">${s.icone || '📦'} ${s.nome}</option>`;
            selSeg.innerHTML += `<option value="${s.id}">${s.icone || '📦'} ${s.nome}</option>`;
        });
    } catch (e) {
        console.warn('Segmentos não carregados:', e);
    }

    await carregarLojas();
}

async function carregarLojas() {
    try {
        todasLojas = await apiGet(API_CONFIG.ENDPOINTS.LOJAS) || [];
        renderStats();
        renderLojas(todasLojas);
    } catch (e) {
        console.error('Erro ao carregar lojas:', e);
        document.getElementById('listaLojas').innerHTML =
            '<div class="empty-state"><div class="icon">❌</div><p>Erro ao carregar lojas.<br>Verifique se o backend está rodando em ' + API_CONFIG.BASE_URL + '</p></div>';
    }
}

// ═══════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════

function renderStats() {
    const total = todasLojas.length;
    const ativas = todasLojas.filter(l => l.status === 'ativo').length;
    const inadimplentes = todasLojas.filter(l => l.status === 'inadimplente').length;
    const bloqueadas = todasLojas.filter(l => l.status === 'bloqueado').length;
    document.getElementById('stats').innerHTML = `
        <div class="stat-mini"><div class="value">${total}</div><div class="label">Total</div></div>
        <div class="stat-mini"><div class="value" style="color:var(--success)">${ativas}</div><div class="label">Ativas</div></div>
        <div class="stat-mini"><div class="value" style="color:var(--warning)">${inadimplentes}</div><div class="label">Inadimplentes</div></div>
        <div class="stat-mini"><div class="value" style="color:var(--danger)">${bloqueadas}</div><div class="label">Bloqueadas</div></div>
    `;
}

// ═══════════════════════════════════════════════════
// RENDERIZAÇÃO (CARDS)
// ═══════════════════════════════════════════════════

function getSegmentoNome(segId) {
    const s = segmentos.find(x => x.id === segId);
    return s ? `${s.icone || '📦'} ${s.nome}` : '—';
}

function esc(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderLojas(lojas) {
    const container = document.getElementById('listaLojas');
    if (!lojas.length) {
        container.innerHTML = '<div class="empty-state"><div class="icon">🏪</div><p>Nenhuma loja encontrada.<br>Clique em <strong>+ Nova Loja</strong> para criar.</p></div>';
        return;
    }

    container.innerHTML = lojas.map(l => `
        <div class="loja-card">
            <div class="loja-header">
                <div>
                    <div class="loja-name">${esc(l.nome_fantasia)}</div>
                    <div class="loja-razao">${esc(l.razao_social || '')}</div>
                </div>
                <div>${statusBadge[l.status] || l.status}</div>
            </div>
            ${l.descricao ? `<div class="loja-desc">📝 ${esc(l.descricao)}</div>` : ''}
            <div class="loja-info">
                <div class="loja-info-item"><strong>CNPJ:</strong> <code>${esc(l.cnpj)}</code></div>
                <div class="loja-info-item"><strong>Segmento:</strong> ${getSegmentoNome(l.segmento_id)}</div>
                <div class="loja-info-item"><strong>Local:</strong> ${esc(l.cidade || '—')}/${esc(l.estado || '—')}</div>
                <div class="loja-info-item"><strong>Responsável:</strong> ${esc(l.responsavel_nome || '—')}</div>
                <div class="loja-info-item"><strong>Telefone:</strong> ${esc(l.telefone || l.whatsapp || '—')}</div>
                <div class="loja-info-item"><strong>Vencimento:</strong> ${l.proximo_vencimento || '—'}</div>
            </div>
            <div class="api-key-box">
                <span style="font-size:12px;color:var(--text-secondary);">🔑 API Key:</span>
                <code id="key-${l.id}">${esc(l.api_key || '—')}</code>
                <button onclick="copiarKey(${l.id})">📋 Copiar</button>
            </div>
            <div class="loja-actions">
                <button class="btn btn-primary" onclick="verDetalhes(${l.id})">🔍 Detalhes</button>
                <button class="btn btn-secondary" onclick="editarLoja(${l.id})">✏️ Editar</button>
                <button class="btn btn-secondary" onclick="abrirModulos(${l.id})">🧩 Módulos</button>
                ${l.status === 'ativo' ? `<button class="btn" style="background:var(--warning);color:#fff;" onclick="alterarStatus(${l.id},'bloqueado')">🔒 Bloquear</button>` : ''}
                ${l.status === 'bloqueado' ? `<button class="btn" style="background:var(--success);color:#fff;" onclick="alterarStatus(${l.id},'ativo')">🔓 Desbloquear</button>` : ''}
                ${l.status === 'inadimplente' ? `<button class="btn" style="background:var(--success);color:#fff;" onclick="alterarStatus(${l.id},'ativo')">✅ Reativar</button>` : ''}
            </div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════
// COPIAR API KEY
// ═══════════════════════════════════════════════════

function copiarKey(id) {
    const el = document.getElementById('key-' + id);
    if (!el) return;
    const text = el.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => toast('✅ API Key copiada!')).catch(() => copiarFallback(text));
    } else {
        copiarFallback(text);
    }
}

function copiarKeyDetail(id) {
    const el = document.getElementById('key-detail-' + id);
    if (!el) return;
    const text = el.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => toast('✅ API Key copiada!')).catch(() => copiarFallback(text));
    } else {
        copiarFallback(text);
    }
}

function copiarFallback(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('✅ API Key copiada!');
}

// ═══════════════════════════════════════════════════
// FILTRAR
// ═══════════════════════════════════════════════════

function filtrarLojas() {
    const busca = document.getElementById('busca').value.toLowerCase();
    const status = document.getElementById('filtroStatus').value;
    const segId = document.getElementById('filtroSegmento').value;

    let filtradas = todasLojas;
    if (busca) filtradas = filtradas.filter(l =>
        (l.nome_fantasia || '').toLowerCase().includes(busca) ||
        (l.cnpj || '').includes(busca) ||
        (l.razao_social || '').toLowerCase().includes(busca) ||
        (l.descricao || '').toLowerCase().includes(busca) ||
        (l.api_key || '').toLowerCase().includes(busca)
    );
    if (status) filtradas = filtradas.filter(l => l.status === status);
    if (segId) filtradas = filtradas.filter(l => l.segmento_id == segId);
    renderLojas(filtradas);
}

// ═══════════════════════════════════════════════════
// MODAL CRIAR / EDITAR
// ═══════════════════════════════════════════════════

function abrirModalNovaLoja() {
    console.log('[DEBUG] abrirModalNovaLoja() chamado');
    document.getElementById('modalTitulo').textContent = '➕ Nova Loja';
    document.getElementById('editLojaId').value = '';
    document.getElementById('fRazaoSocial').value = '';
    document.getElementById('fNomeFantasia').value = '';
    document.getElementById('fCnpj').value = '';
    document.getElementById('fCnpj').disabled = false;
    document.getElementById('fSegmento').value = '';
    document.getElementById('fTipoNegocio').value = 'geral';
    document.getElementById('fDiaVencimento').value = '15';
    document.getElementById('fDescricao').value = '';
    document.getElementById('fTelefone').value = '';
    document.getElementById('fWhatsapp').value = '';
    document.getElementById('fEmail').value = '';
    document.getElementById('fResponsavel').value = '';
    document.getElementById('fCidade').value = '';
    document.getElementById('fEstado').value = '';
    document.getElementById('formErro').style.display = 'none';
    document.getElementById('btnSalvar').textContent = '💾 Criar Loja';

    // MOSTRAR MODAL
    const modal = document.getElementById('modalLoja');
    modal.style.display = 'flex';
    console.log('[DEBUG] modalLoja display:', modal.style.display);
}

async function editarLoja(id) {
    try {
        const loja = await apiGet(API_CONFIG.ENDPOINTS.LOJA(id));
        document.getElementById('modalTitulo').textContent = '✏️ Editar Loja';
        document.getElementById('editLojaId').value = loja.id;
        document.getElementById('fRazaoSocial').value = loja.razao_social || '';
        document.getElementById('fNomeFantasia').value = loja.nome_fantasia || '';
        document.getElementById('fCnpj').value = loja.cnpj || '';
        document.getElementById('fCnpj').disabled = true;
        document.getElementById('fSegmento').value = loja.segmento_id || '';
        document.getElementById('fTipoNegocio').value = loja.tipo_negocio || 'geral';
        document.getElementById('fDiaVencimento').value = loja.dia_vencimento || 15;
        document.getElementById('fDescricao').value = loja.descricao || '';
        document.getElementById('fTelefone').value = loja.telefone || '';
        document.getElementById('fWhatsapp').value = loja.whatsapp || '';
        document.getElementById('fEmail').value = loja.email || '';
        document.getElementById('fResponsavel').value = loja.responsavel_nome || '';
        document.getElementById('fCidade').value = loja.cidade || '';
        document.getElementById('fEstado').value = loja.estado || '';
        document.getElementById('formErro').style.display = 'none';
        document.getElementById('btnSalvar').textContent = '💾 Salvar Alterações';
        document.getElementById('modalLoja').style.display = 'flex';
    } catch (e) {
        toast('❌ Erro ao carregar loja: ' + (e.message || e), true);
    }
}

function fecharModal() {
    document.getElementById('modalLoja').style.display = 'none';
}

function fecharModalDetalhes() {
    document.getElementById('modalDetalhes').style.display = 'none';
}

// ═══════════════════════════════════════════════════
// SALVAR (CRIAR ou ATUALIZAR)
// ═══════════════════════════════════════════════════

async function salvarLoja() {
    const erroDiv = document.getElementById('formErro');
    erroDiv.style.display = 'none';

    const editId = document.getElementById('editLojaId').value;
    const isEdit = !!editId;

    const razao = document.getElementById('fRazaoSocial').value.trim();
    const fantasia = document.getElementById('fNomeFantasia').value.trim();
    const cnpj = document.getElementById('fCnpj').value.trim();

    if (!razao || !fantasia) {
        erroDiv.textContent = '⚠️ Preencha Razão Social e Nome Fantasia.';
        erroDiv.style.display = 'block';
        return;
    }
    if (!isEdit && !cnpj) {
        erroDiv.textContent = '⚠️ CNPJ é obrigatório.';
        erroDiv.style.display = 'block';
        return;
    }

    const emailVal = document.getElementById('fEmail').value.trim();
    const estadoVal = document.getElementById('fEstado').value.trim().toUpperCase();

    const data = {
        razao_social: razao,
        nome_fantasia: fantasia,
        descricao: document.getElementById('fDescricao').value.trim() || null,
        tipo_negocio: document.getElementById('fTipoNegocio').value,
        segmento_id: parseInt(document.getElementById('fSegmento').value) || null,
        whatsapp: document.getElementById('fWhatsapp').value.trim() || null,
        cidade: document.getElementById('fCidade').value.trim() || null,
        estado: estadoVal || null,
        email: emailVal || null,
        telefone: document.getElementById('fTelefone').value.trim() || null,
        responsavel_nome: document.getElementById('fResponsavel').value.trim() || null,
        dia_vencimento: parseInt(document.getElementById('fDiaVencimento').value) || 15,
    };

    if (!isEdit) {
        data.cnpj = cnpj;
    }

    // Remove nulls para edição
    Object.keys(data).forEach(k => {
        if (data[k] === null || data[k] === undefined) delete data[k];
    });

    const btnSalvar = document.getElementById('btnSalvar');
    const btnOriginal = btnSalvar.textContent;
    btnSalvar.disabled = true;
    btnSalvar.textContent = '⏳ Salvando...';

    try {
        let res;
        if (isEdit) {
            res = await apiPut(API_CONFIG.ENDPOINTS.LOJA(editId), data);
        } else {
            res = await apiPost(API_CONFIG.ENDPOINTS.LOJAS, data);
        }

        if (res && res.id) {
            // Se é novo e tem segmento, definir módulos
            if (!isEdit && data.segmento_id) {
                const seg = segmentos.find(s => s.id === data.segmento_id);
                if (seg && seg.codigo) {
                    try {
                        await apiPost(API_CONFIG.ENDPOINTS.MODULOS_DEFINIR_SEG(res.id, seg.codigo), {});
                    } catch (e) { console.warn('Módulos do segmento:', e); }
                }
            }
            toast(isEdit ? '✅ Loja atualizada!' : '✅ Loja criada! API Key: ' + (res.api_key || '').substring(0, 8) + '...');
            fecharModal();
            await carregarLojas();
        }
    } catch (e) {
        let msg = e.message || 'Erro desconhecido';
        erroDiv.innerHTML = `<strong>❌ Erro:</strong> ${esc(msg)}`;
        erroDiv.style.display = 'block';
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.textContent = btnOriginal;
    }
}

// ═══════════════════════════════════════════════════
// DETALHES
// ═══════════════════════════════════════════════════

async function verDetalhes(id) {
    document.getElementById('modalDetalhes').style.display = 'flex';
    document.getElementById('detalheBody').innerHTML = '<p style="text-align:center;">⏳ Carregando...</p>';

    try {
        const loja = await apiGet(API_CONFIG.ENDPOINTS.LOJA(id));
        let modulosHtml = '';
        try {
            const modulos = await apiGet(API_CONFIG.ENDPOINTS.MODULOS_LOJA(id));
            if (modulos && modulos.modulos) {
                modulosHtml = modulos.modulos.map(m => `
                    <span class="badge ${m.ativo ? 'badge-success' : 'badge-dark'}" style="margin:2px;padding:4px 8px;">
                        ${m.icone || ''} ${m.nome}
                    </span>
                `).join('');
            }
        } catch (e) {}

        document.getElementById('detalheTitulo').textContent = loja.nome_fantasia;
        document.getElementById('detalheBody').innerHTML = `
            ${loja.descricao ? `<div style="background:var(--bg-tertiary);padding:12px;border-radius:8px;margin-bottom:16px;font-style:italic;color:var(--text-secondary);">📝 ${esc(loja.descricao)}</div>` : ''}
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                <div>
                    <p><strong>Razão Social:</strong> ${esc(loja.razao_social)}</p>
                    <p><strong>CNPJ:</strong> <code>${esc(loja.cnpj)}</code></p>
                    <p><strong>Status:</strong> ${statusBadge[loja.status] || loja.status}</p>
                    <p><strong>Segmento:</strong> ${getSegmentoNome(loja.segmento_id)}</p>
                    <p><strong>Tipo:</strong> ${esc(loja.tipo_negocio)}</p>
                </div>
                <div>
                    <p><strong>Cidade:</strong> ${esc(loja.cidade || '—')}/${esc(loja.estado || '—')}</p>
                    <p><strong>Telefone:</strong> ${esc(loja.telefone || '—')}</p>
                    <p><strong>WhatsApp:</strong> ${esc(loja.whatsapp || '—')}</p>
                    <p><strong>Email:</strong> ${esc(loja.email || '—')}</p>
                    <p><strong>Responsável:</strong> ${esc(loja.responsavel_nome || '—')}</p>
                </div>
            </div>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-color);">
                <p style="margin-bottom:8px;"><strong>🔑 API Key:</strong></p>
                <div class="api-key-box">
                    <code id="key-detail-${loja.id}">${esc(loja.api_key || '—')}</code>
                    <button onclick="copiarKeyDetail(${loja.id})">📋 Copiar</button>
                </div>
                <p style="margin-top:12px;"><strong>Próximo Vencimento:</strong> ${loja.proximo_vencimento || '—'}</p>
                <p><strong>Plano:</strong> ${esc(loja.plano || 'ultra_completo')} — R$ ${Number(loja.valor_mensalidade || 250).toFixed(2)}</p>
                <p><strong>Dia Vencimento:</strong> ${loja.dia_vencimento || '15'}</p>
            </div>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-color);">
                <p><strong>Módulos:</strong></p>
                <div style="margin-top:8px;">${modulosHtml || '<span style="color:var(--text-secondary)">Nenhum módulo configurado</span>'}</div>
            </div>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border-color);font-size:12px;color:var(--text-tertiary);">
                <p>Criado em: ${loja.criado_em ? new Date(loja.criado_em).toLocaleString('pt-BR') : '—'}</p>
                <p>Última sync: ${loja.ultima_sincronizacao ? new Date(loja.ultima_sincronizacao).toLocaleString('pt-BR') : 'Nunca'}</p>
                <p>Online: ${loja.sistema_online ? '🟢 Sim' : '🔴 Não'}</p>
            </div>
        `;
    } catch (e) {
        document.getElementById('detalheBody').innerHTML = '<p style="color:var(--danger)">❌ Erro ao carregar detalhes</p>';
    }
}

// ═══════════════════════════════════════════════════
// ALTERAR STATUS
// ═══════════════════════════════════════════════════

async function alterarStatus(id, novoStatus) {
    const acoes = { bloqueado: 'Bloquear', ativo: 'Desbloquear/Reativar' };
    const motivo = prompt(`${acoes[novoStatus] || 'Alterar'} esta loja?\nMotivo:`);
    if (motivo === null) return;

    try {
        await apiPatch(API_CONFIG.ENDPOINTS.LOJA_STATUS(id), {
            status: novoStatus,
            motivo: motivo || 'Alteração manual'
        });
        toast(`✅ Status alterado para ${novoStatus}`);
        await carregarLojas();
    } catch (e) {
        toast('❌ Erro: ' + (e.message || e), true);
    }
}

function abrirModulos(id) {
    window.location.href = `modulos.html?loja=${id}`;
}

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════

function toast(msg, isError) {
    const t = document.createElement('div');
    t.className = 'toast' + (isError ? ' error' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

// ═══════════════════════════════════════════════════
// INICIAR
// ═══════════════════════════════════════════════════

init();
