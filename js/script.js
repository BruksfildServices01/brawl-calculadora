// Caminho para o arquivo JSON com os personagens
const JSON_URL = 'data/personagens.json';

// Seleciona os elementos do DOM
const danoInput = document.getElementById('danoInput');
const calcularBtn = document.getElementById('calcularBtn');
const resultadoSection = document.getElementById('resultado');

// Valor de dano padrão
const DEFAULT_DAMAGE = 2600;

// Função para carregar o arquivo JSON
async function carregarPersonagens() {
  try {
    const response = await fetch(JSON_URL);
    if (!response.ok) {
      throw new Error('Não foi possível carregar o arquivo JSON.');
    }
    const data = await response.json();
    return data; // Retorna o array de personagens
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Função para calcular quantos hits são necessários
function calcularHits(hp, dano) {
  return Math.ceil(hp / dano);
}

// Função principal para processar os dados
async function processarCalculo(dano) {
  // Carrega a lista de personagens
  const personagens = await carregarPersonagens();

  // Se não houver personagens, apenas encerra
  if (!personagens.length) {
    resultadoSection.innerHTML = '<p>Não há personagens disponíveis.</p>';
    return;
  }

  // 1. Calcula hits para cada personagem
  const personagensComHits = personagens.map(personagem => {
    const hits = calcularHits(personagem.hp, dano);
    return {
      ...personagem,
      hitsNecessarios: hits
    };
  });

  // 2. Agrupa personagens por hits necessários
  const gruposMap = {};

  personagensComHits.forEach(personagem => {
    const hits = personagem.hitsNecessarios;
    if (!gruposMap[hits]) {
      gruposMap[hits] = [];
    }
    gruposMap[hits].push(personagem);
  });

  // 3. Ordena cada grupo por HP crescente
  for (let hitsKey in gruposMap) {
    gruposMap[hitsKey].sort((a, b) => a.hp - b.hp);
  }

  // 4. Limpa a seção de resultados antes de inserir os novos grupos
  resultadoSection.innerHTML = '';

  // 5. Ordena os grupos pela quantidade de hits
  const gruposOrdenados = Object.keys(gruposMap)
    .map(Number)
    .sort((a, b) => a - b);

  // 6. Cria o layout para cada grupo
  gruposOrdenados.forEach(hits => {
    const grupoElement = document.createElement('div');
    grupoElement.classList.add('grupo-hits');

    const tituloElement = document.createElement('h2');
    tituloElement.classList.add('grupo-titulo');
    tituloElement.textContent = `${hits} Hit${hits > 1 ? 's' : ''}`;
    grupoElement.appendChild(tituloElement);

    const listaElement = document.createElement('div');
    listaElement.classList.add('personagens-lista');

    gruposMap[hits].forEach(personagem => {
      const itemElement = document.createElement('div');
      itemElement.classList.add('personagem-item');

      const imgElement = document.createElement('img');
      imgElement.src = `img/${personagem.emoji}`;
      imgElement.alt = personagem.nome;
      itemElement.appendChild(imgElement);

      const nomeElement = document.createElement('div');
      nomeElement.classList.add('personagem-nome');
      nomeElement.textContent = personagem.nome;
      itemElement.appendChild(nomeElement);

      const hpElement = document.createElement('div');
      hpElement.classList.add('personagem-hp');
      hpElement.textContent = `HP: ${personagem.hp}`;
      itemElement.appendChild(hpElement);

      listaElement.appendChild(itemElement);
    });

    grupoElement.appendChild(listaElement);
    resultadoSection.appendChild(grupoElement);
  });
}

// Ao carregar o DOM, definimos o valor padrão e calculamos automaticamente
document.addEventListener('DOMContentLoaded', () => {
  // Define o valor padrão no input
  danoInput.value = DEFAULT_DAMAGE;
  
  // Chama a função de cálculo com o valor padrão
  processarCalculo(DEFAULT_DAMAGE);
});

// Evento de clique do botão para recalcular caso o usuário mude o valor
calcularBtn.addEventListener('click', () => {
  const danoValor = parseInt(danoInput.value, 10);
  if (!danoValor || danoValor <= 0) {
    alert('Por favor, insira um valor de dano válido.');
    return;
  }
  processarCalculo(danoValor);
});
