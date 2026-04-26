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


function toggleLanguages() {
  const list = document.getElementById('languageList');
  const arrow = document.getElementById('arrow');

  list.classList.toggle('active');

  if (list.classList.contains('active')) {
    arrow.style.transform = 'rotate(180deg)';
  } else {
    arrow.style.transform = 'rotate(0deg)';
  }
}

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
function goLanguage(lang) {
  window.location.href = `search-result.html?lang=${lang}`;
}

function goAnime(genre) {
  window.location.href = "search-result.html?genre=${genre}&lang=ja";
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
let isAnimating = false;

/* 🎬 LOAD HERO */
async function loadHero() {
  showHeroSkeleton();

  const res = await fetch(HERO_API);
  const data = await res.json();

  heroMovies = data.results.slice(0, 12);

  const wrapper = document.getElementById("heroWrapper");
  wrapper.innerHTML = "";

  const first = heroMovies[0];
  const last = heroMovies[heroMovies.length - 1];
  const loopData = [
  heroMovies[heroMovies.length - 2],
  heroMovies[heroMovies.length - 1],
  ...heroMovies,
  heroMovies[0],
  heroMovies[1]
];

  loopData.forEach(movie => {
    const card = document.createElement("div");
    card.classList.add("hero-card");

    card.innerHTML = `
      <img src="${movie.poster_path 
        ? IMG_URL + movie.poster_path 
        : 'blank_poster.png'}" 
        onerror="this.onerror=null; this.src='blank_poster.png';" />
      <div class="hero-badge">${movie.vote_average.toFixed(1)}</div>
      <div class="hero-play-btn">
        <span class="material-icons">play_arrow</span>
      </div>
      <div class="hero-overlay">
        <div class="hero-title">${movie.title}</div>
        <div class="hero-meta">${(movie.release_date || "").split("-")[0]}</div>
        <div class="overlay-btn">
          <button class="overlay-left">Details</button>
          <button class="overlay-right">Watch Now</button>
        </div>
      </div>
    `;

    wrapper.appendChild(card);

    card.addEventListener("click", () => {
      window.location.href = `details.html?id=${movie.id}`;
    });
  });

  // ✅ Start from real first card (index 1, skip clone)
  requestAnimationFrame(() => {
    const cardWidth = getCardWidth();
    wrapper.scrollLeft = cardWidth * heroIndex;
  });

  initDotIndicators();
  updateDots();
  startAutoScroll();
}

/* 📏 GET CARD WIDTH (gap included) */
function getCardWidth() {
  const wrapper = document.getElementById("heroWrapper");
  const card = wrapper.children[0];
  if (!card) return 0;
  const style = getComputedStyle(wrapper);
  const gap = parseFloat(style.gap) || 14;
  return card.offsetWidth + gap;
}

/* 👉 MOVE SLIDE — smooth, full card snap */
function moveSlide(direction = 1) {
  if (isAnimating) return;
  isAnimating = true;

  const wrapper = document.getElementById("heroWrapper");
  heroIndex += direction;
  const cardWidth = getCardWidth();

  wrapper.style.scrollBehavior = "smooth";
  wrapper.scrollLeft = heroIndex * cardWidth;

  // ✅ Dot সাথে সাথে change হবে
  const realIndex = ((heroIndex - 1 + heroMovies.length) % heroMovies.length);
  const dots = document.querySelectorAll(".hero-dot");
  dots.forEach((d, i) => d.classList.toggle("active", i === realIndex));

  setTimeout(() => {
    if (heroIndex === heroMovies.length + 2) {
  wrapper.style.scrollBehavior = "auto";
  heroIndex = 2;
  wrapper.scrollLeft = cardWidth * 2;
}
if (heroIndex === 1) {
  wrapper.style.scrollBehavior = "auto";
  heroIndex = heroMovies.length + 1;
  wrapper.scrollLeft = cardWidth * (heroMovies.length + 1);
}
    isAnimating = false;
  }, 420);
}
/* 🔵 DOT INDICATORS */
function initDotIndicators() {
  let dotsContainer = document.getElementById("heroDots");
  if (!dotsContainer) return;

  dotsContainer.innerHTML = "";
  heroMovies.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.classList.add("hero-dot");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      if (isAnimating) return;
      const diff = (i + 1) - heroIndex;
      moveSlide(diff);
    });
    dotsContainer.appendChild(dot);
  });
}

