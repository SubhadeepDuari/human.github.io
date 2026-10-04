/* =========================================================
   DATA-DRIVEN PERSONAL ARCHIVE
   GitHub Pages friendly: everything is loaded from /data/*.csv
========================================================= */

const CONFIG = {
  // Homepage photos use this naming convention:
  // images/home/home_01.jpg, home_02.jpg ... home_12.jpg
  // You may use .jpg, .jpeg, .png or .webp.
  homeImageCount: 12,
  homeBasePath: "images/home/home_",
  homeExtensions: ["jpg", "jpeg", "png", "webp"],

  achievementsCSV: "data/achievements.csv",
  decksCSV: "data/dj_sets.csv",
  moviesCSV: "data/movies.csv",

  achievementImagePath: "images/achievements/",
  movieImagePath: "images/movies/"
};

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

/* ---------------- NAVIGATION ---------------- */

$$(".nav-link").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.section;
    if (!id) return;

    $$(".panel").forEach(p => p.classList.toggle("active", p.id === id));
    $$(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.section === id));

    window.scrollTo({top:0, behavior:"instant"});
  });
});

/* ---------------- CSV PARSER ----------------
   Supports quoted cells, commas inside quoted cells,
   escaped quotes and CRLF line endings.
------------------------------------------------ */

function parseCSV(text){
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for(let i=0; i<text.length; i++){
    const ch = text[i];
    const next = text[i+1];

    if(ch === '"' && quoted && next === '"'){
      cell += '"';
      i++;
    } else if(ch === '"'){
      quoted = !quoted;
    } else if(ch === "," && !quoted){
      row.push(cell.trim());
      cell = "";
    } else if((ch === "\n" || ch === "\r") && !quoted){
      if(ch === "\r" && next === "\n") i++;
      row.push(cell.trim());
      cell = "";

      if(row.some(v => v !== "")) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }

  row.push(cell.trim());
  if(row.some(v => v !== "")) rows.push(row);

  if(rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(values => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] ?? "");
    return obj;
  });
}

async function loadCSV(url){
  const response = await fetch(url, {cache:"no-store"});
  if(!response.ok) throw new Error(`Could not load ${url}`);
  const text = await response.text();
  return parseCSV(text).filter(row =>
    Object.values(row).some(v => String(v).trim() !== "")
  );
}

function sortRows(rows){
  return [...rows].sort((a,b) => {
    const av = Number(a.order || 9999);
    const bv = Number(b.order || 9999);
    return av - bv;
  });
}

