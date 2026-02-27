// FUNÇÃO: calcularIdadeEmMeses

// Essa função recebe uma data em formato brasileiro (dd/mm/aaaa) e calcula
// quantos meses se passaram desde aquela data até hoje.
// 
// Por exemplo: se a fruteira foi plantada em 15/03/2020 e hoje é 27/02/2025,
// ela tem 58 meses de vida.
//
// É importante calcular corretamente porque esse valor é exibido no card!
const calcularIdadeEmMeses = (dataPlantioStr) => {
  // Primeiro, a gente quebra a string da data nas barras "/"
  // "15/03/2020" vira ["15", "03", "2020"]
  // Depois converte cada pedaço pra número com map(Number)
  const [dia, mes, ano] = dataPlantioStr.split('/').map(Number);
  
  // Aqui criamos um objeto Date do JavaScript pra data de plantio
  // JavaScript é um pouco diferente, os meses vão de 0 a 11
  // Janeiro = 0, Fevereiro = 1... então tem que fazer (mes - 1)
  const plantio = new Date(ano, mes - 1, dia);
  
  // Pegamos a data de hoje também
  const hoje = new Date();

  // Agora vem o cálculo:
  // 1. Pega a diferença de anos e multiplica por 12 (transforma em meses)
  // 2. Soma com a diferença de meses do ano atual
  // Exemplo: 2025 - 2020 = 5 anos = 60 meses
  //          Fevereiro (1) - Março (2) = -1 mês
  //          Total: 60 - 1 = 59 meses
  let meses = (hoje.getFullYear() - plantio.getFullYear()) * 12 +
              (hoje.getMonth() - plantio.getMonth());

  // Aqui fazemos um ajuste fino: se o dia do mês ainda não chegou,
  // consideramos que o mês não completou ainda
  // Ex: plantio dia 15, hoje dia 10 → ainda falta completar o mês
  if (hoje.getDate() < plantio.getDate()) {
    meses -= 1;
  }

  // Por segurança, nunca retornamos número negativo
  // (caso alguém digite uma data no futuro por engano)
  return meses < 0 ? 0 : meses;
};



// FUNÇÃO: criarCardFruteira

// Essa função monta o HTML completo de um card Bootstrap.
// Ela recebe um objeto com os dados da fruteira e devolve uma string HTML pronta.
//
// O card tem:
// - Título com o nome popular (ex: Mangueira)
// - Subtítulo com nome científico em itálico (ex: Mangifera indica)
// - Informações: produção, data de plantio e idade
// - Botão vermelho pra excluir
// - Rodapé com o ID
const criarCardFruteira = (fruteira) => {
  // Primeiro calculamos quantos meses a fruteira tem
  const idadeMeses = calcularIdadeEmMeses(fruteira.dataPlantio);

  // Agora montamos o HTML usando template string (aquelas crases `)
  // Template string é legal porque permite colocar variáveis com ${variavel}
  // e também quebrar o texto em várias linhas sem problemas
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

  // Pronto! Agora é só retornar esse HTML
  return card;
};



// FUNÇÃO: inserirCard

// Essa função é bem simples: ela pega o HTML do card e joga lá na listagem.
// É tipo um "append" mas usando insertAdjacentHTML que é mais rápido.
const inserirCard = (fruteira) => {
  // Primeiro pegamos a div onde os cards ficam
  const listagemFruteiras = document.getElementById('listagemFruteiras');
  
  // Criamos o HTML do card
  const card = criarCardFruteira(fruteira);
  
  // E inserimos no final da listagem
  // 'beforeend' = antes do fim da div = como último filho
  listagemFruteiras.insertAdjacentHTML('beforeend', card);
};



// CARREGAMENTO INICIAL

// Quando a página carrega, a primeira coisa que fazemos é buscar as fruteiras
// que estão salvas no LocalStorage do navegador.

// Tentamos buscar os dados salvos. Se não tiver nada, começa com array vazio []
// O "??" é o operador nullish coalescing: "se for null ou undefined, usa isso aqui"
let fruteiras = JSON.parse(localStorage.getItem('fruteiras')) ?? [];

// Aqui fazemos uma limpeza na área de listagem antes de começar
// Porque se já tiver cards antigos lá, eles vão duplicar
// Então limpamos tudo e recriamos do zero
const listagemFruteiras = document.getElementById('listagemFruteiras');
listagemFruteiras.innerHTML = '';

// Agora percorremos todas as fruteiras salvas e criamos os cards
// for of é tipo um forEach mas mais bonito
for (let fruteira of fruteiras) {
  inserirCard(fruteira);
}



// MÁSCARA DE DATA AUTOMÁTICA


// Aqui a gente adiciona aquela máscara que coloca as barrinhas automaticamente
// quando o usuário digita a data. Fica tipo: 15032020 → 15/03/2020

// Pegamos o campo de data do formulário
const campoDataPlantio = document.getElementById('dataPlantio');

// Adicionamos um "ouvinte" que fica esperando o usuário digitar
campoDataPlantio.addEventListener('input', (evento) => {
  // Pegamos o valor atual do campo
  let valor = evento.target.value;
  
  // Primeiro removemos tudo que não é número
  // /\D/g é uma expressão regular que significa "tudo que não é dígito"
  // Se o usuário digitar "12a3b", fica só "123"
  valor = valor.replace(/\D/g, '');

  // Agora vamos colocando as barrinhas nas posições certas
  
  // Se tiver mais de 2 dígitos, coloca a primeira barra (depois do dia)
  // "123" vira "12/3"
  if (valor.length > 2) {
    valor = valor.slice(0, 2) + '/' + valor.slice(2);
  }
  
  // Se tiver mais de 5 caracteres, coloca a segunda barra (depois do mês)
  // "12/345" vira "12/34/5"
  if (valor.length > 5) {
    valor = valor.slice(0, 5) + '/' + valor.slice(5);
  }
  
  // Limita a 10 caracteres no total (dd/mm/aaaa)
  if (valor.length > 10) {
    valor = valor.slice(0, 10);
  }

  // Atualiza o campo com o valor formatado
  evento.target.value = valor;
});



