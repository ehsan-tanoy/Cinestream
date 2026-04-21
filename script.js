const API_KEY = "d24074791ab99994324a6950e6e0a31a";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const HERO_API = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;
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
}
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
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" onerror="this.onerror=null; this.src='blank_poster.png';"/>
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


let heroIndex = 1;
let heroMovies = [];
let heroInterval;

/* 🎬 LOAD HERO */
async function loadHero() {
  const res = await fetch(HERO_API);
  const data = await res.json();

  heroMovies = data.results.slice(0, 12);

  const wrapper = document.getElementById("heroWrapper");
  wrapper.innerHTML = "";

  // 🔁 CLONE for seamless loop
  const first = heroMovies[0];
  const last = heroMovies[heroMovies.length - 1];

  const loopData = [last, ...heroMovies, first];

  loopData.forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("hero-card");

    card.innerHTML = `
      <img src="${movie.poster_path 
      ? IMG_URL + movie.poster_path 
      : 'blank_poster.png'}" 
    alt="Movie Poster"
    onerror="this.onerror=null; this.src='blank_poster.png';" />

      <div class="hero-badge">
        ${movie.vote_average.toFixed(1)}
      </div>
      <div class="hero-play-btn">
  <span class="material-icons">play_arrow</span>
</div>
      <div class="hero-overlay">
        <div class="hero-title">${movie.title}</div>
        <div class="hero-meta">${(movie.release_date || "").split("-")[0]}</div>
        <div class="overlay-btn">
            <button class="overlay-left">Details
               
            </button>
            <button class="overlay-right">Watch Now
            
            </button>
        </div>
      </div>
    `;

    wrapper.appendChild(card);
    
    card.addEventListener("click", () => {
  window.location.href = `details.html?id=${movie.id}`;
});
  });

  // start from real first
  setTimeout(() => {
    const cardWidth = wrapper.children[0].offsetWidth + 14;
    wrapper.scrollLeft = cardWidth;
  }, 100);

  startAutoScroll();
}
  


/* 👉 MOVE SLIDE */
const wrapper = document.getElementById("heroWrapper");

let startX = 0;
let endX = 0;
let isDragging = false;

/* 📏 GET CARD WIDTH */
function getCardWidth() {
  return wrapper.children[0].offsetWidth + 14;
}

/* 👉 MOVE SLIDE (unchanged core) */
function moveSlide(direction = 1) {
  const cardWidth = getCardWidth();

  heroIndex += direction;

  wrapper.scrollTo({
    left: heroIndex * cardWidth,
    behavior: "smooth"
  });

  setTimeout(() => {
    if (heroIndex === heroMovies.length + 1) {
      wrapper.scrollTo({ left: cardWidth, behavior: "auto" });
      heroIndex = 1;
    }

    if (heroIndex === 0) {
      wrapper.scrollTo({
        left: heroMovies.length * cardWidth,
        behavior: "auto"
      });
      heroIndex = heroMovies.length;
    }
  }, 400);
}

/* 🖐️ TOUCH START */
wrapper.addEventListener("touchstart", (e) => {
  clearInterval(heroInterval);
  startX = e.touches[0].clientX;
  isDragging = true;
});

/* 🖐️ TOUCH MOVE (prevent over scroll feel) */
wrapper.addEventListener("touchmove", (e) => {
  if (!isDragging) return;
  endX = e.touches[0].clientX;
});

/* 🖐️ TOUCH END (SNAP LOGIC) */
wrapper.addEventListener("touchend", () => {
  isDragging = false;

  const diff = startX - endX;
  const threshold = 50; // swipe sensitivity

  if (Math.abs(diff) > threshold) {
    // 🔥 Only ONE card move (no matter swipe speed)
    if (diff > 0) {
      moveSlide(1); // next
    } else {
      moveSlide(-1); // prev
    }
  } else {
    // 🔒 Snap back to current card if small swipe
    const cardWidth = getCardWidth();

    wrapper.scrollTo({
      left: heroIndex * cardWidth,
      behavior: "smooth"
    });
  }

  // 🔁 resume auto
  startAutoScroll();
});

