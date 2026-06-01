const API_KEY = "d24074791ab99994324a6950e6e0a31a";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const HERO_API = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`;

let currentOTT = 213;
let currentBanglaOTT = 5119;

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
homeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = homeInput.value.trim();

    if (!query) return;

    window.location.href = `series-search-result.html?query=${query}`;
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
    `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${query}`
  );

  const data = await res.json();

  homeLive.innerHTML = "";
  homeLive.style.display = "block";

  data.results.slice(0, 15).forEach(movie => {
    const div = document.createElement("div");
    div.classList.add("live-item");

    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" onerror="this.onerror=null; this.src='blank_poster.png';"/>
      <p>${movie.name}</p>
    `;

    div.onclick = () => {
      window.location.href = `series-details.html?id=${movie.id}`;
    };

    homeLive.appendChild(div);
  });
}

homeBtn.addEventListener("click", () => {
  const query = homeInput.value.trim();
  if (!query) return;

  window.location.href = `series-search-result.html?query=${query}`;
});

function goGenre(genre) {
  window.location.href = `series-search-result.html?genre=${genre}`;
}
function goLanguage(lang) {
  window.location.href = `series-search-result.html?lang=${lang}`;
}

function goAnime(genre) {
  window.location.href = "series-search-result.html?genre=${genre}&lang=ja";
}

const GENRE_MAP = {
  10759: "Action",
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
  37: "Western",
  10762: "Kids",
  10765: "Sci-Fantasy",
};




let heroIndex = 2;
let heroMovies = [];
let heroInterval;
let isAnimating = false;

/* 🎬 LOAD HERO */
async function loadHero() {
  showHeroSkeleton();

  const res = await fetch(HERO_API);
  const data = await res.json();

  heroMovies = data.results.slice(0, 9);

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
        <div class="hero-title">${movie.name}</div>
        <div class="hero-meta">${(movie.first_air_date || "").split("-")[0]}</div>
        <div class="overlay-btn">
          <button class="overlay-left">Details</button>
          <button class="overlay-right">Watch Now</button>
        </div>
      </div>
    `;

    wrapper.appendChild(card);

    card.addEventListener("click", () => {
      window.location.href = `series-details.html?id=${movie.id}`;
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
  const realIndex = ((heroIndex - 2 + heroMovies.length) % heroMovies.length);
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
      const diff = (i + 2) - heroIndex;
      moveSlide(diff);
    });
    dotsContainer.appendChild(dot);
  });
}

function updateDots() {
  const dots = document.querySelectorAll(".hero-dot");
  const realIndex = ((heroIndex - 2 + heroMovies.length) % heroMovies.length);
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
      type: "Series",
      title: movie.name,
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
  ${GENRE_MAP[movie.genre_ids?.[0]] || "Series"}
</div>
    <div class="badge right">${movie.vote_average?.toFixed(1) || "N/A"}</div>


<div class="bookmark-btn">
  <img class="bookmark-icon" src="icons/bookmark-outline.svg" />
</div>
    
    <div class="overlay">
      <h3>${movie.title || movie.name}</h3>
      <p>${(movie.first_air_date || "").split("-")[0]}</p>
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
    window.location.href = `series-details.html?id=${movie.id}`;
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
      fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&page=1`),
      fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&page=2`)
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();

    const combined = [...data1.results, ...data2.results].slice(0, 16);

    // 🔥 remove skeleton only after data ready
    container.innerHTML = "";

    combined.forEach(show => {
      container.appendChild(createCard(show));
    });

  } catch (err) {
    console.error("Trending show load failed", err);
  }
}

async function loadLanguageSection(lang, containerId) {
  showMovieSkeleton(containerId, 6);

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}
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
      `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=1`
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

async function loadOTTSeries(providerId = 213) {
  showMovieSkeleton("ottSeries", 6);

  currentOTT = providerId;

  try {

    const networkMap = {
      213: 213,   // Netflix
      49:49,
      1024: 1024, // Prime Video
      2552: 2552, // Apple TV+
      2739: 2739, // Disney+
      453: 453,    // Hulu
      2139:2139,
      5119:5119,
      7035:7035,
      2902:2902,
      1204:1204,
      
      
    };

    const networkId = networkMap[providerId];

    const res = await fetch(
      `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_networks=${networkId}&sort_by=popularity.desc&page=1`
    );

    const data = await res.json();

    const container = document.getElementById("ottSeries");

    container.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      container.innerHTML = `<p style="color:#888;">No series found</p>`;
      return;
    }

    data.results.slice(0, 12).forEach(show => {
      container.appendChild(createCard(show));
    });

  } catch (err) {
    console.error("OTT load failed", err);
  }
}

async function loadBanglaOTT(providerId = 5119) {

  showMovieSkeleton("banglaOttSeries", 6);

  currentBanglaOTT = providerId;

  try {

    const res = await fetch(
      `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_networks=${providerId}&sort_by=popularity.desc&page=1`
    );

    const data = await res.json();

    const container = document.getElementById("banglaOttSeries");

    container.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      container.innerHTML = `
        <p style="color:#888;text-align:center;">
          No Bangla OTT series found
        </p>
      `;
      return;
    }

    data.results.slice(0, 12).forEach(show => {
      container.appendChild(createCard(show));
    });

  } catch (err) {
    console.error("Bangla OTT failed", err);
  }
}

/* 🔥 LOAD NEW RELEASES */
function loadNew(page = 1, append = false) {
  
  fetchMovies(
    `https://api.themoviedb.org/3/tv/on_the_air?api_key=${API_KEY}&page=${page}`,
    "new",
    append
  );
}

