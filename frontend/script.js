// Função que controla a exibição das abas
function showTab(sectionId, clickedButton) {
    // 1. Esconde todas as seções de conteúdo
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    // 2. Remove a classe 'active' de todos os botões
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // 3. Mostra a seção desejada e ativa o botão clicado
    document.getElementById(sectionId).classList.add('active');
    clickedButton.classList.add('active');
}

// Inicializa a aba de Autenticação ao carregar
document.addEventListener('DOMContentLoaded', () => {
    const firstButton = document.querySelector('.tab-button');
    if (firstButton) {
        showTab('auth-section', firstButton);
    }
});

// -------------------------------------------------------------
// VARIÁVEIS DE ESTADO
// -------------------------------------------------------------

const BASE_URL = "http://localhost:3000/api";
let CURRENT_TOKEN = localStorage.getItem("jwtToken") || "";
let CURRENT_ROLE = localStorage.getItem("userRole") || "";
let CLIENTE_ID = localStorage.getItem("clienteId") || "";
let QUARTO_ID = localStorage.getItem("quartoId") || "";
let RESERVA_ID = localStorage.getItem("reservaId") || "";

document.getElementById("current-token").textContent = CURRENT_TOKEN || "N/A";
document.getElementById("current-role").textContent = CURRENT_ROLE || "N/A";
document.getElementById("cliente-id").textContent = CLIENTE_ID || "N/A";
document.getElementById("quarto-id").textContent = QUARTO_ID || "N/A";
document.getElementById("reserva-id").textContent = RESERVA_ID || "N/A";


// -------------------------------------------------------------
// FUNÇÕES AUXILIARES DE RENDERIZAÇÃO
// -------------------------------------------------------------

// Função para renderizar mensagem de sucesso após a criação (sem JSON)
function renderCreationSuccess(data, type, elementId) {
    const outputElement = document.getElementById(elementId);
    const itemId = data.id || 'N/A';

    let message = '';

    if (type === 'Cliente') {
        message = `✅ ${type} criado com sucesso! | ID: <strong>${itemId}</strong> | Nome: <strong>${data.nome}</strong>`;
    } else if (type === 'Quarto') {
        message = `✅ ${type} criado com sucesso! | ID: <strong>${itemId}</strong> | N°: <strong>${data.numero}</strong> | Tipo: <strong>${data.tipo}</strong>`;
    } else if (type === 'Reserva') {
        message = `✅ ${type} criada com sucesso! | ID: <strong>${itemId}</strong> | Cliente ID: <strong>${data.clienteId}</strong> | Quarto ID: <strong>${data.quartoId}</strong>`;
    } else if (type === 'Update') {
        message = `✅ Registro ID: <strong>${itemId}</strong> atualizado com sucesso!`;
    } else {
        message = `✅ Requisição bem-sucedida! | ID: <strong>${itemId}</strong>`;
    }

    outputElement.innerHTML = `
        <div class="success-box">
            ${message}
        </div>
    `;
}

// Função para renderizar mensagem de sucesso de Autenticação (sem JSON)
function renderAuthSuccess(message, elementId) {
    const outputElement = document.getElementById(elementId);

    outputElement.innerHTML = `
        <div class="success-box">
            ${message}
        </div>
    `;
}

// Função para renderizar mensagem de erro estilizada
function renderError(response, data, elementId) {
    const outputElement = document.getElementById(elementId);
    const status = response.status;
    const statusText = response.statusText;
    let errorMessage = `Erro na Requisição (${status} ${statusText}):`;

    // Tenta extrair mensagem de erro específica do JSON
    if (data && data.message) {
        errorMessage += ` ${data.message}`;
    } else if (data && data.error) {
        errorMessage += ` ${data.error}`;
    } else {
        errorMessage += ` Ocorreu um erro desconhecido.`;
    }

    const details = JSON.stringify(data, null, 2);

    outputElement.innerHTML = `
        <div class="error-box">
            🛑 ${errorMessage}
            
        </div>
    `;
}

