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

      <button class="remove-btn">  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#f4f4f4"><path d="m480-240-168 72q-40 17-76-6.5T200-241v-519q0-33 23.5-56.5T280-840h400q33 0 56.5 23.5T760-760v519q0 43-36 66.5t-76 6.5l-168-72Z"/></svg>
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
