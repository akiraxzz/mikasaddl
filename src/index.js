// src/index.js
import './style.css';


const animeList = document.getElementById('animeList');
const searchInput = document.getElementById('searchInput');
const loadingEl = document.getElementById('loading');

let allAnimes = [];

function renderAnimeList(animes) {
  animeList.innerHTML = "";

  if (animes.length === 0) {
    animeList.innerHTML = "<p>Tidak ada anime dengan link download.</p>";
    return;
  }

  animes.forEach(({ anime, linkDownload }) => {
    const animeCard = document.createElement('div');
    animeCard.classList.add('anime-card');

    animeCard.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
      <div class="anime-info">
        <div class="status-tag">${anime.status || 'Unknown'}</div>
        <div class="title">${anime.title}</div>
        <div class="ratings">
          <span> ID: ${anime.mal_id} &nbsp; &nbsp; &nbsp;★ ${anime.score || '-'}  &nbsp; • ${anime.episodes || '?'} Eps</span>
        </div>
        <div class="genre-tags">
          ${anime.genres.slice(0, 2).map(g => `<div class="genre-tag">${g.name}</div>`).join('')}
          ${anime.genres.length > 2 ? `<div class="genre-tag">+${anime.genres.length - 2}</div>` : ''}
        </div>
        <a href="${linkDownload}" target="_blank" class="download-btn">Download</a>
      </div>
    `;

    animeList.appendChild(animeCard);
  });
}

function showLoading(show = true) {
  loadingEl.style.display = show ? 'block' : 'none';
}

showLoading(true);

fetch('https://gist.githubusercontent.com/akiraxzz/b2bf2fbcf5b92e9219d43096ab7ed1c9/raw/1b2d38900ae8526e8282c80236da29a2f1a097b5/downloads.json')
  .then(res => res.json())
  .then(downloads => {
    const ids = Object.keys(downloads);
    if (ids.length === 0) {
      showLoading(false);
      animeList.innerHTML = "<p>Tidak ada anime dengan link download.</p>";
      return;
    }

    return Promise.all(
      ids.map(id =>
        fetch(`https://api.jikan.moe/v4/anime/${id}`)
          .then(res => res.json())
          .then(data => {
            const anime = data.data;
            return { anime, linkDownload: downloads[id] };
          })
          .catch(() => null)
      )
    ).then(results => {
      allAnimes = results.filter(item => item !== null);
      renderAnimeList(allAnimes);
      showLoading(false);
    });
  })
  .catch(() => {
    showLoading(false);
    animeList.innerHTML = "<p>Gagal memuat data download.</p>";
  });

searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm === "") {
    renderAnimeList(allAnimes);
  } else {
    const filtered = allAnimes.filter(({ anime }) =>
      anime.title.toLowerCase().includes(searchTerm)
    );
    renderAnimeList(filtered);
  }
});
