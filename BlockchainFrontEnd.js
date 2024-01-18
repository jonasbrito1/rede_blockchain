document.addEventListener("DOMContentLoaded", function() {
    const mineButton = document.getElementById("mineBlock");
    const getChainButton = document.getElementById("getChain");
    const isValidButton = document.getElementById("isValid");
    const addTransactionButton = document.getElementById("addTransaction");
    const connectNodeButton = document.getElementById("connectNode");
    const replaceChainButton = document.getElementById("replaceChain");
    const outputDiv = document.getElementById("output");

    let blockNumber = 0;

    mineButton.addEventListener("click", mineBlock);
    getChainButton.addEventListener("click", getChain);
    isValidButton.addEventListener("click", checkValidity);
    connectNodeButton.addEventListener("click", connectNodes);
    replaceChainButton.addEventListener("click", replaceChain);
    addTransactionButton.addEventListener("click", addTransaction);


    function mineBlock() {
        fetch("/mine_block", { method: "GET" })
            .then(response => response.json())
            .then(data => {
                blockNumber++;
                if (data.message === "Parabens voce acabou de minerar um bloco!") {
                    outputDiv.innerHTML = `<p class="valid">Mineração bem-sucedida no bloco ${blockNumber}.</p>`;
                    const blockNumberElement = document.getElementById("blockNumber");
        
                    blockNumberElement.textContent = blockNumber;
                } else {
                    outputDiv.innerHTML = `<p class="invalid">${data.message}</p>`;
                }
            })
            .catch(error => console.error("Erro ao minerar bloco:", error));
    }

    function getChain() {
        fetch("/get_chain", { method: "GET" })
            .then(response => response.json())
            .then(data => {
                outputDiv.innerHTML = ""; // Limpar saída anterior
    
                data.chain.forEach(block => {
                    const blockDiv = document.createElement("div");
                    blockDiv.className = "block-details";
                    blockDiv.innerHTML = `
                        <h2>Bloco #${block.index}</h2>
                        <p>Hash Anterior: ${block.previous_hash}</p>
                        <p>Prova: ${block.proof}</p>
                        <p>Carimbo de Data/Hora: ${block.timestamp}</p>
                        <h3>Transações:</h3>
                        <ul>
                            ${block.transactions.map(transaction => `
                                <li>
                                    Remetente: ${transaction.sender}<br>
                                    Destinatário: ${transaction.receiver}<br>
                                    Montante: ${transaction.amount}<br>
                                </li>
                            `).join("")}
                        </ul>
                    `;
                    outputDiv.appendChild(blockDiv);
                });
            })
            .catch(error => console.error("Erro ao obter cadeia:", error));
    }

    function checkValidity() {
        fetch("/is_valid", { method: "GET" })
            .then(response => response.json())
            .then(data => {
                if (data.message === "Tudo certo, o blockchain e valido.") {
                    outputDiv.innerHTML = `<p class="valid">Blockchain: ${data.message}</p>`;
                } else {
                    outputDiv.innerHTML = `<p class="invalid">Blockchain: ${data.message}</p>`;
                }
            })
            .catch(error => console.error("Erro ao verificar validade:", error));
    }

    function connectNodes() {
        const nodesToConnect = prompt("Informe as portas dos nós a serem conectados (separadas por vírgula):");
        if (nodesToConnect === null) return;
    
        const nodesArray = nodesToConnect.split(",").map(node => `http://127.0.0.1:${node.trim()}`);
        const requestBody = { nodes: nodesArray };
    
        fetch("/connect_node", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message && data.message.startsWith("Todos nos conectados")) {
                outputDiv.innerHTML = `<p>Nodes conectados: ${data.total_nodes.join(", ")}</p>`;
            } else {
                outputDiv.innerHTML = `<p>Nenhum nó foi conectado.</p>`;
            }
        })
        .catch(error => console.error("Erro ao conectar nós:", error));
    }

    function replaceChain() {
        fetch("/replace_chain", { method: "GET" })
            .then(response => response.json())
            .then(data => {
                if (data.message && data.message.startsWith("Os nos tinham cadeias diferentes")) {
                    outputDiv.innerHTML = `<p>Cadeia substituída com sucesso.</p>`;
                } else {
                    outputDiv.innerHTML = `<p>Não houve substituição da cadeia.</p>`;
                }
            })
            .catch(error => console.error("Erro ao substituir cadeia:", error));
    }

    function addTransaction() {
        const sender = prompt("Informe o remetente:");
        if (sender === null) return;

        const receiver = prompt("Informe o destinatário:");
        if (receiver === null) return;

        const amount = parseFloat(prompt("Informe o montante:"));
        if (isNaN(amount)) {
            alert("Quantia inválida.");
            return;
        }

        const requestBody = {
            sender: sender,
            receiver: receiver,
            amount: amount
        };

        fetch("/add_transaction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
        .then(response => response.json())
        .then(data => {
            outputDiv.innerHTML = `<p>Transação adicionada ao bloco ${data.index}.</p>`;
        })
        .catch(error => console.error("Erro ao adicionar transação:", error));
    }
});
