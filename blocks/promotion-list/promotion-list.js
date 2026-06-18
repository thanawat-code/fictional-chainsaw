export default async function decorate(block) {
  const apiEndpoint = 'https://galley-projector-salt.ngrok-free.dev/api/v1/offers';
  
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
    
    // 💡 1. เพิ่มการเช็คคลาส 'limit-6' และ 'limit-12'
    const isFeatured = block.classList.contains('featured');
    const isLimit6 = block.classList.contains('limit-6');
    const isLimit12 = block.classList.contains('limit-12');
    
    // กำหนดค่าเริ่มต้น
    let currentLimit = promotions.length;
    let itemsPerLoad = promotions.length;

    if (isLimit6) {
      currentLimit = 6;
      itemsPerLoad = 6;
    } else if (isFeatured) {
      currentLimit = 4;
      itemsPerLoad = 4;
    } else if (isLimit12) {
      currentLimit = 12;
      itemsPerLoad = 12;
    }
    
    // ฟังก์ชันสร้างการ์ด
    const renderCards = (startIndex, endIndex) => {
      const displayPromos = promotions.slice(startIndex, endIndex);
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
    };

    // โหลดครั้งแรก
    renderCards(0, currentLimit);

    // 💡 3. ถ้าเป็นแบบจำกัดจำนวน (ไม่ว่าจะ 4 หรือ 6) ให้แสดงปุ่ม "ดูโปรโมชั่นทั้งหมด" ด้านบน
    if (isLimit6 || isFeatured) {
      const actionContainer = document.createElement('div');
      actionContainer.classList.add('promotion-action-container');
      actionContainer.innerHTML = `<a href="https://main--fictional-chainsaw--thanawat-code.aem.page/promotion" class="button primary">ดูโปรโมชั่นทั้งหมด (View All)</a>`;
      block.prepend(actionContainer);
    }
    
    // 💡 4. ถ้าเป็น limit-12 ให้มีปุ่ม Load More ด้านล่าง
    if (isLimit12 && promotions.length > currentLimit) {
      const loadMoreContainer = document.createElement('div');
      loadMoreContainer.classList.add('promotion-load-more-container');
      loadMoreContainer.innerHTML = `<button class="button secondary">โหลดเพิ่มเติม (Load More)</button>`;
      block.append(loadMoreContainer);

      const loadMoreBtn = loadMoreContainer.querySelector('button');
      loadMoreBtn.addEventListener('click', () => {
        const nextLimit = currentLimit + itemsPerLoad;
        renderCards(currentLimit, nextLimit);
        currentLimit = nextLimit;
        
        if (currentLimit >= promotions.length) {
          loadMoreContainer.style.display = 'none';
        }
      });
    }
    
  } catch (err) {
    block.innerHTML = '<p class="error">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    console.error(err);
  }
}