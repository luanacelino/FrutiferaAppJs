// ============================================================================
// FRUTEIRA.JS - Sistema de Gerenciamento de Fruteiras do Brejo Paraibano
// ============================================================================
// Este arquivo contém toda a lógica de negócio da aplicação:
// - Cálculo de idade das fruteiras em meses
// - Criação dinâmica de cards Bootstrap
// - Persistência de dados no LocalStorage
// - Cadastro e exclusão de fruteiras
// - Máscara automática para data (dd/mm/aaaa)
// ============================================================================


// ============================================================================
// FUNÇÃO 1: CALCULAR IDADE EM MESES
// ============================================================================
/**
 * Calcula quantos meses se passaram desde a data de plantio até hoje
 * 
 * @param {string} dataPlantioStr - Data no formato "dd/mm/aaaa"
 * @returns {number} Idade em meses (número inteiro não-negativo)
 * 
 * Exemplo de uso:
 * calcularIdadeEmMeses("15/03/2020") → retorna 58 (se hoje for 17/02/2025)
 */
const calcularIdadeEmMeses = (dataPlantioStr) => {
  // PASSO 1: Separar a string da data em dia, mês e ano
  // split('/') divide a string nas barras: "15/03/2020" → ["15", "03", "2020"]
  // map(Number) converte cada string em número: ["15", "03", "2020"] → [15, 3, 2020]
  const [dia, mes, ano] = dataPlantioStr.split('/').map(Number);
  
  // PASSO 2: Criar objeto Date do JavaScript para a data de plantio
  // IMPORTANTE: JavaScript conta meses de 0 a 11, por isso (mes - 1)
  // Janeiro = 0, Fevereiro = 1, ..., Dezembro = 11
  const plantio = new Date(ano, mes - 1, dia);
  
  // PASSO 3: Obter a data atual
  const hoje = new Date();

  // PASSO 4: Calcular a diferença em meses
  // Primeiro calculamos a diferença de anos e multiplicamos por 12 para obter meses
  // Depois somamos a diferença de meses do ano
  // Exemplo: plantio em jan/2020, hoje fev/2025
  // → (2025 - 2020) × 12 = 60 meses de diferença de anos
  // → (1 - 0) = 1 mês de diferença no ano (fevereiro - janeiro)
  // → Total = 60 + 1 = 61 meses
  let meses = (hoje.getFullYear() - plantio.getFullYear()) * 12 +
              (hoje.getMonth() - plantio.getMonth());

  // PASSO 5: Ajuste fino considerando o dia do mês
  // Se hoje é dia 10 e o plantio foi no dia 15, o mês atual ainda não completou
  // Neste caso, subtraímos 1 mês do total
  // Exemplo: plantio 15/01, hoje 10/02 → tecnicamente é 1 mês incompleto, não 1 mês completo
  if (hoje.getDate() < plantio.getDate()) {
    meses -= 1;
  }

  // PASSO 6: Garantir que nunca retornamos um valor negativo
  // Caso a data de plantio seja no futuro (erro de digitação), retornamos 0
  return meses < 0 ? 0 : meses;
};


// ============================================================================
// FUNÇÃO 2: CRIAR CARD DE FRUTEIRA (HTML)
// ============================================================================
/**
 * Cria o código HTML de um card Bootstrap para exibir uma fruteira
 * 
 * @param {Object} fruteira - Objeto contendo os dados da fruteira
 * @param {number} fruteira.id - Identificador único (gerado por Date.now())
 * @param {string} fruteira.nomePopular - Nome popular (ex: "Mangueira")
 * @param {string} fruteira.nomeCientifico - Nome científico (ex: "Mangifera indica")
 * @param {number} fruteira.producaoMedia - Produção em kg por safra
 * @param {string} fruteira.dataPlantio - Data no formato "dd/mm/aaaa"
 * @returns {string} Código HTML do card completo
 */
