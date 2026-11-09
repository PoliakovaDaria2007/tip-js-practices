"use strict";

const priorityLabels = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий"
};

export function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task-card";
    if (task.completed) {
        li.classList.add("is-completed");
    }
    li.dataset.taskId = task.id;

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const status = document.createElement("span");
    status.className = "task-status";
    status.textContent = task.completed ? "Выполнена" : "В работе";

    const priority = document.createElement("span");
    priority.className = "task-priority";
    priority.textContent = priorityLabels[task.priority] || task.priority;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    // 1. Кнопка статуса
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.dataset.action = "toggle";
    toggleBtn.setAttribute("aria-pressed", task.completed ? "true" : "false");
    const toggleLabel = document.createElement("span");
    toggleLabel.className = "action-label";
    toggleLabel.textContent = "Выполнена";
    toggleBtn.appendChild(toggleLabel);

    // 2. Кнопка редактирования (НОВОЕ в ПР4)
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.dataset.action = "edit";
    const editLabel = document.createElement("span");
    editLabel.className = "action-label";
    editLabel.textContent = "Изменить";
    editBtn.appendChild(editLabel);

    // 3. Кнопка удаления
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.dataset.action = "delete";
    const deleteLabel = document.createElement("span");
    deleteLabel.className = "action-label";
    deleteLabel.textContent = "Удалить";
    deleteBtn.appendChild(deleteLabel);

    actions.appendChild(toggleBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(title);
    li.appendChild(status);
    li.appendChild(priority);
    li.appendChild(actions);

    return li;
}

export function renderTaskList(container, tasks) {
    const elements = tasks.map(task => createTaskElement(task));
    container.replaceChildren(...elements);
}

export function renderSummary(currentTasks, visibleCount) {
    const total = currentTasks.length;
    const completed = currentTasks.filter(t => t.completed).length;
    const pending = total - completed;
    const progress = total === 0 ? 0 : (completed / total) * 100;

    const summary = document.querySelector("#task-summary");
    if (summary) {
        summary.querySelector('[data-stat="total"]').textContent = total;
        summary.querySelector('[data-stat="completed"]').textContent = completed;
        summary.querySelector('[data-stat="pending"]').textContent = pending;
        summary.querySelector('[data-stat="progress"]').textContent = `${progress.toFixed(1)}%`;
        summary.querySelector('[data-stat="visible"]').textContent = visibleCount;
    }
}

export function renderEmptyState(total, visibleCount) {
    const emptyElement = document.querySelector("#task-empty");
    if (!emptyElement) return;

    if (total === 0 && visibleCount === 0) {
        emptyElement.textContent = "Список задач пуст.";
        emptyElement.hidden = false;
    } else if (total > 0 && visibleCount === 0) {
        emptyElement.textContent = "Нет задач по выбранному фильтру.";
        emptyElement.hidden = false;
    } else {
        emptyElement.textContent = "";
        emptyElement.hidden = true;
    }
}