const skills = [
  {
    title: "Python",
    type: "Language",
    use: "Used with Flask and FastAPI to build the backends for Schipper Statlines and Fragrance Finder",
    icon: "🐍",
  },
  {
    title: "R/RStudio",
    type: "Language",
    use: "Machine learning projects and exploration",
    icon: "🤖",
  },
  {
    title: "HTML/CSS",
    type: "Languages",
    use: "Schipper Translate frontend, Schipper Statlines frontend, Fragrance Finder frontend, website styling",
    icon: "🎨",
  },
  {
    title: "Java",
    type: "Language",
    use: "Blackjack game, educational programs and GUI applications",
    icon: "☕",
  },
  {
    title: "C/Assembly",
    type: "Languages",
    use: "Low-level programming, learning about computer architecture",
    icon: "⚙️",
  },
  {
    title: "C++",
    type: "Language",
    use: "Explorations in object-oriented programming, data structures, and algorithms",
    icon: "➕",
  },
  
  {
    title: "SQL",
    type: "Language",
    use: "SQLite and PostgreSQL, including a self-designed Postgres schema for Schipper Statlines",
    icon: "🗄️🔍",
  },
  // midpoint
  {
    title: "JavaScript",
    type: "Language",
    use: "Schipper Translate, frontend for Schipper Statlines & Fragrance Finder",
    icon: "⚡",
  },
  {
    title: "Flask",
    type: "Framework",
    use: "Database retrieval, URL routing, request handling. Used in the backend of Schipper Statlines",
    icon: "🧪",
  },
  {
    title: "FastAPI",
    type: "Framework",
    use: "Powers the Fragrance Finder backend, serving semantic search over 24,000+ fragrances",
    icon: "🚀",
  },
  {
    title: "Hugging Face",
    type: "Library",
    use: "Sentence Transformers for semantic search in Fragrance Finder",
    icon: "🤗",
  },
  {
    title: "SQLAlchemy",
    type: "Library",
    use: "ORM layer in Flask for Schipper Statlines, executing queries and formatting results for the frontend",
    icon: "🔗",
  },
  {
    title: "Supabase",
    type: "Hosting",
    use: "Hosts the Postgres database for Schipper Statlines, combining the Lahman Baseball database with additional datasets",
    icon: "☁️",
  },
  {
    title: "Render",
    type: "Hosting",
    use: "Deployment platform for Schipper Statlines, providing a live site for exploring baseball data",
    icon: "🌐",
  },
  {
    title: "Git & GitHub",
    type: "Version Control",
    use: "Team collaboration, project tracking, and versioning",
    icon: "🛠️",
  },
  
];

let dealt = false;

window.dealCards = function () {
  if (dealt) return;
  dealt = true;

  const deck = document.querySelector(".deck-stack");
  if (deck) deck.style.display = "none";

  const container = document.getElementById("cardContainer");
  const isTabletView = window.innerWidth >= 641 && window.innerWidth <= 1024;
  const isDesktopView = window.innerWidth > 1024;

  setTimeout(() => {
    const containerWidth = container.offsetWidth;
    const idealSpacing = 200;
    const minSpacing = 100;

    const spacing =
      (skills.length - 1) * idealSpacing > containerWidth
        ? Math.max(minSpacing, containerWidth / (skills.length - 1))
        : idealSpacing;

    const centerOffset = ((skills.length - 1) / 2) * spacing;
    const midpoint = (skills.length - 1) / 2;

    const cardData = skills.map((skill, index) => {
      const direction = index < midpoint ? -1 : 1;
      const distanceFromCenter = Math.abs(index - midpoint);
      const baseRotation = direction * distanceFromCenter * 5;

      // Fixed z-index calculation - ensure center cards have highest z-index
      let zIndex;
      if (index === Math.floor(midpoint) || index === Math.ceil(midpoint)) {
        // Center card(s) get highest z-index
        zIndex = skills.length + 10;
      } else {
        // Other cards get z-index based on distance from center (closer = higher)
        zIndex = skills.length - distanceFromCenter;
      }

      return {
        skill,
        index,
        zIndex,
        baseRotation,
        distanceFromCenter
      };
    });

    // Create cards in original order but set z-index properly
    cardData.forEach(({ skill, index, zIndex, baseRotation }) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <h3>${skill.icon} ${skill.title}</h3>
        <p><strong>Type:</strong> ${skill.type}</p>
        <p><strong>Use:</strong> ${skill.use}</p>
      `;

      card.style.setProperty('z-index', zIndex.toString(), 'important');
      card.setAttribute('data-original-zindex', zIndex);
      card.setAttribute('data-original-index', index);
      container.appendChild(card);

      // Animate in unless tablet view
      setTimeout(() => {
        card.classList.add("revealed");

        if (isDesktopView) {
          card.style.transform = `
            translateX(${index * spacing - centerOffset}px)
            translateX(-50%)
            rotate(${baseRotation}deg)
          `;
        } else {
          card.style.transform = "none";
        }
      }, index * 300);

      // Hover animation — only on desktop
      if (isDesktopView) {
        card.addEventListener("mouseenter", () => {
          // Set the hovered card to highest z-index
          card.style.setProperty('z-index', (skills.length + 20).toString(), 'important');
          card.style.transform = `
            translateX(${index * spacing - centerOffset}px)
            translateX(-50%)
            rotate(0deg)
          `;
        });

        card.addEventListener("mouseleave", () => {
          // Reset to original z-index
          const originalZIndex = card.getAttribute('data-original-zindex');
          card.style.setProperty('z-index', originalZIndex, 'important');
          
          card.style.transform = `
            translateX(${index * spacing - centerOffset}px)
            translateX(-50%)
            rotate(${baseRotation}deg)
          `;
        });
      }
    });

    setTimeout(() => {
      const allCards = container.querySelectorAll('.card');
      allCards.forEach(card => {
        if (!card.classList.contains('revealed')) {
          card.classList.add('revealed');
        }
      });
    }, (skills.length * 300) + 500);
  });
};