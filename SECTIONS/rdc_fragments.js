/**
 * RDC FRAGMENTS D'HISTOIRE
 * Carrousel 3D rotatif pour blog
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
    this.isAnimating = false;
    this.autoRotateInterval = null;
    
    this.init();
  }

  init() {
    console.log('🎨 Fragments Carousel initialized with', this.totalCards, 'cards');
    
    // Initialiser les positions des cartes
    this.updateCardPositions();
    
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
    
    // Auto-rotation (optionnel)
    // this.startAutoRotate();
    
    // Support clavier
    this.setupKeyboardNavigation();
  }

  /**
   * Met à jour les positions de toutes les cartes
   */
  updateCardPositions() {
    this.cards.forEach((card, index) => {
      const position = this.getCardPosition(index);
      card.setAttribute('data-position', position);
      card.style.zIndex = this.getZIndex(position);
    });
    
    // Mettre à jour les indicateurs
    this.updateIndicators();
  }

  /**
   * Calcule la position relative d'une carte par rapport à la carte active
   */
  getCardPosition(cardIndex) {
    let position = cardIndex - this.currentIndex;
    
    // Gérer le wrap-around (boucle circulaire)
    if (position > this.totalCards / 2) {
      position -= this.totalCards;
    } else if (position < -this.totalCards / 2) {
      position += this.totalCards;
    }
    
    return position;
  }

  /**
   * Détermine le z-index basé sur la position
   */
  getZIndex(position) {
    const absPosition = Math.abs(position);
    return 10 - absPosition;
  }

  /**
   * Navigation vers la carte suivante
   */
  next() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex + 1) % this.totalCards;
    this.updateCardPositions();
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 800);
  }

  /**
   * Navigation vers la carte précédente
   */
  prev() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards;
    this.updateCardPositions();
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 800);
  }

  /**
   * Navigation vers une carte spécifique
   */
  goToSlide(index) {
    if (this.isAnimating || index === this.currentIndex) return;
    
    this.isAnimating = true;
    this.currentIndex = index;
    this.updateCardPositions();
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 800);
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
        this.goToSlide(index);
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
   * Filtrer les cartes (Phase 2)
   */
  filterCards(filterValue) {
    // Phase 1: Juste un log
    console.log('Filtering by:', filterValue);
    
    // Phase 2: Implémenter le filtrage réel des articles
    // if (filterValue === 'all') {
    //   this.cards.forEach(card => card.style.display = 'block');
    // } else {
    //   this.cards.forEach(card => {
    //     const tags = card.dataset.tags || '';
    //     card.style.display = tags.includes(filterValue) ? 'block' : 'none';
    //   });
    // }
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
        
        // TODO Phase 2: Rechercher dans les articles
        this.searchCards(query);
      }, 300);
    });
  }

  /**
   * Rechercher dans les cartes (Phase 2)
   */
  searchCards(query) {
    // Phase 1: Juste un log
    console.log('Searching for:', query);
    
    // Phase 2: Implémenter la recherche réelle
    // if (!query) {
    //   this.cards.forEach(card => card.style.display = 'block');
    //   return;
    // }
    // 
    // this.cards.forEach(card => {
    //   const title = card.dataset.title || '';
    //   const content = card.dataset.content || '';
    //   const match = title.toLowerCase().includes(query) || 
    //                 content.toLowerCase().includes(query);
    //   card.style.display = match ? 'block' : 'none';
    // });
  }

  /**
   * Configuration des clics sur les cartes
   */
  setupCardClicks() {
    this.cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        const position = parseInt(card.getAttribute('data-position'));
        
        // Si c'est la carte centrale, on peut ouvrir l'article
        if (position === 0) {
          console.log('✨ Card clicked:', index);
          // TODO Phase 2: Ouvrir l'article
          // window.location.href = card.dataset.url;
        } else {
          // Sinon, naviguer vers cette carte
          this.goToSlide(index);
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

  /**
   * Auto-rotation (optionnel)
   */
  startAutoRotate(interval = 5000) {
    this.stopAutoRotate();
    
    this.autoRotateInterval = setInterval(() => {
      this.next();
    }, interval);
    
    // Arrêter l'auto-rotation lors d'une interaction
    ['click', 'touchstart'].forEach(event => {
      this.section.addEventListener(event, () => {
        this.stopAutoRotate();
      }, { once: true });
    });
  }

  /**
   * Arrêter l'auto-rotation
   */
  stopAutoRotate() {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
      this.autoRotateInterval = null;
    }
  }

  /**
   * Détruire l'instance
   */
  destroy() {
    this.stopAutoRotate();
    // Nettoyer les event listeners si nécessaire
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
