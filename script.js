// script.js

// Arrays to store cards:
let jokersArr          = [];  // All joker cards
let playingCardsArr    = [];  // Playing cards not in "Currently Playing"
let playingSelectedArr = [];  // Currently Playing playing cards

document.addEventListener("DOMContentLoaded", () => {
  // DOM references for the Playing Card form (left)
  const rankSelect  = document.getElementById("rankSelect");
  const suitSelect  = document.getElementById("suitSelect");
  const enhSelect   = document.getElementById("enhancementSelectCard");
  const sealSelect  = document.getElementById("sealSelectCard");
  const addCardBtn  = document.getElementById("addCardBtn");

  // DOM references for the Joker form (right)
  const jokerSelect    = document.getElementById("jokerSelect");
  const editionSelect  = document.getElementById("editionSelectJoker");
  const addJokerBtn    = document.getElementById("addJokerBtn");

  // Populate dropdowns for playing cards:
  populateDropdown(rankSelect, RANKS, "Select Rank");
  populateDropdown(suitSelect, SUITS, "Select Suit");
  populateDropdown(enhSelect, ENHANCEMENTS, "Select Enhancement");
  populateDropdown(sealSelect, SEALS, "Select Seal");

  // Populate dropdowns for jokers:
  const jokerOptions = JOKERS.map(j => ({
    label: `${j.name} [${j.rarity}]`,
    value: j.name
  }));
  populateDropdown(jokerSelect, jokerOptions, "Select Joker");
  populateDropdown(editionSelect, EDITIONS, "Select Edition");

  // Add a playing card
  addCardBtn.addEventListener("click", () => {
    const rank = rankSelect.value;
    const suit = suitSelect.value;
    if (!rank || !suit) {
      alert("Please select both rank and suit for the playing card.");
      return;
    }
    // For playing cards, if enhancement is "None" or not selected,
    // use "Blank" (so that an enhancement layer is always composed).
    let enh = enhSelect.value || "None";
    if (enh === "None") {
      enh = "Blank";
    }
    playingCardsArr.push({
      type: "playingCard",
      rank,
      suit,
      enhancement: enh,
      seal: sealSelect.value || "None",
      composite: null  // will be set after composition
    });
    renderAll();
  });

  // Add a joker (jokers load directly)
  addJokerBtn.addEventListener("click", () => {
    const jokerName = jokerSelect.value;
    const edition   = editionSelect.value;
    if (!jokerName || !edition) {
      alert("Please select a Joker type and edition.");
      return;
    }
    const found = JOKERS.find(j => j.name === jokerName);
    jokersArr.push({
      type: "joker",
      name: found.name,
      rarity: found.rarity,
      edition,
      // For jokers we assume image is static and stored directly.
    });
    renderAll();
  });

  renderAll();
});

/**
 * Re-render all three display sections: Jokers, Playing Cards, and Currently Playing.
 */
function renderAll() {
  renderSection("jokersContainer", jokersArr, false);
  renderSection("playingCardsContainer", playingCardsArr, true);
  renderSection("playingContainer", playingSelectedArr, true);
}

/**
 * Render a section.
 * containerId: the id of the container element.
 * arr: the array of card objects for that container.
 * allowToggle: if true, clicking a playing card toggles its "Currently Playing" state.
 */
function renderSection(containerId, arr, allowToggle) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  arr.forEach((card, idx) => {
    const cardDiv = createCardDiv(card, idx);
    if (allowToggle && card.type === "playingCard") {
      cardDiv.addEventListener("click", () => togglePlaying(card));
    }
    container.appendChild(cardDiv);
  });
  // Update dataset.index for each child.
  Array.from(container.children).forEach((child, i) => {
    child.dataset.index = i;
  });
  enableDrag(container, arr);
}

/**
 * Create a card element.
 * For playing cards, we dynamically compose the image (or use cached composite).
 * For jokers, we load the image directly.
 */
function createCardDiv(card, idx) {
  const d = document.createElement("div");
  d.classList.add("card-item");
  d.setAttribute("draggable", "true");
  d.dataset.index = idx;

  const img = document.createElement("img");
  img.classList.add("card-img");

  if (card.type === "playingCard") {
    // Use cached composite if it exists.
    if (card.composite) {
      img.src = card.composite;
    } else {
      img.src = "images/placeholder.png";
      // Compose the card and update the image.
      composeCard(card).then(dataUrl => {
        card.composite = dataUrl;
        img.src = dataUrl;
      }).catch(err => {
        console.error("composeCard error:", err);
        img.src = `images/playing/${card.rank}_${card.suit}.png`;
      });
    }
    img.alt = `${card.rank} of ${card.suit}`;
  } else {
    // For jokers, load directly.
    img.src = `images/jokers/${card.name.replace(/\s+/g, "_")}.png`;
    img.alt = `${card.name} (${card.rarity})`;
  }
  d.appendChild(img);

  // For joker cards, add an edition label if edition is not "Base"
  if (card.type === "joker" && card.edition && card.edition !== "Base") {
    const lbl = document.createElement("span");
    lbl.classList.add("edition-label");
    lbl.textContent = card.edition;
    d.appendChild(lbl);
  }

  // Create a delete ("×") button:
  const delBtn = document.createElement("span");
  delBtn.classList.add("delete-btn");
  delBtn.textContent = "×";
  delBtn.title = "Remove card";
  delBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent toggling.
    removeCard(card);
  });
  d.appendChild(delBtn);

  // Drag events:
  d.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", d.dataset.index);
    e.dataTransfer.effectAllowed = "move";
    d.classList.add("dragging");
  });
  d.addEventListener("dragend", () => {
    d.classList.remove("dragging");
  });

  return d;
}

