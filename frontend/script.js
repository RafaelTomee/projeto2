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
            if(firstButton) {
                 showTab('auth-section', firstButton);
            }
        });

        // -------------------------------------------------------------
        // SEU CÓDIGO JAVASCRIPT DE LÓGICA DE TESTE (INALTERADO)
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

        // Helper para requisições protegidas
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
                return;
            }

            outputElement.textContent = "Carregando...";

            if (
                !CURRENT_TOKEN &&
                !url.includes("/auth/register") &&
                !url.includes("/auth/login")
            ) {
                outputElement.textContent =
                    "ERRO: Faça o login primeiro para obter o token.";
                return;
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
                    outputElement.textContent = `Status: 204 No Content\n\nOperação de exclusão bem-sucedida.`;
                    return { success: true, status: 204 };
                }
                
                let data = {};
                try {
                    data = await response.json();
                } catch (e) {
                    outputElement.textContent = `Status: ${response.status}\n\nErro do servidor sem JSON (Provavelmente HTML ou texto simples).`;
                    return null; 
                }

                outputElement.textContent =
                    `Status: ${response.status}\n\n` + JSON.stringify(data, null, 2);

                return data;
            } catch (error) {
                outputElement.textContent = "ERRO DE REDE/SERVIDOR: " + error.message;
                return null;
            }
        }

        // NOVO: 1. REGISTRO
        async function registerUser() {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const outputElement = document.getElementById("auth-output");

            try {
                const response = await fetch(`${BASE_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                outputElement.textContent =
                    `Status: ${response.status}\n\n` + JSON.stringify(data, null, 2);

                if (response.ok) {
                    alert("Registro bem-sucedido! Tente fazer o Login agora.");
                }
            } catch (error) {
                outputElement.textContent = "ERRO: " + error.message;
            }
        }

        // 1. LOGIN
        async function login() {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const outputElement = document.getElementById("auth-output");

            try {
                const response = await fetch(`${BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                outputElement.textContent =
                    `Status: ${response.status}\n\n` + JSON.stringify(data, null, 2);

                if (response.ok && data.token) {
                    CURRENT_TOKEN = data.token;
                    CURRENT_ROLE = data.user.role || 'N/A';
                    localStorage.setItem("jwtToken", CURRENT_TOKEN);
                    localStorage.setItem("userRole", CURRENT_ROLE);
                    document.getElementById("current-token").textContent = CURRENT_TOKEN;
                    document.getElementById("current-role").textContent = CURRENT_ROLE;
                    alert(`Login bem-sucedido! Perfil: ${CURRENT_ROLE}. Token salvo.`);
                } else {
                    CURRENT_TOKEN = "";
                    CURRENT_ROLE = "";
                    localStorage.removeItem("jwtToken");
                    localStorage.removeItem("userRole");
                    document.getElementById("current-token").textContent = "N/A";
                    document.getElementById("current-role").textContent = "N/A";
                }
            } catch (error) {
                outputElement.textContent = "ERRO: " + error.message;
            }
        }

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
            }
        }

        // 2. LISTAR CLIENTES
        async function listClientes() {
            await fetchProtected(`${BASE_URL}/clientes`, "GET");
        }

        // 3. BUSCAR CLIENTE POR ID (GET /api/clientes/:id)
        async function getOneCliente() {
            const targetId = document.getElementById("cliente-id-input").value;
            if (!targetId) {
                alert("Digite o ID do cliente no campo ID.");
                return;
            }

            await fetchProtected(`${BASE_URL}/clientes/${targetId}`, "GET");
        }

        // 4. EDITAR CLIENTE (PUT /api/clientes/:id)
        async function updateCliente() {
            const targetId = document.getElementById("cliente-id-input").value;
            if (!targetId) {
                alert(
                    "Digite o ID do cliente que você quer editar no campo ID."
                );
                return;
            }

            const nome = document.getElementById("cliente-nome").value;
            const cpf = document.getElementById("cliente-cpf").value;
            const telefone = document.getElementById("cliente-telefone").value;
            const email = document.getElementById("cliente-email").value;

            await fetchProtected(`${BASE_URL}/clientes/${targetId}`, "PUT", {
                nome: nome,
                cpf: cpf,
                telefone: telefone,
                email: email,
            });

            document.getElementById("cliente-id").textContent = targetId;
        }

        // 5. EXCLUIR CLIENTE (DELETE /api/clientes/:id)
        async function deleteCliente() {
            const targetId = document.getElementById("cliente-id-input").value;
            if (!targetId) {
                alert(
                    "Digite o ID do cliente que você quer excluir no campo ID."
                );
                return;
            }

            const result = await fetchProtected(`${BASE_URL}/clientes/${targetId}`, "DELETE");
            
            if (result && result.status === 204 && parseInt(targetId, 10) === parseInt(CLIENTE_ID, 10)) {
                CLIENTE_ID = "";
                localStorage.removeItem("clienteId");
                document.getElementById("cliente-id").textContent = "N/A";
            }
        }
        
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
            }
        }

        // 2. LISTAR QUARTOS (GET /api/quartos?status=...)
        async function listQuartos() {
            await fetchProtected(`${BASE_URL}/quartos`, "GET");
        }

        // 3. BUSCAR QUARTO POR ID (GET /api/quartos/:id)
        async function getOneQuarto() {
            const targetId = document.getElementById("quarto-id-input").value;
            if (!targetId) {
                alert("Digite o ID do quarto no campo ID.");
                return;
            }

            await fetchProtected(`${BASE_URL}/quartos/${targetId}`, "GET");
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

            await fetchProtected(`${BASE_URL}/quartos/${targetId}`, "PUT", {
                numero: numero,
                tipo: tipo,
                valorDiaria: parseFloat(valorDiaria),
                capacidade: parseInt(capacidade, 10),
                status: newStatus,
            });

            document.getElementById("quarto-id").textContent = targetId;
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
            }
        }

        // 2. LISTAR RESERVAS (GET /api/reservas)
        async function listReservas() {
            await fetchProtected(`${BASE_URL}/reservas`, "GET");
        }

        // 3. BUSCAR RESERVA POR ID (GET /api/reservas/:id)
        async function getOneReserva() {
            const targetId = document.getElementById("reserva-id-input").value;
            if (!targetId) {
                alert("Digite o ID da reserva que você quer buscar.");
                return;
            }

            await fetchProtected(`${BASE_URL}/reservas/${targetId}`, "GET");
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