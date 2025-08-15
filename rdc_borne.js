document.addEventListener('DOMContentLoaded', function() {
  const borne = document.querySelector('.rdc-borne');
  const backButton = borne.querySelector('.rdc-borne__back-button');
  const history = [];
  let selectedCategory = null;
  let selectedCollection = null;
  let selectedProduct = null;

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

  function updateCollections(category) {
    const collections = document.querySelectorAll('.rdc-borne__collection');
    collections.forEach(collection => {
      const collectionTitle = collection.querySelector('h3').textContent;
      const mappings = categoryCollections[category] || [];
      if (mappings.includes(collectionTitle)) {
        collection.style.display = '';
      } else {
        collection.style.display = 'none';
      }
    });
  }

  // Navigation générale
  function navigateToScreen(screenNumber) {
    const currentScreen = borne.querySelector('.rdc-borne__screen[data-active="true"]');
    const nextScreen = borne.querySelector(`.rdc-borne__screen[data-screen="${screenNumber}"]`);

    if (currentScreen && nextScreen) {
      history.push(currentScreen.dataset.screen);
      currentScreen.dataset.active = "false";
      nextScreen.dataset.active = "true";
    }
  }

  // Gestion des clics sur les catégories et collections
  borne.addEventListener('click', function(event) {
    const category = event.target.closest('.rdc-borne__category');
    const collection = event.target.closest('.rdc-borne__collection');

    if (category) {
      const categoryTitle = category.dataset.category;
      selectedCategory = categoryTitle;
      document.getElementById('selected-category').value = categoryTitle;
      document.querySelector('.rdc-borne__selected-category').textContent = categoryTitle;
      updateCollections(categoryTitle);
      navigateToScreen('2');
      return;
    }

    if (collection) {
      const collectionHandle = collection.dataset.handle;
      selectedCollection = collection.querySelector('h3').textContent;
      const url = new URL(window.location.pathname, window.location.origin);
      url.searchParams.set('collection', collectionHandle);
      window.history.pushState({}, '', url.pathname + '?' + url.searchParams.toString());
      navigateToScreen('3');
      return;
    }


    // Gestion des clics sur les miniatures
    const thumbnail = event.target.matches('.rdc-borne__product-thumbnail');
    if (thumbnail) {
      const mainImage = borne.querySelector('.rdc-borne__product-main-image');
      mainImage.src = thumbnail.src;
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
