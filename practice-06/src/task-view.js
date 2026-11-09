"use strict";

const priorityLabels = { low: "Низкий", medium: "Средний", high: "Высокий" };

export function createTaskElement(task, categories) {
    const li = document.createElement("li");
    li.className = "task-card";
    if (task.completed) li.classList.add("is-completed");
    li.dataset.taskId = task.id;

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title; // Безопасный вывод

    const status = document.createElement("span");
    status.className = "task-status";
    status.textContent = task.completed ? "Выполнена" : "В работе";

    const priority = document.createElement("span");
    priority.className = "task-priority";
    priority.textContent = priorityLabels[task.priority] || task.priority;

    // Категория
    const cat = categories.find(c => c.id === task.categoryId);
    const categorySpan = document.createElement("span");
    categorySpan.className = "task-category";
    categorySpan.textContent = cat ? cat.name : "Без категории";

    const actions = document.createElement("div");
    actions.className = "task-actions";

    // Кнопки
    const createBtn = (action, label) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.action = action;
        const span = document.createElement("span");
        span.className = "action-label";
        span.textContent = label;
        btn.appendChild(span);
        return btn;
    };

    actions.appendChild(createBtn("toggle", "Выполнена"));
    actions.appendChild(createBtn("edit", "Изменить"));
    actions.appendChild(createBtn("delete", "Удалить"));

    li.appendChild(title);
    li.appendChild(status);
    li.appendChild(priority);
    li.appendChild(categorySpan);
    li.appendChild(actions);

    return li;
}

export function renderTaskList(container, tasks, categories) {
    const elements = tasks.map(task => createTaskElement(task, categories));
    container.replaceChildren(...elements);
}