/**
 * Compose a playing card image by layering:
 *   1. The enhancement image (or Blank.png if not selected) → drawn first (behind)
 *   2. The base playing card image → drawn second
 *   3. The seal image (if any) → drawn on top
 *
 * All layers are drawn at (0,0) without offset.
 *
 * Uses caching: if card.composite is already set, returns it immediately.
 *
 * Returns a Promise that resolves to a data URL of the composite image.
 */
function composeCard(card) {
  if (card.composite) {
    return Promise.resolve(card.composite);
  }
  return new Promise((resolve, reject) => {
    const baseUrl = `images/playing/${card.rank}_${card.suit}.png`;
    const baseImg = new Image();
    baseImg.crossOrigin = "Anonymous";
    baseImg.onload = () => {
      const w = baseImg.width;
      const h = baseImg.height;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      // Helper: draw an image overlay (always at (0,0)).
      function drawOverlay(url) {
        return new Promise((res, rej) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => {
            ctx.drawImage(img, 0, 0, w, h);
            res();
          };
          img.onerror = rej;
          img.src = url;
        });
      }

      // Build promise chain for layering.
      let promiseChain = Promise.resolve();

      // 1. Draw enhancement layer first.
      // If enhancement is provided, use it; otherwise, use "Blank.png".
      let enhName = card.enhancement && card.enhancement !== "None" ? card.enhancement : "Blank";
      const enhUrl = `images/enhancements/${enhName.replace(/\s+/g, "_")}.png`;
      promiseChain = promiseChain.then(() => drawOverlay(enhUrl));

      // 2. Draw base image on top of the enhancement.
      promiseChain = promiseChain.then(() => {
        ctx.drawImage(baseImg, 0, 0, w, h);
      });

      // 3. If a seal is provided and not "None", draw it on top.
      if (card.seal && card.seal !== "None") {
        const sealUrl = `images/seals/${card.seal.replace(/\s+/g, "_")}.png`;
        promiseChain = promiseChain.then(() => drawOverlay(sealUrl));
      }

      promiseChain.then(() => {
        const dataUrl = canvas.toDataURL("image/png");
        card.composite = dataUrl;  // cache
        resolve(dataUrl);
      }).catch(reject);
    };
    baseImg.onerror = (err) => reject(err);
    baseImg.src = baseUrl;
  });
}

/**
 * Toggle a playing card: move between unselected and "Currently Playing".
 */
function togglePlaying(card) {
  if (playingSelectedArr.includes(card)) {
    playingSelectedArr = playingSelectedArr.filter(c => c !== card);
    playingCardsArr.push(card);
  } else {
    playingCardsArr = playingCardsArr.filter(c => c !== card);
    playingSelectedArr.push(card);
  }
  renderAll();
}

/**
 * Remove a card from all arrays.
 */
function removeCard(card) {
  jokersArr          = jokersArr.filter(c => c !== card);
  playingCardsArr    = playingCardsArr.filter(c => c !== card);
  playingSelectedArr = playingSelectedArr.filter(c => c !== card);
  renderAll();
}

/**
 * Enable drag-and-drop reordering within a container.
 */
function enableDrag(containerEl, arr) {
  let draggedEl = null;
  containerEl.addEventListener("dragstart", (e) => {
    const target = e.target.closest(".card-item");
    if (!target) return;
    draggedEl = target;
    e.dataTransfer.setData("text/plain", target.dataset.index);
    e.dataTransfer.effectAllowed = "move";
  });
  containerEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    const target = e.target.closest(".card-item");
    if (!target || target === draggedEl) return;
    target.classList.add("drag-over");
    e.dataTransfer.dropEffect = "move";
  });
  containerEl.addEventListener("dragleave", (e) => {
    const target = e.target.closest(".card-item");
    if (target) target.classList.remove("drag-over");
  });
  containerEl.addEventListener("drop", (e) => {
    e.preventDefault();
    const target = e.target.closest(".card-item");
    if (!target || target === draggedEl) return;
    target.classList.remove("drag-over");
    const srcIndex = parseInt(draggedEl.dataset.index, 10);
    const tgtIndex = parseInt(target.dataset.index, 10);
    if (isNaN(srcIndex) || isNaN(tgtIndex) || srcIndex === tgtIndex) return;
    [arr[srcIndex], arr[tgtIndex]] = [arr[tgtIndex], arr[srcIndex]];
    renderAll();
  });
  containerEl.addEventListener("dragend", () => {
    draggedEl = null;
    Array.from(containerEl.querySelectorAll(".card-item"))
         .forEach(el => el.classList.remove("drag-over"));
  });
}

/**
 * Populate a <select> element with data.
 */
function populateDropdown(selectEl, dataArr, defaultText) {
  selectEl.innerHTML = "";
  const defOpt = document.createElement("option");
  defOpt.value = "";
  defOpt.textContent = `-- ${defaultText} --`;
  selectEl.appendChild(defOpt);
  dataArr.forEach(item => {
    let label, value;
    if (typeof item === "string") {
      label = item;
      value = item;
    } else {
      label = item.label;
      value = item.value;
    }
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    selectEl.appendChild(opt);
  });
}

/**
 * Return the image URL for a card.
 * For jokers: images/jokers/<Name with underscores>.png.
 * For playing cards: returns the cached composite (if available) or a placeholder.
 */
function getCardImage(card) {
  if (card.type === "joker") {
    return `images/jokers/${card.name.replace(/\s+/g, "_")}.png`;
  } else {
    return card.composite || "images/placeholder.png";
  }
}
