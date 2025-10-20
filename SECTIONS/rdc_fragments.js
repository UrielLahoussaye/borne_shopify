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
    
    this.init();
  }

  init() {
    console.log('🎨 Fragments Carousel initialized with', this.totalCards, 'cards');
    
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
   * Détection de la carte centrale au scroll
   */
  setupScrollDetection() {
    this.carousel.addEventListener('scroll', () => {
      clearTimeout(this.scrollTimeout);
      
      this.scrollTimeout = setTimeout(() => {
        this.updateCenterCard();
      }, 100);
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
      
      // Retirer la classe is-center de toutes les cartes
      card.classList.remove('is-center');
    });
    
    // Ajouter la classe is-center à la carte la plus proche du centre
    if (closestCard) {
      closestCard.card.classList.add('is-center');
      this.currentIndex = closestCard.index;
      this.updateIndicators();
    }
  }

  /**
   * Navigation vers la carte suivante
   */
  next() {
    const nextIndex = Math.min(this.currentIndex + 1, this.totalCards - 1);
    this.scrollToCard(nextIndex);
  }

  /**
   * Navigation vers la carte précédente
   */
  prev() {
    const prevIndex = Math.max(this.currentIndex - 1, 0);
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
        const isCentered = card.classList.contains('is-center');
        
        if (isCentered) {
          console.log('✨ Central card clicked - Ready to open article');
          // TODO Phase 2: Ouvrir l'article
          // window.location.href = card.dataset.url;
        } else {
          console.log('➡️ Scrolling to card', index);
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
