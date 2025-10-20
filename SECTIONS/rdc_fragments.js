/**
 * RDC FRAGMENTS D'HISTOIRE
 * Carrousel horizontal scrollable pour blog
 * Phase 1: Système avec cadres de couleur
 * Phase 2: Connexion aux articles du blog
 */

class FragmentsCarousel {
  constructor(section) {
    this.section = section;
    this.sectionId = section.dataset.sectionId;
    this.carousel = section.querySelector('.fragments-carousel');
    this.cards = Array.from(section.querySelectorAll('.fragment-card'));
    this.indicators = Array.from(section.querySelectorAll('.indicator'));
    this.prevBtn = section.querySelector('.carousel-nav-prev');
    this.nextBtn = section.querySelector('.carousel-nav-next');
    this.searchInput = section.querySelector('.fragments-search-input');
    this.filters = Array.from(section.querySelectorAll('.fragments-filter'));
    
    this.currentIndex = 0;
    this.totalCards = this.cards.length;
    this.scrollTimeout = null;
    this.targetIndex = null; // Carte ciblée lors d'un clic
    
    this.init();
  }

  init() {
    console.log('🎨 Fragments Carousel initialized with', this.totalCards, 'cards');
    
    // Mettre à jour le placeholder de recherche avec le nombre de cartes
    this.updateSearchPlaceholder();
    
    // Détecter la carte centrale au scroll
    this.setupScrollDetection();
    
    // Événements de navigation
    this.setupNavigation();
    
    // Événements des indicateurs
    this.setupIndicators();
    
    // Événements des filtres
    this.setupFilters();
    
    // Événement de recherche
    this.setupSearch();
    
    // Clics sur les cartes
    this.setupCardClicks();
    
    // Support clavier
    this.setupKeyboardNavigation();
    
    // Centrer la carte du milieu au chargement
    setTimeout(() => {
      const middleIndex = Math.floor(this.totalCards / 2);
      this.scrollToCard(middleIndex);
    }, 100);
  }

  /**
   * Met à jour le placeholder de recherche avec le nombre de cartes
   */
  updateSearchPlaceholder() {
    if (!this.searchInput) return;
    
    this.searchInput.placeholder = `Rechercher parmi les ${this.totalCards} fragments...`;
  }

