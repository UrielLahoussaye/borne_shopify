# Carousel de Catégories - Documentation

## Vue d'ensemble

Le système de carousel permet d'afficher 3 catégories à la fois avec des boutons de navigation pour accéder aux catégories supplémentaires.

## Fonctionnalités

### Affichage
- **3 catégories visibles** simultanément sur desktop
- **Boutons de navigation** sur les côtés (gauche/droite)
- **Animation fluide** lors du défilement (transition de 0.4s)
- **Responsive** : s'adapte automatiquement sur mobile

### Navigation
- **Bouton précédent** : Affiche les 3 catégories précédentes
- **Bouton suivant** : Affiche les 3 catégories suivantes
- Les boutons se désactivent automatiquement quand on atteint le début ou la fin

### Comportement
- Le carousel se **réinitialise** automatiquement quand on revient à l'écran 1
- **Adaptatif au redimensionnement** de la fenêtre
- Les boutons sont **désactivés visuellement** quand ils ne peuvent pas être utilisés

## Configuration dans Shopify

Pour ajouter une 4ème catégorie (ou plus) :

1. Allez dans le **Customizer** de votre thème
2. Sélectionnez la section **"Borne RDC"**
3. Dans le champ **"Catégories"**, ajoutez votre nouvelle catégorie séparée par une virgule :
   ```
   T-shirts, Débardeurs, Sweatshirts, Nouvelle Catégorie
   ```
4. Assurez-vous que l'image correspondante existe avec le nom : `nouvelle-categorie.webp`

## Structure technique

### HTML (Liquid)
```liquid
<div class="rdc-borne__categories-wrapper">
  <button class="rdc-borne__carousel-button rdc-borne__carousel-button--prev">
    <!-- SVG flèche gauche -->
  </button>
  
  <div class="rdc-borne__categories">
    <!-- Catégories générées dynamiquement -->
  </div>
  
  <button class="rdc-borne__carousel-button rdc-borne__carousel-button--next">
    <!-- SVG flèche droite -->
  </button>
</div>
```

### CSS
- `.rdc-borne__categories-wrapper` : Conteneur flex avec les boutons
- `.rdc-borne__categories` : Conteneur des catégories avec `transform` pour le défilement
- `.rdc-borne__carousel-button` : Styles des boutons de navigation
- `gap: 2rem` : Espacement entre les catégories (20px)

### JavaScript
- **Variables clés** :
  - `currentIndex` : Position actuelle du carousel (0 = début)
  - `visibleItems` : Nombre de catégories visibles (3)
  - `maxIndex` : Index maximum calculé automatiquement

- **Fonctions principales** :
  - `getItemWidth()` : Calcule la largeur d'une catégorie + gap
  - `updateButtons()` : Active/désactive les boutons selon la position
  - `moveCarousel()` : Déplace le carousel avec `translateX`

## Personnalisation

### Modifier le nombre de catégories visibles

Dans `rdc_borne.js`, ligne 983 :
```javascript
const visibleItems = 3; // Changer cette valeur
```

### Modifier la vitesse d'animation

Dans `rdc_borne.css`, ligne 179 :
```css
transition: transform 0.4s ease; /* Modifier 0.4s */
```

### Modifier le gap entre catégories

Dans `rdc_borne.css`, ligne 177 :
```css
gap: 2rem; /* Modifier cette valeur */
```

⚠️ **Important** : Si vous modifiez le gap, pensez à ajuster aussi la valeur dans `rdc_borne.js` ligne 991 :
```javascript
const gap = 20; // Doit correspondre au gap CSS en pixels
```

## Support mobile

Sur mobile (< 768px) :
- Les boutons sont **plus petits** (40px au lieu de 50px)
- Le gap est **réduit** (0.5rem)
- Le comportement du carousel reste identique

## Dépannage

### Les boutons ne fonctionnent pas
- Vérifiez que les classes CSS sont correctement appliquées
- Ouvrez la console du navigateur pour voir les erreurs JavaScript

### Les catégories ne s'alignent pas correctement
- Vérifiez que le gap CSS correspond à la valeur JavaScript
- Assurez-vous que toutes les catégories ont la même largeur (300px)

### Le carousel ne se réinitialise pas
- Vérifiez que le `MutationObserver` est bien initialisé
- Consultez la console pour les erreurs

## Compatibilité

- ✅ Chrome/Edge (dernières versions)
- ✅ Firefox (dernières versions)
- ✅ Safari (dernières versions)
- ✅ Mobile (iOS/Android)
