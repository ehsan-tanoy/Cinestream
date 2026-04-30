const API_KEY = "d24074791ab99994324a6950e6e0a31a";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const params = new URLSearchParams(window.location.search);

const query = params.get("query");
const genre = params.get("genre");
const lang = params.get("lang");
const provider = params.get("provider");

const grid = document.getElementById("resultGrid");
const title = document.getElementById("resultTitle");
const noResult = document.getElementById("noResult");

let page = 1;
let loading = false;
let allowInfinite = false;

if (genre || lang || provider) {
  allowInfinite = true;
}

const GENRE_MAP = {
  action: 10759,
  adventure: 16,
  animation: 16,
  documentary: 99,
  drama: 18,
  family: 10751,
  thriller: 53,
  history: 36,
  mystery: 9648,
  science_fiction: 878,
  war: 10752,
  western: 37,
  horror: 27,
  comedy: 35,
  anime: 16,
  romance: 10749,
  crime: 80
};

const PROVIDER_NAMES = {
  213: "Netflix Originals",
  1024: "Prime Video Originals",
  2552: "Apple TV+ Originals",
  2739: "Disney+ Originals",
  453: "Hulu Originals",
  49: "HBO Max Originals",
  2139: "Hoichoi Originals",
  3234: "Bongo Originals",
  5926: "Chorki Originals"
};

async function loadResults(append = false) {

  if (loading) return;

  loading = true;

  document.getElementById("loader").classList.remove("hidden");

  let url = "";

  if (query) {

    title.textContent = `Search results for \"${query}\"`;

    url = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${query}&page=${page}`;
  }

  if (genre) {

    title.textContent = `${genre} Series`;

    if (genre === "anime") {

      url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&page=${page}`;

    } else {

      url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=${GENRE_MAP[genre.toLowerCase()]}&page=${page}`;
    }
  }

  if (lang) {

    const langNames = {
      en: "English",
      hi: "Hindi",
      bn: "Bangla",
      ta: "Tamil",
      ja: "Japanese"
    };

    title.textContent = `${langNames[lang]} Series`;

    url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_original_language=${lang}&page=${page}`;
  }

  if (provider) {

    title.textContent = PROVIDER_NAMES[provider] || "OTT Originals";

    url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_networks=${provider}&sort_by=popularity.desc&page=${page}`;
  }

  try {
  if (!url) return;

    const res = await fetch(url);
    const data = await res.json();

    if (!append) {
      grid.innerHTML = "";
      noResult.style.display = "none";

    }

    if (!data.results || data.results.length === 0) {

      noResult.style.display = "block";
      loading = false;

      document.getElementById("loader").classList.add("hidden");

      return;
    }

    noResult.style.display = "none";

    data.results.forEach(show => {
    
      
    
      grid.appendChild(createCard(show));
    });

  } catch (err) {
    console.error("Series result error", err);
  }

  document.getElementById("loader").classList.add("hidden");

  loading = false;
}

/* 🔐 LOAD WATCHLIST */
function getWatchlist() {
  return JSON.parse(localStorage.getItem("watchlist")) || [];
}

/* 💾 SAVE */
function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));
}

/* 🔍 CHECK */
function isInWatchlist(id) {
  return getWatchlist().some(m => m.id == id);
}

/* 🔄 TOGGLE */
function toggleWatchlist(show) {
  let list = getWatchlist();

  if (isInWatchlist(show.id)) {
    list = list.filter(m => m.id != show.id);
  } else {
    list.unshift({
      id: show.id,
      type: "Series",
      title: show.name,
      poster: show.poster_path,
      year: series.first_air_date?.split("-")[0],
      rating: show.vote_average
    });
  }

  saveWatchlist(list);
  
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = "toast";

  toast.classList.add(type, "show");

  clearTimeout(toast._timer);

  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function createCard(show) {

 

  const div = document.createElement("div");

  div.className = "movie-card";

  div.innerHTML = `
    <img loading="lazy"
      src="${show.poster_path ? IMG_URL + show.poster_path : 'blank_poster.png'}"
      onerror="this.onerror=null; this.src='blank_poster.png';" />

    <div class="badge left">
      Series
    </div>

    <div class="badge right">
      ${show.vote_average?.toFixed(1) || 'N/A'}
    </div>
    <div class="bookmark-btn">
  <img class="bookmark-icon" src="icons/bookmark-outline.svg" />
</div>
    <div class="overlay">
      <h3>${show.name}</h3>
      <p>${(show.first_air_date || "").split("-")[0]}</p>
    </div>
  `;


  /* 🔐 WATCHLIST SYSTEM */
  const bookmark = div.querySelector(".bookmark-btn");
  const bookmarkIcon = div.querySelector(".bookmark-icon");

  // check existing
  if (isInWatchlist(show.id)) {
    bookmarkIcon.src = "icons/bookmark-filled.svg";
    bookmark.classList.add("active");
}
    
    
    
    
  bookmark.addEventListener("click", (e) => {
  e.stopPropagation();

  const already = isInWatchlist(show.id);

  toggleWatchlist(show);

  if (already) {
    bookmarkIcon.src = "icons/bookmark-outline.svg";  
    bookmark.classList.remove("active");
    showToast("Removed watchlist successfully!", "remove");
  } else {
    bookmarkIcon.src = "icons/bookmark-filled.svg";
    bookmark.classList.add("active");
  
       
    showToast('Added to watchlist successfully!', "success");
  }

});
   

  div.onclick = () => {
    window.location.href = `series-details.html?id=${show.id}`;
  };

  return div;
}

window.addEventListener("scroll", () => {

  if (!allowInfinite) return;

  if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 1000
  ) {

    if (!loading) {
      page++;
      loadResults(true);
    }
  }
});

loadResults();