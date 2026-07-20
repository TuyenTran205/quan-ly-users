import { UserService } from './services/userService.js';
import { User } from './types/User.js';

// Khai báo đối tượng bootstrap toàn cục từ CDN
declare const bootstrap: any;

const userService = new UserService();

// Các DOM Elements
const userTableBody = document.getElementById('user-table-body') as HTMLTableSectionElement;
const userForm = document.getElementById('user-form') as HTMLFormElement;
const userIdInput = document.getElementById('user-id') as HTMLInputElement;
const fullNameInput = document.getElementById('full-name') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const positionInput = document.getElementById('position') as HTMLInputElement;
const departmentInput = document.getElementById('department') as HTMLInputElement;
const hometownInput = document.getElementById('hometown') as HTMLInputElement;
const dateOfBirthInput = document.getElementById('date-of-birth') as HTMLInputElement;
const startDateInput = document.getElementById('start-date') as HTMLInputElement;

const formTitle = document.getElementById('form-title') as HTMLElement;
const formModeBadge = document.getElementById('form-mode-badge') as HTMLElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
const openAddModalBtn = document.getElementById('open-add-modal-btn') as HTMLButtonElement;
const modalElement = document.getElementById('user-modal') as HTMLElement;

// Đối tượng Bootstrap 5 Modal
let userModal: any;

/**
 * Hàm hỗ trợ định dạng ngày tháng từ YYYY-MM-DD sang DD/MM/YYYY của Việt Nam
 */
function formatDateVN(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
}

/**
 * 1. Hàm renderUsers(): Gọi API và vẽ lại dữ liệu lên bảng
 */