// Função para renderizar um Array de objetos em Tabela HTML
// Função para renderizar um array de objetos em uma tabela HTML
// Função para renderizar um Array de objetos em Tabela HTML (CORRIGIDA)
function renderDataInTable(data, elementId) {
    const outputElement = document.getElementById(elementId);
    
    if (!outputElement) return;

    // --- SOLUÇÃO ROBUSTA: LISTA EXPLÍCITA DE CHAVES A IGNORAR ---
    const keysToIgnore = [
        'cliente',       // Objeto aninhado de Cliente (que aparece como [Object])
        'quarto',        // Objeto aninhado de Quarto (que aparece como [Object])
        'createdAt',     // Metadados de data/hora (minúsculo)
        'updatedAt',     // Metadados de data/hora (minúsculo)
        'CreatedAt',     // Variação de capitalização (se houver)
        'UpdatedAt'      // Variação de capitalização (se houver)
    ]; 

    // Cria a estrutura da tabela
    const table = document.createElement('table');
    table.classList.add('data-table');
    const tableHead = table.createTHead();
    const tableBody = table.createTBody();
    const headerRow = tableHead.insertRow();

    // 1. Criar Cabeçalho da Tabela (Headers)
    if (data.length > 0) {
        let headers = "";
        for (const key in data[0]) {
            // ✅ CORREÇÃO AQUI: Se a chave estiver na lista, pula para a próxima iteração
            if (keysToIgnore.includes(key)) { 
                continue; // Pula a criação deste cabeçalho
            }
            headers += `<th>${key}</th>`;
        }
        headerRow.innerHTML = headers;
    }

    // 2. Criar Corpo da Tabela (Rows)
    let bodyRows = "";
    data.forEach(item => {
        let rowData = "";
        for (const key in item) {
            
            // ✅ CORREÇÃO AQUI: Se a chave estiver na lista, pula para a próxima iteração
            if (keysToIgnore.includes(key)) { 
                continue; // Pula a criação desta célula
            }
            
            let value = item[key];
            
            // Tratamento especial para objetos (mantido para segurança, mas a lista já deve filtrar)
            if (typeof value === 'object' && value !== null) {
                rowData += `<td>[Object]</td>`; 
            } else if (value === null || value === undefined) {
                rowData += `<td>-</td>`;
            } else {
                rowData += `<td>${value}</td>`;
            }
        }
        bodyRows += `<tr>${rowData}</tr>`;
    });
    tableBody.innerHTML = bodyRows;

    // Limpa o output e adiciona a nova tabela
    outputElement.innerHTML = ''; 
    outputElement.appendChild(table);
}


// -------------------------------------------------------------
// HELPER PRINCIPAL (TODAS AS REQUISIÇÕES) - AGORA TRATA ERROS VISUALMENTE
// -------------------------------------------------------------

// Helper para requisições protegidas (MODIFICADA)
async function fetchProtected(url, method, body = null) {
    let outputElementId;
    if (url.includes("/clientes")) {
        outputElementId = "cliente-output";
    } else if (url.includes("/quartos")) {
        outputElementId = "quarto-output";
    } else if (url.includes("/reservas")) {
        outputElementId = "reserva-output";
    } else if (url.includes("/auth")) {
        outputElementId = "auth-output";
    } else {
        outputElementId = "auth-output";
    }

    const outputElement = document.getElementById(outputElementId);
    if (!outputElement) {
        console.error("Elemento de saída não encontrado:", outputElementId);
        return null;
    }

    outputElement.textContent = "Carregando...";

    // 1. Tratamento de Erro de Token Local Estilizado
    if (
        !CURRENT_TOKEN &&
        !url.includes("/auth/register") &&
        !url.includes("/auth/login")
    ) {
        outputElement.innerHTML = `
            <div class="error-box" style="font-weight: normal;">
                🛑 ERRO DE AUTORIZAÇÃO: Faça o login primeiro para obter o token.
            </div>
        `;
        return null;
    }

    const options = {
        method: method,
        headers: {
            "Content-Type": "application/json",
            ...(CURRENT_TOKEN &&
                !url.includes("/auth") && {
                Authorization: `Bearer ${CURRENT_TOKEN}`,
            }),
        },
        body: body ? JSON.stringify(body) : null,
    };

    try {
        const response = await fetch(url, options);

        // 2. Tratamento de Sucesso 204 (No Content/Exclusão) Estilizado
        if (response.status === 204) {
            outputElement.innerHTML = `
                <div class="success-box">
                    ✅ Status: 204 No Content. Operação de exclusão bem-sucedida.
                </div>
            `;
            return { success: true, status: 204 };
        }

        let data = {};
        try {
            data = await response.json();
        } catch (e) {
            // Tratamento para API que retorna HTML/Texto em vez de JSON
            renderError(response, { error: "Resposta do servidor não é JSON. Verifique o console para detalhes." }, outputElementId);
            return null;
        }

        // 3. Tratamento de Erro HTTP (4xx, 5xx) Estilizado
        if (!response.ok) {
            renderError(response, data, outputElementId);
            return null;
        }

        // 4. Retorno de Sucesso (200, 201)
        return data;

    } catch (error) {
        // Tratamento de Erro de Rede
        outputElement.innerHTML = `
            <div class="error-box">
                🛑 ERRO DE REDE/SERVIDOR: ${error.message}
            </div>
        `;
        return null;
    }
}