function updateDots() {
  const dots = document.querySelectorAll(".hero-dot");
  const realIndex = ((heroIndex - 1 + heroMovies.length) % heroMovies.length);
  dots.forEach((d, i) => d.classList.toggle("active", i === realIndex));
}

/* 🖐️ TOUCH / SWIPE GESTURE */
const wrapper = document.getElementById("heroWrapper");
let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let isSwiping = false;
let swipeLocked = false; // lock to horizontal

wrapper.addEventListener("touchstart", (e) => {
  clearInterval(heroInterval);
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchCurrentX = touchStartX;
  isSwiping = true;
  swipeLocked = false;
  wrapper.style.scrollBehavior = "auto";
}, { passive: true });

wrapper.addEventListener("touchmove", (e) => {
  if (!isSwiping) return;
  touchCurrentX = e.touches[0].clientX;
  const dx = touchStartX - touchCurrentX;
  const dy = touchStartY - e.touches[0].clientY;

  // Lock direction on first move
  if (!swipeLocked) {
    if (Math.abs(dx) > Math.abs(dy)) {
      swipeLocked = true;
    } else {
      isSwiping = false; // vertical scroll — don't interfere
      return;
    }
  }

  e.preventDefault(); // prevent page scroll while swiping horizontally
  const cardWidth = getCardWidth();
  // Live drag feel
  wrapper.scrollLeft = (heroIndex * cardWidth) + dx;
}, { passive: false });

wrapper.addEventListener("touchend", () => {
  if (!isSwiping) return;
  isSwiping = false;

  const diff = touchStartX - touchCurrentX;
  const threshold = 60;

  if (Math.abs(diff) > threshold) {
    moveSlide(diff > 0 ? 1 : -1);
  } else {
    // Snap back to current card
    const cardWidth = getCardWidth();
    wrapper.style.scrollBehavior = "smooth";
    wrapper.scrollLeft = heroIndex * cardWidth;
    isAnimating = false;
  }

  startAutoScroll();
}, { passive: true });

/* 🖱️ MOUSE DRAG (Desktop) */
let mouseStartX = 0;
let mouseCurrentX = 0;
let isDragging = false;

wrapper.addEventListener("mousedown", (e) => {
  clearInterval(heroInterval);
  mouseStartX = e.clientX;
  mouseCurrentX = e.clientX;
  isDragging = true;
  wrapper.style.cursor = "grabbing";
  wrapper.style.scrollBehavior = "auto";
});

wrapper.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  mouseCurrentX = e.clientX;
  const dx = mouseStartX - mouseCurrentX;
  const cardWidth = getCardWidth();
  wrapper.scrollLeft = (heroIndex * cardWidth) + dx;
});

wrapper.addEventListener("mouseup", () => {
  if (!isDragging) return;
  isDragging = false;
  wrapper.style.cursor = "grab";

  const diff = mouseStartX - mouseCurrentX;
  const threshold = 60;

  if (Math.abs(diff) > threshold) {
    moveSlide(diff > 0 ? 1 : -1);
  } else {
    const cardWidth = getCardWidth();
    wrapper.style.scrollBehavior = "smooth";
    wrapper.scrollLeft = heroIndex * cardWidth;
  }

  startAutoScroll();
});

wrapper.addEventListener("mouseleave", () => {
  if (!isDragging) return;
  isDragging = false;
  wrapper.style.cursor = "grab";
  const cardWidth = getCardWidth();
  wrapper.style.scrollBehavior = "smooth";
  wrapper.scrollLeft = heroIndex * cardWidth;
  startAutoScroll();
});

/* 🔄 AUTO SCROLL */
function startAutoScroll() {
  clearInterval(heroInterval);
  heroInterval = setInterval(() => moveSlide(1), 5000);
}

/* 🖱️ BUTTON EVENTS */
document.getElementById("heroNext").onclick = () => {
  clearInterval(heroInterval);
  moveSlide(1);
  startAutoScroll();
};

document.getElementById("heroPrev").onclick = () => {
  clearInterval(heroInterval);
  moveSlide(-1);
  startAutoScroll();
};






/* 🚀 INIT */
loadHero();

/* 🔥 HERO SKELETON */
function showHeroSkeleton() {
  const wrapper = document.getElementById("heroWrapper");

  wrapper.innerHTML = `
    <div class="hero-skeleton">
      ${Array(3).fill(`
        <div class="hero-skeleton-card skeleton-shimmer"></div>
      `).join("")}
    </div>
  `;
}

