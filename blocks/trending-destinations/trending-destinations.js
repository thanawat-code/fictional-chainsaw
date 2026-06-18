export default async function decorate(block) {
  const apiEndpoint = 'https://galley-projector-salt.ngrok-free.dev/api/v1/trending-destinations';
  block.innerHTML = '<div class="loading">Loading trending destinations...</div>';

  try {
    const response = await fetch(apiEndpoint, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch trending destinations');
    const data = await response.json();
    
    block.innerHTML = '';
    
    const track = document.createElement('div');
    track.className = 'trending-destinations-track';
    
    data.forEach(item => {
      // [{ id, fromCity, toCity, toCode, image, travelClass, price, currency, startDate, endDate }]
      const card = document.createElement('a');
      card.className = 'trending-card';
      card.href = `/booking?origin=${item.fromCity}&dest=${item.toCode}`;
      
      const formattedPrice = new Intl.NumberFormat('en-TH', { style: 'currency', currency: item.currency || 'THB' }).format(item.price);
      
      card.innerHTML = `
        <div class="trending-image">
          <img src="${item.image || 'https://via.placeholder.com/400x300?text=Destination'}" alt="${item.toCity}" loading="lazy">
          <div class="trending-badge">${item.travelClass || 'Economy'}</div>
        </div>
        <div class="trending-info">
          <h3>${item.toCity} <span class="code">(${item.toCode})</span></h3>
          <p class="route">From ${item.fromCity}</p>
          <div class="trending-meta">
            <span class="dates">${item.startDate} - ${item.endDate}</span>
            <span class="price">From <strong>${formattedPrice}</strong></span>
          </div>
        </div>
      `;
      track.append(card);
    });
    
    block.append(track);
  } catch (error) {
    block.innerHTML = '<div class="error">Unable to load trending destinations at this time.</div>';
    console.error(error);
  }
}
