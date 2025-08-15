document.addEventListener('DOMContentLoaded', function() {
  const borne = document.querySelector('.rdc-borne');
  const backButton = borne.querySelector('.rdc-borne__back-button');
  const history = [];
  let isAddingToCart = false;
  let addToCartTimeout;

  // Récupérer et parser les données
  const collectionLinksText = document.getElementById('rdc-borne-data').textContent;
  const categoryCollections = collectionLinksText.split('|').reduce((acc, pair) => {
    const [category, collections] = pair.split(':');
    if (category && collections) {
      acc[category.trim()] = collections.split(',').map(c => c.trim());
    }
    return acc;
  }, {});

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

  // Gestion des clics sur les catégories
  borne.addEventListener('click', function(event) {
    const category = event.target.closest('.rdc-borne__category');
    const collection = event.target.closest('.rdc-borne__collection');
    const product = event.target.closest('.rdc-borne__product');

    if (category) {
      const categoryTitle = category.dataset.category;
      document.getElementById('selected-category').value = categoryTitle;
      document.querySelector('.rdc-borne__selected-category').textContent = categoryTitle;
      
      // Afficher uniquement les collections de la catégorie
      const collections = document.querySelectorAll('.rdc-borne__collection');
      collections.forEach(col => {
        const title = col.querySelector('h3').textContent;
        col.style.display = categoryCollections[categoryTitle]?.includes(title) ? '' : 'none';
      });
      
      navigateToScreen('2');
      return;
    }

    if (collection) {
      const collectionHandle = collection.dataset.handle;
      const collectionTitle = collection.querySelector('h3').textContent;
      document.querySelector('.rdc-borne__collection-title').textContent = collectionTitle;
      
      // Afficher les produits de la collection
      const productGrids = document.querySelectorAll('.rdc-borne__products');
      productGrids.forEach(grid => {
        grid.style.display = grid.dataset.collection === collectionHandle ? 'grid' : 'none';
      });
      
      navigateToScreen('3');
      return;
    }

    if (product) {
      const handle = product.dataset.handle;
      
      // Afficher les détails du produit
      const productDetails = document.querySelectorAll('.rdc-borne__product-detail');
      productDetails.forEach(detail => {
        detail.style.display = detail.dataset.productHandle === handle ? 'grid' : 'none';
      });
      
      navigateToScreen('4');
      return;
    }

    // Gestion des clics sur les miniatures
    const thumbnail = event.target.closest('.rdc-borne__product-thumbnail');
    if (thumbnail) {
      const mainImage = thumbnail.closest('.rdc-borne__product-images').querySelector('.rdc-borne__product-main-image');
      mainImage.src = thumbnail.dataset.fullUrl;
      
      // Mettre à jour l'opacité des miniatures
      const thumbnails = thumbnail.closest('.rdc-borne__product-thumbnails').querySelectorAll('.rdc-borne__product-thumbnail');
      thumbnails.forEach(thumb => thumb.style.opacity = '0.7');
      thumbnail.style.opacity = '1';
      return;
    }

    // Gestion du panier
    if (event.target.matches('.rdc-borne__add-to-cart')) {
      const button = event.target;
      
      // Prevent multiple rapid clicks
      if (isAddingToCart) return;
      clearTimeout(addToCartTimeout);
      
      const variantSelect = button.closest('.rdc-borne__product-info').querySelector('.rdc-borne__variant-select');
      const variantId = variantSelect ? variantSelect.value : button.dataset.variantId;
      
      button.textContent = 'Ajout en cours...';
      button.disabled = true;
      isAddingToCart = true;
      
      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({
          items: [{ id: variantId, quantity: 1 }]
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        button.textContent = 'Ajouté !';
        button.classList.add('success');
        addToCartTimeout = setTimeout(() => {
          button.textContent = 'Ajouter au panier';
          button.disabled = false;
          button.classList.remove('success');
          isAddingToCart = false;
        }, 2000);
      })
      .catch(error => {
        console.error('Error adding to cart:', error);
        button.textContent = 'Erreur - Réessayer';
        button.classList.add('error');
        addToCartTimeout = setTimeout(() => {
          button.textContent = 'Ajouter au panier';
          button.disabled = false;
          button.classList.remove('error');
          isAddingToCart = false;
        }, 3000);
      });
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
