// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearStorageBtn = document.getElementById('clearStorageBtn');
        
// Stats elements
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
        
// State variables
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';

// Initialize todos with lastModified property if missing (for existing todos)
function initializeTodos() {
    todos = todos.map(todo => {
        if (!todo.lastModified) {
            // If todo doesn't have lastModified, use createdAt
            return {
                ...todo,
                lastModified: new Date(todo.createdAt).getTime() || Date.now()
            };
        }
        return todo;
    });
    saveTodos(); // Save the updated todos
}
        
// Initialize the app
function init() {
    initializeTodos(); // Initialize todos with lastModified property
    renderTodos();
    updateStats();
    setupEventListeners();
}
        
// Set up event listeners
function setupEventListeners() {
    // Add todo
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
            
    // Filter tasks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // To update active filter button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
                    
            // Apply filter
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });
            
    // Clear storage
    clearStorageBtn.addEventListener('click', clearStorage);
}
        
// Add a new task
function addTodo() {
    const text = todoInput.value.trim();
            
    if (text === '') {
        alert('Please enter a task');
        return;
    }
            
    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        lastModified: Date.now()
    };
            
    todos.push(newTodo);
    saveTodos();
    renderTodos();
    updateStats();
            
    // Clear input
    todoInput.value = '';
    todoInput.focus();
}
        
// Render todos based on current filter
function renderTodos() {
    // Filter todos based on current filter
    let filteredTodos = [];
    
    switch (currentFilter) {
        case 'pending':
            filteredTodos = todos.filter(todo => !todo.completed);
            break;
        case 'completed':
            filteredTodos = todos.filter(todo => todo.completed);
            break;
        default:
            filteredTodos = todos;
    }

    // Sort todos by lastModified (newest first)
    filteredTodos.sort((a, b) => {
        // If todos don't have lastModified property yet, use createdAt
        const timeA = a.lastModified || new Date(a.createdAt).getTime();
        const timeB = b.lastModified || new Date(b.createdAt).getTime();
        return timeB - timeA; // Descending order (newest first)
    });
            
    // Clear the list
    todoList.innerHTML = '';
            
    // Show/hide empty state
    if (filteredTodos.length === 0) {
        emptyState.style.display = 'block';
                
        // Update empty state message based on filter
        if (currentFilter === 'pending') {
            emptyState.innerHTML = `
                <h3 style="color: white;">No pending tasks</h3>
                <p style="color: white;">Great job! You've completed all tasks.</p>`;
        } else if (currentFilter === 'completed') {
            emptyState.innerHTML = `
                <h3 style="color: white;">No completed tasks</h3>
                <p  style="color: white;">Complete some tasks to see them here.</p>`;
        } else {
            emptyState.innerHTML = `
                <h3 style="color: white;">No tasks yet</h3>
                <p style="color: white;">Add a task above to get started!</p>`;
        }
    } else {
        emptyState.style.display = 'none';
              
        // Render each task
        filteredTodos.forEach(todo => {
            const todoItem = document.createElement('li');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            todoItem.dataset.id = todo.id;
                    
            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <div class="todo-actions">
                    <button class="action-btn edit-btn" title="Edit task">
                        <span class="icon icon-edit"></span>
                    </button>
                    <button class="action-btn delete-btn" title="Delete task">
                        <span class="icon icon-trash"></span>
                    </button>
                </div>
            `;
                    
            todoList.appendChild(todoItem);
                    
            // Add event listeners for task item
            const checkbox = todoItem.querySelector('.todo-checkbox');
            const editBtn = todoItem.querySelector('.edit-btn');
            const deleteBtn = todoItem.querySelector('.delete-btn');
                    
            // Toggle completion
            checkbox.addEventListener('change', () => toggleTodoCompletion(todo.id));
                    
            // Edit task
            editBtn.addEventListener('click', () => editTodo(todo.id));
                    
            // Delete task
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        });
    }
}
        
// Toggle todo completion status
function toggleTodoCompletion(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed, lastModified: Date.now() };
        }
        return todo;
    });
            
    saveTodos();
    renderTodos();
    updateStats();
}
        
// Edit task
function editTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    const newText = prompt('Edit your task:', todo.text);
            
    if (newText !== null && newText.trim() !== '') {
        todo.text = newText.trim();
        todo.lastModified = Date.now();
        saveTodos();
        renderTodos();
    }
}
        
// Delete task
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
    }
}
        
// Update statistics
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;
            
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}
    
// Save tasks to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}
        
// Clear all data from localStorage
function clearStorage() {
    if (confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
        localStorage.removeItem('todos');
        todos = [];
        renderTodos();
        updateStats();
    }
}
        
// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);