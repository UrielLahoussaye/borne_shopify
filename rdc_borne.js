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

  // Parser les images des collections
  function parseCollectionImages(text) {
    const images = {};
    if (!text) return images;

    const imagePairs = text.split('|');
    imagePairs.forEach(pair => {
      const [collection, imageUrl] = pair.split(':');
      if (collection && imageUrl) {
        images[collection.trim()] = imageUrl.trim();
      }
    });

    return images;
  }

  // Récupérer et parser les données
  const collectionLinksText = document.getElementById('rdc-borne-data').textContent;
  const collectionImagesText = document.getElementById('rdc-borne-collection-images').textContent;
  const categoryCollections = parseCollectionLinks(collectionLinksText);
  const collectionImages = parseCollectionImages(collectionImagesText);

  // Afficher les collections d'une catégorie
  function displayCollections(categoryName) {
    const collections = categoryCollections[categoryName] || [];
    const container = borne.querySelector('.rdc-borne__collections');
    
    if (container) {
      const html = collections.map(collection => `
        <div class="rdc-borne__collection">
          <img src="${collectionImages[collection] || ''}" alt="${collection}" class="rdc-borne__collection-image">
          <h3>${collection}</h3>
        </div>
      `).join('');
      
      container.innerHTML = html;
    }
  }

  // Charger les produits d'une collection
  async function loadCollectionProducts(collectionTitle) {
    try {
      const response = await fetch(`/collections/${collectionTitle.toLowerCase()}?view=json`);
      const products = await response.json();
      displayProducts(products);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  }

  // Afficher les produits
  function displayProducts(products) {
    const container = borne.querySelector('.rdc-borne__screen[data-screen="3"] .rdc-borne__content');
    if (!container) return;

    const html = `
      <h1>${selectedCollection}</h1>
      <div class="rdc-borne__products">
        ${products.map(product => `
          <div class="rdc-borne__product" data-product-handle="${product.handle}">
            <img src="${product.featured_image}" alt="${product.title}" class="rdc-borne__product-image">
            <h3>${product.title}</h3>
            <p class="rdc-borne__product-price">${product.price}</p>
          </div>
        `).join('')}
      </div>
    `;

    container.innerHTML = html;
  }

  // Charger les détails d'un produit
  async function loadProductDetails(handle) {
    try {
      const response = await fetch(`/products/${handle}?view=json`);
      const product = await response.json();
      displayProductDetails(product);
    } catch (error) {
      console.error('Erreur lors du chargement des détails du produit:', error);
    }
  }

  // Afficher les détails du produit
  function displayProductDetails(product) {
    const container = borne.querySelector('.rdc-borne__product-detail');
    if (!container) return;

    // Mise à jour de l'image principale
    const mainImage = container.querySelector('.rdc-borne__product-main-image');
    mainImage.src = product.featured_image;
    mainImage.alt = product.title;

    // Mise à jour des miniatures
    const thumbnailsContainer = container.querySelector('.rdc-borne__product-thumbnails');
    thumbnailsContainer.innerHTML = product.images.map(image => `
      <img src="${image}" alt="${product.title}" class="rdc-borne__product-thumbnail">
    `).join('');

    // Mise à jour des informations du produit
    container.querySelector('.rdc-borne__product-title').textContent = product.title;
    container.querySelector('.rdc-borne__product-price').textContent = product.price;
    container.querySelector('.rdc-borne__product-description').innerHTML = product.description;

    // Mise à jour des variantes
    const variantsContainer = container.querySelector('.rdc-borne__product-variants');
    if (product.variants && product.variants.length > 1) {
      variantsContainer.innerHTML = `
        <select class="rdc-borne__variant-select">
          ${product.variants.map(variant => `
            <option value="${variant.id}" data-price="${variant.price}">
              ${variant.title} - ${variant.price}
            </option>
          `).join('')}
        </select>
      `;
    } else {
      variantsContainer.innerHTML = '';
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

  // Gestion des clics sur les catégories et collections
  borne.addEventListener('click', function(event) {
    const category = event.target.closest('.rdc-borne__category');
    const collection = event.target.closest('.rdc-borne__collection');

    if (category) {
      const categoryTitle = category.querySelector('.rdc-borne__category-title').textContent;
      selectedCategory = categoryTitle;
      const url = new URL(window.location.href);
      url.searchParams.set('category', categoryTitle);
      window.history.pushState({}, '', url);
      navigateToScreen('2');
      return;
    }

    if (collection) {
      const collectionTitle = collection.querySelector('h3').textContent;
      selectedCollection = collectionTitle;
      const url = new URL(window.location.href);
      url.searchParams.set('collection', collectionTitle.toLowerCase());
      window.history.pushState({}, '', url);
      navigateToScreen('3');
      return;
    }

    // Gestion des clics sur les produits
    const product = event.target.closest('.rdc-borne__product');
    if (product) {
      const handle = product.dataset.productHandle;
      selectedProduct = handle;
      loadProductDetails(handle);
      navigateToScreen('4');
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
