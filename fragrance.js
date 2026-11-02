const modeCards = document.querySelectorAll(".similar, .byNotes, .surpriseMe");

// Function to activate a card
function activateCard(card) {
  // Check if this card is already active
  const wasAlreadyActive = card.classList.contains("active");

  // Remove active from all cards
  modeCards.forEach((c) => c.classList.remove("active"));

  // Add active to clicked card
  card.classList.add("active");

  // Add dimmed to non-active cards
  modeCards.forEach((c) => {
    if (c !== card) {
      c.classList.add("dimmed");
    } else {
      c.classList.remove("dimmed");
    }
  });

  // Only clear inputs/results if switching to a DIFFERENT card
  if (!wasAlreadyActive) {
    // Clear all input fields
    const fragranceInput = document.getElementById("fragranceInput");
    const noteInput = document.getElementById("noteInput");
    if (fragranceInput) fragranceInput.value = "";
    if (noteInput) noteInput.value = "";

    // Clear all result grids
    const allResultGrids = document.querySelectorAll(".results-grid");
    allResultGrids.forEach((grid) => (grid.innerHTML = ""));

    // Hide all loading/error/no-results messages
    const allSpinners = document.querySelectorAll(".loading-spinner");
    const allErrors = document.querySelectorAll(".error-message");
    const allNoResults = document.querySelectorAll(".no-results");
    
    allSpinners.forEach((spinner) => (spinner.style.display = "none"));
    allErrors.forEach((error) => (error.style.display = "none"));
    allNoResults.forEach((noResult) => (noResult.style.display = "none"));
  }

  // Show display section
  const mode = card.dataset.mode;
  console.log("Mode:", mode);
  showDisplaySection(mode);
}

// Card click handler
modeCards.forEach((card) => {
  card.addEventListener("click", function (e) {
    // Don't trigger if clicking input (so user can type)
    if (e.target.tagName === "INPUT") return;

    activateCard(this);
  });

  // Also listen for clicks on button or input to activate parent card
  const button = card.querySelector("button");
  const input = card.querySelector("input");

  if (button) {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent double-firing
      activateCard(card);
    });
  }

  if (input) {
    input.addEventListener("focus", function () {
      activateCard(card);
    });
  }
});

function showDisplaySection(mode) {
  // hide all sections
  const allSections = document.querySelectorAll(".display-section");
  allSections.forEach((section) => (section.style.display = "none"));

  // show the selected section
  const activeSection = document.getElementById(`${mode}Display`);
  if (activeSection) {
    activeSection.style.display = "block";
    activeSection.classList.add("show");
  }
}

// ============================================
// MODE 1: FIND SIMILAR FRAGRANCES
// ============================================
async function findSimilarFragrances() {
  const input = document.getElementById("fragranceInput");
  const genderSelect = document.getElementById("genderFilterSim");
  let perfumeName = input.value.trim();
  const selectedGender = genderSelect.value;

  if (!perfumeName) {
    alert("Please enter a fragrance name");
    return;
  }

  // Convert spaces to hyphens for API
  perfumeName = perfumeName.toLowerCase().replace(/\s+/g, "-");
  console.log("Searching for similar fragrances to:", perfumeName);

  // Show loading
  const loadingSpinner = document.querySelector(
    "#similarDisplay .loading-spinner"
  );
  const resultsGrid = document.querySelector("#similarDisplay .results-grid");
  const errorMessage = document.querySelector("#similarDisplay .error-message");

  loadingSpinner.style.display = "block";
  resultsGrid.innerHTML = "";
  errorMessage.style.display = "none";

  try {
    const response = await fetch(
      "https://fragrance-selector-backend.onrender.com/api/recommend/similar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          perfume_name: perfumeName,
          limit: 50,
          gender: selectedGender || null,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Fragrance not found");
    }

    const data = await response.json();

    // Hide loading
    loadingSpinner.style.display = "none";

    // Display results
    displayResults(data.results, "similar", resultsGrid);
  } catch (error) {
    console.error("Error:", error);
    loadingSpinner.style.display = "none";
    errorMessage.style.display = "block";
    errorMessage.textContent =
      "Could not find that fragrance. Please check the spelling.";
  }
}


// MODE 2: FIND BY NOTES
const noteInput = document.getElementById("noteInput");

