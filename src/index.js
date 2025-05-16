// src/index.js
import './style.css';
const searchInput = document.getElementById('searchInput');
const animeList = document.getElementById('animeList');
const loadingEl = document.getElementById('loading');

let allAnimes = [];

// Buat card notifikasi
function createNotification(message) {
  const notificationCard = document.createElement('div');
  notificationCard.classList.add('notification-card');
  notificationCard.innerHTML = `<p>${message}</p>`;
  searchInput.insertAdjacentElement('afterend', notificationCard);
}

// Fungsi untuk menampilkan atau menyembunyikan loading
function showLoading(show = true) {
  loadingEl.style.display = show ? 'block' : 'none';
}

// Fungsi untuk merender daftar anime
function renderAnimeList(animes) {
  animeList.innerHTML = "";

  if (animes.length === 0) {
    animeList.innerHTML = "<p>Tidak ada anime dengan link download.</p>";
    return;
  }

  animes.slice(0, 20).forEach(({ anime, linkDownload }) => {
    const animeCard = document.createElement('div');
    animeCard.classList.add('anime-card');
    animeCard.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}" />
      <div class="anime-info">
        <div class="status-tag">${anime.status || 'Unknown'}</div>
        <div class="title">${anime.title}</div>
        <div class="ratings">★ ${anime.score || '-'} • ${anime.episodes || '?'} Eps</div>
        <div class="genre-tags">
          ${anime.genres.slice(0, 2).map(g => `<div class="genre-tag">${g.name}</div>`).join('')}
        </div>
        <a href="${linkDownload}" target="_blank" class="download-btn">Download</a>
      </div>
    `;
    animeList.appendChild(animeCard);
  });
}

// Fetch data dari API
function fetchAnimeData() {
  showLoading(true);
  fetch('https://gist.githubusercontent.com/akiraxzz/b2bf2fbcf5b92e9219d43096ab7ed1c9/raw/c09c2a0819291e24103c16e84671c83359e91294/downloads.json')
    .then(res => res.json())
    .then(downloads => {
      const ids = Object.keys(downloads);
      if (ids.length === 0) {
        createNotification('Tidak ada data anime yang tersedia.');
        showLoading(false);
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
      createNotification('Gagal memuat data download.');
      showLoading(false);
    });
}

// Event listener untuk pencarian
searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const filtered = searchTerm ? allAnimes.filter(({ anime }) => anime.title.toLowerCase().includes(searchTerm)) : allAnimes;
  renderAnimeList(filtered);
});

// Inisialisasi aplikasi
createNotification('Selamat datang di MikasaDDL!');
fetchAnimeData();