const criarCardFruteira = (fruteira) => {
  // PASSO 1: Calcular idade atual da fruteira em meses
  const idadeMeses = calcularIdadeEmMeses(fruteira.dataPlantio);

  // PASSO 2: Montar o HTML do card usando template literals (`)
  // Template literals permitem criar strings com múltiplas linhas e interpolação ${variavel}
  const card = `
    <div class="col" id="card-${fruteira.id}">
      <!-- Container da coluna do grid Bootstrap -->
      <!-- id="card-${fruteira.id}": ID único para poder excluir o card depois -->
      <!-- Exemplo: se id=1739827351234, o ID será "card-1739827351234" -->
      
      <div class="card h-100">
        <!-- Card do Bootstrap -->
        <!-- h-100: height 100% - garante que todos os cards tenham a mesma altura -->
        
        <div class="card-body">
          <!-- Corpo do card: contém as informações principais -->
          
          <!-- Título: Nome Popular -->
          <h5 class="card-title">${fruteira.nomePopular}</h5>
          
          <!-- Subtítulo: Nome Científico (em itálico e cinza) -->
          <h6 class="card-subtitle mb-2 text-muted fst-italic">${fruteira.nomeCientifico}</h6>
          
          <!-- Texto do card: informações detalhadas -->
          <p class="card-text">
            <strong>Produção média:</strong> ${fruteira.producaoMedia} kg/safra<br>
            <strong>Data de plantio:</strong> ${fruteira.dataPlantio}<br>
            <strong>Idade:</strong> ${idadeMeses} ${idadeMeses === 1 ? 'mês' : 'meses'}
            <!-- Operador ternário: se idade for 1, exibe "mês"; senão, exibe "meses" -->
          </p>
          
          <!-- Botão de Excluir -->
          <button type="button" class="btn btn-danger btn-sm btn-excluir" data-id="${fruteira.id}">
            <!-- btn-danger: botão vermelho (indica ação destrutiva) -->
            <!-- btn-sm: botão pequeno -->
            <!-- btn-excluir: classe customizada usada pelo event listener -->
            <!-- data-id: atributo data customizado que armazena o ID da fruteira -->
            Excluir
          </button>
        </div>
        
        <div class="card-footer text-muted">
          <!-- Rodapé do card: exibe o identificador único -->
          <small>ID: ${fruteira.id}</small>
        </div>
      </div>
    </div>`;

  // PASSO 3: Retornar o HTML como string
  return card;
};


// ============================================================================
// FUNÇÃO 3: INSERIR CARD NA LISTAGEM
// ============================================================================
/**
 * Insere um card de fruteira na área de listagem do HTML
 * 
 * @param {Object} fruteira - Objeto com dados da fruteira
 */
const inserirCard = (fruteira) => {
  // PASSO 1: Obter referência ao elemento HTML onde os cards serão inseridos
  // getElementById busca no documento HTML o elemento com id="listagemFruteiras"
  const listagemFruteiras = document.getElementById('listagemFruteiras');
  
  // PASSO 2: Criar o HTML do card chamando a função anterior
  const card = criarCardFruteira(fruteira);
  
  // PASSO 3: Inserir o HTML no final da listagem
  // insertAdjacentHTML é um método nativo do JavaScript que insere HTML
  // 'beforeend' significa "antes do fim" (adiciona como último filho)
  // É mais performático que innerHTML += porque não recria todo o conteúdo
  listagemFruteiras.insertAdjacentHTML('beforeend', card);
};


// ============================================================================
// INICIALIZAÇÃO: CARREGAR DADOS DO LOCALSTORAGE
// ============================================================================

// PASSO 1: Buscar fruteiras salvas no LocalStorage
// localStorage.getItem('fruteiras') retorna uma string JSON ou null se não existir
// JSON.parse() converte a string JSON de volta para um array JavaScript
// Operador Nullish Coalescing (??): se for null/undefined, usa array vazio []
// Resultado: se houver dados salvos, carrega; senão, começa com array vazio
let fruteiras = JSON.parse(localStorage.getItem('fruteiras')) ?? [];

// PASSO 2: Limpar a área de listagem antes de recarregar
// Isso garante que cards antigos sejam atualizados com novos recursos (como botão excluir)
// Sem isso, cards cadastrados antes da implementação do botão não teriam o botão
const listagemFruteiras = document.getElementById('listagemFruteiras');
listagemFruteiras.innerHTML = ''; // Remove todo o conteúdo HTML interno

// PASSO 3: Recriar todos os cards a partir dos dados salvos
// for...of percorre cada elemento do array
// Para cada fruteira salva, cria e insere um novo card atualizado
for (let fruteira of fruteiras) {
  inserirCard(fruteira);
}


// ============================================================================
// MÁSCARA AUTOMÁTICA: DATA NO FORMATO dd/mm/aaaa
// ============================================================================

// PASSO 1: Obter referência ao campo de data do formulário
const campoDataPlantio = document.getElementById('dataPlantio');

