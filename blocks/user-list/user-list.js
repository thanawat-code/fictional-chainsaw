export default async function decorate(block) {
  // 1. กำหนด URL ของ API (เปลี่ยน xxxxxxx เป็น ID จริงของคุณ)
  const apiEndpoint = 'https://6a30ec2ea7f8866418d6aec8.mockapi.io/user';

  try {
    // 2. เรียกดึงข้อมูลจาก API
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      throw new Error('ไม่สามารถดึงข้อมูลจาก API ได้');
    }
    const users = await response.json();

    // 3. ล้างข้อมูลเก่าใน Block (ถ้ามี)
    block.textContent = '';

    // 4. สร้าง HTML Container สำหรับใส่ข้อมูลผู้ใช้
    const listContainer = document.createElement('div');
    listContainer.classList.add('user-list-inner');

    // 5. วนลูปข้อมูลผู้ใช้ที่ได้จาก MockAPI มาแสดงผล
    // (สมมติว่าใน API มี field ชื่อ name, email, และ avatar ให้ปรับตามโครงสร้างจริงของคุณ)
    users.forEach((user) => {
      const userCard = document.createElement('div');
      userCard.classList.add('user-card');

      userCard.innerHTML = `
        ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}" class="user-avatar">` : ''}
        <div class="user-info">
          <h3 class="user-name">${user.name || 'ไม่ระบุชื่อ'}</h3>
          <p class="user-email">${user.email || 'ไม่มีอีเมล'}</p>
        </div>
      `;
      listContainer.append(userCard);
    });

    // 6. นำข้อมูลทั้งหมดไปใส่ใน Block เพื่อแสดงผลบนหน้าเว็บ
    block.append(listContainer);

  } catch (error) {
    console.error('Error fetching data:', error);
    block.textContent = 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้งาน';
  }
}