/**
 * Galerie Ressources functionality
 * Handles filtering, modal viewing, and video playback
 */

function initGalerieRessources() {
  // DOM elements
  const galerieSection = document.querySelector('[data-galerie-ressources]');
  if (!galerieSection) return;

  const items = galerieSection.querySelectorAll('.galerie-ressources__item');
  const videoWrappers = galerieSection.querySelectorAll('.galerie-ressources__video-wrapper');
  const viewImageButtons = galerieSection.querySelectorAll('[data-view-image]');
  const viewVideoButtons = galerieSection.querySelectorAll('[data-view-video]');
  
  // Initialize video previews
  initVideoPreviews();
  
  // Initialize modal viewing
  initModal();
  
  // Initialize view buttons
  initViewButtons();

  // Filtrage retiré

  /**
   * Initialize video preview functionality
   */
  function initVideoPreviews() {
    videoWrappers.forEach(wrapper => {
      wrapper.addEventListener('click', function() {
        const videoUrl = this.getAttribute('data-video-url');
        
        if (!videoUrl) return;
        
        // Check if it's YouTube or Vimeo
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          openYouTubeVideo(videoUrl);
        } else if (videoUrl.includes('vimeo.com')) {
          openVimeoVideo(videoUrl);
        } else {
          // Assume it's a direct video file
          openVideoFile(videoUrl);
        }
      });
    });
  }

  /**
   * Open YouTube video in modal
   */
  function openYouTubeVideo(url) {
    // Extract YouTube ID
    let videoId = '';
    
    if (url.includes('youtube.com/watch')) {
      videoId = new URL(url).searchParams.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    if (!videoId) return;
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframe.width = '800';
    iframe.height = '450';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.classList.add('galerie-ressources__modal-video');
    
    // Open in modal
    openModal(iframe);
  }

  /**
   * Open Vimeo video in modal
   */
  function openVimeoVideo(url) {
    // Extract Vimeo ID
    const vimeoId = url.split('vimeo.com/')[1].split('?')[0];
    
    if (!vimeoId) return;
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
    iframe.width = '800';
    iframe.height = '450';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.classList.add('galerie-ressources__modal-video');
    
    // Open in modal
    openModal(iframe);
  }

  /**
   * Open video file in modal
   */
  function openVideoFile(url) {
    // Create video element
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    video.classList.add('galerie-ressources__modal-video');
    
    // Open in modal
    openModal(video);
  }

  /**
   * Initialize modal functionality
   */
  function initModal() {
    // Create modal if it doesn't exist
    if (!document.querySelector('.galerie-ressources__modal')) {
      const modal = document.createElement('div');
      modal.className = 'galerie-ressources__modal';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'galerie-ressources__modal-content';
      
      const closeButton = document.createElement('button');
      closeButton.className = 'galerie-ressources__modal-close';
      closeButton.innerHTML = '&times;';
      closeButton.setAttribute('aria-label', 'Fermer');
      
      modalContent.appendChild(closeButton);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
      
      // Close modal on button click
      closeButton.addEventListener('click', closeModal);
      
      // Close modal on background click
      modal.addEventListener('click', function(event) {
        if (event.target === modal) {
          closeModal();
        }
      });
      
      // Close modal on escape key
      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
          closeModal();
        }
      });
    }
  }

  /**
   * Open modal with content
   */
  function openModal(content) {
    const modal = document.querySelector('.galerie-ressources__modal');
    const modalContent = modal.querySelector('.galerie-ressources__modal-content');
    
    // Clear previous content (except close button)
    const closeButton = modalContent.querySelector('.galerie-ressources__modal-close');
    modalContent.innerHTML = '';
    modalContent.appendChild(closeButton);
    
    // Add new content
    modalContent.appendChild(content);
    
    // Show modal
    modal.classList.add('active');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close modal
   */
  function closeModal() {
    const modal = document.querySelector('.galerie-ressources__modal');
    
    // Hide modal
    modal.classList.remove('active');
    
    // Allow body scrolling
    document.body.style.overflow = '';
    
    // Clear content after animation
    setTimeout(() => {
      const modalContent = modal.querySelector('.galerie-ressources__modal-content');
      const closeButton = modalContent.querySelector('.galerie-ressources__modal-close');
      modalContent.innerHTML = '';
      modalContent.appendChild(closeButton);
    }, 300);
  }
  
  /**
   * Initialize view buttons for images and videos
   */
  function initViewButtons() {
    // Handle image view buttons
    viewImageButtons.forEach(button => {
      button.addEventListener('click', function() {
        const imageUrl = this.getAttribute('data-view-image');
        if (!imageUrl) return;
        
        // Create image element
        const img = document.createElement('img');
        img.src = imageUrl;
        img.classList.add('galerie-ressources__modal-image');
        img.alt = this.closest('.galerie-ressources__item').querySelector('.galerie-ressources__item-title')?.textContent || 'Image';
        
        // Open in modal
        openModal(img);
      });
    });
    
    // Handle video view buttons
    viewVideoButtons.forEach(button => {
      button.addEventListener('click', function() {
        const videoUrl = this.getAttribute('data-view-video');
        if (!videoUrl) return;
        
        // Check if it's YouTube or Vimeo
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
          openYouTubeVideo(videoUrl);
        } else if (videoUrl.includes('vimeo.com')) {
          openVimeoVideo(videoUrl);
        } else {
          // Assume it's a direct video file
          openVideoFile(videoUrl);
        }
      });
    });
  }
}
