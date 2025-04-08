document.addEventListener("DOMContentLoaded", () => {
    // Get references to UI elements
    const rankSelect = document.getElementById("rankSelect");
    const suitSelect = document.getElementById("suitSelect");
    const editionSelect = document.getElementById("editionSelect");
    const enhancementSelect = document.getElementById("enhancementSelect");
    const sealSelect = document.getElementById("sealSelect");
    const displayCardBtn = document.getElementById("displayCardBtn");
    const cardDisplay = document.getElementById("cardDisplay");
  
    // Populate dropdowns
    populateDropdown(rankSelect, RANKS, "Select Rank");
    populateDropdown(suitSelect, SUITS, "Select Suit");
    populateDropdown(editionSelect, EDITIONS, "Select Edition");
    populateDropdown(enhancementSelect, ENHANCEMENTS, "Select Enhancement");
    populateDropdown(sealSelect, SEALS, "Select Seal");
  
    // Display button click
    displayCardBtn.addEventListener("click", () => {
      // Clear any previous display
      cardDisplay.innerHTML = "";
  
      // Get selected values
      const selectedRank = rankSelect.value;
      const selectedSuit = suitSelect.value;
      const selectedEdition = editionSelect.value;
      const selectedEnhancement = enhancementSelect.value;
      const selectedSeal = sealSelect.value;
  
      // Create container
      const container = document.createElement("div");
      container.classList.add("card-container");
  
      // Create a heading
      const heading = document.createElement("h2");
      heading.textContent = "Selected Card";
      container.appendChild(heading);
  
      // Create details paragraph
      const details = document.createElement("p");
      details.innerHTML = `
        <strong>Rank:</strong> ${selectedRank} <br>
        <strong>Suit:</strong> ${selectedSuit} <br>
        <strong>Edition:</strong> ${selectedEdition} <br>
        <strong>Enhancement:</strong> ${selectedEnhancement} <br>
        <strong>Seal:</strong> ${selectedSeal}
      `;
      container.appendChild(details);
  
      // Append to display
      cardDisplay.appendChild(container);
    });
  });
  
  /**
   * Helper to populate a <select> element with array items.
   * Adds a default option with a custom label.
   */
  function populateDropdown(selectEl, itemsArray, defaultLabel) {
    selectEl.innerHTML = "";
  
    // Default placeholder
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = `-- ${defaultLabel} --`;
    selectEl.appendChild(placeholderOption);
  
    // Fill from array
    for (const item of itemsArray) {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      selectEl.appendChild(option);
    }
  }
  