  /**
   * Détection de la carte centrale au scroll
   */
  setupScrollDetection() {
    this.carousel.addEventListener('scroll', () => {
      // Toujours détecter en temps réel quelle carte est au centre
      this.updateCenterCard();
      
      // Après le scroll, réinitialiser la cible
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.targetIndex = null;
        this.updateCenterCard();
      }, 50);
    });
  }

  /**
   * Met à jour quelle carte est au centre
   */
  updateCenterCard() {
    const carouselRect = this.carousel.getBoundingClientRect();
    const carouselCenter = carouselRect.left + carouselRect.width / 2;
    
    let closestCard = null;
    let closestDistance = Infinity;
    
    this.cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(carouselCenter - cardCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestCard = { card, index };
      }
    });
    
    // Si on a une carte ciblée (clic/navigation), la garder active pendant le scroll
    if (this.targetIndex !== null) {
      // Garder la carte ciblée active pendant tout le trajet
      this.cards.forEach((card, index) => {
        if (index === this.targetIndex) {
          card.classList.add('is-center');
        } else {
          card.classList.remove('is-center');
        }
      });
    } else {
      // Sinon, mettre à jour normalement selon la carte la plus proche
      this.cards.forEach(card => card.classList.remove('is-center'));
      if (closestCard) {
        closestCard.card.classList.add('is-center');
      }
    }
    
    // Mettre à jour l'index courant
    if (closestCard) {
      this.currentIndex = closestCard.index;
      this.updateIndicators();
    }
  }

  /**
   * Navigation vers la carte suivante (avec boucle)
   */
  next() {
    // Boucler : si on est à la dernière carte, revenir à la première
    const nextIndex = (this.currentIndex + 1) % this.totalCards;
    
    // Définir la cible et appliquer l'animation immédiatement
    this.targetIndex = nextIndex;
    this.cards.forEach((card, index) => {
      if (index === nextIndex) {
        card.classList.add('is-center');
      } else {
        card.classList.remove('is-center');
      }
    });
    
    this.scrollToCard(nextIndex);
  }

  /**
   * Navigation vers la carte précédente (avec boucle)
   */
  prev() {
    // Boucler : si on est à la première carte, aller à la dernière
    const prevIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards;
    
    // Définir la cible et appliquer l'animation immédiatement
    this.targetIndex = prevIndex;
    this.cards.forEach((card, index) => {
      if (index === prevIndex) {
        card.classList.add('is-center');
      } else {
        card.classList.remove('is-center');
      }
    });
    
    this.scrollToCard(prevIndex);
  }

  /**
   * Scroll vers une carte spécifique
   */
  scrollToCard(index) {
    if (index < 0 || index >= this.totalCards) return;
    
    const card = this.cards[index];
    if (!card) return;
    
    // Calculer la position de scroll pour centrer la carte
    const carouselRect = this.carousel.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const scrollLeft = this.carousel.scrollLeft;
    
    const targetScroll = scrollLeft + (cardRect.left - carouselRect.left) - (carouselRect.width / 2) + (cardRect.width / 2);
    
    this.carousel.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }

  /**
   * Configuration de la navigation
   */
  setupNavigation() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }
  }

  /**
   * Configuration des indicateurs
   */
  setupIndicators() {
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        // Définir la cible et appliquer l'animation immédiatement
        this.targetIndex = index;
        this.cards.forEach((card, cardIndex) => {
          if (cardIndex === index) {
            card.classList.add('is-center');
          } else {
            card.classList.remove('is-center');
          }
        });
        
        this.scrollToCard(index);
      });
    });
  }

  /**
   * Met à jour l'état actif des indicateurs
   */
  updateIndicators() {
    this.indicators.forEach((indicator, index) => {
      if (index === this.currentIndex) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }

  /**
   * Configuration des filtres
   */
  setupFilters() {
    this.filters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        // Retirer l'état actif de tous les filtres
        this.filters.forEach(f => f.classList.remove('active'));
        
        // Activer le filtre cliqué
        e.target.classList.add('active');
        
        const filterValue = e.target.dataset.filter;
        console.log('🔍 Filter selected:', filterValue);
        
        // TODO Phase 2: Filtrer les articles par tag
        this.filterCards(filterValue);
      });
    });
  }

  /**
   * Filtrer les cartes par tag
   */
  filterCards(filterValue) {
    console.log('🏷️ Filtering by:', filterValue);
    
    let visibleCount = 0;
    
    if (filterValue === 'all') {
      // Afficher toutes les cartes
      this.cards.forEach(card => {
        card.style.display = 'flex';
        visibleCount++;
      });
    } else {
      // Filtrer par tag (normaliser les tags pour la comparaison)
      this.cards.forEach(card => {
        const tags = card.dataset.tags || '';
        const tagsArray = tags.split(',').map(tag => this.handleize(tag.trim()));
        const match = tagsArray.includes(filterValue.toLowerCase());
        
        if (match) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });
    }
    
    console.log(`✅ ${visibleCount} carte(s) affichée(s)`);
    
    // Mettre à jour la carte centrale après le filtrage
    setTimeout(() => {
      this.updateCenterCard();
    }, 100);
  }

  /**
   * Normaliser un tag (similaire au filtre handleize de Shopify)
   */
  handleize(str) {
    return str
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Configuration de la recherche
   */
  setupSearch() {
    if (!this.searchInput) return;
    
    let searchTimeout;
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      
      searchTimeout = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        console.log('🔎 Search query:', query);
        
        this.searchCards(query);
      }, 300);
    });
  }

  /**
   * Rechercher dans les cartes
   */
  searchCards(query) {
    let visibleCount = 0;
    
    this.cards.forEach((card, index) => {
      // Récupérer le titre de la carte
      const titleElement = card.querySelector('.fragment-card-title');
      const title = titleElement ? titleElement.textContent.toLowerCase() : '';
      
      // Vérifier si le titre contient le terme de recherche
      const match = !query || title.includes(query);
      
      if (match) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    console.log(`✅ ${visibleCount} carte(s) trouvée(s)`);
    
    // Mettre à jour la carte centrale après le filtrage
    setTimeout(() => {
      this.updateCenterCard();
    }, 100);
  }

  /**
   * Configuration des clics sur les cartes
   */
  setupCardClicks() {
    this.cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        const isCentered = card.classList.contains('is-center');
        
        if (isCentered) {
          // Ouvrir l'article
          const articleUrl = card.dataset.articleUrl;
          if (articleUrl) {
            console.log('✨ Opening article:', articleUrl);
            window.location.href = articleUrl;
          }
        } else {
          console.log('➡️ Scrolling to card', index);
          
          // Définir cette carte comme cible
          this.targetIndex = index;
          
          // Appliquer immédiatement la classe is-center pour démarrer l'animation
          this.cards.forEach(c => c.classList.remove('is-center'));
          card.classList.add('is-center');
          
          // Puis scroller vers la carte
          this.scrollToCard(index);
        }
      });
    });
  }

  /**
   * Navigation au clavier
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Vérifier si on est dans la section
      const rect = this.section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (!inView) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      }
    });
  }
}

// ============================================
// INITIALISATION
// ============================================

function initFragmentsCarousels() {
  const sections = document.querySelectorAll('.rdc-fragments-section');
  
  sections.forEach(section => {
    // Éviter la double initialisation
    if (section.dataset.initialized) return;
    
    new FragmentsCarousel(section);
    section.dataset.initialized = 'true';
    
    console.log('✅ Fragments carousel initialized');
  });
}

// Initialisation au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFragmentsCarousels);
} else {
  initFragmentsCarousels();
}

// Support pour l'éditeur de thème Shopify
if (typeof Shopify !== 'undefined' && Shopify.designMode) {
  document.addEventListener('shopify:section:load', (event) => {
    const section = event.target.querySelector('.rdc-fragments-section');
    if (section && !section.dataset.initialized) {
      new FragmentsCarousel(section);
      section.dataset.initialized = 'true';
    }
  });
  
  document.addEventListener('shopify:section:unload', (event) => {
    const section = event.target.querySelector('.rdc-fragments-section');
    if (section) {
      section.dataset.initialized = '';
    }
  });
}
