document.addEventListener("DOMContentLoaded", function () {
  // Debug: Log tous les produits disponibles
  const products = document.querySelectorAll('[data-product-target]');
  console.log(`Nombre total de produits chargés: ${products.length}`);
  
  // Debug: Log toutes les catégories de produits
  const categories = new Set();
  document.querySelectorAll('[data-category-target]').forEach(el => {
    categories.add(el.dataset.categoryTarget);
  });
  console.log('Catégories de produits disponibles:', Array.from(categories));

  // Gestion de l'overlay de chargement
  const overlay = document.querySelector(".overlay-loading");
  if (overlay) {
    overlay.style.transition = "opacity 1s ease-out";
    overlay.style.opacity = "1";
    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.style.display = "none";
      }, 1000);
    }, 300);
  }

  // Initialisation de la première couleur et taille sélectionnées
  document.querySelectorAll(".rdc-borne__product-form").forEach((form) => {
    const productId = form.dataset.productForm;
    const colorInput = form.querySelector("input[data-option-trigger]:checked");
    const select = form.querySelector(`[data-variant-select="${productId}"]`);

    if (colorInput && select) {
      const selectedColor = colorInput.value;
      updateAvailableSizes(form, select, selectedColor);

      // Trouver la variante correspondant à la couleur sélectionnée
      const variant = Array.from(select.options).find((opt) =>
        opt.text.includes(selectedColor)
      );

      if (variant) {
        // Sélectionner la bonne variante dans le select
        select.value = variant.value;

        // Mettre à jour l'image si disponible
        if (variant.dataset.imageUrl) {
          const mainImage = document.querySelector(
            `[data-main-image="${productId}"]`
          );
          if (mainImage) {
            mainImage.src = variant.dataset.imageUrl;
          }
        }

        // Mettre à jour la couleur dans le sous-titre
        const colorElement = document.querySelector(
          `[data-selected-color="${productId}"]`
        );
        if (colorElement) {
          colorElement.textContent = selectedColor;
        }
      }
    }
  });

  // Fonction pour mettre à jour les tailles disponibles
  function updateAvailableSizes(form, select, selectedColor) {
    const sizeInputs = form.querySelectorAll("input[data-size-option]");
    const variants = Array.from(select.options);

    // Récupérer toutes les tailles disponibles pour la couleur sélectionnée
    const availableSizes = new Set();
    variants.forEach((variant) => {
      const [variantColor, variantSize] = variant.text.split(" / ");
      if (
        variantColor === selectedColor &&
        variant.getAttribute("data-available") !== "false"
      ) {
        availableSizes.add(variantSize);
      }
    });

    // Mettre à jour l'état des inputs de taille
    sizeInputs.forEach((input) => {
      const sizeValue = input.value;
      const label = form.querySelector(`label[for="${input.id}"]`);

      if (availableSizes.has(sizeValue)) {
        input.disabled = false;
        label.classList.remove("disabled");
      } else {
        input.disabled = true;
        label.classList.add("disabled");

        // Si la taille sélectionnée n'est plus disponible, sélectionner la première taille disponible
        if (input.checked) {
          const firstAvailableSize = form.querySelector(
            `input[data-size-option]:not([disabled])`
          );
          if (firstAvailableSize) {
            firstAvailableSize.checked = true;
          }
        }
      }
    });
  }

  const borne = document.querySelector("[data-borne]");
  const cart = document.querySelector("[data-cart]");
  const cartItems = cart.querySelector(".rdc-borne__cart-items");
  const cartCount = document.querySelector("[data-cart-count]");
  const checkoutPopup = document.querySelector(".rdc-borne__checkout-popup");

  const backToProducts = document.querySelector('[data-back="products"]');
  const confirmationOverlay = document.querySelector(
    "[data-confirmation-overlay]"
  );


  // Fonction pour mettre à jour le compteur du panier
  function updateCartCount() {
    fetch(window.Shopify.routes.root + "cart.js")
      .then((response) => response.json())
      .then((cart) => {
        const count = cart.item_count;
        if (count > 0) {
          cartCount.textContent = count;
        } else {
          cartCount.textContent = "";
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  // Mettre à jour le compteur au chargement de la page
  updateCartCount();

  // Détection mobile et ouverture du panier sur desktop si non vide
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const hasCartItems = cartItems.querySelector("[data-cart-item]") !== null;

  if (!isMobile && hasCartItems) {
    cart.classList.add("is-open");
    borne.classList.add("has-cart");
  }

  // Gestion des slides
  function hideAllSlides() {
    const slides = document.querySelectorAll("[data-slide]");
    slides.forEach((slide) => {
      slide.style.opacity = "0";
      slide.style.pointerEvents = "none";
      slide.style.transform = "translateX(30px)";
      slide.style.display = "none";
    });
  }

  function showSlide(slideType, id = null) {
    // Cacher toutes les slides
    hideAllSlides();

    // Si on revient à la page des catégories, réinitialiser la catégorie actuelle
    if (slideType === "categories") {
      currentCategory = "";
      document.querySelectorAll(".rdc-borne__type-button").forEach((button) => {
        button.style.display = "flex";
      });
    }

    // Afficher la slide demandée
    let targetSlide;
    if (slideType === "product-details") {
      targetSlide = document.querySelector(
        `[data-slide="${slideType}"][data-product-id="${id}"]`
      );
    } else if (slideType === "products" && id) {
      targetSlide = document.querySelector(
        `[data-slide="${slideType}"][data-category="${id}"]`
      );
    } else {
      targetSlide = document.querySelector(`[data-slide="${slideType}"]`);
    }

    if (targetSlide) {
      targetSlide.style.display = "flex";
      // Petit délai pour permettre à la transition de s'effectuer
      setTimeout(() => {
        targetSlide.style.opacity = "1";
        targetSlide.style.pointerEvents = "auto";
        targetSlide.style.transform = "translateX(0)";
      }, 50);
    }

    // Mettre à jour les boutons de retour
    const backButtons = document.querySelectorAll(".rdc-borne__back-button");
    backButtons.forEach((button) => {
      if (slideType === "categories") {
        button.style.display = "none";
      } else if (slideType === "products") {
        button.style.display =
          button.dataset.back === "categories" ? "block" : "none";
      } else if (slideType === "product-details") {
        button.style.display =
          button.dataset.back === "products" ? "block" : "none";
      }
    });

    // Mettre à jour la classe active sur la borne
    borne.dataset.activeSlide = slideType;

    // Si on est sur la slide des catégories, cacher le panier
    if (slideType === "categories") {
      cart.classList.remove("active");
    }

    // Si on est sur la slide des produits, afficher le panier
    if (slideType === "products") {
      if (!isMobile) {
        cart.classList.add("active");
      }
    }
  }

  // Variables globales
  let currentCategory = "";

  // Sélection des boutons de navigation
  const navigationButtons = {
    categories: document.querySelector('[data-back="categories"]'),
    products: document.querySelector('[data-back="products"]'),
  };

  // Initialisation des boutons de retour
  Object.values(navigationButtons).forEach((button) => {
    if (button) button.style.display = "none";
  });

  // Afficher la première slide au chargement
  showSlide("categories");

  // Gestion des clicks
  document.addEventListener("click", function (e) {
    // Gestion des clicks sur les catégories
    const categoryButton = e.target.closest("[data-category-target]");
    if (categoryButton) {
      e.preventDefault();
      const categoryId = categoryButton.dataset.categoryTarget;
      currentCategory = categoryId;
      showSlide("products", categoryId);
      navigationButtons.categories.style.display = "flex";
      return;
    }

    // Gestion des clicks sur les produits
    const productButton = e.target.closest("[data-product-target]");
    if (productButton) {
      e.preventDefault();
      const productId = productButton.dataset.productTarget;

      showSlide("product-details", productId);
      borne.classList.remove("rdc-borne--show-products");
      borne.classList.add("rdc-borne--show-details");
      navigationButtons.products.style.display = "flex";
    }

    // Gestion du retour
    const backButton = e.target.closest(".rdc-borne__back-button");
    if (backButton) {
      const backTo = backButton.dataset.back;

      if (backTo === "categories") {
        currentCategory = "";
        navigationButtons.categories.style.display = "none";
        showSlide("categories");
        borne.classList.remove("rdc-borne--show-products", "rdc-borne--show-details");
      } else if (backTo === "products") {
        navigationButtons.products.style.display = "none";
        showSlide("products", currentCategory);
        borne.classList.remove("rdc-borne--show-details");
        borne.classList.add("rdc-borne--show-products");
      }
    }
  });

  // Gestion du panier
  document.addEventListener("click", (e) => {
    const cartToggle = e.target.closest("[data-cart-toggle]");
    const clearCart = e.target.closest("[data-cart-clear]");
    const cartRemove = e.target.closest("[data-cart-remove]");
    const cartCheckout = e.target.closest("[data-cart-checkout]");

    if (cartToggle) {
      cart.classList.toggle("is-open");
      if (cart.classList.contains("is-open")) {
        document.body.classList.add("cart-open");
      } else {
        document.body.classList.remove("cart-open");
      }
    }

    if (clearCart) {
      if (confirm("Voulez-vous vraiment vider votre panier ?")) {
        fetch("/cart/clear.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then(() => {
            location.reload();
          })
          .catch((error) => {
            console.error("Erreur:", error);
          });
      }
    }

    if (cartRemove) {
      const itemKey = cartRemove.dataset.cartRemove;
      updateCartItem(itemKey, 0);
    }

    if (cartCheckout) {
      e.preventDefault();
      checkoutPopup.classList.add("is-active");

      setTimeout(() => {
        window.location.href = "/checkout";
      }, 3000);
    }
  });

  // Fermeture du panier en cliquant en dehors
  document.addEventListener("click", (e) => {
    if (
      !cart.contains(e.target) &&
      !e.target.closest("[data-cart-toggle]") &&
      cart.classList.contains("is-open")
    ) {
      cart.classList.remove("is-open");
      document.body.classList.remove("cart-open");
    }
  });

  // Gestion des quantités
  document.addEventListener("click", function (e) {
    const minusBtn = e.target.closest("[data-quantity-minus]");
    const plusBtn = e.target.closest("[data-quantity-plus]");

    if (minusBtn || plusBtn) {
      const input = e.target
        .closest(".rdc-borne__cart-item-quantity")
        .querySelector("[data-quantity-input]");
      const itemKey = e.target.closest("[data-cart-item]").dataset.cartItem;
      let quantity = parseInt(input.value);

      if (minusBtn && quantity > 0) {
        quantity--;
      } else if (plusBtn) {
        quantity++;
      }

      input.value = quantity;
      updateCartItem(itemKey, quantity);
    }
  });

  // Mise à jour d'un article
  function updateCartItem(key, quantity) {
    fetch("/cart/change.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: key,
        quantity: quantity,
      }),
    })
      .then((response) => response.json())
      .then((cart) => {
        updateCartCount();
        location.reload();
      })
      .catch((error) => {
        console.error("Erreur:", error);
      });
  }

  // Gestion des variantes
  document.addEventListener("change", function (e) {
    const radio = e.target.closest("[data-option-trigger]");
    if (!radio) return;

    const productId = radio.dataset.productId;
    const form = document.querySelector(
      `form[data-product-form="${productId}"]`
    );

    if (!form) return;

    const select = form.querySelector(`[data-variant-select="${productId}"]`);
    if (!select) return;

    // Si c'est un changement de couleur, mettre à jour les tailles disponibles
    if (!radio.hasAttribute("data-size-option")) {
      const selectedColor = radio.value;
      updateAvailableSizes(form, select, selectedColor);
    }

    // Récupérer la couleur et la taille sélectionnées
    const selectedColor = form.querySelector(
      "input[data-option-trigger]:not([data-size-option]):checked"
    ).value;
    const selectedSize = form.querySelector(
      "input[data-size-option]:checked"
    ).value;

    // Trouver la variante correspondante
    const variant = Array.from(select.options).find(
      (opt) => opt.text === `${selectedColor} / ${selectedSize}`
    );

    if (variant) {
      // Sélectionner la bonne variante dans le select
      select.value = variant.value;

      // Mettre à jour l'image si disponible
      if (variant.dataset.imageUrl) {
        const mainImage = document.querySelector(
          `[data-main-image="${productId}"]`
        );
        if (mainImage) {
          mainImage.src = variant.dataset.imageUrl;
        }
      }

      // Mettre à jour la couleur dans le sous-titre
      const colorElement = document.querySelector(
        `[data-selected-color="${productId}"]`
      );
      if (colorElement) {
        colorElement.textContent = selectedColor;
      }

      // Mettre à jour le prix
      const priceElement = document.querySelector(
        `[data-product-price="${productId}"]`
      );
      if (priceElement && variant.dataset.price) {
        priceElement.textContent = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(variant.dataset.price / 100);
      }
    }
  });

  // Gestion du formulaire d'ajout au panier
  document.addEventListener("submit", function (e) {
    const form = e.target.closest(".rdc-borne__product-form");
    if (!form) return;

    e.preventDefault();

    // Ajouter au panier via l'API Shopify
    fetch(window.Shopify.routes.root + "cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            id: form.querySelector("[data-variant-select]").value,
            quantity: 1,
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Afficher l'overlay de confirmation
        confirmationOverlay.classList.add("is-active");

        // Mettre à jour le compteur du panier
        updateCartCount();

        // Recharger la page après 2 secondes
        setTimeout(() => {
          location.reload();
        }, 1000);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
});
