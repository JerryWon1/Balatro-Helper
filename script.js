// script.js

// An array to hold all added cards (both standard and joker)
const deck = [];

document.addEventListener("DOMContentLoaded", () => {
  // STANDARD CARD elements
  const rankSelect = document.getElementById("rankSelect");
  const suitSelect = document.getElementById("suitSelect");
  const editionSelectCard = document.getElementById("editionSelectCard");
  const enhancementSelectCard = document.getElementById("enhancementSelectCard");
  const sealSelectCard = document.getElementById("sealSelectCard");
  const addCardBtn = document.getElementById("addCardBtn");

  // JOKER elements
  const jokerSelect = document.getElementById("jokerSelect");
  const editionSelectJoker = document.getElementById("editionSelectJoker");
  const enhancementSelectJoker = document.getElementById("enhancementSelectJoker");
  const sealSelectJoker = document.getElementById("sealSelectJoker");
  const addJokerBtn = document.getElementById("addJokerBtn");

  // Deck display container
  const deckContainer = document.getElementById("deckContainer");

  // Populate dropdowns (Standard Card)
  populateDropdown(rankSelect, RANKS, "Select Rank");
  populateDropdown(suitSelect, SUITS, "Select Suit");
  populateDropdown(editionSelectCard, EDITIONS, "Select Edition");
  populateDropdown(enhancementSelectCard, ENHANCEMENTS, "Select Enhancement");
  populateDropdown(sealSelectCard, SEALS, "Select Seal");

  // Populate dropdowns (Joker)
  populateDropdown(jokerSelect, JOKERS, "Select Joker");
  populateDropdown(editionSelectJoker, EDITIONS, "Select Edition");
  populateDropdown(enhancementSelectJoker, ENHANCEMENTS, "Select Enhancement");
  populateDropdown(sealSelectJoker, SEALS, "Select Seal");

  // Add Standard Card
  addCardBtn.addEventListener("click", () => {
    const rank = rankSelect.value;
    const suit = suitSelect.value;
    const edition = editionSelectCard.value;
    const enhancement = enhancementSelectCard.value;
    const seal = sealSelectCard.value;

    if (!rank || !suit) {
      alert("Please select both rank and suit for a standard card.");
      return;
    }

    // Create a card object
    const card = {
      type: "standard",
      rank: rank,
      suit: suit,
      edition: edition || "None",
      enhancement: enhancement || "None",
      seal: seal || "None"
    };

    // Push to deck array
    deck.push(card);

    // Update display
    renderDeck(deck, deckContainer);
  });

  // Add Joker
  addJokerBtn.addEventListener("click", () => {
    const jokerType = jokerSelect.value;
    const edition = editionSelectJoker.value;
    const enhancement = enhancementSelectJoker.value;
    const seal = sealSelectJoker.value;

    if (!jokerType) {
      alert("Please select a Joker type.");
      return;
    }

    // Create a joker object
    const jokerCard = {
      type: "joker",
      jokerType: jokerType,
      edition: edition || "None",
      enhancement: enhancement || "None",
      seal: seal || "None"
    };

    // Push to deck array
    deck.push(jokerCard);

    // Update display
    renderDeck(deck, deckContainer);
  });
});

/**
 * Helper function to populate a <select> element with options
 */
function populateDropdown(selectEl, items, defaultLabel) {
  selectEl.innerHTML = "";

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = `-- ${defaultLabel} --`;
  selectEl.appendChild(placeholderOption);

  for (const item of items) {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    selectEl.appendChild(option);
  }
}

/**
 * Render the entire deck in the #deckContainer.
 * Each card is displayed as a small block with relevant info.
 */
function renderDeck(deckArray, containerEl) {
  containerEl.innerHTML = ""; // Clear previous

  if (deckArray.length === 0) {
    containerEl.textContent = "No cards added yet.";
    return;
  }

  deckArray.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card-item");

    let contentHtml = `<strong>Index #${index + 1}</strong><br>`;

    if (card.type === "standard") {
      contentHtml += `
        <strong>Type:</strong> Standard Card<br>
        <strong>Rank:</strong> ${card.rank}<br>
        <strong>Suit:</strong> ${card.suit}<br>
      `;
    } else {
      // Joker
      contentHtml += `
        <strong>Type:</strong> Joker Card<br>
        <strong>Joker Type:</strong> ${card.jokerType}<br>
      `;
    }

    // Shared fields
    contentHtml += `
      <strong>Edition:</strong> ${card.edition}<br>
      <strong>Enhancement:</strong> ${card.enhancement}<br>
      <strong>Seal:</strong> ${card.seal}<br>
    `;

    cardDiv.innerHTML = contentHtml;
    containerEl.appendChild(cardDiv);
  });
}
