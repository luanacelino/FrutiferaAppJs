// ============================================================================
// FRUTEIRA.JS - Lógica do Sistema de Gerenciamento de Fruteiras
// ============================================================================


// ============================================================================
// CALCULAR IDADE EM MESES
// ============================================================================
//Cada frutífera deve exibir sua idade em meses
// Recebe data "dd/mm/aaaa" e retorna idade em meses
const calcularIdadeEmMeses = (dataPlantioStr) => {
  // Separar dia, mês, ano da string
  const [dia, mes, ano] = dataPlantioStr.split('/').map(Number);
  
  // Criar objeto Date (mês em JS: 0-11, por isso mes-1)
  const plantio = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  // Calcular diferença em meses
  let meses = (hoje.getFullYear() - plantio.getFullYear()) * 12 +
              (hoje.getMonth() - plantio.getMonth());

  // Ajustar se o dia do mês ainda não chegou
  if (hoje.getDate() < plantio.getDate()) {
    meses -= 1;
  }

  return meses < 0 ? 0 : meses;
};


// ============================================================================
// CRIAR CARD HTML
// ============================================================================
// Listagem utilizando componente de cartão do Bootstrap
// Cria o HTML de um card Bootstrap com todas as informações da fruteira
const criarCardFruteira = (fruteira) => {
  const idadeMeses = calcularIdadeEmMeses(fruteira.dataPlantio);

  const card = `
    <div class="col" id="card-${fruteira.id}">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${fruteira.nomePopular}</h5>
          <h6 class="card-subtitle mb-2 text-muted fst-italic">${fruteira.nomeCientifico}</h6>
          <p class="card-text">
            <strong>Produção média:</strong> ${fruteira.producaoMedia} kg/safra<br>
            <strong>Data de plantio:</strong> ${fruteira.dataPlantio}<br>
            <strong>Idade:</strong> ${idadeMeses} ${idadeMeses === 1 ? 'mês' : 'meses'}
          </p>
          <!-- Botão de excluir (funcionalidade extra) -->
          <button type="button" class="btn btn-danger btn-sm btn-excluir" data-id="${fruteira.id}">
            Excluir
          </button>
        </div>
        <div class="card-footer text-muted">
          <small>ID: ${fruteira.id}</small>
        </div>
      </div>
    </div>`;

  return card;
};


// ============================================================================
// INSERIR CARD NA LISTAGEM
// ============================================================================
const inserirCard = (fruteira) => {
  const listagemFruteiras = document.getElementById('listagemFruteiras');
  const card = criarCardFruteira(fruteira);
  listagemFruteiras.insertAdjacentHTML('beforeend', card);
};


// ============================================================================
// INICIALIZAÇÃO: CARREGAR DADOS DO LOCALSTORAGE
// ============================================================================
//Informações salvas utilizando LocalStorage

// Carregar fruteiras salvas (ou array vazio se não houver dados)
let fruteiras = JSON.parse(localStorage.getItem('fruteiras')) ?? [];

// Limpar e recriar cards (atualiza cards antigos com novos recursos)
const listagemFruteiras = document.getElementById('listagemFruteiras');
listagemFruteiras.innerHTML = '';

// Exibir todas as fruteiras salvas
for (let fruteira of fruteiras) {
  inserirCard(fruteira);
}


// ============================================================================
// MÁSCARA AUTOMÁTICA: dd/mm/aaaa
// ============================================================================
// Adiciona barras automaticamente enquanto o usuário digita
const campoDataPlantio = document.getElementById('dataPlantio');

campoDataPlantio.addEventListener('input', (evento) => {
  // Remove tudo que não é dígito
  let valor = evento.target.value.replace(/\D/g, '');

  // Adiciona as barras automaticamente
  if (valor.length > 2) {
    valor = valor.slice(0, 2) + '/' + valor.slice(2);
  }
  if (valor.length > 5) {
    valor = valor.slice(0, 5) + '/' + valor.slice(5);
  }
  if (valor.length > 10) {
    valor = valor.slice(0, 10);
  }

  evento.target.value = valor;
});


// ============================================================================
// CADASTRO: SUBMIT DO FORMULÁRIO
// ============================================================================
const formularioFruteira = document.getElementById('formularioFruteira');

formularioFruteira.onsubmit = (evento) => {
  // Prevenir recarregamento da página
  evento.preventDefault();
  console.log('Formulário submetido');

  // Capturar valores dos campos
  const nomePopular = document.getElementById('nomePopular').value;
  const nomeCientifico = document.getElementById('nomeCientifico').value;
  const producaoMedia = document.getElementById('producaoMedia').value;
  const dataPlantio = document.getElementById('dataPlantio').value;

  // Criar objeto da fruteira
  // ID gerado automaticamente com Date.now()
  const fruteiraJson = {
    id: Date.now(), // ID único numérico
    nomePopular: nomePopular,
    nomeCientifico: nomeCientifico,
    producaoMedia: producaoMedia,
    dataPlantio: dataPlantio,
  };

  // Salvar no LocalStorage
  fruteiras.push(fruteiraJson);
  localStorage.setItem('fruteiras', JSON.stringify(fruteiras));

  // Adicionar card na tela
  inserirCard(fruteiraJson);

  // Fechar modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalFruteira'));
  modal.hide();

  // Limpar formulário
  formularioFruteira.reset();
};


// ============================================================================
// EXCLUSÃO: REMOVER FRUTEIRA
// ============================================================================
const excluirFruteira = (id) => {
  // Pedir confirmação
  const confirmacao = confirm('Deseja realmente excluir esta fruteira?');
  if (!confirmacao) return;

  // Remover do array
  fruteiras = fruteiras.filter(fruteira => fruteira.id !== id);

  // Atualizar LocalStorage
  localStorage.setItem('fruteiras', JSON.stringify(fruteiras));

  // Remover card da tela
  const card = document.getElementById(`card-${id}`);
  if (card) card.remove();

  console.log(`Fruteira ID ${id} excluída`);
};


// ============================================================================
// EVENT DELEGATION: ESCUTAR CLIQUES NOS BOTÕES DE EXCLUIR
// ============================================================================
// Event delegation: necessário porque os botões são criados dinamicamente
document.addEventListener('click', (evento) => {
  if (evento.target.classList.contains('btn-excluir')) {
    const id = parseInt(evento.target.getAttribute('data-id'));
    excluirFruteira(id);
  }
});
      
