export class UserService {
    constructor() {
        this.baseUrl = "http://localhost:3000/users";
    }
    async getAllUsers() {
        try {
            const response = await fetch(this.baseUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }
    async getUserById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch user with id ${id}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            throw error;
        }
    }
    async createUser(user) {
        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });
            if (!response.ok) {
                throw new Error(`Failed to create user: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error("Error creating user:", error);
            throw error;
        }
    }
    async updateUser(id, user) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });
            if (!response.ok) {
                throw new Error(`Failed to update user with id ${id}: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw error;
        }
    }
    async deleteUser(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error(`Failed to delete user with id ${id}: ${response.statusText}`);
            }
        }
        catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw error;
        }
    }
}