// -------------------------------------------------------------
// FUNÇÕES DE AUTENTICAÇÃO (AGORA USAM O NOVO DISPLAY)
// -------------------------------------------------------------

// 1. REGISTRO (AGORA USA fetchProtected para erros e renderAuthSuccess para sucesso)
async function registerUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const data = await fetchProtected(`${BASE_URL}/auth/register`, "POST", { email, password });

    if (data && data.id) {
        renderAuthSuccess(`✅ Usuário <strong>${data.email}</strong> registrado com sucesso! Faça o login.`, "auth-output");
    }
}

// 1. LOGIN (AGORA USA fetchProtected para erros e renderAuthSuccess para sucesso)
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const data = await fetchProtected(`${BASE_URL}/auth/login`, "POST", { email, password });

    if (data && data.token) {
        CURRENT_TOKEN = data.token;
        // Se a API não retornar 'user.role', usa 'admin' como fallback
        CURRENT_ROLE = data.user && data.user.role ? data.user.role : 'admin';

        localStorage.setItem("jwtToken", CURRENT_TOKEN);
        localStorage.setItem("userRole", CURRENT_ROLE);

        document.getElementById("current-token").textContent = CURRENT_TOKEN;
        document.getElementById("current-role").textContent = CURRENT_ROLE;

        renderAuthSuccess(`✅ Login bem-sucedido! Token obtido. Perfil: <strong>${CURRENT_ROLE}</strong>`, "auth-output");
        alert(`Login bem-sucedido! Perfil: ${CURRENT_ROLE}. Token salvo.`);
    } else {
        // Limpa tokens se a API retornou sucesso (status 200/201) mas sem token válido
        CURRENT_TOKEN = "";
        CURRENT_ROLE = "";
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userRole");
        document.getElementById("current-token").textContent = "N/A";
        document.getElementById("current-role").textContent = "N/A";
        // Se houve erro HTTP, o fetchProtected já cuidou da exibição.
    }
}


// -------------------------------------------------------------
// FUNÇÕES CRUD CLIENTE (COM DISPLAY NOVO)
// -------------------------------------------------------------

// 2. CRIAR CLIENTE
async function createCliente() {
    const nome = document.getElementById("cliente-nome").value;
    const cpf = document.getElementById("cliente-cpf").value;
    const telefone = document.getElementById("cliente-telefone").value;
    const email = document.getElementById("cliente-email").value;

    const data = await fetchProtected(`${BASE_URL}/clientes`, "POST", {
        nome: nome,
        cpf: cpf,
        telefone: telefone,
        email: email,
    });

    if (data && data.id) {
        CLIENTE_ID = data.id;
        localStorage.setItem("clienteId", CLIENTE_ID);
        document.getElementById("cliente-id").textContent = CLIENTE_ID;

        document.getElementById("reserva-clienteId").value = CLIENTE_ID;
        document.getElementById("cliente-id-input").value = CLIENTE_ID;

        // Usa a nova função de display
        renderCreationSuccess(data, 'Cliente', 'cliente-output');
    }
}

// 2. LISTAR CLIENTES (AGORA EXIBE EM TABELA)
async function listClientes() {
    const data = await fetchProtected(`${BASE_URL}/clientes`, "GET");
    if (Array.isArray(data)) {
        data.sort((a, b) => a.id - b.id);

        renderDataInTable(data, "cliente-output");
    }
}

// 3. BUSCAR CLIENTE POR ID (GET /api/clientes/:id)
async function getOneCliente() {
    const targetId = document.getElementById("cliente-id-input").value;
    if (!targetId) {
        alert("Digite o ID do cliente no campo ID.");
        return;
    }

    const data = await fetchProtected(`${BASE_URL}/clientes/${targetId}`, "GET");
    // Se a API retornar um objeto simples (um registro) em caso de sucesso
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        renderDataInTable([data], "cliente-output"); // Renderiza como tabela de 1 item
    }
    // Se falhar, fetchProtected já exibiu o erro
}

