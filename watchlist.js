const grid = document.getElementById("watchGrid");
const IMG_URL = "https://image.tmdb.org/t/p/w500";

/* LOAD */
function getWatchlist() {
  return JSON.parse(localStorage.getItem("watchlist")) || [];
}

/* REMOVE */
function removeFromWatchlist(id) {
  let list = getWatchlist().filter(m => m.id != id);
  localStorage.setItem("watchlist", JSON.stringify(list));
  loadWatchlist();
}

/* RENDER */
function loadWatchlist() {
  const list = getWatchlist();
  grid.innerHTML = "";

  list.forEach(movie => {
    const div = document.createElement("div");
    div.classList.add("movie-card");

    div.innerHTML = `
      <img src="${IMG_URL + movie.poster}" />

      <div class="badge left">${movie.year}</div>
      <div class="badge right">${movie.rating?.toFixed(1)}</div>

      <div class="overlay">
        <h3>${movie.title}</h3>
      </div>

      <button class="remove-btn">  <span class="material-symbols-rounded"> bookmark_remove </span>
      </button>
    `;

    div.querySelector(".remove-btn").onclick = (e) => {
      e.stopPropagation();
      removeFromWatchlist(movie.id);
    };

    div.onclick = () => {
      window.location.href = `details.html?id=${movie.id}`;
    };

    grid.appendChild(div);
  });
}

loadWatchlist();
