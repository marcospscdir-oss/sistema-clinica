// Importando as funções do Firebase (versão 12.11.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Configuração do seu Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCN8ZX00pdvENAzJx_h3ymVtp4cfkTR6wU",
    authDomain: "sistema-financeiro-clinica.firebaseapp.com",
    projectId: "sistema-financeiro-clinica",
    storageBucket: "sistema-financeiro-clinica.firebasestorage.app",
    messagingSenderId: "199395159745",
    appId: "1:199395159745:web:667a96031337db5831ae40",
    measurementId: "G-EYT28L7B8Q"
};

// Inicializando o Firebase e o Banco de Dados
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Sistema inicializado! Firebase conectado.");

// ==========================================
// LÓGICA DE NAVEGAÇÃO ENTRE TELAS
// ==========================================
const botoesMenu = document.querySelectorAll('.menu-btn');
const telas = document.querySelectorAll('.tela');

botoesMenu.forEach(botao => {
    botao.addEventListener('click', () => {
        // Remove a classe 'ativo' de todos os botões e oculta todas as telas
        botoesMenu.forEach(btn => btn.classList.remove('ativo'));
        telas.forEach(tela => tela.classList.remove('ativa'));

        // Adiciona 'ativo' no botão clicado
        botao.classList.add('ativo');

        // Mostra a tela correspondente
        const idTela = botao.id.replace('btn-', 'tela-');
        const telaAlvo = document.getElementById(idTela);
        if(telaAlvo) {
            telaAlvo.classList.add('ativa');
        }
    });
});

// ==========================================
// LÓGICA PARA BUSCAR E LISTAR CLIENTES
// ==========================================
async function carregarClientes() {
    const container = document.getElementById('lista-clientes-container');
    if (!container) return; // Só roda se a tela de clientes estiver montada no HTML
    
    try {
        const querySnapshot = await getDocs(collection(db, "clientes"));
        container.innerHTML = ''; 

        if (querySnapshot.empty) {
            container.innerHTML = '<p style="font-size: 0.9rem; color: #777;">Nenhum cliente cadastrado ainda.</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const cliente = doc.data();
            const saldo = cliente.saldoDevedor || 0;
            const corSaldo = saldo > 0 ? 'var(--alerta)' : 'var(--texto-escuro)';

            const div = document.createElement('div');
            div.style = "padding: 15px; border: 1px solid var(--borda-suave); border-radius: 4px; display: flex; justify-content: space-between; align-items: center; background-color: var(--fundo-offwhite);";
            
            div.innerHTML = `
                <div>
                    <strong style="color: var(--dourado-escuro);">${cliente.nome}</strong><br>
                    <span style="font-size: 0.85rem; color: #666;">📞 ${cliente.telefone}</span>
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 0.85rem; color: #666;">Saldo Devedor:</span><br>
                    <strong style="color: ${corSaldo}">R$ ${saldo.toFixed(2).replace('.', ',')}</strong>
                </div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error("Erro ao buscar clientes: ", error);
        container.innerHTML = '<p style="color: red;">Erro ao carregar a lista de clientes.</p>';
    }
}

// ==========================================
// LÓGICA DE CADASTRO DE CLIENTES
// ==========================================
const formCliente = document.getElementById('form-cliente');
if (formCliente) {
    formCliente.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const nome = document.getElementById('cli-nome').value;
        const telefone = document.getElementById('cli-telefone').value;
        const nascimento = document.getElementById('cli-nascimento').value;
        const obs = document.getElementById('cli-obs').value;

        try {
            const btnSalvar = formCliente.querySelector('button');
            const textoOriginal = btnSalvar.innerText;
            btnSalvar.innerText = "Salvando...";

            await addDoc(collection(db, "clientes"), {
                nome: nome,
                telefone: telefone,
                nascimento: nascimento,
                observacoes: obs,
                saldoDevedor: 0, 
                dataCadastro: new Date().toISOString() 
            });

            alert("Cliente cadastrado com sucesso!");
            formCliente.reset();
            btnSalvar.innerText = textoOriginal;
            
            // Atualiza a lista na hora!
            carregarClientes();
            
        } catch (error) {
            console.error("Erro ao salvar cliente: ", error);
            alert("Erro ao salvar. Verifique se você está conectado à internet.");
        }
    });
}

// Executa a função de carregar a lista assim que a página abre
carregarClientes();