// 4. EDITAR CLIENTE (PUT /api/clientes/:id)
async function updateCliente() {
    const targetId = document.getElementById("cliente-id-input").value;
    if (!targetId) {
        alert("Digite o ID do cliente que você quer editar no campo ID.");
        return;
    }

    const nome = document.getElementById("cliente-nome").value;
    const cpf = document.getElementById("cliente-cpf").value;
    const telefone = document.getElementById("cliente-telefone").value;
    const email = document.getElementById("cliente-email").value;

    const data = await fetchProtected(`${BASE_URL}/clientes/${targetId}`, "PUT", {
        nome: nome,
        cpf: cpf,
        telefone: telefone,
        email: email,
    });

    if (data && data.id) {
        document.getElementById("cliente-id").textContent = targetId;
        renderCreationSuccess(data, 'Update', 'cliente-output');
    }
}

// 5. EXCLUIR CLIENTE (DELETE /api/clientes/:id)
async function deleteCliente() {
    const targetId = document.getElementById("cliente-id-input").value;
    if (!targetId) {
        alert("Digite o ID do cliente que você quer excluir no campo ID.");
        return;
    }

    const result = await fetchProtected(`${BASE_URL}/clientes/${targetId}`, "DELETE");

    // O fetchProtected já exibe a mensagem de sucesso (204)
    if (result && result.status === 204 && parseInt(targetId, 10) === parseInt(CLIENTE_ID, 10)) {
        CLIENTE_ID = "";
        localStorage.removeItem("clienteId");
        document.getElementById("cliente-id").textContent = "N/A";
    }
}


// -------------------------------------------------------------
// FUNÇÕES CRUD QUARTO (COM DISPLAY NOVO)
// -------------------------------------------------------------

// 1. CRIAR QUARTO (POST /api/quartos)
async function createQuarto() {
    const numero = document.getElementById("quarto-numero").value;
    const tipo = document.getElementById("quarto-tipo").value;
    const valorDiaria = document.getElementById("quarto-valor").value;
    const capacidade = document.getElementById("quarto-capacidade").value;
    const status = document.getElementById("quarto-status-edit").value;

    const data = await fetchProtected(`${BASE_URL}/quartos`, "POST", {
        numero: numero,
        tipo: tipo,
        valorDiaria: parseFloat(valorDiaria),
        capacidade: parseInt(capacidade, 10),
        status: status,
    });

    if (data && data.id) {
        QUARTO_ID = data.id;
        localStorage.setItem("quartoId", QUARTO_ID);
        document.getElementById("quarto-id").textContent = QUARTO_ID;
        document.getElementById("quarto-id-input").value = QUARTO_ID;
        document.getElementById("reserva-quartoId").value = QUARTO_ID;

        // Usa a nova função de display
        renderCreationSuccess(data, 'Quarto', 'quarto-output');
    }
}

// 2. LISTAR QUARTOS (AGORA EXIBE EM TABELA)
async function listQuartos() {
    const data = await fetchProtected(`${BASE_URL}/quartos`, "GET");
    if (Array.isArray(data)) {
        data.sort((a, b) => a.id - b.id);

        renderDataInTable(data, "quarto-output");
    }
}

// 3. BUSCAR QUARTO POR ID (GET /api/quartos/:id)
async function getOneQuarto() {
    const targetId = document.getElementById("quarto-id-input").value;
    if (!targetId) {
        alert("Digite o ID do quarto no campo ID.");
        return;
    }

    const data = await fetchProtected(`${BASE_URL}/quartos/${targetId}`, "GET");
    // Se a API retornar um objeto simples (um registro) em caso de sucesso
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        renderDataInTable([data], "quarto-output"); // Renderiza como tabela de 1 item
    }
}

