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

      <div class="details-skeleton-btns">
        <div class="details-skeleton-btn skeleton-shimmer"></div>
        <div class="details-skeleton-btn skeleton-shimmer"></div>
      </div>
      
      <div class="details-skeleton-text skeleton-shimmer"></div>
      <div class="details-skeleton-text skeleton-shimmer"></div>
      <div class="details-skeleton-text skeleton-shimmer"></div>
      <div class="details-skeleton-text skeleton-shimmer"></div>
      <div class="details-skeleton-text short skeleton-shimmer"></div>
      
      

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
          <h4 style="display: flex;gap: 3px;align-items:center;color:#fff">
              <span class="material-symbols-rounded" style="font-size: 22px;color:#00ccff">
kid_star
</span>
               ${movie.vote_average.toFixed(1)} | ${movie.release_date}</h4>
      </div>
      
      <div class="genres"> 
  ${movie.genres.map(g => `<span>${g.name}</span>`).join("")}
</div>
      
      <div class="m-btn-container">
          <button class="play-btn" style="font-family:Inter;font-weight:bold;font-size:16px">
   <span class="material-symbols-rounded" style="font-size: 34px">play_arrow</span>
  Watch Now
      </button>
      <button class="download-btn" id="watchlistBtn" style="font-family:Inter;font-weight:bold;font-size:16px">
          <img class="bookmark-icon" src="icons/bookmark-outline.svg" style="width:28px;height:28px;vertical-align:middle;"/>
          Watchlist</button>
      </div>
     
        <p>${movie.overview}</p>
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
  
  const bookmark     = document.getElementById("watchlistBtn");
  const bookmarkIcon = document.querySelector(".bookmark-icon");
  const bookmarkCont = bookmark;
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
      type: "Movie",
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

  // 🎬 FTP play link setup
  const releaseYear = movie.release_date?.split("-")[0];
  setupPlayButtons(movie.title, releaseYear, String(movie.id));

bookmark.onclick = () => {

  const already = isInWatchlist(movie.id);

  toggleWatchlist(movie);
  updateWatchBtn(movie.id);

  if (already) {
    showToast("Removed watchlist successfully", "remove");
  } else {
    showToast("Added to watchlist successfully", "success");
  }
};
  
}