// CONTROLE DO FORMULÁRIO

// Aqui é onde o cadastro realmente acontece!
// Quando o usuário clica em "Salvar", esse código roda.

// Pegamos o formulário pelo ID
const formularioFruteira = document.getElementById('formularioFruteira');

// Definimos o que acontece quando o formulário é submetido
formularioFruteira.onsubmit = (evento) => {
  
  // preventDefault() impede o formulário de recarregar a página
  // Por padrão, formulários HTML recarregam a página quando enviados
  // A gente não quer isso! Queremos controlar tudo via JavaScript
  evento.preventDefault();
  
  // Log no console pra debug (útil pra testar se o evento tá funcionando)
  console.log('Formulário submetido');


  //Pegar os valores dos campos

  // Pra cada campo, pegamos o elemento e depois seu valor
  
  const nomePopular = document.getElementById('nomePopular').value;
  const nomeCientifico = document.getElementById('nomeCientifico').value;
  const producaoMedia = document.getElementById('producaoMedia').value;
  const dataPlantio = document.getElementById('dataPlantio').value;


  //Criar o objeto da fruteira

  // Montamos um objeto JavaScript com todos os dados
  const fruteiraJson = {
    // O ID é gerado automaticamente usando Date.now()
    // Date.now() retorna quantos milissegundos se passaram desde 01/01/1970
    // Como esse número só aumenta, cada ID é único!
    // Exemplo: 1739827351234
    id: Date.now(),
    
    // Resto dos dados vêm do formulário
    nomePopular: nomePopular,
    nomeCientifico: nomeCientifico,
    producaoMedia: producaoMedia,
    dataPlantio: dataPlantio,
  };


  // Salvar no LocalStorage

  // LocalStorage é tipo um "banco de dados" do navegador
  // Os dados ficam salvos mesmo se fechar o navegador!
  
  // Primeiro adicionamos a nova fruteira no array
  fruteiras.push(fruteiraJson);

  // Depois salvamos o array completo no LocalStorage
  // LocalStorage só aceita texto, então usamos JSON.stringify() pra converter
  localStorage.setItem('fruteiras', JSON.stringify(fruteiras));


  // Atualizar a interface
  
  // Adiciona o card na tela (sem recarregar a página!)
  inserirCard(fruteiraJson);

  // Fecha o modal automaticamente
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalFruteira'));
  modal.hide();

  // Limpa todos os campos do formulário
  // Fica pronto pra um novo cadastro
  formularioFruteira.reset();
  
  // Pronto! Fruteira cadastrada com sucesso 🎉
};



// FUNÇÃO: excluirFruteira

// Essa função remove uma fruteira do sistema.
// Ela é chamada quando o usuário clica no botão "Excluir" de um card.
const excluirFruteira = (id) => {
  
  // Primeiro pedimos confirmação pro usuário
  // Isso evita exclusões acidentais!
  const confirmacao = confirm('Deseja realmente excluir esta fruteira?');
  
  // Se o usuário clicar em "Cancelar", a função para aqui
  if (!confirmacao) {
    return; // Sai da função sem fazer nada
  }


  //Remover do array em memória

  // filter() cria um novo array mantendo só o que passa no teste
  // Aqui mantemos todas as fruteiras EXCETO a que tem o ID pra excluir
  fruteiras = fruteiras.filter(fruteira => fruteira.id !== id);


  //Atualizar o LocalStorage

  // Salvamos o array atualizado (sem a fruteira excluída)
  localStorage.setItem('fruteiras', JSON.stringify(fruteiras));


  //Remover o card da tela

  // Procuramos o card pelo ID (que segue o padrão "card-123456")
  const card = document.getElementById(`card-${id}`);
  
  // Se encontrou, remove do DOM (da página)
  if (card) {
    card.remove();
  }

  // Log pra confirmar que deu certo
  console.log(`Fruteira ID ${id} excluída com sucesso`);
};



// EVENT DELEGATION - Escutar cliques nos botões de excluir

// Aqui tem um detalhe importante
// Os cards são criados DEPOIS que a página carrega (via JavaScript).
// Então não dá pra adicionar eventos diretamente nos botões porque eles não existem ainda.
//
// A solução é Event Delegation
// A gente coloca UM listener no documento inteiro, e quando alguém clica em QUALQUER lugar,
// verificamos se o clique foi em um botão de excluir.

// Adiciona um ouvinte de clique no documento inteiro
document.addEventListener('click', (evento) => {
  // evento.target = elemento que foi clicado
  
  // Verifica se o elemento clicado tem a classe 'btn-excluir'
  if (evento.target.classList.contains('btn-excluir')) {
    
    // Se chegou aqui, foi clique em um botão de excluir!
    
    // Pegamos o ID que está guardado no atributo data-id
    // getAttribute() busca o valor de um atributo HTML
    // parseInt() converte texto pra número
    const id = parseInt(evento.target.getAttribute('data-id'));
    
    // Chama a função de exclusão passando o ID
    excluirFruteira(id);
  }
  
  // Se não foi clique no botão de excluir, não faz nada
});


