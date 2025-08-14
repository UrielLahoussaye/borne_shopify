document.addEventListener('DOMContentLoaded', function() {
  const borne = document.querySelector('.rdc-borne');
  const backButton = borne.querySelector('.rdc-borne__back-button');
  const history = [];

  // Navigation vers l'écran suivant
  borne.addEventListener('click', function(event) {
    if (event.target.matches('[data-action="next"]')) {
      const currentScreen = borne.querySelector('.rdc-borne__screen[data-active="true"]');
      const nextScreenNumber = event.target.dataset.target;
      const nextScreen = borne.querySelector(`.rdc-borne__screen[data-screen="${nextScreenNumber}"]`);

      if (currentScreen && nextScreen) {
        history.push(currentScreen.dataset.screen);
        currentScreen.dataset.active = "false";
        nextScreen.dataset.active = "true";
      }
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
