export default async function decorate(block) {
  const apiEndpoint = 'https://galley-projector-salt.ngrok-free.dev/api/v1/lifestyle';
  block.innerHTML = '<div class="loading">Loading lifestyle articles...</div>';

  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) throw new Error('Failed to fetch lifestyle articles');
    const data = await response.json();
    
    block.innerHTML = '';
    
    const feed = document.createElement('div');
    feed.className = 'lifestyle-feed';
    
    data.slice(0, 3).forEach((article, index) => {
      // [{ id, title, excerpt, image, publishDate, readTime, link }]
      const articleEl = document.createElement('article');
      articleEl.className = `lifestyle-article ${index === 0 ? 'featured-article' : 'standard-article'}`;
      
      const dateStr = new Date(article.publishDate || Date.now()).toLocaleDateString('en-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      articleEl.innerHTML = `
        <a href="${article.link || '#'}" class="article-link">
          <div class="article-image">
            <img src="${article.image || 'https://via.placeholder.com/800x600?text=Lifestyle'}" alt="${article.title}" loading="lazy">
          </div>
          <div class="article-content">
            <div class="article-meta">
              <time datetime="${article.publishDate}">${dateStr}</time>
              <span class="read-time">${article.readTime || '5 min'} read</span>
            </div>
            <h3 class="article-title">${article.title}</h3>
            <p class="article-excerpt">${article.excerpt}</p>
            <span class="read-more">Read Full Story ➔</span>
          </div>
        </a>
      `;
      feed.append(articleEl);
    });
    
    block.append(feed);
  } catch (error) {
    block.innerHTML = '<div class="error">Unable to load articles at this time.</div>';
    console.error(error);
  }
}
