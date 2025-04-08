// script.js

// We'll keep all added cards in this array, regardless of type
const myCards = [];

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements for Standard Card
  const rankSelect = document.getElementById("rankSelect");
  const suitSelect = document.getElementById("suitSelect");
  const editionSelectCard = document.getElementById("editionSelectCard");
  const enhancementSelectCard = document.getElementById("enhancementSelectCard");
  const sealSelectCard = document.getElementById("sealSelectCard");
  const addCardBtn = document.getElementById("addCardBtn");

  // DOM elements for Joker Card
  const jokerSelect = document.getElementById("jokerSelect");
  const editionSelectJoker = document.getElementById("editionSelectJoker");
  const enhancementSelectJoker = document.getElementById("enhancementSelectJoker");
  const sealSelectJoker = document.getElementById("sealSelectJoker");
  const addJokerBtn = document.getElementById("addJokerBtn");

  // DOM element for the cards container
  const cardsContainer = document.getElementById("cardsContainer");

  // Populate dropdowns for Standard Card
  populateDropdown(rankSelect, RANKS.map(r => ({ label: r, value: r })), "Select Rank");
  populateDropdown(suitSelect, SUITS.map(s => ({ label: s, value: s })), "Select Suit");
  populateDropdown(editionSelectCard, EDITIONS.map(e => ({ label: e, value: e })), "Select Edition");
  populateDropdown(enhancementSelectCard, ENHANCEMENTS.map(en => ({ label: en, value: en })), "Select Enhancement");
  populateDropdown(sealSelectCard, SEALS.map(se => ({ label: se, value: se })), "Select Seal");

  // Populate dropdown for Joker Card
  // We'll display just the Joker "name" in the dropdown, but keep track of the rarity
  const jokerDropdownItems = JOKERS.map(j => ({
    label: `${j.name} [${j.rarity}]`,
    value: j.name
  }));

  populateDropdown(jokerSelect, jokerDropdownItems, "Select Joker");

  populateDropdown(editionSelectJoker, EDITIONS.map(e => ({ label: e, value: e })), "Select Edition");
  populateDropdown(enhancementSelectJoker, ENHANCEMENTS.map(en => ({ label: en, value: en })), "Select Enhancement");
  populateDropdown(sealSelectJoker, SEALS.map(se => ({ label: se, value: se })), "Select Seal");

  // Handle adding a Standard Card
  addCardBtn.addEventListener("click", () => {
    const rank = rankSelect.value;
    const suit = suitSelect.value;
    const edition = editionSelectCard.value;
    const enhancement = enhancementSelectCard.value;
    const seal = sealSelectCard.value;

    // Basic validation
    if (!rank || !suit) {
      alert("Please select both rank and suit for a standard card.");
      return;
    }

    // Construct a standard card object
    const standardCard = {
      type: "standard",
      rank: rank,
      suit: suit,
      edition: edition || "None",
      enhancement: enhancement || "None",
      seal: seal || "None"
    };

    // Add to our cards array
    myCards.push(standardCard);

    // Re-render
    renderMyCards(myCards, cardsContainer);
  });

  // Handle adding a Joker Card
  addJokerBtn.addEventListener("click", () => {
    const jokerName = jokerSelect.value;
    const edition = editionSelectJoker.value;
    const enhancement = enhancementSelectJoker.value;
    const seal = sealSelectJoker.value;

    if (!jokerName) {
      alert("Please select a Joker type.");
      return;
    }

    // Find the Joker object in JOKERS to get its rarity
    const jokerObj = JOKERS.find(j => j.name === jokerName);

    // Construct a joker card object
    const jokerCard = {
      type: "joker",
      name: jokerObj.name,
      rarity: jokerObj.rarity,
      edition: edition || "None",
      enhancement: enhancement || "None",
      seal: seal || "None"
    };

    // Add to the array
    myCards.push(jokerCard);

    // Re-render
    renderMyCards(myCards, cardsContainer);
  });
});

/**
 * Helper function to populate a <select> element with options.
 * itemsArray is an array of objects with {label, value}.
 */
function populateDropdown(selectEl, itemsArray, defaultLabel) {
  selectEl.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = `-- ${defaultLabel} --`;
  selectEl.appendChild(defaultOption);

  itemsArray.forEach(item => {
    const option = document.createElement("option");
    option.value = item.value;
    option.textContent = item.label;
    selectEl.appendChild(option);
  });
}

/**
 * Render the entire myCards array into the #cardsContainer.
 */
function renderMyCards(cardsArray, containerEl) {
  containerEl.innerHTML = ""; // clear old display

  if (cardsArray.length === 0) {
    containerEl.textContent = "No cards have been added.";
    return;
  }

  cardsArray.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card-item");

    let cardHTML = `<strong>Card #${index + 1}</strong><br>`;

    if (card.type === "standard") {
      cardHTML += `
        <strong>Type:</strong> Standard<br>
        <strong>Rank:</strong> ${card.rank}<br>
        <strong>Suit:</strong> ${card.suit}<br>
      `;
    } else {
      // Joker
      cardHTML += `
        <strong>Type:</strong> Joker<br>
        <strong>Joker Name:</strong> ${card.name}<br>
        <strong>Rarity:</strong> ${card.rarity}<br>
      `;
    }

    // Common fields
    cardHTML += `
      <strong>Edition:</strong> ${card.edition}<br>
      <strong>Enhancement:</strong> ${card.enhancement}<br>
      <strong>Seal:</strong> ${card.seal}<br>
    `;

    cardDiv.innerHTML = cardHTML;
    containerEl.appendChild(cardDiv);
  });
}