/* 🔄 AUTO */
function startAutoScroll() {
  clearInterval(heroInterval);

  heroInterval = setInterval(() => {
    moveSlide(1);
  }, 5000);
}

/* 🖱️ BUTTON EVENTS 


*/
document.getElementById("heroNext").onclick = () => {
  moveSlide(1);
};

document.getElementById("heroPrev").onclick = () => {
  moveSlide(-1);
};

/* 🖐️ TOUCH PAUSE */


/* 🚀 INIT */
loadHero();

let newPage = 1;
let loading = false;

/* 🎯 FETCH FUNCTION */
async function fetchMovies(url, containerId, append = false) {
  if (loading) return;
  loading = true;

  document.getElementById("loader").classList.remove("hidden");

  const res = await fetch(url);
  const data = await res.json();

  const container = document.getElementById(containerId);

  if (!append) container.innerHTML = "";

  data.results.forEach(movie => {
    const card = createCard(movie);
    container.appendChild(card);
  });

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
function toggleWatchlist(movie) {
  let list = getWatchlist();

  if (isInWatchlist(movie.id)) {
    list = list.filter(m => m.id != movie.id);
  } else {
    list.push({
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

/* 🎥 CREATE CARD */
function createCard(movie) {
  const div = document.createElement("div");
  div.classList.add("movie-card");

  div.innerHTML = `
    <img loading="lazy" src="${movie.poster_path 
      ? IMG_URL + movie.poster_path 
      : 'blank_poster.png'}" 
    alt="Movie Poster"
    onerror="this.onerror=null; this.src='blank_poster.png';" />

    <div class="badge left shimmer">
  ${GENRE_MAP[movie.genre_ids?.[0]] || "Movie"}
</div>
    <div class="badge right">${movie.vote_average?.toFixed(1) || "N/A"}</div>


<div class="bookmark-btn">
      <span class="material-symbols-rounded">bookmark</span>
    </div>
    
    <div class="overlay">
      <h3>${movie.title || movie.name}</h3>
      <p>${(movie.release_date || "").split("-")[0]}</p>
    </div>
  `;
  
  /* 🔐 WATCHLIST SYSTEM */
  const bookmark = div.querySelector(".bookmark-btn");
  const bookmarkIcon = div.querySelector(".bookmark-btn span");

  // check existing
  if (isInWatchlist(movie.id)) {
    bookmark.classList.add("active");
    }
    
    
  bookmark.addEventListener("click", (e) => {
  e.stopPropagation();

  const already = isInWatchlist(movie.id);

  toggleWatchlist(movie);

  if (already) {
    bookmark.classList.remove("active");
    showToast("Removed from watchlist", "remove");
  } else {
    bookmark.classList.add("active");
    showToast("Added to watchlist successfully", "success");
  }

});
   
    
  


  
  // 🔥 CLICK EVENT
  div.addEventListener("click", () => {
    window.location.href = `details.html?id=${movie.id}`;
  });
  
  return div;
}

/* 🔥 LOAD TRENDING (30 MOVIES ONLY) */
async function loadTrending() {
  const container = document.getElementById("trending");
  container.innerHTML = "";

  // Page 1 + Page 2 = ~40 movies → we slice 30
  const res1 = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=1`);
  const res2 = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=2`);

  const data1 = await res1.json();
  const data2 = await res2.json();

  const combined = [...data1.results, ...data2.results].slice(0, 30);

  combined.forEach(movie => {
    container.appendChild(createCard(movie));
  });
}

/* 🔥 LOAD NEW RELEASES */
function loadNew(page = 1, append = false) {
  fetchMovies(
    `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&page=${page}`,
    "new",
    append
  );
}

const scrollBtn = document.getElementById("scrollTopBtn");

/* 👀 SHOW / HIDE */
window.addEventListener("scroll", () => {
  if (window.scrollY > 1400) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
});

/* ⬆️ SCROLL TO TOP */
scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


/* 🚀 INITIAL LOAD */
loadTrending();
loadNew();

/* 🔄 INFINITE SCROLL ONLY FOR NEW RELEASE */
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    newPage++;
    loadNew(newPage, true);
  }
});


