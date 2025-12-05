function showTab(sectionId, clickedButton) {
    document.querySelectorAll('.section-content').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    clickedButton.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const firstButton = document.querySelector('.tab-button');
    if (firstButton) {
        showTab('auth-section', firstButton);
    }
});


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


function renderCreationSuccess(data, type, elementId) {
    const outputElement = document.getElementById(elementId);
    const itemId = data.id || 'N/A';

    let message = '';

    if (type === 'Cliente') {
        message = `${type} criado com sucesso! | ID: <strong>${itemId}</strong> | Nome: <strong>${data.nome}</strong>`;
    } else if (type === 'Quarto') {
        message = `${type} criado com sucesso! | ID: <strong>${itemId}</strong> | N°: <strong>${data.numero}</strong> | Tipo: <strong>${data.tipo}</strong>`;
    } else if (type === 'Reserva') {
        message = `${type} criada com sucesso! | ID: <strong>${itemId}</strong> | Cliente ID: <strong>${data.clienteId}</strong> | Quarto ID: <strong>${data.quartoId}</strong>`;
    } else if (type === 'Update') {
        message = `Registro ID: <strong>${itemId}</strong> atualizado com sucesso!`;
    } else {
        message = `Requisição bem-sucedida! | ID: <strong>${itemId}</strong>`;
    }

    outputElement.innerHTML = `
        <div class="success-box">
            ${message}
        </div>
    `;
}

function renderAuthSuccess(message, elementId) {
    const outputElement = document.getElementById(elementId);

    outputElement.innerHTML = `
        <div class="success-box">
            ${message}
        </div>
    `;
}

function renderError(response, data, elementId) {
    const outputElement = document.getElementById(elementId);
    const status = response.status;
    const statusText = response.statusText;
    let errorMessage = `Erro na Requisição (${status} ${statusText}):`;

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
            ERRO: ${errorMessage}
            
        </div>
    `;
}

function renderDataInTable(data, elementId) {
    const outputElement = document.getElementById(elementId);
    
    if (!outputElement) return;

    const keysToIgnore = [
        'cliente',
        'quarto',
        'createdAt',
        'updatedAt',
        'CreatedAt',
        'UpdatedAt'
    ]; 

    const table = document.createElement('table');
    table.classList.add('data-table');
    const tableHead = table.createTHead();
    const tableBody = table.createTBody();
    const headerRow = tableHead.insertRow();

    if (data.length > 0) {
        let headers = "";
        for (const key in data[0]) {
            if (keysToIgnore.includes(key)) { 
                continue;
            }
            headers += `<th>${key}</th>`;
        }
        headerRow.innerHTML = headers;
    }

    let bodyRows = "";
    data.forEach(item => {
        let rowData = "";
        for (const key in item) {
            
            if (keysToIgnore.includes(key)) { 
                continue;
            }
            
            let value = item[key];
            
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

    outputElement.innerHTML = ''; 
    outputElement.appendChild(table);
}


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

    if (
        !CURRENT_TOKEN &&
        !url.includes("/auth/register") &&
        !url.includes("/auth/login")
    ) {
        outputElement.innerHTML = `
            <div class="error-box" style="font-weight: normal;">
                ERRO DE AUTORIZAÇÃO: Faça o login primeiro para obter o token.
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

        if (response.status === 204) {
            outputElement.innerHTML = `
                <div class="success-box">
                    Status: 204 No Content. Operação de exclusão bem-sucedida.
                </div>
            `;
            return { success: true, status: 204 };
        }

        let data = {};
        try {
            data = await response.json();
        } catch (e) {
            renderError(response, { error: "Resposta do servidor não é JSON. Verifique o console para detalhes." }, outputElementId);
            return null;
        }

        if (!response.ok) {
            renderError(response, data, outputElementId);
            return null;
        }

        return data;

    } catch (error) {
        outputElement.innerHTML = `
            <div class="error-box">
                ERRO DE REDE/SERVIDOR: ${error.message}
            </div>
        `;
        return null;
    }
}


