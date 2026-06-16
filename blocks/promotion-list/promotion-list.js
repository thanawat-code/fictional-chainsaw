export default async function decorate(block) {
  const apiEndpoint = 'https://6a30ec2ea7f8866418d6aec8.mockapi.io/promotion';
  
  block.innerHTML = '<p class="loading">กำลังโหลดโปรโมชั่น...</p>';
  
  try {
    const res = await fetch(apiEndpoint);
    if (!res.ok) throw new Error();
    const promotions = await res.json();
    
    block.innerHTML = '';
    
    if (promotions.length === 0) {
      block.innerHTML = '<p class="no-data">ไม่มีข้อมูลโปรโมชั่น</p>';
      return;
    }
    
    const listContainer = document.createElement('div');
    listContainer.classList.add('promotion-list-inner');
    block.append(listContainer);
    
    const isFeatured = block.classList.contains('featured');
    const displayPromos = isFeatured ? promotions.slice(0, 4) : promotions;
    
    displayPromos.forEach(promo => {
      const card = document.createElement('div');
      card.classList.add('promotion-card');
      card.innerHTML = `
        <div class="promotion-image">
          <img src="${promo.img || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${promo.title}" loading="lazy">
        </div>
        <div class="promotion-info">
          <h3 class="title">${promo.title}</h3>
          <p class="description">${promo.description}</p>
        </div>
      `;
      listContainer.append(card);
    });

    if (isFeatured) {
      const actionContainer = document.createElement('div');
      actionContainer.classList.add('promotion-action-container');
      actionContainer.innerHTML = `<a href="/promotions" class="button primary">ดูโปรโมชั่นทั้งหมด (View All)</a>`;
      block.append(actionContainer);
    }
    
  } catch (err) {
    block.innerHTML = '<p class="error">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    console.error(err);
  }
}
