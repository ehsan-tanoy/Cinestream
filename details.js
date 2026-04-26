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


const searchToggleBtn = document.getElementById("homeSearchBtn"); // header btn
const floatingSearch = document.getElementById("floatingSearch");

const homeInput = document.getElementById("homeSearchInput");
const homeBtn = document.getElementById("rightSearchBtn");
const homeLive = document.getElementById("homeLiveResults");

let isSearchOpen = false;
let debounceTimer;
const icon = document.querySelector("#homeSearchBtn .icon");

/* 🔍 TOGGLE */
searchToggleBtn.addEventListener("click", () => {
  isSearchOpen = !isSearchOpen;

  floatingSearch.classList.toggle("active");

  if (isSearchOpen) {
    icon.textContent = "close";
    homeInput.focus();
  } else {
    icon.textContent = "search";
    homeInput.value = "";
    homeLive.style.display = "none";
  }
});


homeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = homeInput.value.trim();

    if (!query) return;

    window.location.href = `search-result.html?query=${query}`;
  }
});


/* LIVE SEARCH */
homeInput.addEventListener("input", () => {
  const query = homeInput.value.trim();

  clearTimeout(debounceTimer);

  if (!query) {
    homeLive.style.display = "none";
    return;
  }

  debounceTimer = setTimeout(() => {
    fetchLiveHome(query);
  }, 300);
});

async function fetchLiveHome(query) {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`
  );

  const data = await res.json();

  homeLive.innerHTML = "";
  homeLive.style.display = "block";

  data.results.slice(0, 15).forEach(movie => {
    const div = document.createElement("div");
    div.classList.add("live-item");

    div.innerHTML = `
      <img src=" https://image.tmdb.org/t/p/w200${movie.poster_path}" 
    
    onerror="this.onerror=null; this.src='blank_poster.png';" />
      <p>${movie.title}</p>
    `;



    div.onclick = () => {
      window.location.href = `details.html?id=${movie.id}`;
    };

    homeLive.appendChild(div);
  });
}

homeBtn.addEventListener("click", () => {
  const query = homeInput.value.trim();
  if (!query) return;

  window.location.href = `search-result.html?query=${query}`;
});


function showDetailsSkeleton() {
  const container = document.getElementById("details");

  container.innerHTML = `
    <div class="details-skeleton">

      <div class="details-skeleton-hero skeleton-shimmer"></div>

      <div class="details-skeleton-title skeleton-shimmer"></div>
      <div class="details-skeleton-meta skeleton-shimmer"></div>

     <div class="details-skeleton-meta skeleton-shimmer"></div>


      <div class="details-skeleton-text skeleton-shimmer"></div>
      <div class="details-skeleton-text skeleton-shimmer"></div>
      <div class="details-skeleton-text skeleton-shimmer"></div>
      <div class="details-skeleton-text skeleton-shimmer"></div>
      <div class="details-skeleton-text short skeleton-shimmer"></div>
      
      <div class="details-skeleton-btns">
        <div class="details-skeleton-btn skeleton-shimmer"></div>
        <div class="details-skeleton-btn skeleton-shimmer"></div>
      </div>

      <div class="details-skeleton-cast">
        ${Array(5).fill(`
          <div class="details-skeleton-cast-card">
            <div class="details-skeleton-avatar skeleton-shimmer"></div>
            <div class="details-skeleton-name skeleton-shimmer"></div>
          </div>
        `).join("")}
      </div>

    </div>
  `;
}

const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");

/* 🎬 FETCH ALL DATA */
async function loadDetails() {

showDetailsSkeleton();

  const [detailsRes, creditsRes, videoRes, similarRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`),
    fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`),
    fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`),
    fetch(`https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}`)
  ]);

  const movie = await detailsRes.json();
  const credits = await creditsRes.json();
  const videos = await videoRes.json();
  const similar = await similarRes.json();

  renderDetails(movie, credits.cast, videos.results, similar.results);
}