const ottButtons = document.querySelectorAll(".ott-btn");

ottButtons.forEach(btn => {
  btn.addEventListener("click", () => {

    ottButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const provider = btn.dataset.provider;

    loadOTTSeries(provider);
  });
});

const banglaButtons = document.querySelectorAll(".bangla-ott-btn");

banglaButtons.forEach(btn => {

  btn.addEventListener("click", () => {

    banglaButtons.forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    const provider = btn.dataset.provider;

    loadBanglaOTT(provider);
  });

});

document.getElementById("ottSeeMore").onclick = () => {
  window.location.href = `series-search-result.html?provider=${currentOTT}`;
};

document.getElementById("banglaOttSeeMore").onclick = () => {

  window.location.href =
    `series-search-result.html?provider=${currentBanglaOTT}`;
};

const scrollBtn = document.getElementById("scrollTopBtn");

/* 👀 SHOW / HIDE 
window.addEventListener("scroll", () => {
  if (window.scrollY > 1400) {
    scrollBtn.classList.add("show");
  } else {
    scrollBtn.classList.remove("show");
  }
});
*/
/* ⬆️ SCROLL TO TOP */
scrollBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

const topNav = document.querySelector(".navbar-main");

let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {

  const currentScroll = window.scrollY;

  if (currentScroll > lastScrollY && currentScroll > 100) {
    // scroll down
    topNav.classList.add("hide");
    
  } else {
    // scroll up
    topNav.classList.remove("hide");
    
  }

  lastScrollY = currentScroll;
});

/* 🚀 INITIAL LOAD */
loadTrending();
loadOTTSeries();
loadBanglaOTT();

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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ▶ CONTINUE WATCHING
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const CW_KEY = "cinestream_continue";

function getContinueWatchingAll() {
  try { return JSON.parse(localStorage.getItem(CW_KEY) || "[]"); }
  catch { return []; }
}

async function loadContinueWatching() {
  // শুধু series (tv) দেখাও
  const all  = getContinueWatchingAll();
  const data = all.filter(d => d.mediaType === "tv");
  if (!data.length) return;

  const section = document.getElementById("continueWatchingSection");
  const list    = document.getElementById("continueWatchingList");
  section.style.display = "block";
  list.innerHTML = "";

  for (const item of data) {
    try {
      const res  = await fetch(
        `https://api.themoviedb.org/3/tv/${item.id}?api_key=${API_KEY}`
      );
      const info = await res.json();

      const poster = info.poster_path ? IMG_URL + info.poster_path : "blank_poster.png";
      const title  = info.name || "";
      const pct    = Math.round(item.progress);
      const mins   = Math.round(item.currentTime / 60);
      const epInfo = item.season && item.episode
        ? `S${String(item.season).padStart(2,'0')}E${String(item.episode).padStart(2,'0')} · ` : '';

      const card = document.createElement("div");
      card.style.cssText = `
        min-width: 80%; max-width: 80%;
        flex-shrink: 0; border-radius: 12px;
        overflow: hidden; background: #1a1a2e;
        cursor: pointer; position: relative;
      `;

      card.innerHTML = `
        <div style="position:relative;">
          <img src="${poster}" alt="${title}"
               style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;"
               onerror="this.src='blank_poster.png'"/>
          <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.2);">
            <div style="height:100%;width:${pct}%;background:#00ccff;"></div>
          </div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
                      background:rgba(0,0,0,0.3);">
            <span class="material-symbols-rounded" style="font-size:48px;color:#fff;opacity:0.9;">play_circle</span>
          </div>
        </div>
        <div style="padding:10px 12px;">
          <p style="font-family:Inter;font-weight:700;font-size:14px;color:#fff;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</p>
          <p style="font-family:Inter;font-size:11px;color:rgba(255,255,255,0.5);margin-top:3px;">
            ${epInfo}${mins} min watched · ${pct}%
          </p>
        </div>
      `;

      card.onclick = () => {
        const t   = Math.floor(item.currentTime);
        const url = `player.html?type=tv&id=${item.id}&s=${item.season||1}&e=${item.episode||1}&progress=${t}`;
        window.open(url, '_blank');
      };

      list.appendChild(card);
    } catch(e) {}
  }
}

loadContinueWatching();


