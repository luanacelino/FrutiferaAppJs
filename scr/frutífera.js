// Calcula a idade em meses a partir de uma data no formato dd/mm/aaaa
const calcularIdadeEmMeses = (dataPlantioStr) => {
  const [dia, mes, ano] = dataPlantioStr.split('/').map(Number);
  const plantio = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  let meses = (hoje.getFullYear() - plantio.getFullYear()) * 12 +
              (hoje.getMonth() - plantio.getMonth());

  if (hoje.getDate() < plantio.getDate()) {
    meses -= 1;
  }

  return meses < 0 ? 0 : meses;
};

// Cria o HTML de um card de fruteira
const criarCardFruteira = (fruteira) => {
  const idadeMeses = calcularIdadeEmMeses(fruteira.dataPlantio);

  const card = `
    <div class="col">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">${fruteira.nomePopular}</h5>
          <h6 class="card-subtitle mb-2 text-muted fst-italic">${fruteira.nomeCientifico}</h6>
          <p class="card-text">
            <strong>Produção média:</strong> ${fruteira.producaoMedia} kg/safra<br>
            <strong>Data de plantio:</strong> ${fruteira.dataPlantio}<br>
            <strong>Idade:</strong> ${idadeMeses} ${idadeMeses === 1 ? 'mês' : 'meses'}
          </p>
        </div>
        <div class="card-footer text-muted">
          <small>ID: ${fruteira.id}</small>
        </div>
      </div>
    </div>`;

  return card;
};

// Insere um card na listagem
const inserirCard = (fruteira) => {
  const listagemFruteiras = document.getElementById('listagemFruteiras');
  const card = criarCardFruteira(fruteira);
  listagemFruteiras.insertAdjacentHTML('beforeend', card);
};

// Carregar fruteiras do LocalStorage e exibir na página
let fruteiras = JSON.parse(localStorage.getItem('fruteiras')) ?? [];

for (let fruteira of fruteiras) {
  inserirCard(fruteira);
}

// Adicionar máscara de data no campo dataPlantio
const campoDataPlantio = document.getElementById('dataPlantio');

campoDataPlantio.addEventListener('input', (evento) => {
  let valor = evento.target.value.replace(/\D/g, '');

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

// Controlar o submit do formulário
const formularioFruteira = document.getElementById('formularioFruteira');

formularioFruteira.onsubmit = (evento) => {
  evento.preventDefault();
  console.log('Controlando a submissão do formulário');

  // Capturar os valores digitados nos campos
  const campoNomePopular = document.getElementById('nomePopular');
  const nomePopular = campoNomePopular.value;

  const campoNomeCientifico = document.getElementById('nomeCientifico');
  const nomeCientifico = campoNomeCientifico.value;

  const campoProducaoMedia = document.getElementById('producaoMedia');
  const producaoMedia = campoProducaoMedia.value;

  const campoDataPlantio = document.getElementById('dataPlantio');
  const dataPlantio = campoDataPlantio.value;

  // Criar objeto da fruteira com ID gerado por Date.now()
  const fruteiraJson = {
    id: Date.now(),
    nomePopular: nomePopular,
    nomeCientifico: nomeCientifico,
    producaoMedia: producaoMedia,
    dataPlantio: dataPlantio,
  };

  // Adicionar ao array e salvar no LocalStorage
  fruteiras.push(fruteiraJson);
  localStorage.setItem('fruteiras', JSON.stringify(fruteiras));

  // Inserir o card na listagem
  inserirCard(fruteiraJson);

  // Fechar o modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalFruteira'));
  modal.hide();

  // Limpar o formulário
  formularioFruteira.reset();
};

  
