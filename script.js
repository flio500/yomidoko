const STORAGE_KEY = "yomidoko-manga-v1";
const VIEW_KEY = "yomidoko-view-mode-v1";

const defaultMangaItems = [
  {
    title: "\u661f\u964d\u308b\u66f8\u5e97\u306e\u732b",
    url: "https://example.com/hoshifuru",
    icon: "\u2605",
    iconUrl: "",
    episode: 28,
    total: 36,
  },
  {
    title: "\u671d\u713c\u3051\u306e\u9b54\u6cd5\u4f7f\u3044",
    url: "https://example.com/asayake",
    icon: "\u25c7",
    iconUrl: "",
    episode: 14,
    total: 24,
  },
  {
    title: "\u96e8\u306e\u65e5\u306e\u52c7\u8005\u30e1\u30e2",
    url: "https://example.com/amenohi",
    icon: "\u266a",
    iconUrl: "",
    episode: 52,
    total: 80,
  },
  {
    title: "\u8def\u5730\u88cf\u30ad\u30c3\u30c1\u30f3",
    url: "https://example.com/rojiura",
    icon: "\u25cb",
    iconUrl: "",
    episode: 7,
    total: 12,
  },
  {
    title: "\u6708\u706f\u308a\u56f3\u66f8\u9928",
    url: "https://example.com/tsukiakari",
    icon: "\u25ce",
    iconUrl: "",
    episode: 31,
    total: 45,
  },
  {
    title: "\u307e\u3069\u308d\u307f\u63a2\u5075\u56e3",
    url: "https://example.com/madoromi",
    icon: "\u25b3",
    iconUrl: "",
    episode: 18,
    total: 30,
  },
  {
    title: "\u6c34\u5e73\u7dda\u307e\u3067\u4e09\u99c5",
    url: "https://example.com/suiheisen",
    icon: "\u25a1",
    iconUrl: "",
    episode: 43,
    total: 60,
  },
  {
    title: "\u304b\u3089\u304f\u308a\u753a\u65e5\u548c",
    url: "https://example.com/karakuri",
    icon: "\u2726",
    iconUrl: "",
    episode: 9,
    total: 20,
  },
  {
    title: "\u5c0f\u3055\u306a\u7adc\u3068\u624b\u7d19\u5c4b",
    url: "https://example.com/tegamiya",
    icon: "\uff0b",
    iconUrl: "",
    episode: 63,
    total: 72,
  },
];

const grid = document.querySelector("#mangaGrid");
const template = document.querySelector("#mangaCardTemplate");
const buttons = document.querySelectorAll(".segment");
const appSettingsButton = document.querySelector("#appSettingsButton");
const libraryPanel = document.querySelector("#libraryPanel");
const libraryList = document.querySelector("#libraryList");
const addMangaButton = document.querySelector("#addMangaButton");
const summaryText = document.querySelector("#summaryText");

let mangaItems = loadItems();
let currentView = loadViewMode();

function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(saved)) {
      return structuredClone(defaultMangaItems);
    }

    return saved.map((savedItem, index) => {
      const fallback = defaultMangaItems[index] || createMangaItem(index + 1);

      return {
        ...fallback,
        ...savedItem,
        icon: savedItem.icon || fallback.icon,
        total: Math.max(1, Number(savedItem.total ?? fallback.total) || fallback.total),
      };
    });
  } catch {
    return structuredClone(defaultMangaItems);
  }
}

function loadViewMode() {
  const saved = localStorage.getItem(VIEW_KEY);
  return saved === "list" || saved === "9" ? "list" : "grid";
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mangaItems));
}

function saveViewMode(view) {
  localStorage.setItem(VIEW_KEY, view);
}

function createMangaItem(number = mangaItems.length + 1) {
  const icons = ["\u2605", "\u25c7", "\u266a", "\u25cb", "\u25ce", "\u25b3", "\u25a1", "\u2726", "\uff0b"];

  return {
    title: `\u65b0\u3057\u3044\u6f2b\u753b ${number}`,
    url: "",
    icon: icons[(number - 1) % icons.length],
    iconUrl: "",
    episode: 0,
    total: 1,
  };
}