// PASSO 2: Adicionar listener para o evento 'input'
// Este evento é disparado toda vez que o usuário digita algo no campo
campoDataPlantio.addEventListener('input', (evento) => {
  // evento.target é o elemento que disparou o evento (o input de data)
  // evento.target.value é o valor atual digitado no campo
  
  // PASSO 3: Remover todos os caracteres que não são dígitos (0-9)
  // /\D/g é uma expressão regular (regex):
  // \D significa "qualquer coisa que não seja dígito"
  // g significa "global" (substitui todas as ocorrências, não só a primeira)
  // replace(/\D/g, '') remove letras, espaços, barras, etc
  // Exemplo: "12a/3b" → "123"
  let valor = evento.target.value.replace(/\D/g, '');

  // PASSO 4: Adicionar a primeira barra após 2 dígitos (dia)
  // Se houver mais de 2 caracteres, insere '/' após os 2 primeiros
  // Exemplo: "123" → "12/3"
  if (valor.length > 2) {
    valor = valor.slice(0, 2) + '/' + valor.slice(2);
  }
  
  // PASSO 5: Adicionar a segunda barra após 5 caracteres (mês)
  // Exemplo: "12/345" → "12/34/5"
  if (valor.length > 5) {
    valor = valor.slice(0, 5) + '/' + valor.slice(5);
  }
  
  // PASSO 6: Limitar a 10 caracteres no total (dd/mm/aaaa)
  // Exemplo: "12/34/56789" → "12/34/5678"
  if (valor.length > 10) {
    valor = valor.slice(0, 10);
  }

  // PASSO 7: Atualizar o valor do campo com a máscara aplicada
  evento.target.value = valor;
  // Resultado visual para o usuário: ao digitar "15032020", vê automaticamente "15/03/2020"
});


// ============================================================================
// CADASTRO: CONTROLAR SUBMIT DO FORMULÁRIO
// ============================================================================

// PASSO 1: Obter referência ao formulário
const formularioFruteira = document.getElementById('formularioFruteira');

// PASSO 2: Adicionar listener para o evento 'submit'
// onsubmit é disparado quando o usuário clica em "Salvar" (botão type="submit")
formularioFruteira.onsubmit = (evento) => {
  
  // PASSO 3: Prevenir o comportamento padrão do formulário
  // Por padrão, formulários HTML recarregam a página ao serem submetidos
  // preventDefault() cancela esse comportamento, permitindo processar os dados via JavaScript
  evento.preventDefault();
  
  // Log no console para debug (confirma que o evento foi capturado)
  console.log('Controlando a submissão do formulário');

  // ========================================
  // CAPTURAR VALORES DOS CAMPOS
  // ========================================
  
  // Para cada campo, fazemos 2 passos:
  // 1. Obter referência ao elemento HTML pelo ID
  // 2. Extrair o valor digitado pelo usuário (.value)
  
  const campoNomePopular = document.getElementById('nomePopular');
  const nomePopular = campoNomePopular.value;

  const campoNomeCientifico = document.getElementById('nomeCientifico');
  const nomeCientifico = campoNomeCientifico.value;

  const campoProducaoMedia = document.getElementById('producaoMedia');
  const producaoMedia = campoProducaoMedia.value;

  const campoDataPlantio = document.getElementById('dataPlantio');
  const dataPlantio = campoDataPlantio.value;

  // ========================================
  // CRIAR OBJETO DA FRUTEIRA
  // ========================================
  
  // Montamos um objeto JavaScript com todas as informações
  const fruteiraJson = {
    // IDENTIFICADOR ÚNICO: gerado automaticamente usando Date.now()
    // Date.now() retorna o número de milissegundos desde 01/01/1970 (Unix Epoch)
    // Como esse número aumenta a cada milissegundo, garante IDs únicos
    // Exemplo: 1739827351234
    id: Date.now(),
    
    // Dados digitados pelo usuário
    nomePopular: nomePopular,
    nomeCientifico: nomeCientifico,
    producaoMedia: producaoMedia,
    dataPlantio: dataPlantio,
  };

  // ========================================
  // PERSISTIR NO LOCALSTORAGE
  // ========================================
  
  // PASSO 1: Adicionar a nova fruteira ao array em memória
  // push() adiciona um elemento no final do array
  fruteiras.push(fruteiraJson);

  // PASSO 2: Salvar o array atualizado no LocalStorage
  // LocalStorage só aceita strings, então usamos JSON.stringify() para converter
  // JSON.stringify() transforma o array JavaScript em uma string JSON
  // Exemplo: [{id: 123, nome: "Manga"}] → '{"id":123,"nome":"Manga"}'
  localStorage.setItem('fruteiras', JSON.stringify(fruteiras));
  // Agora os dados estão persistidos e sobrevivem ao fechamento do navegador!

  // ========================================
  // ATUALIZAR A INTERFACE
  // ========================================
  
  // PASSO 1: Inserir o card da nova fruteira na tela
  // Isso adiciona visualmente o card sem precisar recarregar a página
  inserirCard(fruteiraJson);

  // PASSO 2: Fechar o modal automaticamente
  // getInstance obtém a instância do modal Bootstrap já criada
  // hide() é o método que fecha o modal com animação
  const modal = bootstrap.Modal.getInstance(document.getElementById('modalFruteira'));
  modal.hide();

  // PASSO 3: Limpar o formulário
  // reset() limpa todos os campos do formulário, deixando-os vazios
  // Isso prepara o formulário para um novo cadastro futuro
  formularioFruteira.reset();
  
  // FIM DO PROCESSO DE CADASTRO
  // O usuário agora vê o novo card na listagem, o modal está fechado e o formulário limpo
};