/* 🎨 RENDER */
function renderDetails(movie, cast, videos, similar) {
  const container = document.getElementById("details");

  // 🎬 trailer (get first YouTube trailer)
  const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube");
  
  

  container.innerHTML = `
    <div class="details-hero">
      <img src="https://image.tmdb.org/t/p/w780${movie.backdrop_path}" />
    </div>

    <div class="details-content">
      <h1>${movie.title}</h1>
      
      <div class="det2">
          <h4>⭐ ${movie.vote_average.toFixed(1)} | ${movie.release_date}</h4>
          
          <div class="watchlist-con" id="watchCont">
      
      <button class="watchlist-btn" id="watchlistBtn">
  <img class="bookmark-icon" src="icons/bookmark-outline.svg" />
</button>


  </div>
      </div>
      
      
  
  
      
      <div class="genres"> 
         
  ${movie.genres.map(g => `<span>${g.name}</span>`).join("")}
</div>
      
      <p>${movie.overview}</p>

     <button class="play-btn" style="font-family:Inter;font-weight:bold;font-size:16px">
   <span class="material-symbols-rounded" style="font-size: 34px">
play_arrow
</span>
  Watch Now
      
      </button>
      <button class="download-btn" style="font-family:Inter;font-weight:bold;font-size:16px">
          <span class="material-symbols-rounded">
download
</span>
          Download</button>

      ${
        trailer
          ? `
        <div class="trailer">
          <h3>Trailer</h3>
          <iframe 
            src="https://www.youtube.com/embed/${trailer.key}" 
            frameborder="0" 
            allowfullscreen>
          </iframe>
        </div>
      `
          : ""
      }

      <div class="cast-section">
        <h3>Cast</h3>
        <div class="cast-row">
          ${cast.slice(0, 10).map(actor => `
            <div class="cast-card">
              <img src="${actor.profile_path ? IMG_URL + actor.profile_path : 'default-cast.jpeg'}" />
              <p>${actor.name}</p>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="similar-section">
        <h3>You may like</h3>
        <div class="similar-row">
          ${similar.slice(0, 12).map(m => `
            <div class="similar-card" onclick="goToMovie(${m.id})">
              <img src="${m.poster_path 
      ? IMG_URL + m.poster_path 
      : 'blank_poster.png'}" 
    alt="Movie Poster"
    onerror="this.onerror=null; this.src='blank_poster.png';"/>
              
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  
  const bookmark = document.getElementById("watchlistBtn");
  const bookmarkIcon = document.querySelector(".bookmark-icon");
  const bookmarkCont = document.querySelector(".watchlist-con");
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
function toggleWatchlist(movie) {
  let list = getWatchlist();

  if (isInWatchlist(movie.id)) {
    list = list.filter(m => m.id != movie.id);
  } else {
    list.unshift({
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path,
      year: movie.release_date?.split("-")[0],
      rating: movie.vote_average
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

/* 🎯 UPDATE ICON */
function updateWatchBtn(id) {
  const already = isInWatchlist(id);

  if (already) {
    bookmarkIcon.src = "icons/bookmark-filled.svg";
    bookmarkCont.classList.add("active");
  } else {
    bookmarkIcon.src = "icons/bookmark-outline.svg";
    bookmarkCont.classList.remove("active");
  }
}
  updateWatchBtn(movie.id);

bookmark.onclick = () => {

  const already = isInWatchlist(movie.id);

  toggleWatchlist(movie);
  updateWatchBtn(movie.id);

  if (already) {
    showToast("Removed from watchlist", "remove");
  } else {
    showToast("Added to watchlist successfully", "success");
  }
};
  
}

/* 🔁 NAVIGATE */
function goToMovie(id) {
  window.location.href = `details.html?id=${id}`;
}
  
loadDetails();
//showDetailsSkeleton();