async function registerUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const data = await fetchProtected(`${BASE_URL}/auth/register`, "POST", { email, password });

    if (data && data.id) {
        renderAuthSuccess(`Usuário <strong>${data.email}</strong> registrado com sucesso! Faça o login.`, "auth-output");
    }
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const data = await fetchProtected(`${BASE_URL}/auth/login`, "POST", { email, password });

    if (data && data.token) {
        CURRENT_TOKEN = data.token;
        CURRENT_ROLE = data.user && data.user.role ? data.user.role : 'admin';

        localStorage.setItem("jwtToken", CURRENT_TOKEN);
        localStorage.setItem("userRole", CURRENT_ROLE);

        document.getElementById("current-token").textContent = CURRENT_TOKEN;
        document.getElementById("current-role").textContent = CURRENT_ROLE;

        renderAuthSuccess(`Login bem-sucedido! Token obtido. Perfil: <strong>${CURRENT_ROLE}</strong>`, "auth-output");
        alert(`Login bem-sucedido! Perfil: ${CURRENT_ROLE}. Token salvo.`);
    } else {
        CURRENT_TOKEN = "";
        CURRENT_ROLE = "";
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("userRole");
        document.getElementById("current-token").textContent = "N/A";
        document.getElementById("current-role").textContent = "N/A";
    }
}


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

        renderCreationSuccess(data, 'Cliente', 'cliente-output');
    }
}

async function listClientes() {
    const data = await fetchProtected(`${BASE_URL}/clientes`, "GET");
    if (Array.isArray(data)) {
        data.sort((a, b) => a.id - b.id);

        renderDataInTable(data, "cliente-output");
    }
}

async function getOneCliente() {
    const targetId = document.getElementById("cliente-id-input").value;
    if (!targetId) {
        alert("Digite o ID do cliente no campo ID.");
        return;
    }

    const data = await fetchProtected(`${BASE_URL}/clientes/${targetId}`, "GET");
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        renderDataInTable([data], "cliente-output");
    }
}

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

async function deleteCliente() {
    const targetId = document.getElementById("cliente-id-input").value;
    if (!targetId) {
        alert("Digite o ID do cliente que você quer excluir no campo ID.");
        return;
    }

    const result = await fetchProtected(`${BASE_URL}/clientes/${targetId}`, "DELETE");

    if (result && result.status === 204 && parseInt(targetId, 10) === parseInt(CLIENTE_ID, 10)) {
        CLIENTE_ID = "";
        localStorage.removeItem("clienteId");
        document.getElementById("cliente-id").textContent = "N/A";
    }
}



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

        renderCreationSuccess(data, 'Quarto', 'quarto-output');
    }
}

async function listQuartos() {
    const data = await fetchProtected(`${BASE_URL}/quartos`, "GET");
    if (Array.isArray(data)) {
        data.sort((a, b) => a.id - b.id);

        renderDataInTable(data, "quarto-output");
    }
}

async function getOneQuarto() {
    const targetId = document.getElementById("quarto-id-input").value;
    if (!targetId) {
        alert("Digite o ID do quarto no campo ID.");
        return;
    }

    const data = await fetchProtected(`${BASE_URL}/quartos/${targetId}`, "GET");
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        renderDataInTable([data], "quarto-output");
    }
}

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

        renderCreationSuccess(responseData, 'Reserva', 'reserva-output');
    }
}

async function listReservas() {
    const data = await fetchProtected(`${BASE_URL}/reservas`, "GET");
    if (Array.isArray(data)) {
        data.sort((a, b) => a.id - b.id);

        renderDataInTable(data, "reserva-output");
    }
}

async function getOneReserva() {
    const targetId = document.getElementById("reserva-id-input").value;
    if (!targetId) {
        alert("Digite o ID da reserva que você quer buscar.");
        return;
    }

    const data = await fetchProtected(`${BASE_URL}/reservas/${targetId}`, "GET");
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        renderDataInTable([data], "reserva-output");
    }
}

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