export async function renderUsers(): Promise<void> {
  if (!userTableBody) return;

  try {
    const users = await userService.getAllUsers();

    if (users.length === 0) {
      userTableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center text-muted py-4">Chưa có dữ liệu nhân viên.</td>
        </tr>
      `;
      return;
    }

    userTableBody.innerHTML = users
      .map(
        (user) => `
        <tr>
          <td><span class="fw-semibold text-secondary">#${user.id}</span></td>
          <td class="fw-bold">${user.fullName}</td>
          <td>${user.email}</td>
          <td><span class="badge bg-info-subtle text-info-emphasis">${user.position}</span></td>
          <td><span class="badge bg-light text-dark border">${user.department}</span></td>
          <td class="d-none d-md-table-cell">${user.hometown || ''}</td>
          <td class="d-none d-lg-table-cell">${formatDateVN(user.dateOfBirth)}</td>
          <td class="d-none d-md-table-cell">${formatDateVN(user.startDate)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-warning me-1 btn-edit" data-id="${user.id}">
              <i class="bi bi-pencil-square me-1"></i>Sửa
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${user.id}">
              <i class="bi bi-trash me-1"></i>Xóa
            </button>
          </td>
        </tr>
      `
      )
      .join('');
  } catch (error) {
    userTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-danger py-4">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>Không thể tải dữ liệu nhân viên. Vui lòng kiểm tra lại json-server!
        </td>
      </tr>
    `;
    console.error('Lỗi khi render dữ liệu nhân viên:', error);
  }
}

/**
 * Reset form và đưa Modal về trạng thái 'Thêm mới' (create)
 */
function prepareCreateForm(): void {
  userForm.reset();
  userIdInput.value = '';
  hometownInput.value = '';
  dateOfBirthInput.value = '';
  startDateInput.value = '';
  userForm.setAttribute('data-mode', 'create');

  if (formTitle) {
    formTitle.innerHTML = `<i class="bi bi-person-plus-fill me-2 text-primary"></i>Thêm Nhân Viên`;
  }
  if (formModeBadge) {
    formModeBadge.textContent = 'Tạo mới';
    formModeBadge.className = 'badge bg-primary-subtle text-primary';
  }
  if (submitBtn) {
    submitBtn.innerHTML = `<i class="bi bi-check-lg me-1"></i>Lưu thông tin`;
    submitBtn.className = 'btn btn-primary';
  }
}

/**
 * Đổ dữ liệu nhân viên lên form và chuyển Modal sang trạng thái 'Cập nhật' (update)
 */
function prepareUpdateForm(user: User): void {
  userIdInput.value = user.id;
  fullNameInput.value = user.fullName;
  emailInput.value = user.email;
  positionInput.value = user.position;
  departmentInput.value = user.department;
  hometownInput.value = user.hometown || '';
  dateOfBirthInput.value = user.dateOfBirth || '';
  startDateInput.value = user.startDate || '';

  userForm.setAttribute('data-mode', 'update');

  if (formTitle) {
    formTitle.innerHTML = `<i class="bi bi-pencil-square me-2 text-warning"></i>Cập Nhật Nhân Viên`;
  }
  if (formModeBadge) {
    formModeBadge.textContent = 'Cập nhật';
    formModeBadge.className = 'badge bg-warning-subtle text-warning-emphasis';
  }
  if (submitBtn) {
    submitBtn.innerHTML = `<i class="bi bi-arrow-repeat me-1"></i>Cập nhật`;
    submitBtn.className = 'btn btn-warning';
  }
}

// 2. Sự kiện click 'Thêm mới nhân viên' -> Chuẩn bị form & Mở Modal
openAddModalBtn?.addEventListener('click', () => {
  prepareCreateForm();
  if (userModal) {
    userModal.show();
  }
});

// 3. Sự kiện click trên bảng (nút Sửa & Xóa)
userTableBody?.addEventListener('click', async (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  // Xử lý Xóa nhân viên
  const deleteBtn = target.closest<HTMLButtonElement>('.btn-delete');
  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    if (id) {
      const isConfirmed = confirm('Bạn có chắc chắn muốn xóa nhân viên này không?');
      if (isConfirmed) {
        try {
          await userService.deleteUser(id);
          await renderUsers();
        } catch (error) {
          alert('Xóa nhân viên thất bại. Vui lòng thử lại!');
        }
      }
    }
    return;
  }

  // Xử lý Sửa nhân viên -> Đổ dữ liệu & Mở Modal
  const editBtn = target.closest<HTMLButtonElement>('.btn-edit');
  if (editBtn) {
    const id = editBtn.getAttribute('data-id');
    if (id) {
      try {
        const user = await userService.getUserById(id);
        prepareUpdateForm(user);
        if (userModal) {
          userModal.show();
        }
      } catch (error) {
        alert('Không thể lấy thông tin nhân viên để sửa.');
      }
    }
  }
});

// 4. Sự kiện Submit Form trong Modal
userForm?.addEventListener('submit', async (event: SubmitEvent) => {
  event.preventDefault();

  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim();
  const position = positionInput.value.trim();
  const department = departmentInput.value.trim();
  const hometown = hometownInput.value.trim();
  const dateOfBirth = dateOfBirthInput.value.trim();
  const startDate = startDateInput.value.trim();

  if (!fullName || !email || !position || !department || !hometown || !dateOfBirth || !startDate) {
    alert('Vui lòng điền đầy đủ tất cả các trường thông tin!');
    return;
  }

  const mode = userForm.getAttribute('data-mode');

  try {
    const userData = {
      fullName,
      email,
      position,
      department,
      hometown,
      dateOfBirth,
      startDate,
    };

    if (mode === 'create') {
      await userService.createUser(userData);
    } else if (mode === 'update') {
      const id = userIdInput.value;
      if (!id) {
        alert('Không tìm thấy ID nhân viên!');
        return;
      }
      await userService.updateUser(id, userData);
    }

    // Ẩn Modal sau khi tạo/cập nhật thành công
    if (userModal) {
      userModal.hide();
    }

    // Reset Form & Render lại bảng dữ liệu
    prepareCreateForm();
    await renderUsers();
  } catch (error) {
    console.error('Lỗi khi lưu thông tin:', error);
    alert('Thao tác thất bại. Vui lòng kiểm tra lại!');
  }
});

// 5. Khởi tạo Bootstrap Modal instance & Render dữ liệu lần đầu
document.addEventListener('DOMContentLoaded', () => {
  if (modalElement && typeof bootstrap !== 'undefined') {
    userModal = new bootstrap.Modal(modalElement);
  }
  renderUsers();
});