function esc(value=""){
  return String(value)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

/* ---------------- HOMEPAGE IMAGES ---------------- */

function pad2(n){ return String(n).padStart(2,"0"); }

function tryHomeImage(img, n, extIndex=0){
  if(extIndex >= CONFIG.homeExtensions.length){
    img.removeAttribute("src");
    img.closest(".home-photo").classList.add("placeholder");
    return;
  }

  const ext = CONFIG.homeExtensions[extIndex];
  img.onerror = () => tryHomeImage(img, n, extIndex+1);
  img.onload = () => {
    img.onerror = null;
    img.closest(".home-photo").classList.remove("placeholder");
  };
  img.src = `${CONFIG.homeBasePath}${pad2(n)}.${ext}`;
}

function buildHomePhotos(){
  const field = $("#homePhotoField");

  for(let n=1; n<=CONFIG.homeImageCount; n++){
    const slot = document.createElement("figure");
    slot.className = "home-photo placeholder";
    slot.dataset.number = pad2(n);

    const img = document.createElement("img");
    img.alt = `Personal archive photo ${n}`;
    img.loading = "lazy";

    slot.appendChild(img);
    field.appendChild(slot);

    tryHomeImage(img, n);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, {threshold:.18});

  $$(".home-photo").forEach(photo => observer.observe(photo));
}

/* ---------------- ACHIEVEMENTS ---------------- */

async function buildAchievements(){
  const wall = $("#achievementWall");

  try{
    const rows = sortRows(await loadCSV(CONFIG.achievementsCSV));
    wall.innerHTML = "";

    if(!rows.length){
      wall.innerHTML = `<p class="data-message">No achievements yet. Add rows to data/achievements.csv.</p>`;
      return;
    }

    rows.forEach(item => {
      const card = document.createElement("article");
      card.className = "achievement-card";

      const imageSrc = item.image ? CONFIG.achievementImagePath + item.image : "";

      card.innerHTML = `
        <div class="achievement-image ${imageSrc ? "" : "missing"}">
          ${imageSrc ? `<img src="${esc(imageSrc)}" alt="${esc(item.title || "Achievement")}" loading="lazy">` : ""}
        </div>
        <div class="achievement-copy">
          <small>${esc(item.year)}</small>
          <h3>${esc(item.title || "Untitled achievement")}</h3>
          <p>${esc(item.place)}</p>
        </div>
      `;

      const img = $("img", card);
      if(img){
        img.addEventListener("error", () => {
          img.remove();
          $(".achievement-image", card).classList.add("missing");
        });
      }

      card.addEventListener("click", () => {
        const link = item.link
          ? `<p><a class="listen-link" href="${esc(item.link)}" target="_blank" rel="noopener">open link ↗</a></p>`
          : "";

        openModal(`
          <div class="modal-body">
            ${imageSrc ? `<img src="${esc(imageSrc)}" alt="${esc(item.title)}" onerror="this.remove()">` : ""}
            <p class="eyebrow">${esc(item.year)} / ACHIEVEMENT</p>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.description)}</p>
            ${link}
            <div class="modal-facts">
              ${item.place ? `<span>${esc(item.place)}</span>` : ""}
              ${item.category ? `<span>${esc(item.category)}</span>` : ""}
            </div>
          </div>
        `);
      });

      wall.appendChild(card);
    });

  } catch(err){
    wall.innerHTML = `<p class="data-message">Could not load achievements.csv. If you opened index.html by double-clicking, run it through a local web server or upload it to GitHub Pages.</p>`;
    console.error(err);
  }
}

/* ---------------- THE DECKS ---------------- */

function youtubeID(url){
  try{
    const u = new URL(url);

    if(u.hostname.includes("youtu.be")){
      return u.pathname.replace("/","").split("/")[0];
    }

    if(u.hostname.includes("youtube.com")){
      if(u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
      if(u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
      return u.searchParams.get("v");
    }
  }catch(e){}
  return null;
}

function platformFor(url){
  const s = String(url || "").toLowerCase();
  if(s.includes("youtube.com") || s.includes("youtu.be")) return "youtube";
  if(s.includes("soundcloud.com")) return "soundcloud";
  return "link";
}

function playerMarkup(url){
  const platform = platformFor(url);

  if(platform === "youtube"){
    const id = youtubeID(url);
    if(id){
      return `<div class="player-shell">
        <iframe class="youtube-player"
          src="https://www.youtube-nocookie.com/embed/${esc(id)}"
          title="YouTube DJ set"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen></iframe>
      </div>`;
    }
  }

  if(platform === "soundcloud"){
    const encoded = encodeURIComponent(url);
    return `<div class="player-shell">
      <iframe class="soundcloud-player"
        scrolling="no"
        frameborder="no"
        allow="autoplay"
        loading="lazy"
        src="https://w.soundcloud.com/player/?url=${encoded}&color=%23111111&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false"></iframe>
    </div>`;
  }

  return `<div class="player-shell unsupported-player">
    <a class="listen-link" href="${esc(url)}" target="_blank" rel="noopener">open set ↗</a>
  </div>`;
}

async function buildDecks(){
  const grid = $("#deckGrid");

  try{
    const rows = sortRows(await loadCSV(CONFIG.decksCSV));
    grid.innerHTML = "";

    if(!rows.length){
      grid.innerHTML = `<p class="data-message">No sets yet. Paste SoundCloud or YouTube URLs into data/dj_sets.csv.</p>`;
      return;
    }

    rows.forEach((item, idx) => {
      const url = item.url || "";
      const card = document.createElement("article");
      card.className = "deck-card";

      const meta = [
        item.genre,
        item.duration,
        item.location,
        item.date
      ].filter(Boolean).join(" · ");

      card.innerHTML = `
        <div class="deck-card-head">
          <div>
            <h3>${esc(item.title || `Set ${pad2(idx+1)}`)}</h3>
            ${meta ? `<p class="deck-meta">${esc(meta)}</p>` : ""}
          </div>
          <span class="deck-number">${pad2(idx+1)}</span>
        </div>
        ${url ? playerMarkup(url) : `<div class="player-shell unsupported-player">ADD URL IN CSV</div>`}
        ${url ? `<a class="listen-link" href="${esc(url)}" target="_blank" rel="noopener">open original ↗</a>` : ""}
      `;

      grid.appendChild(card);
    });

  } catch(err){
    grid.innerHTML = `<p class="data-message">Could not load dj_sets.csv. If you opened index.html by double-clicking, run it through a local web server or upload it to GitHub Pages.</p>`;
    console.error(err);
  }
}

/* ---------------- MOVIES ---------------- */

async function buildMovies(){
  const grid = $("#movieGrid");

  try{
    const rows = sortRows(await loadCSV(CONFIG.moviesCSV));
    grid.innerHTML = "";

    if(!rows.length){
      grid.innerHTML = `<p class="data-message">No movies yet. Add rows to data/movies.csv.</p>`;
      return;
    }

    rows.forEach(item => {
      const card = document.createElement("article");
      card.className = "movie-card";

      const posterSrc = item.poster ? CONFIG.movieImagePath + item.poster : "";

      card.innerHTML = `
        <div class="movie-poster ${posterSrc ? "" : "missing"}">
          ${posterSrc ? `<img src="${esc(posterSrc)}" alt="${esc(item.title || "Movie poster")}" loading="lazy">` : ""}
        </div>
        <div class="movie-copy">
          <h3>${esc(item.title || "Untitled")}</h3>
          <span class="rating">${item.rating ? esc(item.rating) : ""}</span>
          <span class="details">${[item.year,item.director].filter(Boolean).map(esc).join(" · ")}</span>
        </div>
      `;

      const img = $("img", card);
      if(img){
        img.addEventListener("error", () => {
          img.remove();
          $(".movie-poster", card).classList.add("missing");
        });
      }

      card.addEventListener("click", () => {
        openModal(`
          <div class="modal-body">
            ${posterSrc ? `<img src="${esc(posterSrc)}" alt="${esc(item.title)}" onerror="this.remove()">` : ""}
            <p class="eyebrow">${esc(item.year)} / FILM</p>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.comment)}</p>
            <div class="modal-facts">
              ${item.director ? `<span>${esc(item.director)}</span>` : ""}
              ${item.rating ? `<span>${esc(item.rating)}</span>` : ""}
            </div>
          </div>
        `);
      });

      grid.appendChild(card);
    });

  } catch(err){
    grid.innerHTML = `<p class="data-message">Could not load movies.csv. If you opened index.html by double-clicking, run it through a local web server or upload it to GitHub Pages.</p>`;
    console.error(err);
  }
}

/* ---------------- MODAL ---------------- */

const modal = $("#modal");

function openModal(html){
  $("#modalContent").innerHTML = html;
  modal.showModal();
}

$(".modal-close").addEventListener("click", () => modal.close());

modal.addEventListener("click", e => {
  const r = modal.getBoundingClientRect();
  const outside =
    e.clientX < r.left || e.clientX > r.right ||
    e.clientY < r.top || e.clientY > r.bottom;
  if(outside) modal.close();
});

/* ---------------- INIT ---------------- */

buildHomePhotos();
buildAchievements();
buildDecks();
buildMovies();
