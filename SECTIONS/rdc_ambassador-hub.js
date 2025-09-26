/**
 * Ambassador Hub functionality
 * Handles password validation and overlay interaction
 */

function initAmbassadorHub(hubElement, correctAnswer) {
  // DOM elements
  const passwordOverlay = hubElement.querySelector('[data-password-overlay]');
  const hubContent = hubElement.querySelector('[data-hub-content]');
  const passwordInput = hubElement.querySelector('[data-password-input]');
  const submitButton = hubElement.querySelector('[data-submit-button]');
  const errorMessage = hubElement.querySelector('[data-error-message]');
  const hintButton = hubElement.querySelector('[data-hint-button]');
  const riddleHint = hubElement.querySelector('[data-riddle-hint]');
  
  // Check if user has already solved the riddle
  const storageKey = `ambassador_hub_${hubElement.getAttribute('data-id')}_solved`;
  const hasAccessGranted = sessionStorage.getItem(storageKey) === 'true';
  
  if (hasAccessGranted) {
    // Skip password overlay if already solved
    showContent();
  }
  
  // Event listeners
  if (submitButton) {
    submitButton.addEventListener('click', validatePassword);
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        validatePassword();
      }
    });
  }
  
  if (hintButton && riddleHint) {
    hintButton.addEventListener('click', function() {
      riddleHint.classList.add('visible');
      hintButton.style.display = 'none';
    });
  }
  
  /**
   * Validates the password input against the correct answer
   */
  function validatePassword() {
    const userAnswer = passwordInput.value.trim();
    
    if (userAnswer === '') {
      showError('Veuillez entrer une réponse');
      return;
    }
    
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      // Store in session that user has solved the riddle
      sessionStorage.setItem(storageKey, 'true');
      showContent();
    } else {
      showError('Réponse incorrecte, essayez encore');
      passwordInput.value = '';
      passwordInput.focus();
      
      // Add shake animation to input
      passwordInput.classList.add('shake');
      setTimeout(() => {
        passwordInput.classList.remove('shake');
      }, 500);
    }
  }
  
  /**
   * Shows error message
   */
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.opacity = 1;
    
    // Hide error message after 3 seconds
    setTimeout(() => {
      errorMessage.style.opacity = 0;
    }, 3000);
  }
  
  /**
   * Shows the main content and hides the password overlay
   */
  function showContent() {
    // Add transition classes
    passwordOverlay.classList.add('hidden');
    hubContent.classList.add('visible');
    
    // After transition completes, set display none to remove from DOM flow
    setTimeout(() => {
      passwordOverlay.style.display = 'none';
    }, 500);
  }
  
  /**
   * Adds CSS for animations not included in the CSS file
   */
  function addDynamicStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  // Initialize dynamic styles
  addDynamicStyles();
}

// Add an icon-instagram render function for Shopify if it doesn't exist
if (typeof window.Shopify === 'undefined' || !window.Shopify.designMode) {
  // This is a fallback for when the Shopify icon-instagram render is not available
  document.addEventListener('DOMContentLoaded', function() {
    const iconPlaceholders = document.querySelectorAll('.ambassador-hub__ambassador-social');
    
    iconPlaceholders.forEach(placeholder => {
      if (!placeholder.querySelector('svg')) {
        placeholder.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        `;
      }
    });
  });
}