// ============================================================================
// EXCLUSÃO: REMOVER UMA FRUTEIRA
// ============================================================================

/**
 * Remove uma fruteira do sistema (memória, LocalStorage e interface)
 * 
 * @param {number} id - ID único da fruteira a ser excluída
 */
const excluirFruteira = (id) => {
  
  // PASSO 1: Pedir confirmação ao usuário
  // confirm() exibe uma caixa de diálogo nativa do navegador com OK/Cancelar
  // Retorna true se o usuário clicar em OK, false se clicar em Cancelar
  const confirmacao = confirm('Deseja realmente excluir esta fruteira?');
  
  // PASSO 2: Se o usuário cancelar, interromper a função
  // return sai da função sem executar o código abaixo
  if (!confirmacao) {
    return; // Não faz nada, fruteira não será excluída
  }

  // ========================================
  // REMOVER DO ARRAY EM MEMÓRIA
  // ========================================
  
  // filter() cria um novo array contendo apenas os elementos que passam no teste
  // Para cada fruteira do array, verifica: fruteira.id !== id
  // Se o ID for diferente, mantém no array; se for igual, remove
  // Exemplo: array = [{id:1}, {id:2}, {id:3}], id=2
  // Resultado: [{id:1}, {id:3}] (removeu o elemento com id=2)
  fruteiras = fruteiras.filter(fruteira => fruteira.id !== id);

  // ========================================
  // ATUALIZAR O LOCALSTORAGE
  // ========================================
  
  // Salvar o array atualizado (sem a fruteira excluída) no LocalStorage
  localStorage.setItem('fruteiras', JSON.stringify(fruteiras));

  // ========================================
  // REMOVER O CARD DA TELA
  // ========================================
  
  // PASSO 1: Buscar o elemento HTML do card pelo ID
  // O ID do card segue o padrão: "card-" + id da fruteira
  // Exemplo: se id=1739827351234, busca por "card-1739827351234"
  const card = document.getElementById(`card-${id}`);
  
  // PASSO 2: Se o card foi encontrado, removê-lo do DOM
  if (card) {
    // remove() é um método nativo que remove o elemento do documento HTML
    card.remove();
  }

  // PASSO 3: Log no console para debug
  console.log(`Fruteira com ID ${id} excluída com sucesso`);
  
  // FIM DO PROCESSO DE EXCLUSÃO
  // A fruteira foi removida da memória, do LocalStorage e da interface visual
};


// ============================================================================
// EVENT DELEGATION: ESCUTAR CLIQUES EM BOTÕES DE EXCLUIR
// ============================================================================

// Por que usar Event Delegation?
// Os cards são criados dinamicamente (via JavaScript), então não existem quando
// a página carrega. Se tentássemos adicionar listeners diretamente aos botões,
// não funcionaria porque eles ainda não existem no momento da execução do script.
// 
// Solução: adicionar um único listener no documento inteiro que "escuta" todos os cliques.
// Quando um clique acontece, verificamos se foi em um botão de excluir.

// Adicionar listener de clique no documento inteiro
document.addEventListener('click', (evento) => {
  // evento.target é o elemento que foi clicado
  
  // Verificar se o elemento clicado tem a classe 'btn-excluir'
  // classList.contains() retorna true se a classe existir no elemento
  if (evento.target.classList.contains('btn-excluir')) {
    
    // PASSO 1: Obter o ID da fruteira armazenado no atributo data-id
    // getAttribute() busca o valor de um atributo HTML
    // parseInt() converte a string para número inteiro
    const id = parseInt(evento.target.getAttribute('data-id'));
    
    // PASSO 2: Chamar a função de exclusão passando o ID
    excluirFruteira(id);
  }
  // Se o clique não foi em um botão de excluir, não faz nada
});


// ============================================================================
// FIM DO ARQUIVO - APLICAÇÃO PRONTA PARA USO
// ============================================================================
// Ao carregar esta página:
// 1. Os dados são carregados do LocalStorage
// 2. Os cards são criados e exibidos
// 3. O formulário fica pronto para novos cadastros
// 4. Os botões de excluir estão funcionando via event delegation
// 5. A máscara de data está ativa no campo de data
// ============================================================================


  