// 4. ATUALIZAR QUARTO (PUT /api/quartos/:id)
async function updateQuarto() {
    const targetId = document.getElementById("quarto-id-input").value;
    if (!targetId) {
        alert("Digite o ID do quarto que você quer editar no campo ID.");
        return;
    }

    const numero = document.getElementById("quarto-numero").value;
    const tipo = document.getElementById("quarto-tipo").value;
    const valorDiaria = document.getElementById("quarto-valor").value;
    const capacidade = document.getElementById("quarto-capacidade").value;
    const newStatus = document.getElementById("quarto-status-edit").value;

    const data = await fetchProtected(`${BASE_URL}/quartos/${targetId}`, "PUT", {
        numero: numero,
        tipo: tipo,
        valorDiaria: parseFloat(valorDiaria),
        capacidade: parseInt(capacidade, 10),
        status: newStatus,
    });

    if (data && data.id) {
        document.getElementById("quarto-id").textContent = targetId;
        renderCreationSuccess(data, 'Update', 'quarto-output');
    }
}

// 5. EXCLUIR QUARTO (DELETE /api/quartos/:id)
async function deleteQuarto() {
    const targetId = document.getElementById("quarto-id-input").value;
    if (!targetId) {
        alert("Digite o ID do quarto que você quer excluir no campo ID.");
        return;
    }

    const result = await fetchProtected(`${BASE_URL}/quartos/${targetId}`, "DELETE");

    if (result && result.status === 204 && parseInt(targetId, 10) === parseInt(QUARTO_ID, 10)) {
        QUARTO_ID = "";
        localStorage.removeItem("quartoId");
        document.getElementById("quarto-id").textContent = "N/A";
    }
}


// -------------------------------------------------------------
// FUNÇÕES CRUD RESERVA (COM DISPLAY NOVO)
// -------------------------------------------------------------

// 1. CRIAR RESERVA (POST /api/reservas)
async function createReserva() {
    const clienteId = parseInt(
        document.getElementById("reserva-clienteId").value,
        10
    );
    const quartoId = parseInt(
        document.getElementById("reserva-quartoId").value,
        10
    );
    const dataCheckIn = document.getElementById("reserva-checkIn").value;
    const dataCheckOut = document.getElementById("reserva-checkOut").value;

    if (
        isNaN(clienteId) ||
        isNaN(quartoId) ||
        !dataCheckIn ||
        !dataCheckOut
    ) {
        alert(
            "ERRO: Por favor, preencha todos os campos, garantindo que os IDs são números válidos."
        );
        return;
    }

    const data = {
        clienteId: clienteId,
        quartoId: quartoId,
        dataCheckIn: dataCheckIn,
        dataCheckOut: dataCheckOut,
    };

    const responseData = await fetchProtected(
        `${BASE_URL}/reservas`,
        "POST",
        data
    );

    if (responseData && responseData.id) {
        RESERVA_ID = responseData.id;
        localStorage.setItem("reservaId", RESERVA_ID);
        document.getElementById("reserva-id").textContent = RESERVA_ID;
        document.getElementById("reserva-id-input").value = RESERVA_ID;

        // Usa a nova função de display
        renderCreationSuccess(responseData, 'Reserva', 'reserva-output');
    }
}

// 2. LISTAR RESERVAS (AGORA EXIBE EM TABELA)
async function listReservas() {
    const data = await fetchProtected(`${BASE_URL}/reservas`, "GET");
    if (Array.isArray(data)) {
        data.sort((a, b) => a.id - b.id);

        renderDataInTable(data, "reserva-output");
    }
}

// 3. BUSCAR RESERVA POR ID (GET /api/reservas/:id)
async function getOneReserva() {
    const targetId = document.getElementById("reserva-id-input").value;
    if (!targetId) {
        alert("Digite o ID da reserva que você quer buscar.");
        return;
    }

    const data = await fetchProtected(`${BASE_URL}/reservas/${targetId}`, "GET");
    // Se a API retornar um objeto simples (um registro) em caso de sucesso
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        renderDataInTable([data], "reserva-output"); // Renderiza como tabela de 1 item
    }
}

// 4. EXCLUIR RESERVA POR ID (DELETE /api/reservas/:id)
async function deleteReserva() {
    const targetId = document.getElementById("reserva-id-input").value;
    if (!targetId) {
        alert("Digite o ID da reserva que você quer excluir.");
        return;
    }

    const result = await fetchProtected(`${BASE_URL}/reservas/${targetId}`, "DELETE");

    if (result && result.status === 204 && parseInt(targetId, 10) === parseInt(RESERVA_ID, 10)) {
        RESERVA_ID = "";
        localStorage.removeItem("reservaId");
        document.getElementById("reserva-id").textContent = "N/A";
    }
}