/* 🎬 MOVIE GRID SKELETON */
function showMovieSkeleton(containerId, count = 8) {
  const container = document.getElementById(containerId);

  container.innerHTML = `
    <div class="movie-skeleton">
      ${Array(count).fill(`
        <div class="movie-skeleton-card skeleton-shimmer">
          
          <div class="movie-skeleton-text short skeleton-shimmer"></div>
          <div class="movie-skeleton-text long skeleton-shimmer"></div>
        </div>
      `).join("")}
    </div>
  `;
}

let newPage = 1;
let loading = false;

/* 🎯 FETCH FUNCTION */
async function fetchMovies(url, containerId, append = false) {


  if (!append) {
  showMovieSkeleton(containerId, 8);
}

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

/* 🎥 CREATE CARD */
function createCard(movie) {
  const div = document.createElement("div");
  div.classList.add("movie-card");

  div.innerHTML = `
    <img loading="lazy" src="${movie.poster_path 
      ? IMG_URL + movie.poster_path 
      : 'blank_poster.png'}" 
    alt="${movie.title || movie.name}"
    onerror="this.onerror=null; this.src='blank_poster.png';" />

    <div class="badge left shimmer">
  ${GENRE_MAP[movie.genre_ids?.[0]] || "Movie"}
</div>
    <div class="badge right">${movie.vote_average?.toFixed(1) || "N/A"}</div>


<div class="bookmark-btn">
  <img class="bookmark-icon" src="icons/bookmark-outline.svg" />
</div>
    
    <div class="overlay">
      <h3>${movie.title || movie.name}</h3>
      <p>${(movie.release_date || "").split("-")[0]}</p>
    </div>
  `;
  
  /* 🔐 WATCHLIST SYSTEM */
  const bookmark = div.querySelector(".bookmark-btn");
  const bookmarkIcon = div.querySelector(".bookmark-icon");

  // check existing
  if (isInWatchlist(movie.id)) {
    bookmarkIcon.src = "icons/bookmark-filled.svg";
    bookmark.classList.add("active");
}
    
    
    
    
  bookmark.addEventListener("click", (e) => {
  e.stopPropagation();

  const already = isInWatchlist(movie.id);

  toggleWatchlist(movie);

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
   
    
  


  
  // 🔥 CLICK EVENT
  div.addEventListener("click", () => {
    window.location.href = `details.html?id=${movie.id}`;
  });
  
  return div;
}

/* 🔥 LOAD TRENDING (30 MOVIES ONLY) */
async function loadTrending() {
  const container = document.getElementById("trending");

  // 🔥 show skeleton instantly
  showMovieSkeleton("trending", 8);

  try {
    const [res1, res2] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=1`),
      fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=2`)
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();

    const combined = [...data1.results, ...data2.results].slice(0, 16);

    // 🔥 remove skeleton only after data ready
    container.innerHTML = "";

    combined.forEach(movie => {
      container.appendChild(createCard(movie));
    });

  } catch (err) {
    console.error("Trending load failed", err);
  }
}

async function loadLanguageSection(lang, containerId) {
  showMovieSkeleton(containerId, 6);

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}
&with_original_language=${lang}
&primary_release_date.gte=2025-01-01
&sort_by=popularity.desc
&page=1`
    );

    const data = await res.json();

    const container = document.getElementById(containerId);

    container.innerHTML = "";

    data.results.slice(0, 12).forEach(movie => {
      container.appendChild(createCard(movie));
    });

  } catch (err) {
    console.error(`${lang} section failed`, err);
  }
}

async function loadAnimeSection() {
  showMovieSkeleton("anime", 6);

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=1`
    );

    const data = await res.json();

    const container = document.getElementById("anime");

    container.innerHTML = "";

    data.results.slice(0, 12).forEach(movie => {
      container.appendChild(createCard(movie));
    });

  } catch (err) {
    console.error("Anime load failed", err);
  }
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
loadLanguageSection("hi", "hindi");
loadLanguageSection("bn", "bangla");
loadAnimeSection();
loadNew();

//showHeroSkeleton();
//showMovieSkeleton("trending", 8);
//showMovieSkeleton("new", 8);

/* 🔄 INFINITE SCROLL ONLY FOR NEW RELEASE */
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    newPage++;
    loadNew(newPage, true);
  }
});


