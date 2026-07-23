import { TodoService } from './services/todoService.js';

// Khởi tạo instance của TodoService
const todoService = new TodoService();

// Lấy các phần tử DOM
const todoForm = document.getElementById('todo-form') as HTMLFormElement;
const todoInput = document.getElementById('todo-input') as HTMLInputElement;
const todoList = document.getElementById('todo-list') as HTMLUListElement;

/**
 * Hàm lấy danh sách công việc từ API và render ra thẻ <ul>
 */
export async function renderTodos(): Promise<void> {
  if (!todoList) return;

  try {
    const todos = await todoService.getAllTodos();

    if (todos.length === 0) {
      todoList.innerHTML = `
        <li class="list-group-item text-center text-muted py-4">
          <i class="bi bi-inbox fs-3 d-block mb-2"></i>
          Chưa có công việc nào trong danh sách. Hãy thêm mới!
        </li>
      `;
      return;
    }

    todoList.innerHTML = todos
      .map(
        (todo) => `
        <li class="list-group-item d-flex align-items-center justify-content-between p-3">
          <div class="d-flex align-items-center gap-3">
            <input 
              type="checkbox" 
              class="form-check-input fs-5 mt-0 btn-toggle" 
              data-id="${todo.id}" 
              ${todo.completed ? 'checked' : ''} 
            />
            <span class="fs-6 ${todo.completed ? 'todo-completed' : 'fw-medium'}">
              ${todo.title}
            </span>
          </div>
          <button class="btn btn-sm btn-outline-danger btn-delete d-flex align-items-center gap-1" data-id="${todo.id}">
            <i class="bi bi-trash"></i>
            <span>Xóa</span>
          </button>
        </li>
      `
      )
      .join('');
  } catch (error) {
    todoList.innerHTML = `
      <li class="list-group-item text-center text-danger py-4">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>Không thể tải danh sách công việc. Vui lòng kiểm tra lại json-server!
      </li>
    `;
    console.error('Lỗi khi render danh sách công việc:', error);
  }
}

/**
 * Lắng nghe sự kiện Submit của Form để tạo công việc mới
 */
todoForm?.addEventListener('submit', async (event: SubmitEvent) => {
  event.preventDefault();

  const title = todoInput.value.trim();
  if (!title) {
    alert('Vui lòng nhập tên công việc!');
    return;
  }

  try {
    await todoService.createTodo({
      title,
      completed: false,
    });
    todoInput.value = '';
    await renderTodos();
  } catch (error) {
    alert('Thêm công việc thất bại. Vui lòng thử lại!');
    console.error('Lỗi khi thêm công việc mới:', error);
  }
});

/**
 * Xử lý Event Delegation trên todoList (gồm đổi trạng thái completed và xóa)
 */
todoList?.addEventListener('click', async (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  // 1. Xử lý nút Xóa
  const deleteBtn = target.closest<HTMLButtonElement>('.btn-delete');
  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    if (id) {
      const isConfirmed = confirm('Bạn có chắc chắn muốn xóa công việc này không?');
      if (isConfirmed) {
        try {
          await todoService.deleteTodo(id);
          await renderTodos();
        } catch (error) {
          alert('Xóa công việc thất bại. Vui lòng thử lại!');
          console.error(`Lỗi khi xóa công việc #${id}:`, error);
        }
      }
    }
    return;
  }

  // 2. Xử lý Checkbox đổi trạng thái completed
  const toggleCheckbox = target.closest<HTMLInputElement>('.btn-toggle');
  if (toggleCheckbox) {
    const id = toggleCheckbox.getAttribute('data-id');
    if (id) {
      const newStatus = toggleCheckbox.checked;
      try {
        await todoService.updateTodo(id, { completed: newStatus });
        await renderTodos();
      } catch (error) {
        alert('Cập nhật trạng thái công việc thất bại!');
        console.error(`Lỗi khi cập nhật trạng thái công việc #${id}:`, error);
      }
    }
  }
});

// Tự động tải danh sách công việc khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  renderTodos();
});
