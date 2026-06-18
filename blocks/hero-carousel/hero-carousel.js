export default async function decorate(block) {
  const apiEndpoint = 'https://galley-projector-salt.ngrok-free.dev/api/v1/offers';
  let slidesData = [];

  // 1. Check if authored table rows exist
  if (block.children.length > 0) {
    [...block.children].forEach(row => {
      if (row.children.length >= 2) {
        const imageElement = row.children[0].querySelector('picture');
        const contentHtml = row.children[1].innerHTML;
        if (imageElement) {
          slidesData.push({
            type: 'authored',
            imageElement: imageElement.cloneNode(true),
            contentHtml
          });
        }
      }
    });
  }

  // Clear block
  block.innerHTML = '';

  // 2. Fetch API Data if authored data is missing
  if (slidesData.length === 0) {
    try {
      const response = await fetch(apiEndpoint, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Assume API returns: [{ id, title, description, image, ctaText, ctaLink, category }]
        slidesData = data.slice(0, 5).map(item => ({
          type: 'api',
          image: item.image,
          title: item.title,
          description: item.description,
          ctaText: item.ctaText,
          ctaLink: item.ctaLink,
          category: item.category
        }));
      }
    } catch (err) {
      console.error('Hero Carousel: Failed to fetch API data', err);
    }
  }

  if (slidesData.length === 0) return; // Exit if no data

  // 3. Render Slides
  const carouselTrack = document.createElement('div');
  carouselTrack.className = 'hero-carousel-track';
  
  const indicatorsContainer = document.createElement('div');
  indicatorsContainer.className = 'hero-carousel-indicators';

  slidesData.forEach((slide, index) => {
    const slideEl = document.createElement('div');
    slideEl.className = 'hero-carousel-slide';
    if (index === 0) slideEl.classList.add('active');

    if (slide.type === 'authored') {
      slideEl.innerHTML = `
        <div class="hero-image">${slide.imageElement.outerHTML}</div>
        <div class="hero-content">${slide.contentHtml}</div>
      `;
    } else {
      slideEl.innerHTML = `
        <div class="hero-image">
          <img src="${slide.image}" alt="${slide.title}" loading="${index === 0 ? 'eager' : 'lazy'}">
        </div>
        <div class="hero-content">
          <span class="hero-category">${slide.category || ''}</span>
          <h2>${slide.title}</h2>
          <p>${slide.description}</p>
          ${slide.ctaLink ? `<a href="${slide.ctaLink}" class="button primary">${slide.ctaText || 'Learn More'}</a>` : ''}
        </div>
      `;
    }
    carouselTrack.append(slideEl);

    // Indicator
    const dot = document.createElement('button');
    dot.className = 'hero-carousel-dot';
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    indicatorsContainer.append(dot);
  });

  block.append(carouselTrack, indicatorsContainer);

  // 4. Slide Navigation Logic
  let currentIndex = 0;
  const slides = carouselTrack.querySelectorAll('.hero-carousel-slide');
  const dots = indicatorsContainer.querySelectorAll('.hero-carousel-dot');
  let autoPlayInterval;

  const goToSlide = (index) => {
    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');
    
    currentIndex = index;
    
    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');
    
    resetAutoPlay();
  };

  const nextSlide = () => {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= slides.length) nextIndex = 0;
    goToSlide(nextIndex);
  };

  const startAutoPlay = () => {
    autoPlayInterval = setInterval(nextSlide, 5000); // 5s rotation
  };

  const resetAutoPlay = () => {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  };

  if (slides.length > 1) {
    startAutoPlay();
    
    // Pause on hover
    block.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    block.addEventListener('mouseleave', startAutoPlay);
  }
}