/* 🔁 NAVIGATE */
function goToMovie(id) {
  window.location.href = `details.html?id=${id}`;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📡 SUPABASE — MOVIES TABLE INTEGRATION
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const SUPA_URL = "https://uhkkfuitiuykndhyzgrs.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoa2tmdWl0aXV5a25kaHl6Z3JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDczNDcsImV4cCI6MjA5MzgyMzM0N30.o-r5B3hUtaW6HbXR7QZvcCt1diM__aMPKEgI5jN9Kig";

const SUPA_HEADERS = {
  "apikey":        SUPA_KEY,
  "Authorization": `Bearer ${SUPA_KEY}`
};

async function findMovieData(title, year) {
  try {
    const clean = title
      .replace(/[:\-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const SELECT = "direct_link,quality,category,year,dual_audio,hindi,file_size,file_name";

    // Step 1 — Exact title + year
    const exactRes = await fetch(
      `${SUPA_URL}/rest/v1/movies`
      + `?select=${SELECT}`
      + `&title=ilike.${encodeURIComponent(clean)}`
      + `&year=eq.${year}`
      + `&limit=1`,
      { headers: SUPA_HEADERS, signal: AbortSignal.timeout(5000) }
    );
    const exactData = await exactRes.json();
    if (exactData?.length) return exactData[0];

    // Step 2 — Fuzzy title + year
    const fuzzyRes = await fetch(
      `${SUPA_URL}/rest/v1/movies`
      + `?select=${SELECT}`
      + `&title=ilike.*${encodeURIComponent(clean)}*`
      + `&year=eq.${year}`
      + `&limit=5`,
      { headers: SUPA_HEADERS, signal: AbortSignal.timeout(5000) }
    );
    const fuzzyData = await fuzzyRes.json();
    if (fuzzyData?.length) return fuzzyData[0];

    return null;

  } catch(e) {
    console.warn("Supabase error:", e.message);
    return null;
  }
}

function getLanguageLabel(movieData) {
  if (!movieData) return null;
  const { dual_audio, hindi, category } = movieData;

  if (dual_audio)                                      return "Hindi + English";
  if (category === "Hindi Movies")                     return "Hindi";
  if (category === "South-Movie Hindi Dubbed")         return "Hindi";
  if (category === "South Indian Movies")              return "Original Language";
  if (category === "Kolkata Bangla Movies")            return "Bengali";
  if (category === "Animation Movies" && hindi)        return "Hindi";
  if (hindi)                                           return "Hindi";
  return "English";
}

function renderFileInfo(movieData) {
  document.getElementById("fileInfoBox")?.remove();
  if (!movieData) return;

  const lang     = getLanguageLabel(movieData);
  const quality  = movieData.quality   || null;
  const year     = movieData.year      || null;
  const size     = movieData.file_size ? `${movieData.file_size} GB` : null;
  const fileName = movieData.file_name || null;

  if (!lang && !quality && !year && !size) return;

  const items = [
    quality ? { icon: "hd",            label: "Quality",  value: quality      } : null,
    lang    ? { icon: "translate",      label: "Language", value: lang         } : null,
    
    size    ? { icon: "hard_drive",     label: "Size",     value: size         } : null,
  ].filter(Boolean);

  const box = document.createElement("div");
  box.id = "fileInfoBox";
  box.style.cssText = `
    margin: 14px 0;
    padding: 12px 14px;
    background: rgba(255,255,255,0.06);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
  `;

  box.innerHTML = `
    
    <div style="display:flex;flex-wrap:wrap;gap:18px;">
      ${items.map(it => `
        <div style="display:flex;align-items:center;gap:6px">
          <span class="material-symbols-rounded"
                style="font-size:18px;color:#00ccff;">${it.icon}</span>
          
          <div>
              <div style="font-size:10px;color:rgba(255,255,255,0.45);font-family: Inter;"> ${it.label} </div>
              <div style="font-size:13px;font-weight:600;font-family:Inter;
                      color:#fff;">${it.value}</div>
          </div>
        </div>
      `).join("")}
    </div>
  `;

  const btnContainer = document.querySelector(".m-btn-container");
  if (btnContainer) btnContainer.after(box);
}

async function findFMFTPData(tmdbId) {
  if (!tmdbId) return null;
  try {
    const res = await fetch(
      `${SUPA_URL}/rest/v1/fmftp_movies`
      + `?select=direct_link,quality,language,file_name`
      + `&tmdb_id=eq.${tmdbId}`
      + `&limit=1`,
      { headers: SUPA_HEADERS, signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    return data?.length ? data[0] : null;
  } catch(e) {
    console.warn("FMFTP error:", e.message);
    return null;
  }
}

function renderFileInfo(dfData, fmData) {
  document.getElementById("fileInfoBox")?.remove();
  document.getElementById("server2Btn")?.remove();

  // Primary data — DhakaFlix থাকলে সেটা, না হলে FMFTP
  const primary = dfData || fmData;
  if (!primary) return;

  const lang    = dfData ? getLanguageLabel(dfData)
                         : (fmData?.language || "N/A");
  const quality = primary.quality   || "N/A";
  const size    = dfData?.file_size || "N/A";
  const fileName= primary.file_name || null;

  const items = [
    { icon: "hd",        label: "Quality",  value: quality },
    { icon: "translate", label: "Language", value: lang    },
    { icon: "hard_drive",label: "Size",     value: size    },
  ];

  const box = document.createElement("div");
  box.id = "fileInfoBox";
  box.style.cssText = `
    margin: 14px 0;
    padding: 12px 14px;
    background: rgba(255,255,255,0.06);
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
  `;

  box.innerHTML = `
     
    <div style="display:flex;flex-wrap:wrap;gap:18px;">
      ${items.map(it => `
        <div style="display:flex;align-items:center;gap:6px">
          <span class="material-symbols-rounded"
                style="font-size:18px;color:#00ccff;">${it.icon}</span>
          <div>
            <div style="font-size:10px;color:rgba(255,255,255,0.45);font-family:Inter;">${it.label}</div>
            <div style="font-size:13px;font-weight:600;font-family:Inter;color:#fff;">${it.value}</div>
          </div>
        </div>
      `).join("")}
    </div>

    ${dfData && fmData ? `
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">
        <button id="server2Btn" onclick="openWithIntent('${fmData.direct_link}')" style="
          padding: 7px 16px;
          background: rgba(255,255,255,0.04);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          font-family: Inter;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        ">
          <span class="material-symbols-rounded" style="font-size:16px;">dns</span>
          Server 2${fmData.quality ? ' · ' + fmData.quality : ''}
        </button>
      </div>
    ` : ''}
  `;

  const btnContainer = document.querySelector(".m-btn-container");
  if (btnContainer) btnContainer.after(box);
}

function openWithIntent(link) {
  const isAndroid = /android/i.test(navigator.userAgent);
  if (isAndroid) {
    window.location.href =
      `intent:${link}#Intent;` +
      `type=video/*;` +
      `package=org.videolan.vlc;` +
      `S.browser_fallback_url=${encodeURIComponent(link)};` +
      `end`;
  } else {
    window.open(link, '_blank');
  }
}

async function setupPlayButtons(title, year, tmdbId) {
  const playBtn = document.querySelector(".play-btn");
  if (!playBtn) return;

  playBtn.disabled = true;
  playBtn.style.opacity = "0.6";
  playBtn.innerHTML = `
    <span class="material-symbols-rounded" style="font-size:30px">hourglass_top</span>
    Searching...
  `;

  // DhakaFlix + FMFTP parallel query
  const [dfData, fmData] = await Promise.all([
    findMovieData(title, year),
    findFMFTPData(tmdbId)
  ]);

  const primaryLink = dfData?.direct_link || fmData?.direct_link || null;

  // File info render
  renderFileInfo(dfData, fmData);

  if (primaryLink) {
    playBtn.disabled = false;
    playBtn.style.opacity = "1";
    playBtn.style.cursor  = "pointer";
    playBtn.innerHTML = `
      <span class="material-symbols-rounded" style="font-size:34px">play_arrow</span>
      Watch Now
    `;
    playBtn.onclick = () => openWithIntent(primaryLink);
  } else {
    playBtn.disabled = true;
    playBtn.style.opacity = "0.4";
    playBtn.style.cursor  = "not-allowed";
    playBtn.innerHTML = `
      <span class="material-symbols-rounded" style="font-size:30px">block</span>
      Not Available
    `;
  }
}

loadDetails();
