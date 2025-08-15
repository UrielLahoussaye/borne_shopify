document.addEventListener('DOMContentLoaded', function() {
  const borne = document.querySelector('.rdc-borne');
  const backButton = borne.querySelector('.rdc-borne__back-button');
  const history = [];
  let selectedCategory = null;

  // Parser le texte des collections
  function parseCollectionLinks(text) {
    const categories = {};
    if (!text) return categories;

    // Séparer les catégories (séparées par |)
    const categoryPairs = text.split('|');
    
    categoryPairs.forEach(pair => {
      // Séparer la catégorie de ses collections (séparées par :)
      const [category, collections] = pair.split(':');
      if (category && collections) {
        // Nettoyer les espaces et séparer les collections (séparées par ,)
        categories[category.trim()] = collections.split(',').map(c => c.trim());
      }
    });

    return categories;
  }

  // Récupérer et parser les données
  const collectionLinksText = document.getElementById('rdc-borne-data').textContent;
  const categoryCollections = parseCollectionLinks(collectionLinksText);

  // Afficher les collections d'une catégorie
  function displayCollections(categoryName) {
    const collections = categoryCollections[categoryName] || [];
    const container = borne.querySelector('.rdc-borne__collections');
    
    if (container) {
      const html = collections.map(collection => `
        <div class="rdc-borne__collection">
          <h3>${collection}</h3>
        </div>
      `).join('');
      
      container.innerHTML = html;
    }
  }

  // Navigation générale
  function navigateToScreen(screenNumber) {
    const currentScreen = borne.querySelector('.rdc-borne__screen[data-active="true"]');
    const nextScreen = borne.querySelector(`.rdc-borne__screen[data-screen="${screenNumber}"]`);

    if (currentScreen && nextScreen) {
      // Si on va à l'écran 2, afficher les collections de la catégorie
      if (screenNumber === '2' && selectedCategory) {
        displayCollections(selectedCategory);
      }

      history.push(currentScreen.dataset.screen);
      currentScreen.dataset.active = "false";
      nextScreen.dataset.active = "true";
    }
  }

  // Gestion des clics sur les catégories
  borne.addEventListener('click', function(event) {
    const category = event.target.closest('.rdc-borne__category');
    if (category) {
      const categoryTitle = category.querySelector('.rdc-borne__category-title').textContent;
      selectedCategory = categoryTitle;
      navigateToScreen('2');
      return;
    }

    // Navigation vers l'écran suivant
    if (event.target.matches('[data-action="next"]')) {
      const nextScreenNumber = event.target.dataset.target;
      navigateToScreen(nextScreenNumber);
    }
  });

  // Retour à l'écran précédent
  backButton.addEventListener('click', function() {
    if (history.length > 0) {
      const currentScreen = borne.querySelector('.rdc-borne__screen[data-active="true"]');
      const previousScreenNumber = history.pop();
      const previousScreen = borne.querySelector(`.rdc-borne__screen[data-screen="${previousScreenNumber}"]`);

      if (currentScreen && previousScreen) {
        currentScreen.dataset.active = "false";
        previousScreen.dataset.active = "true";
      }
    }
  });
});
