export class TodoService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/todos';
    }
    /**
     * Lấy danh sách tất cả công việc từ json-server
     */
    async getAllTodos() {
        try {
            const response = await fetch(this.baseUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch todos: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error in getAllTodos:', error);
            throw error;
        }
    }
    /**
     * Tạo một công việc mới
     * @param todo Đối tượng công việc chưa có id (Omit<Todo, 'id'>)
     */
    async createTodo(todo) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(todo),
            });
            if (!response.ok) {
                throw new Error(`Failed to create todo: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error in createTodo:', error);
            throw error;
        }
    }
    /**
     * Cập nhật thông tin công việc (trạng thái hoàn thành hoặc tiêu đề)
     * @param id ID của công việc cần sửa
     * @param todo Dữ liệu cập nhật một phần (Partial<Todo>)
     */
    async updateTodo(id, todo) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(todo),
            });
            if (!response.ok) {
                throw new Error(`Failed to update todo #${id}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error in updateTodo #${id}:`, error);
            throw error;
        }
    }
    /**
     * Xóa một công việc theo ID
     * @param id ID của công việc cần xóa
     */
    async deleteTodo(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Failed to delete todo #${id}: ${response.statusText}`);
            }
        }
        catch (error) {
            console.error(`Error in deleteTodo #${id}:`, error);
            throw error;
        }
    }
}
