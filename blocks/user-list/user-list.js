export default async function decorate(block) {
  // เปลี่ยน xxxxxxx เป็น ID จริงของ MockAPI ของคุณ
  const apiEndpoint = 'https://6a30ec2ea7f8866418d6aec8.mockapi.io/user'; 
  
  block.innerHTML = ''; // ล้างข้อมูลเดิมในหน้าเว็บออกก่อน

  // --- ส่วนที่ 1: สร้าง โครงสร้าง HTML สำหรับ ฟอร์ม (Create & Update) ---
  const formContainer = document.createElement('div');
  formContainer.classList.add('user-form-container');
  formContainer.innerHTML = `
    <h3 id="form-title">เพิ่มผู้ใช้งานใหม่</h3>
    <form id="user-form">
      <input type="hidden" id="user-id">
      <div class="form-group">
        <input type="text" id="user-name" placeholder="ชื่อ-นามสกุล" required>
      </div>
      <div class="form-group">
        <input type="email" id="user-email" placeholder="อีเมล" required>
      </div>
      <div class="form-actions">
        <button type="submit" id="submit-btn" class="btn btn-primary">บันทึกข้อมูล</button>
        <button type="button" id="cancel-btn" class="btn btn-secondary" style="display:none;">ยกเลิก</button>
      </div>
    </form>
  `;
  block.append(formContainer);

  // --- ส่วนที่ 2: สร้าง Container สำหรับแสดงรายการผู้ใช้ (Read) ---
  const listContainer = document.createElement('div');
  listContainer.classList.add('user-list-inner');
  block.append(listContainer);

  // ดึง Element ต่างๆ มาเตรียมใช้งานใน JavaScript
  const form = block.querySelector('#user-form');
  const userIdInput = block.querySelector('#user-id');
  const nameInput = block.querySelector('#user-name');
  const emailInput = block.querySelector('#user-email');
  const formTitle = block.querySelector('#form-title');
  const submitBtn = block.querySelector('#submit-btn');
  const cancelBtn = block.querySelector('#cancel-btn');

  // ==========================================
  //ฟังก์ชัน READ: ดึงข้อมูลมาแสดงผล (GET)
  // ==========================================
  async function loadUsers() {
    listContainer.innerHTML = '<p class="loading">กำลังโหลดข้อมูล...</p>';
    try {
      const res = await fetch(apiEndpoint);
      if (!res.ok) throw new Error();
      const users = await res.json();
      listContainer.innerHTML = ''; // ล้าง Loading ออก

      if (users.length === 0) {
        listContainer.innerHTML = '<p class="no-data">ไม่มีข้อมูลผู้ใช้งานในระบบ</p>';
        return;
      }

      users.forEach(user => {
        const card = document.createElement('div');
        card.classList.add('user-card');
        card.innerHTML = `
          <div class="user-info">
            <h4 class="name">${user.name}</h4>
            <p class="email">${user.email}</p>
          </div>
          <div class="user-actions">
            <button class="edit-btn" data-id="${user.id}" data-name="${user.name}" data-email="${user.email}">แก้ไข</button>
            <button class="delete-btn" data-id="${user.id}">ลบ</button>
          </div>
        `;
        listContainer.append(card);
      });

      // ผูกเหตุการณ์ให้ปุ่ม ลบ (DELETE)
      block.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          if (confirm('คุณแน่ใจใช่ไหมที่จะลบผู้ใช้งานนี้?')) {
            await deleteUser(id);
          }
        });
      });

      // ผูกเหตุการณ์ให้ปุ่ม แก้ไข (เตรียม UPDATE)
      block.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const { id, name, email } = e.target.dataset;
          userIdInput.value = id;
          nameInput.value = name;
          emailInput.value = email;
          formTitle.textContent = 'แก้ไขข้อมูลผู้ใช้งาน';
          submitBtn.textContent = 'อัปเดตข้อมูล';
          cancelBtn.style.display = 'inline-block';
          formContainer.scrollIntoView({ behavior: 'smooth' });
        });
      });

    } catch (err) {
      listContainer.innerHTML = '<p class="error">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
  }

  // ==========================================
  // ฟังก์ชัน DELETE: ลบข้อมูล (DELETE)
  // ==========================================
  async function deleteUser(id) {
    try {
      const res = await fetch(`${apiEndpoint}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadUsers(); // โหลดข้อมูลใหม่หลังจากลบสำเร็จ
      } else {
        alert('ไม่สามารถลบข้อมูลได้');
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ฟังก์ชันเคลียร์ฟอร์มกลับเป็นสถานะเพิ่มข้อมูลใหม่
  function resetForm() {
    form.reset();
    userIdInput.value = '';
    formTitle.textContent = 'เพิ่มผู้ใช้งานใหม่';
    submitBtn.textContent = 'บันทึกข้อมูล';
    cancelBtn.style.display = 'none';
  }

  cancelBtn.addEventListener('click', resetForm);

  // ==========================================
  // ฟังก์ชัน CREATE & UPDATE: บันทึกข้อมูล (POST / PUT)
  // ==========================================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = userIdInput.value;
    const userData = {
      name: nameInput.value,
      email: emailInput.value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึก...';

    try {
      let response;
      if (id) {
        // ถ้ามี ID แปลว่าเป็นการแก้ไขข้อมูล (UPDATE -> PUT)
        response = await fetch(`${apiEndpoint}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
      } else {
        // ถ้าไม่มี ID แปลว่าเป็นการเพิ่มข้อมูลใหม่ (CREATE -> POST)
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
      }

      if (response.ok) {
        resetForm();
        loadUsers(); // โหลดรายการใหม่
      } else {
        alert('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
      }
    } catch (err) {
      alert('ไม่สามารถเชื่อมต่อกับ API ได้');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // เรียกทำงานครั้งแรกเมื่อเปิดหน้าเว็บ
  loadUsers();
}