async function findByNotes() {
  const noteValue = noteInput.value.trim().toLowerCase();
  const genderSelect = document.getElementById("genderFilterAcc");
  const selectedGender = genderSelect.value;

  if (!noteValue) {
    alert("Please enter a note");
    return;
  }

  console.log("Searching for fragrances with note:", noteValue);

  // Show loading
  const loadingSpinner = document.querySelector(
    "#notesDisplay .loading-spinner"
  );
  const resultsGrid = document.querySelector("#notesDisplay .results-grid");
  const errorMessage = document.querySelector("#notesDisplay .error-message");
  const noResults = document.querySelector("#notesDisplay .no-results");

  loadingSpinner.style.display = "block";
  resultsGrid.innerHTML = "";
  errorMessage.style.display = "none";
  noResults.style.display = "none";

  try {
    const response = await fetch(
      "https://fragrance-selector-backend.onrender.com/api/recommend/by-notes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: [noteValue],
          limit: 50,
          gender: selectedGender || null, // Add gender filter
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();

    // Hide loading
    loadingSpinner.style.display = "none";

    if (data.results.length === 0) {
      noResults.style.display = "block";
      return;
    }

    // Display results
    displayResults(data.results, "notes", resultsGrid);
  } catch (error) {
    console.error("Error:", error);
    loadingSpinner.style.display = "none";
    errorMessage.style.display = "block";
    errorMessage.textContent = "Could not search for that note. Please try again.";
  }
}


// MODE 3: SURPRISE ME
async function surpriseMe() {
  const genderSelect = document.getElementById("genderFilterRan");
  const selectedGender = genderSelect.value;

  // Show loading
  const loadingSpinner = document.querySelector(
    "#randomDisplay .loading-spinner"
  );
  const resultsGrid = document.querySelector("#randomDisplay .results-grid");
  const errorMessage = document.querySelector("#randomDisplay .error-message");

  loadingSpinner.style.display = "block";
  resultsGrid.innerHTML = "";
  errorMessage.style.display = "none";

  try {
    let url =
      "https://fragrance-selector-backend.onrender.com/api/recommend/random";
    if (selectedGender) {
      url += `?gender=${selectedGender}`;
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Fragrance not found");
    }

    const data = await response.json();
    console.log("Data received:", data);

    // Hide loading
    loadingSpinner.style.display = "none";

    // Display single result (note: data.result not data.results)
    displayResults([data.result], "random", resultsGrid); // Wrap in array for displayResults
  } catch (error) {
    console.error("Error:", error);
    loadingSpinner.style.display = "none";
    errorMessage.style.display = "block";
    errorMessage.textContent =
      "Could not find a fragrance. Please try again.";
  }
}

// Display Results
function displayResults(fragrances, mode, container) {
  if (!fragrances || fragrances.length === 0) {
    container.innerHTML = '<p class="no-results">No fragrances found.</p>';
    return;
  }

  fragrances.forEach((fragrance) => {
    const card = createResultCard(fragrance, mode);
    container.innerHTML += card;
  });
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Only allow http(s) links from the API
function safeURL(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.href
      : "";
  } catch {
    return "";
  }
}

function createResultCard(fragrance, mode) {
  // Clean up fragrance name (remove hyphens, capitalize)
  const cleanName = escapeHTML(
    String(fragrance.Perfume || "Unknown")
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );

  // clean up Brand name
  const cleanBrand = escapeHTML(
    String(fragrance.Brand || "Unknown Brand")
      .replace(/-/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
  const detailsURL = safeURL(fragrance.url);

  // Build accord badges
  const accords = [
    fragrance.mainaccord1,
    fragrance.mainaccord2,
    fragrance.mainaccord3,
    fragrance.mainaccord4,
    fragrance.mainaccord5,
  ].filter((accord) => accord && accord !== ""); // Remove empty accords

  const accordBadges = accords
    .map((accord) => `<span class="accord-badge">${escapeHTML(accord)}</span>`)
    .join("");

  // Build the card HTML
  return `
        <div class="result-card">
            <div class="result-header">
                <h3 class="fragrance-Name">${cleanName || "Unknown"}</h3>
                <p class="brand-name">${cleanBrand || "Unknown Brand"}</p>
            </div>
            
            <div class="similarity-section">
                ${
                  mode === "similar" && fragrance.similarity_score
                    ? `<span class="similarity-badge">${escapeHTML(
                        Math.round(fragrance.similarity_score * 100)
                      )}% match</span>`
                    : ""
                }
            </div>
            
            <div class="notes-section">
                ${
                  fragrance.Top
                    ? `<p class="notes"><strong>Top:</strong> ${escapeHTML(fragrance.Top)}</p>`
                    : ""
                }
                ${
                  fragrance.Middle
                    ? `<p class="notes"><strong>Middle:</strong> ${escapeHTML(fragrance.Middle)}</p>`
                    : ""
                }
                ${
                  fragrance.Base
                    ? `<p class="notes"><strong>Base:</strong> ${escapeHTML(fragrance.Base)}</p>`
                    : ""
                }
            </div>
            
            <div class="accord-badges">
                ${accordBadges}
            </div>
            
            <div class="card-footer">
                <span class="meta">${escapeHTML(fragrance.Year)} ${
    fragrance.Gender ? "• " + escapeHTML(fragrance.Gender) : ""
  }</span>
                ${
                  detailsURL
                    ? `<a href="${escapeHTML(detailsURL)}" target="_blank" rel="noopener noreferrer" class="view-link">View Details →</a>`
                    : ""
                }
            </div>
        </div>
    `;
}
