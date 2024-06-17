document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById("searchNoticia");
  const totalFiltro = document.getElementById("circuloFiltro");
  const filtroTipo = document.getElementById("filtroTipo");
  const filtroQuantidade = document.getElementById("filtroQuantidade");
  const filtroDe = document.getElementById("filtroDe");
  const filtroAte = document.getElementById("filtroAte");
  const filtro = document.getElementById("svgFiltro");
  const dialogFiltro = document.getElementById("dialogFiltro");
  const closeDialog = document.getElementById("closeDialog");
  const paginacao = document.getElementById("pag");
  const uldaNoticia = document.getElementById("main");

  filtro.addEventListener('click', () => {
    dialogFiltro.showModal();
  });

  closeDialog.addEventListener('click', () => {
    dialogFiltro.close();
  });

  function infoFiltro() {
    setFiltros();
    getQuantidadeFiltros();
    trazerInformacoesFiltradas();
  }

  infoFiltro();

  async function trazerInformacoesFiltradas() {
    const noticias = await getNoticias();
    renderizarNoticias(noticias);
    criarPaginas(noticias.totalPages, noticias.page);
  }

  async function getNoticias() {
    const url = new URL('https://servicodados.ibge.gov.br/api/v3/noticias');
    const params = new URLSearchParams(window.location.search);
    url.search = params.toString();
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

  function renderizarNoticias(noticias) {
    uldaNoticia.innerHTML = '';
    noticias.items.forEach(n => uldaNoticia.appendChild(createCard(n)));
  }

  function createCard(noticia) {
    const li = criarElementoHTML('li');
    const img = criarElementoHTML('img');
    const divTexto = criarElementoHTML('div');
    const titulo = criarElementoHTML('h2');
    const paragrafo = criarElementoHTML('p');
    const divSepararEditoriasPublicado = criarElementoHTML('div');
    const editorias = criarElementoHTML('p');
    const publicado = criarElementoHTML('p');
    const botaoLerMais = criarElementoHTML('button');
    img.src = getImagem(noticia.imagens);
    img.alt = 'Imagem da notícia';
    titulo.textContent = noticia.titulo;
    paragrafo.textContent = noticia.introducao;
    editorias.textContent = getEditorias(noticia.editorias);
    publicado.textContent = getPublicado(noticia.data_publicacao);
    divTexto.setAttribute('id', 'textoListagem');
    botaoLerMais.textContent = 'Leia mais';
    botaoLerMais.addEventListener('click', () => {
      window.open(noticia.link, '_blank');
    });
    adicionarClasses(botaoLerMais, ['width100', 'botaoNoticia']);
    adicionarClasses(divSepararEditoriasPublicado, ['flex', 'centerSpaceBetween']);
    adicionarClasses(divTexto, ['width100', 'flexColumn', 'gap10']);
    adicionarClasses(img, ['imagemNoticia']);
    adicionarClasses(li, ['cardNoticia']);
    adicionarFilho(divSepararEditoriasPublicado, editorias);
    adicionarFilho(divSepararEditoriasPublicado, publicado);
    adicionarFilho(divTexto, titulo);
    adicionarFilho(divTexto, paragrafo);
    adicionarFilho(divTexto, divSepararEditoriasPublicado);
    adicionarFilho(divTexto, botaoLerMais);
    adicionarFilho(li, img);
    adicionarFilho(li, divTexto);
    return li;
  }

  function getImagem(imagem) {
    return 'https://agenciadenoticias.ibge.gov.br/' +
      JSON.parse(!!imagem ? imagem : '{"image":{"image_intro": ""}}').image_intro;
  }

  function getEditorias(editorias) {
    return '#' + editorias.replace(';', ' #');
  }

  function getPublicado(dateString) {
    const date = new Date(dateString);
    const dateHoje = new Date();
    const diffTime = Math.abs(dateHoje - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Publicado hoje';
    } else if (diffDays === 1) {
      return 'Publicado ontem';
    } else {
      return `Publicado há ${diffDays} dias`;
    }
  }

  function criarElementoHTML(elemento) {
    return document.createElement(elemento);
  }

  function adicionarFilho(elementoPai, elementoFilho) {
    elementoPai.appendChild(elementoFilho);
  }

  function adicionarClasses(elemento, classes) {
    elemento.classList.add(...classes);
  }

  async function setFiltros() {
    const params = new URLSearchParams(window.location.search);
    filtroTipo.value = params.get('tipo') || '';
    filtroQuantidade.value = params.get('quantidade') || '10';
    filtroDe.value = params.get('de') || '';
    filtroAte.value = params.get('ate') || '';
  }

  async function aplicarFiltro(event) {
    event.preventDefault();
    dialogFiltro.close();
    const tipo = filtroTipo.value;
    const quantidade = filtroQuantidade.value;
    const de = filtroDe.value;
    const ate = filtroAte.value;
    const params = new URLSearchParams();
    if (tipo) params.set('tipo', tipo);
    if (quantidade) params.set('quantidade', quantidade);
    if (de) params.set('de', de);
    if (ate) params.set('ate', ate);
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
    infoFiltro();
  }

  function criarPaginas(totalPaginas, paginaAtual) {
    paginacao.innerHTML = '';
    const maxVisibleButtons = 10;
    let startPage, endPage;

    if (totalPaginas <= maxVisibleButtons) {
      startPage = 1;
      endPage = totalPaginas;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxVisibleButtons / 2);
      const maxPagesAfterCurrent = Math.ceil(maxVisibleButtons / 2) - 1;
      if (paginaAtual <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxVisibleButtons;
      } else if (paginaAtual + maxPagesAfterCurrent >= totalPaginas) {
        startPage = totalPaginas - maxVisibleButtons + 1;
        endPage = totalPaginas;
      } else {
        startPage = paginaAtual - maxPagesBeforeCurrent;
        endPage = paginaAtual + maxPagesAfterCurrent;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const li = criarElementoHTML('li');
      li.classList.add('pagina');
      li.textContent = i;
      if (i === paginaAtual) {
        li.classList.add('paginaAtiva');
      } else {
        li.addEventListener('click', () => mudarPagina(i));
      }
      paginacao.appendChild(li);
    }
  }

  function mudarPagina(page) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
    infoFiltro();
  }

  async function getQuantidadeFiltros() {
    const params = new URLSearchParams(window.location.search);
    const quantidadeFiltros = params.toString().split('&').length - 1;
    totalFiltro.textContent = quantidadeFiltros;
  }

  searchInput.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("buttonSearchNoticia").click();
    }
  });

  async function search(event) {
    event.preventDefault();
    const searchTerm = searchInput.value.trim();
    const params = new URLSearchParams(window.location.search);
    params.set('busca', searchTerm);
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
    infoFiltro();
  }

  document.getElementById("buttonSearchNoticia").addEventListener('click', search);
  document.getElementById("botaoFiltro").addEventListener('click', aplicarFiltro);
});
