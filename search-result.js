const API_KEY = "d24074791ab99994324a6950e6e0a31a";
const IMG_URL = "https://image.tmdb.org/t/p/w500";


document.querySelector(".logo").onclick = () => {
  window.location.href = "index.html";
}  ;

const menuBtn =document.querySelector("#menu");
const menuPage =document.querySelector("#menuPage");

const overlay =document.querySelector(".menu-overlay");


menuBtn.onclick = () => {
  menuPage.style.left ="8px";
  overlay.classList.add("active");
};
const wList = document.querySelector("#wList");

wList.onclick = () => {
  window.location.href = "watchlist.html";
  console.log("hi");
};

overlay.onclick = () => {
   menuPage.style.left ="-200px";
  overlay.classList.remove("active"); 
};

function goGenre(genre) {
  window.location.href = `search-result.html?genre=${genre}`;
}


const GENRE_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

const grid = document.getElementById("resultGrid");
const title = document.getElementById("resultTitle");
const noResult = document.getElementById("noResult");

/* 🎯 GET PARAMS */
const params = new URLSearchParams(window.location.search);
const query = params.get("query");
const genre = params.get("genre");

/* 🎬 LOAD */
async function loadResults() {
  let url = "";

  if (query) {
    title.textContent = `Search results for "${query}"`;

    url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`;
  }

  if (genre) {
    title.textContent = `${genre} Movies`;

    // example genre mapping
    const GENRE_MAP = {
      action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  science_fiction: 878,
  thriller: 53,
  war: 10752,
  western: 37,
  tv_movie: 10770,
  anime: 16
    };

    url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${GENRE_MAP[genre.toLowerCase()]}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  grid.innerHTML = "";

  if (!data.results || data.results.length === 0) {
    noResult.style.display = "block";
    return;
  }

  noResult.style.display = "none";

  data.results.forEach(movie => {
    const div = document.createElement("div");
    div.classList.add("movie-card");

    div.innerHTML = `
      <img src="${IMG_URL + movie.poster_path}" />
      <div class="overlay">
        <h3>${movie.title}</h3>
      </div>
    `;

    div.onclick = () => {
      window.location.href = `details.html?id=${movie.id}`;
    };

    grid.appendChild(div);
  });
}

loadResults();

/* 🔙 LOGO BACK */
document.querySelector(".logo").onclick = () => {
  window.history.back();
};