function safeUrl(url) {
  const trimmed = url.trim();
  if (!trimmed) return "#";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function updateActiveButton(view) {
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
}

function updateProgress(card, item) {
  const episode = Number(item.episode) || 0;
  const total = Math.max(1, Number(item.total) || 1);
  const progress = Math.min(100, Math.round((episode / total) * 100));
  card.querySelector(".progress-fill").style.setProperty("--progress", `${progress}%`);
  card.querySelector(".total-display").textContent = total;
}

function updateSummary() {
  const updatedCount = mangaItems.filter((item) => Number(item.episode) > 0).length;
  summaryText.textContent = `${mangaItems.length}\u4f5c\u54c1\u4e2d ${updatedCount}\u4f5c\u54c1\u3092\u66f4\u65b0\u6e08\u307f`;
}

function updateIcon(iconElement, item) {
  const iconUrl = safeUrl(item.iconUrl || "");

  iconElement.classList.remove("has-image");
  iconElement.textContent = item.icon;

  if (iconUrl === "#") return;

  const image = new Image();
  image.alt = "";
  image.src = iconUrl;
  image.addEventListener("load", () => {
    iconElement.replaceChildren(image);
    iconElement.classList.add("has-image");
  });
  image.addEventListener("error", () => {
    iconElement.classList.remove("has-image");
    iconElement.textContent = item.icon;
  });
}

function renderCards(view = currentView) {
  currentView = view;
  grid.classList.toggle("list", view === "list");
  grid.replaceChildren();
  updateActiveButton(view);

  mangaItems.forEach((item, index) => {
    const card = template.content.cloneNode(true);
    const article = card.querySelector(".manga-card");
    const openLink = card.querySelector(".open-link");
    const iconElement = card.querySelector(".manga-icon");
    const settingsToggle = card.querySelector(".settings-toggle");
    const titleInput = card.querySelector(".manga-title-input");
    const urlInput = card.querySelector(".manga-url-input");
    const iconUrlInput = card.querySelector(".icon-url-input");
    const episodeInput = card.querySelector(".episode-input");
    const totalInput = card.querySelector(".total-input");

    updateIcon(iconElement, item);
    openLink.href = safeUrl(item.url);
    titleInput.value = item.title;
    urlInput.value = item.url;
    iconUrlInput.value = item.iconUrl || "";
    episodeInput.value = item.episode;
    totalInput.value = item.total;
    updateProgress(card, item);

    const toggleSettings = (focusTarget) => {
      const isOpen = article.classList.toggle("show-settings");
      iconElement.setAttribute("aria-expanded", String(isOpen));
      settingsToggle.setAttribute("aria-expanded", String(isOpen));
      if (isOpen && focusTarget) focusTarget.focus();
    };

    iconElement.addEventListener("click", () => toggleSettings(iconUrlInput));
    settingsToggle.addEventListener("click", () => toggleSettings());

    titleInput.addEventListener("input", () => {
      mangaItems[index].title = titleInput.value;
      saveItems();
      renderLibrary();
    });

    urlInput.addEventListener("input", () => {
      mangaItems[index].url = urlInput.value;
      openLink.href = safeUrl(urlInput.value);
      saveItems();
    });

    iconUrlInput.addEventListener("input", () => {
      mangaItems[index].iconUrl = iconUrlInput.value;
      updateIcon(iconElement, mangaItems[index]);
      saveItems();
    });

    episodeInput.addEventListener("input", () => {
      mangaItems[index].episode = Math.max(0, Number(episodeInput.value) || 0);
      updateProgress(article, mangaItems[index]);
      saveItems();
      updateSummary();
    });

    totalInput.addEventListener("input", () => {
      mangaItems[index].total = Math.max(1, Number(totalInput.value) || 1);
      updateProgress(article, mangaItems[index]);
      saveItems();
    });

    grid.append(card);
  });
}

function renderLibrary() {
  libraryList.replaceChildren();

  mangaItems.forEach((item, index) => {
    const row = document.createElement("div");
    const title = document.createElement("span");
    const deleteButton = document.createElement("button");

    row.className = "library-row";
    title.className = "library-title";
    title.textContent = item.title || `\u6f2b\u753b ${index + 1}`;
    deleteButton.className = "delete-manga-button";
    deleteButton.type = "button";
    deleteButton.textContent = "\u524a\u9664";
    deleteButton.addEventListener("click", () => {
      const confirmed = window.confirm(`\u300c${title.textContent}\u300d\u3092\u524a\u9664\u3057\u307e\u3059\u304b\uff1f`);
      if (!confirmed) return;

      mangaItems.splice(index, 1);
      saveItems();
      renderLibrary();
      renderCards();
      updateSummary();
    });

    row.append(title, deleteButton);
    libraryList.append(row);
  });
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    saveViewMode(view);
    renderCards(view);
  });
});

appSettingsButton.addEventListener("click", () => {
  const isOpen = libraryPanel.classList.toggle("open");
  appSettingsButton.setAttribute("aria-expanded", String(isOpen));
});

addMangaButton.addEventListener("click", () => {
  mangaItems.push(createMangaItem());
  saveItems();
  renderLibrary();
  renderCards();
  updateSummary();
});

renderLibrary();
updateSummary();
renderCards(currentView);
