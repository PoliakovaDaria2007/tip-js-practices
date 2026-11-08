"use strict";

// Вспомогательные словари для перевода приоритетов
const priorityLabels = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий"
};

export function createTaskElement(task) {
    // 1. Создаем корневой элемент li
    const li = document.createElement("li");
    li.className = "task-card";
    if (task.completed) {
        li.classList.add("is-completed");
    }
    li.dataset.taskId = task.id;

    // 2. Создаем заголовок (h3)
    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title; // Именно textContent, чтобы теги не срабатывали!

    // 3. Создаем статус
    const status = document.createElement("span");
    status.className = "task-status";
    status.textContent = task.completed ? "Выполнена" : "В работе";

    // 4. Создаем приоритет
    const priority = document.createElement("span");
    priority.className = "task-priority";
    priority.textContent = priorityLabels[task.priority] || task.priority;

    // 5. Создаем контейнер для кнопок
    const actions = document.createElement("div");
    actions.className = "task-actions";

    // 6. Кнопка переключения статуса
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.dataset.action = "toggle";
    toggleBtn.setAttribute("aria-pressed", task.completed ? "true" : "false");

    const toggleLabel = document.createElement("span");
    toggleLabel.className = "action-label";
    toggleLabel.textContent = "Выполнена"; // По заданию текст постоянный
    toggleBtn.appendChild(toggleLabel);

    // 7. Кнопка удаления
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.dataset.action = "delete";

    const deleteLabel = document.createElement("span");
    deleteLabel.className = "action-label";
    deleteLabel.textContent = "Удалить";
    deleteBtn.appendChild(deleteLabel);

    // Собираем кнопки в контейнер
    actions.appendChild(toggleBtn);
    actions.appendChild(deleteBtn);

    // Собираем всю карточку
    li.appendChild(title);
    li.appendChild(status);
    li.appendChild(priority);
    li.appendChild(actions);

    return li;
}

export function renderTaskList(container, tasks) {
    // Создаем массив элементов через map
    const elements = tasks.map(task => createTaskElement(task));
    
    // Заменяем содержимое контейнера. 
    // ...elements (spread) разворачивает массив в список аргументов
    container.replaceChildren(...elements);
}
export function renderSummary(currentTasks, visibleCount) {
    // Считаем статистику по ВСЕМУ текущему массиву, а не по видимым
    const total = currentTasks.length;
    const completed = currentTasks.filter(t => t.completed).length;
    const pending = total - completed;
    // Защита от деления на ноль
    const progress = total === 0 ? 0 : (completed / total) * 100;

    // Находим элементы в DOM и обновляем их
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
    const emptyElement = document.querySelector("#task-empty"); // Предполагаемый ID элемента
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