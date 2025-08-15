/**
 * Borne Interactive Runes de Chêne
 * Script de gestion de l'interface utilisateur de la borne tactile
 */

document.addEventListener("DOMContentLoaded", function () {
  // Éléments principaux
  const borne = document.querySelector(".rdc-borne");
  const backButton = borne.querySelector(".rdc-borne__back-button");

  // Variables de gestion de la navigation et du panier
  const history = [];
  let isAddingToCart = false;
  let addToCartTimeout;

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
      currentScreen.dataset.active = "false";
      nextScreen.dataset.active = "true";
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
    const nextButton = event.target.closest('[data-action="next"]');

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
        grid.style.display =
          grid.dataset.collection === collectionHandle ? "grid" : "none";
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
          detail.style.display = "grid";

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
        const currentlySelectedSize = Array.from(sizeSwatches).find(size => size.classList.contains('active'));
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
          sizeSwatches.forEach(s => s.classList.remove("active"));
          
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

    // Navigation vers l'écran suivant avec les boutons data-action="next"
    if (nextButton) {
      const nextScreenNumber = nextButton.dataset.target;
      navigateToScreen(nextScreenNumber);
    }
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
        currentScreen.dataset.active = "false";
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
      }
    }
  });
});
