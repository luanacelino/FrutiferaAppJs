// FUNÇÃO 1: CALCULAR IDADE EM MESES 
//  Exibir idade em meses de cada fruteira
// Recebe "dd/mm/aaaa" e retorna quantos meses desde o plantio
const calcularIdadeEmMeses = (dataPlantioStr) => {
  const [dia, mes, ano] = dataPlantioStr.split('/').map(Number);
  const plantio = new Date(ano, mes - 1, dia); // JS conta meses de 0-11
  const hoje = new Date();

  // Calcula diferença: (anos × 12) + diferença de meses
  let meses = (hoje.getFullYear() - plantio.getFullYear()) * 12 +
              (hoje.getMonth() - plantio.getMonth());

  // Ajusta se o dia do mês ainda não chegou
  if (hoje.getDate() < plantio.getDate()) {
    meses -= 1;
  }

  return meses < 0 ? 0 : meses;
};


// FUNÇÃO 2: CRIAR CARD HTML 
// Listagem usando cards Bootstrap
// Monta o HTML completo de um card com todas as informações
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


// FUNÇÃO 3: INSERIR CARD NA LISTAGEM 
const inserirCard = (fruteira) => {
  const listagemFruteiras = document.getElementById('listagemFruteiras');
  const card = criarCardFruteira(fruteira);
  listagemFruteiras.insertAdjacentHTML('beforeend', card);
};


// CARREGAR DADOS DO LOCALSTORAGE 
//  Dados salvos no LocalStorage
let fruteiras = JSON.parse(localStorage.getItem('fruteiras')) ?? [];

// Limpa e recria todos os cards (atualiza cards antigos)
const listagemFruteiras = document.getElementById('listagemFruteiras');
listagemFruteiras.innerHTML = '';

for (let fruteira of fruteiras) {
  inserirCard(fruteira);
}


// MÁSCARA AUTOMÁTICA DE DATA (dd/mm/aaaa)
const campoDataPlantio = document.getElementById('dataPlantio');

campoDataPlantio.addEventListener('input', (evento) => {
  let valor = evento.target.value.replace(/\D/g, ''); // Remove não-dígitos

  // Adiciona barras automaticamente
  if (valor.length > 2) valor = valor.slice(0, 2) + '/' + valor.slice(2);
  if (valor.length > 5) valor = valor.slice(0, 5) + '/' + valor.slice(5);
  if (valor.length > 10) valor = valor.slice(0, 10);

  evento.target.value = valor;
});


// CADASTRO: SUBMIT DO FORMULÁRIO 
const formularioFruteira = document.getElementById('formularioFruteira');

formularioFruteira.onsubmit = (evento) => {
  evento.preventDefault(); // Impede recarregamento da página

  // Captura valores dos campos
  const nomePopular = document.getElementById('nomePopular').value;
  const nomeCientifico = document.getElementById('nomeCientifico').value;
  const producaoMedia = document.getElementById('producaoMedia').value;
  const dataPlantio = document.getElementById('dataPlantio').value;

  // Cria objeto da fruteira
  // ID gerado com Date.now() - retorna milissegundos desde 1970 (sempre único)
  const fruteiraJson = {
    id: Date.now(),
    nomePopular: nomePopular,
    nomeCientifico: nomeCientifico,
    producaoMedia: producaoMedia,
    dataPlantio: dataPlantio,
  };

  // Salva no LocalStorage
  fruteiras.push(fruteiraJson);
  localStorage.setItem('fruteiras', JSON.stringify(fruteiras));

  // Adiciona card na tela
  inserirCard(fruteiraJson);

  // Fecha modal e limpa formulário
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalFruteira'));
  modal.hide();
  formularioFruteira.reset();
};


// EXCLUSÃO DE FRUTEIRA 
const excluirFruteira = (id) => {
  if (!confirm('Deseja realmente excluir esta fruteira?')) return;

  // Remove do array
  fruteiras = fruteiras.filter(fruteira => fruteira.id !== id);
  
  // Atualiza LocalStorage
  localStorage.setItem('fruteiras', JSON.stringify(fruteiras));

  // Remove card da tela
  document.getElementById(`card-${id}`)?.remove();
};


// EVENT DELEGATION 
// Escuta cliques em TODOS os botões de excluir (inclusive os criados dinamicamente)
document.addEventListener('click', (evento) => {
  if (evento.target.classList.contains('btn-excluir')) {
    const id = parseInt(evento.target.getAttribute('data-id'));
    excluirFruteira(id);
  }
});
