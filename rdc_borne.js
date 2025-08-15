/**
 * Borne Interactive Runes de Chêne
 * Script de gestion de l'interface utilisateur de la borne tactile
 */

document.addEventListener("DOMContentLoaded", function () {
  // Gestion de l'overlay de chargement
  const loadingOverlay = document.getElementById("rdc-loading-overlay");

  // S'assurer que l'overlay est bien visible avant de le masquer
  if (loadingOverlay) {
    // Forçer un reflow pour s'assurer que l'overlay est bien rendu
    void loadingOverlay.offsetWidth;

    // Masquer l'overlay après 1 seconde
    setTimeout(() => {
      // Ajouter la propriété opacity directement pour éviter les conflits avec le style inline
      loadingOverlay.style.opacity = "0";
      loadingOverlay.style.pointerEvents = "none";

      // Supprimer complètement l'overlay après la fin de l'animation
      setTimeout(() => {
        loadingOverlay.remove();
      }, 500); // Correspond à la durée de la transition CSS
    }, 1000);
  }

  // Appliquer les URLs des swatches via l'attribut data-swatch-url
  function applySwatchUrls() {
    const swatches = document.querySelectorAll(".swatch[data-swatch-url]");
    swatches.forEach((swatch) => {
      const url = swatch.getAttribute("data-swatch-url");
      swatch.style.setProperty("--swatch-bg-image", `url(${url})`);
    });
  }

  // Exécuter la fonction au chargement
  applySwatchUrls();

  // Éléments principaux
  const borne = document.querySelector(".rdc-borne");
  const backButton = borne.querySelector(".rdc-borne__back-button");
  const cartButton = borne.querySelector(".rdc-borne__cart-button");
  const cartDrawer = borne.querySelector(".rdc-borne__cart-drawer");
  const cartItemsContainer = borne.querySelector(".rdc-borne__cart-items");
  const cartCountBadge = borne.querySelector(".rdc-borne__cart-count");
  const cartTotalPrice = borne.querySelector(".rdc-borne__cart-total-price");
  const checkoutButton = borne.querySelector(".rdc-borne__cart-checkout");
  const clearCartButton = borne.querySelector(".rdc-borne__cart-clear");
  const confirmationPopup = document.getElementById("cart-confirmation-popup");
  const popupProductName = confirmationPopup.querySelector(
    ".rdc-borne__popup-product-name"
  );

  // Variables de gestion de la navigation et du panier
  const history = [];
  let isAddingToCart = false;
  let addToCartTimeout;
  let cart = { items: [], total: 0 };

  /**
   * Récupération et parsing des données de configuration
   * Format attendu: "Catégorie:Collection1,Collection2|Catégorie2:Collection3,Collection4"
   */
  const collectionLinksText =
    document.getElementById("rdc-borne-data").textContent;
  const categoryCollections = collectionLinksText
    .split("|")
    .reduce((acc, pair) => {
      const [category, collections] = pair.split(":");
      if (category && collections) {
        acc[category.trim()] = collections.split(",").map((c) => c.trim());
      }
      return acc;
    }, {});

  /**
   * Système de navigation entre les écrans
   * Gère la transition entre les différents écrans et maintient l'historique
   * @param {string} screenNumber - Numéro de l'écran de destination
   */
  function navigateToScreen(screenNumber) {
    const currentScreen = borne.querySelector(
      '.rdc-borne__screen[data-active="true"]'
    );
    const nextScreen = borne.querySelector(
      `.rdc-borne__screen[data-screen="${screenNumber}"]`
    );

    if (currentScreen && nextScreen) {
      history.push(currentScreen.dataset.screen);

      // Préparation de l'écran suivant avant la transition
      nextScreen.style.display = "flex";

      // Forcer un reflow pour s'assurer que les changements sont appliqués
      void nextScreen.offsetWidth;

      // Désactiver l'écran actuel (déclenchera la transition d'opacité)
      currentScreen.dataset.active = "false";

      // Attendre la fin de la transition avant de masquer complètement l'ancien écran
      setTimeout(() => {
        // Activer le nouvel écran (déclenchera la transition d'opacité)
        nextScreen.dataset.active = "true";
      }, 50);
    }
  }

  /**
   * Gestionnaire d'événements principal
   * Gère toutes les interactions utilisateur avec la borne
   */
  borne.addEventListener("click", function (event) {
    // Détection des éléments cliqués
    const category = event.target.closest(".rdc-borne__category");
    const collection = event.target.closest(".rdc-borne__collection");
    const product = event.target.closest(".rdc-borne__product");
    const swatch = event.target.closest(".rdc-borne__swatch");
    const sizeSwatch = event.target.closest(".rdc-borne__swatch--size");
    const addToCartButton = event.target.closest(".rdc-borne__add-to-cart");

    // Gestion des clics sur une catégorie (Écran 1 -> 2)
    if (category) {
      const categoryTitle = category.dataset.category;
      document.getElementById("selected-category").value = categoryTitle;
      document.querySelector(".rdc-borne__selected-category").textContent =
        categoryTitle;

      // Filtrer les collections selon la catégorie sélectionnée
      const collections = document.querySelectorAll(".rdc-borne__collection");
      collections.forEach((col) => {
        const title = col.querySelector("h3").textContent;
        col.style.display = categoryCollections[categoryTitle]?.includes(title)
          ? ""
          : "none";
      });

      navigateToScreen("2");
      return;
    }

    // Gestion des clics sur une collection (Écran 2 -> 3)
    if (collection) {
      const collectionHandle = collection.dataset.handle;
      const collectionTitle = collection.querySelector("h3").textContent;
      document.querySelector(".rdc-borne__collection-title").textContent =
        collectionTitle;

      // Afficher uniquement les produits de la collection sélectionnée
      const productGrids = document.querySelectorAll(".rdc-borne__products");
      productGrids.forEach((grid) => {
        if (grid.dataset.collection === collectionHandle) {
          grid.classList.add("active");
          grid.classList.remove("inactive");
        } else {
          grid.classList.add("inactive");
          grid.classList.remove("active");
        }
      });

      navigateToScreen("3");
      return;
    }

    // Gestion des clics sur un produit (Écran 3 -> 4)
    if (product) {
      const handle = product.dataset.handle;

      // Afficher les détails du produit sélectionné
      const productDetails = document.querySelectorAll(
        ".rdc-borne__product-detail"
      );
      productDetails.forEach((detail) => {
        if (detail.dataset.productHandle === handle) {
          detail.style.display = "flex";

          // Sélection automatique de la première couleur disponible
          const firstSwatch = detail.querySelector(".rdc-borne__swatch");
          if (firstSwatch) {
            // Initialiser le nom de la couleur avant de cliquer sur le swatch
            const colorNameElement = detail.querySelector(
              ".rdc-borne__color-name"
            );
            if (colorNameElement) {
              const colorName = firstSwatch.getAttribute("data-color");
              if (colorName) {
                const readableColorName = colorName
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");
                colorNameElement.textContent = readableColorName;
              } else if (firstSwatch.querySelector("img")) {
                colorNameElement.textContent =
                  firstSwatch.querySelector("img").alt;
              }
            }

            // Simuler le clic sur le premier swatch
            firstSwatch.click();
            firstSwatch.classList.add("active");

            // Sélectionner automatiquement la taille M si disponible
            const sizeSwatches = detail.querySelectorAll(
              ".rdc-borne__swatch--size"
            );
            const mSizeSwatch = Array.from(sizeSwatches).find(
              (swatch) =>
                swatch.textContent.trim().toUpperCase() === "M" &&
                !swatch.disabled
            );

            if (mSizeSwatch) {
              mSizeSwatch.click();
              mSizeSwatch.classList.add("active");
            } else if (sizeSwatches.length > 0) {
              // Si M n'est pas disponible, sélectionner la première taille disponible
              const firstAvailableSize = Array.from(sizeSwatches).find(
                (swatch) => !swatch.disabled
              );
              if (firstAvailableSize) {
                firstAvailableSize.click();
                firstAvailableSize.classList.add("active");
              }
            }
          }
        } else {
          detail.style.display = "none";
        }
      });

      navigateToScreen("4");
      return;
    }

    /**
     * Gestion des swatches de couleur
     * Met à jour l'image du produit, le nom de la couleur et les tailles disponibles
     */
    if (swatch && !swatch.classList.contains("rdc-borne__swatch--size")) {
      const productDetail = swatch.closest(".rdc-borne__product-detail");
      const mainImage = productDetail.querySelector(
        ".rdc-borne__product-main-image"
      );
      const addToCartButton = productDetail.querySelector(
        ".rdc-borne__add-to-cart"
      );
      const swatches = productDetail.querySelectorAll(
        ".rdc-borne__swatch:not(.rdc-borne__swatch--size)"
      );
      const colorNameElement = productDetail.querySelector(
        ".rdc-borne__color-name"
      );
      const sizeSwatches = productDetail.querySelectorAll(
        ".rdc-borne__swatch--size"
      );
      const selectedColor = swatch.dataset.color;

      // Mise à jour de l'image principale du produit
      if (swatch.dataset.imageUrl) {
        mainImage.src = swatch.dataset.imageUrl;
      }

      // Mise à jour de l'ID de variante pour l'ajout au panier
      if (swatch.dataset.variantId) {
        addToCartButton.dataset.variantId = swatch.dataset.variantId;
      }

      // Mise à jour de l'affichage du nom de la couleur
      if (colorNameElement) {
        const colorName = swatch.getAttribute("data-color");
        if (colorName) {
          // Conversion du format handleize en format lisible (ex: "bleu-clair" -> "Bleu Clair")
          const readableColorName = colorName
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          colorNameElement.textContent = readableColorName;
        } else if (swatch.querySelector("img")) {
          // Fallback sur l'alt de l'image si data-color n'est pas disponible
          colorNameElement.textContent = swatch.querySelector("img").alt;
        }
      }

      // Mise à jour de l'état actif des swatches de couleur
      swatches.forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");

      // Gestion de la disponibilité des tailles en fonction de la couleur sélectionnée
      if (selectedColor) {
        // Désactiver toutes les tailles par défaut
        sizeSwatches.forEach((sizeSwatch) => {
          sizeSwatch.disabled = true;
          sizeSwatch.classList.add("disabled");
        });

        // Filtrer les tailles disponibles pour cette couleur
        const availableSizes = Array.from(sizeSwatches).filter((sizeSwatch) => {
          const availableColors = sizeSwatch.dataset.availableColors || "";

          // Vérifier la disponibilité de cette taille pour la couleur sélectionnée
          const colorsList = availableColors.split(",");
          return colorsList.some(
            (color) =>
              color && color.toLowerCase() === selectedColor.toLowerCase()
          );
        });

        // Activer uniquement les tailles disponibles
        availableSizes.forEach((availableSize) => {
          availableSize.disabled = false;
          availableSize.classList.remove("disabled");
        });

        // Vérifier si une taille était déjà sélectionnée
        const currentlySelectedSize = Array.from(sizeSwatches).find((size) =>
          size.classList.contains("active")
        );
        let sizeToSelect;

        if (currentlySelectedSize && !currentlySelectedSize.disabled) {
          // Si la taille précédemment sélectionnée est toujours disponible, la conserver
          sizeToSelect = currentlySelectedSize;
        } else {
          // Sinon, sélectionner la taille M si disponible, ou la première taille disponible
          const mSize = availableSizes.find(
            (size) => size.textContent.trim().toUpperCase() === "M"
          );
          sizeToSelect = mSize || availableSizes[0];
        }

        if (sizeToSelect) {
          // Retirer la classe active de toutes les tailles
          sizeSwatches.forEach((s) => s.classList.remove("active"));

          // Ajouter la classe active à la taille sélectionnée
          sizeToSelect.classList.add("active");

          // Déclencher l'événement de clic pour mettre à jour les données de variante
          sizeToSelect.click();

          // Mise à jour de l'affichage de la taille sélectionnée
          const sizeNameElement = productDetail.querySelector(
            ".rdc-borne__size-name"
          );
          if (sizeNameElement) {
            sizeNameElement.textContent = sizeToSelect.dataset.size;
          }
        }
      }
      return;
    }

    /**
     * Gestion des swatches de taille
     * Met à jour la taille sélectionnée et l'ID de variante pour l'ajout au panier
     */
    if (sizeSwatch && !sizeSwatch.disabled) {
      const productDetail = sizeSwatch.closest(".rdc-borne__product-detail");
      const sizeSwatches = productDetail.querySelectorAll(
        ".rdc-borne__swatch--size"
      );
      const addToCartButton = productDetail.querySelector(
        ".rdc-borne__add-to-cart"
      );
      const selectedSize = sizeSwatch.dataset.size;

      // Mise à jour de l'ID de variante pour l'ajout au panier
      if (sizeSwatch.dataset.variantId) {
        addToCartButton.dataset.variantId = sizeSwatch.dataset.variantId;
      }

      // Mise à jour de l'état actif des swatches de taille
      sizeSwatches.forEach((s) => s.classList.remove("active"));
      sizeSwatch.classList.add("active");

      // Mise à jour de l'affichage de la taille sélectionnée
      const sizeNameElement = productDetail.querySelector(
        ".rdc-borne__size-name"
      );
      if (sizeNameElement && selectedSize) {
        sizeNameElement.textContent = selectedSize;
      }

      return;
    }

    /**
     * Gestion de l'ajout au panier
     * Envoie une requête AJAX pour ajouter le produit au panier Shopify
     */
    if (addToCartButton && !isAddingToCart) {
      const variantId = addToCartButton.dataset.variantId;
      const quantity = 1;

      // Récupérer les informations du produit
      const productDetail = addToCartButton.closest(
        ".rdc-borne__product-detail"
      );
      const productTitle = productDetail.querySelector(
        ".rdc-borne__product-title"
      ).textContent;
      const productPrice = productDetail.querySelector(
        ".rdc-borne__product-price"
      ).textContent;
      const productImage = productDetail.querySelector(
        ".rdc-borne__product-main-image"
      ).src;
      const colorName = productDetail.querySelector(
        ".rdc-borne__color-name"
      ).textContent;
      const sizeName = productDetail.querySelector(
        ".rdc-borne__size-name"
      ).textContent;

      if (variantId) {
        // Prévention des clics multiples pendant le processus d'ajout
        isAddingToCart = true;
        addToCartButton.classList.add("adding");

        // Requête AJAX vers l'API Shopify pour ajouter au panier
        fetch("/cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({
            items: [
              {
                id: variantId,
                quantity: quantity,
              },
            ],
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            // Gestion du succès de l'ajout au panier
            addToCartButton.textContent = "Ajouté !";
            addToCartButton.classList.remove("adding");
            addToCartButton.classList.add("added");

            // Ajouter le produit à notre état local du panier
            const item = {
              id: variantId,
              title: productTitle,
              price: parseFloat(
                productPrice.replace(/[^0-9.,]/g, "").replace(",", ".")
              ),
              image: productImage,
              color: colorName,
              size: sizeName,
              quantity: quantity,
            };

            // Vérifier si le produit existe déjà dans le panier
            const existingItemIndex = cart.items.findIndex(
              (i) => i.id === variantId
            );

            if (existingItemIndex !== -1) {
              // Incrémenter la quantité si le produit existe déjà
              cart.items[existingItemIndex].quantity += quantity;
            } else {
              // Ajouter le nouveau produit au panier
              cart.items.push(item);
            }

            // Mettre à jour le total et l'affichage du panier
            updateCart();

            // Afficher le popup de confirmation
            showConfirmationPopup(productTitle);

            // Réinitialisation de l'état du bouton après 2 secondes
            clearTimeout(addToCartTimeout);
            addToCartTimeout = setTimeout(() => {
              addToCartButton.textContent = "Ajouter au panier";
              addToCartButton.classList.remove("added");
              isAddingToCart = false;
            }, 2000);
          })
          .catch((error) => {
            // Gestion des erreurs
            addToCartButton.textContent = "Erreur - Réessayer";
            addToCartButton.classList.remove("adding");
            addToCartButton.classList.add("error");

            clearTimeout(addToCartTimeout);
            addToCartTimeout = setTimeout(() => {
              addToCartButton.textContent = "Ajouter au panier";
              addToCartButton.classList.remove("error");
              isAddingToCart = false;
            }, 3000);
          });
      }
      return;
    }

    // Gestion du clic sur le bouton de toggle du panier
    if (event.target.closest('[data-action="toggle-cart"]')) {
      toggleCartDrawer();
      return;
    }

    // La navigation entre écrans se fait maintenant directement via les éléments cliquables
  });

  /**
   * Gestion du bouton retour
   * Permet de naviguer vers l'écran précédent en utilisant l'historique
   */
  backButton.addEventListener("click", function () {
    if (history.length > 0) {
      const currentScreen = borne.querySelector(
        '.rdc-borne__screen[data-active="true"]'
      );
      const previousScreenNumber = history.pop();
      const previousScreen = borne.querySelector(
        `.rdc-borne__screen[data-screen="${previousScreenNumber}"]`
      );

      if (currentScreen && previousScreen) {
        // Préparation de l'écran précédent avant la transition
        previousScreen.style.display = "flex";

        // Forcer un reflow pour s'assurer que les changements sont appliqués
        void previousScreen.offsetWidth;

        // Désactiver l'écran actuel (déclenchera la transition d'opacité)
        currentScreen.dataset.active = "false";

        // Attendre la fin de la transition avant de masquer complètement l'ancien écran
        setTimeout(() => {
          // Activer le nouvel écran (déclenchera la transition d'opacité)
          previousScreen.dataset.active = "true";

          // Nettoyage spécifique lors du retour à l'écran des produits
          if (previousScreenNumber === "3") {
            const productDetails = document.querySelectorAll(
              ".rdc-borne__product-detail"
            );
            productDetails.forEach((detail) => {
              detail.style.display = "none";
            });
          }
        }, 50);
      }
    }
  });

  /**
   * Initialisation du panier
   * Récupère l'état actuel du panier Shopify et met à jour l'interface
   */
  function initCart() {
    // Récupérer l'état du panier depuis Shopify
    fetch("/cart.js", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((response) => response.json())
      .then((shopifyCart) => {
        // Convertir les données du panier Shopify en notre format interne
        cart.items = shopifyCart.items.map((item) => {
          // Extraire les informations de variante (couleur, taille)
          const variantTitle = item.variant_title
            ? item.variant_title.split(" / ")
            : [];
          const color = variantTitle[0] || "";
          const size = variantTitle[1] || "";

          return {
            id: item.variant_id,
            title: item.product_title,
            price: item.price / 100, // Shopify stocke les prix en centimes
            image: item.image,
            color: color,
            size: size,
            quantity: item.quantity,
          };
        });

        // Mettre à jour l'affichage du panier
        updateCart();
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du panier:", error);
      });
  }

  /**
   * Met à jour l'affichage du panier
   * Calcule le total, met à jour le compteur et le contenu du drawer
   */
  function updateCart() {
    // Calculer le total du panier
    cart.total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Mettre à jour le compteur d'articles
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = totalItems;

    // Mettre à jour le prix total
    cartTotalPrice.textContent = formatPrice(cart.total);

    // Mettre à jour le contenu du panier
    renderCartItems();
  }

  /**
   * Affiche les articles du panier dans le drawer
   */
  function renderCartItems() {
    // Vider le conteneur
    cartItemsContainer.innerHTML = "";

    if (cart.items.length === 0) {
      // Afficher un message si le panier est vide
      cartItemsContainer.innerHTML = `
        <div class="rdc-borne__cart-empty">
          <div class="rdc-borne__cart-empty-icon">🛒</div>
          <p class="rdc-borne__cart-empty-message">Votre panier est vide</p>
          <button class="rdc-borne__cart-continue-shopping" data-action="toggle-cart">Continuer vos achats</button>
        </div>
      `;
      return;
    }

    // Créer un élément pour chaque article du panier
    cart.items.forEach((item) => {
      const cartItemElement = document.createElement("div");
      cartItemElement.className = "rdc-borne__cart-item";
      cartItemElement.dataset.variantId = item.id;

      cartItemElement.innerHTML = `
        <img src="${item.image}" alt="${
        item.title
      }" class="rdc-borne__cart-item-image">
        <div class="rdc-borne__cart-item-details">
          <h3 class="rdc-borne__cart-item-title">${item.title}</h3>
          <p class="rdc-borne__cart-item-variant">${item.color} / ${
        item.size
      }</p>
          <p class="rdc-borne__cart-item-price">${formatPrice(item.price)}</p>
          <div class="rdc-borne__cart-item-quantity">
            <button class="rdc-borne__cart-item-quantity-button" data-action="decrease-quantity" data-variant-id="${
              item.id
            }">-</button>
            <span class="rdc-borne__cart-item-quantity-value">${
              item.quantity
            }</span>
            <button class="rdc-borne__cart-item-quantity-button" data-action="increase-quantity" data-variant-id="${
              item.id
            }">+</button>
          </div>
          <button class="rdc-borne__cart-item-remove" data-action="remove-item" data-variant-id="${
            item.id
          }">Supprimer</button>
        </div>
      `;

      cartItemsContainer.appendChild(cartItemElement);
    });

    // Ajouter des écouteurs d'événements pour les boutons de quantité et de suppression
    cartItemsContainer
      .querySelectorAll('[data-action="decrease-quantity"]')
      .forEach((button) => {
        button.addEventListener("click", function () {
          const variantId = this.dataset.variantId;
          updateItemQuantity(variantId, -1);
        });
      });

    cartItemsContainer
      .querySelectorAll('[data-action="increase-quantity"]')
      .forEach((button) => {
        button.addEventListener("click", function () {
          const variantId = this.dataset.variantId;
          updateItemQuantity(variantId, 1);
        });
      });

    cartItemsContainer
      .querySelectorAll('[data-action="remove-item"]')
      .forEach((button) => {
        button.addEventListener("click", function () {
          const variantId = this.dataset.variantId;
          removeItemFromCart(variantId);
        });
      });
  }

  /**
   * Met à jour la quantité d'un article dans le panier
   * @param {string} variantId - ID de la variante à mettre à jour
   * @param {number} change - Changement de quantité (+1 ou -1)
   */
  function updateItemQuantity(variantId, change) {
    const itemIndex = cart.items.findIndex((item) => item.id === variantId);

    if (itemIndex === -1) return;

    const newQuantity = cart.items[itemIndex].quantity + change;

    if (newQuantity <= 0) {
      // Si la quantité devient 0 ou négative, supprimer l'article
      removeItemFromCart(variantId);
      return;
    }

    // Mettre à jour la quantité dans notre état local
    cart.items[itemIndex].quantity = newQuantity;

    // Mettre à jour la quantité dans le panier Shopify
    fetch("/cart/change.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        id: variantId,
        quantity: newQuantity,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        // Mettre à jour l'affichage du panier
        updateCart();
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de la quantité:", error);
      });
  }

  /**
   * Supprime un article du panier
   * @param {string} variantId - ID de la variante à supprimer
   */
  function removeItemFromCart(variantId) {
    // Supprimer l'article de notre état local
    cart.items = cart.items.filter((item) => item.id !== variantId);

    // Supprimer l'article du panier Shopify
    fetch("/cart/change.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        id: variantId,
        quantity: 0,
      }),
    })
      .then((response) => response.json())
      .then(() => {
        // Mettre à jour l'affichage du panier
        updateCart();
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression de l'article:", error);
      });
  }

  /**
   * Vide complètement le panier
   */
  function clearCart() {
    // Vider notre état local du panier
    cart.items = [];
    cart.total = 0;

    // Envoyer la requête à l'API Shopify pour vider le panier
    fetch("/cart/clear.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((response) => response.json())
      .then(() => {
        // Mettre à jour l'affichage du panier
        updateCart();

        // Afficher un message de confirmation temporaire
        const cartItems = cartItemsContainer;
        cartItems.innerHTML =
          '<div class="rdc-borne__cart-empty">Votre panier a été vidé</div>';

        // Retourner à la slide 1 après un court délai
        setTimeout(() => {
          toggleCartDrawer(true); // Fermer le drawer
          navigateToScreen(1); // Retourner à l'écran des catégories
        }, 1500);
      })
      .catch((error) => {
        console.error("Erreur lors du vidage du panier:", error);
      });
  }

  // Ajouter des écouteurs d'événements pour les boutons de quantité et de suppression
  cartItemsContainer
    .querySelectorAll('[data-action="decrease-quantity"]')
    .forEach((button) => {
      button.addEventListener("click", function () {
        const variantId = this.dataset.variantId;
        updateItemQuantity(variantId, -1);
      });
    });

  /**
   * Ouvre ou ferme le drawer du panier
   * @param {boolean} forceClose - Force la fermeture du drawer si true
   */
  function toggleCartDrawer(forceClose) {
    const isOpen = cartDrawer.dataset.open === "true";

    if (forceClose) {
      cartDrawer.dataset.open = false;
      return;
    }

    cartDrawer.dataset.open = !isOpen;

    // Si le drawer est ouvert, ajouter un écouteur d'événement pour le fermer quand on clique ailleurs
    if (!isOpen) {
      // Utiliser setTimeout pour s'assurer que l'événement de clic actuel est terminé
      setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
      }, 0);
    } else {
      // Si on ferme le drawer, supprimer l'écouteur d'événement
      document.removeEventListener("click", handleOutsideClick);
    }
  }

  /**
   * Gère les clics en dehors du drawer pour le fermer
   * @param {Event} event - L'événement de clic
   */
  function handleOutsideClick(event) {
    // Vérifier si le clic est en dehors du drawer et du bouton de panier
    if (
      !event.target.closest(".rdc-borne__cart-drawer") &&
      !event.target.closest('[data-action="toggle-cart"]')
    ) {
      toggleCartDrawer(true); // Force la fermeture
      document.removeEventListener("click", handleOutsideClick);
    }
  }

  /**
   * Affiche le popup de confirmation d'ajout au panier
   * @param {string} productTitle - Le titre du produit ajouté
   */
  function showConfirmationPopup(productTitle) {
    // Définir le nom du produit dans le popup
    popupProductName.textContent = productTitle;

    // Afficher le popup
    confirmationPopup.dataset.visible = "true";

    // Ajouter les écouteurs d'événements pour les boutons du popup
    const continueButton = confirmationPopup.querySelector(
      '[data-action="continue-shopping"]'
    );
    const viewCartButton = confirmationPopup.querySelector(
      '[data-action="view-cart"]'
    );

    // Supprimer les écouteurs existants pour éviter les doublons
    continueButton.removeEventListener("click", handleContinueShopping);
    viewCartButton.removeEventListener("click", handleViewCart);

    // Ajouter les nouveaux écouteurs
    continueButton.addEventListener("click", handleContinueShopping);
    viewCartButton.addEventListener("click", handleViewCart);
  }

  /**
   * Gère le clic sur le bouton "Continuer vos achats"
   */
  function handleContinueShopping() {
    // Fermer le popup
    confirmationPopup.dataset.visible = "false";

    // Retourner à la slide 1 (catégories)
    navigateToScreen(1);
  }

  /**
   * Gère le clic sur le bouton "Voir le panier"
   */
  function handleViewCart() {
    // Fermer le popup
    confirmationPopup.dataset.visible = "false";

    // Ouvrir le drawer du panier
    toggleCartDrawer();

    // Retourner à la slide 1 (catégories)
    setTimeout(() => {
      navigateToScreen(1);
    }, 100);
  }

  /**
   * Formate un prix en euros
   * @param {number} price - Prix à formater
   * @returns {string} - Prix formaté (ex: "42,99 €")
   */
  function formatPrice(price) {
    return price.toFixed(2).replace(".", ",") + " €";
  }

  // Initialiser le panier au chargement de la page
  initCart();

  // Ajouter un écouteur d'événement pour le bouton de passage à la caisse
  checkoutButton.addEventListener("click", function () {
    window.location.href = "/checkout";
  });

  // Ajouter un écouteur d'événement pour le bouton de vidage du panier
  clearCartButton.addEventListener("click", function () {
    clearCart();
  });
});
