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
        if (detail.dataset.productHandle === handle) {
          detail.style.display = 'grid';
          // Sélectionner la première swatch disponible
          const firstSwatch = detail.querySelector('.rdc-borne__swatch');
          if (firstSwatch) {
            // Initialiser le nom de la couleur avant de cliquer sur le swatch
            const colorNameElement = detail.querySelector('.rdc-borne__color-name');
            if (colorNameElement) {
              const colorName = firstSwatch.getAttribute('data-color');
              if (colorName) {
                const readableColorName = colorName
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                colorNameElement.textContent = readableColorName;
              } else if (firstSwatch.querySelector('img')) {
                colorNameElement.textContent = firstSwatch.querySelector('img').alt;
              }
            }
            
            // Simuler le clic sur le premier swatch
            firstSwatch.click();
            firstSwatch.classList.add('active');
          }
        } else {
          detail.style.display = 'none';
        }
      });
      
      navigateToScreen('4');
      return;
    }

    // Gestion des clics sur les swatches
    const swatch = event.target.closest('.rdc-borne__swatch');
    if (swatch) {
      const productDetail = swatch.closest('.rdc-borne__product-detail');
      const mainImage = productDetail.querySelector('.rdc-borne__product-main-image');
      const addToCartButton = productDetail.querySelector('.rdc-borne__add-to-cart');
      const swatches = productDetail.querySelectorAll('.rdc-borne__swatch');
      const colorNameElement = productDetail.querySelector('.rdc-borne__color-name');
      
      // Mettre à jour l'image si disponible
      if (swatch.dataset.imageUrl) {
        mainImage.src = swatch.dataset.imageUrl;
      }
      
      // Mettre à jour le variant ID pour le panier
      if (swatch.dataset.variantId) {
        addToCartButton.dataset.variantId = swatch.dataset.variantId;
      }
      
      // Mettre à jour le nom de la couleur
      if (colorNameElement) {
        // Utiliser l'attribut data-color qui contient le nom de la couleur
        const colorName = swatch.getAttribute('data-color');
        if (colorName) {
          // Convertir le format handleize en format lisible (ex: "bleu-clair" -> "Bleu Clair")
          const readableColorName = colorName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          colorNameElement.textContent = readableColorName;
        } else if (swatch.querySelector('img')) {
          // Fallback sur l'alt de l'image si data-color n'est pas disponible
          colorNameElement.textContent = swatch.querySelector('img').alt;
        }
      }
      
      // Mettre à jour l'état actif des swatches
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
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
