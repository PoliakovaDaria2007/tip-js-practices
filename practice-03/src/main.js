"use strict";

// 1. ИМПОРТЫ
// Подключаем данные и функции для работы с задачами
import { demoTasks } from "./data.js";
import { 
    addTask, 
    setTaskCompleted, 
    renameTask, 
    removeTask 
} from "./task-service.js";

// Подключаем функции отрисовки
import { 
    createTaskElement, 
    renderTaskList, 
    renderSummary, 
    renderEmptyState 
} from "./task-view.js";

// Подключаем селекторы
import { getVisibleTasks } from "./task-selectors.js";


// 2. ПЕРЕМЕННЫЕ СОСТОЯНИЯ
let currentTasks = demoTasks; // Текущий массив задач
let currentFilter = "all";    // Текущий фильтр (по умолчанию "все")

// Находим элементы на странице
const taskListElement = document.querySelector("#task-list");
const errorElement = document.querySelector("#error-message"); // Убедитесь, что такой ID есть в HTML!


// 3. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ОШИБОК
function showError(message) {
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.hidden = false;
    } else {
        console.error("Ошибка:", message); // Если элемента нет, выводим в консоль
    }
}

function clearError() {
    if (errorElement) {
        errorElement.textContent = "";
        errorElement.hidden = true;
    }
}


// 4. ОБРАБОТЧИК КЛИКОВ ПО СПИСКУ ЗАДАЧ (Задание из предыдущего шага)
function handleTaskListClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest('button[data-action]');
    if (!button || !taskListElement.contains(button)) return;

    const action = button.dataset.action;
    if (action !== 'toggle' && action !== 'delete') return;

    const card = button.closest('li[data-task-id]');
    if (!card) return;

    const id = Number(card.dataset.taskId);

    if (!Number.isSafeInteger(id) || id <= 0) {
        showError("Некорректный идентификатор задачи");
        return;
    }

    const task = currentTasks.find(t => t.id === id);
    if (!task) {
        showError("Задача с таким идентификатором не найдена");
        return;
    }

    let result;
    if (action === 'toggle') {
        result = setTaskCompleted(currentTasks, id, !task.completed);
    } else if (action === 'delete') {
        result = removeTask(currentTasks, id);
    }

    if (result.ok) {
        currentTasks = result.tasks;
        clearError();
        renderApp(); // Вызываем полную перерисовку!
    } else {
        showError(result.error);
    }
}


// 5. ОБРАБОТЧИК КЛИКОВ ПО ФИЛЬТРАМ
function handleFilterClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest('button[data-filter]');
    if (!button) return;

    const newFilter = button.dataset.filter;
    if (newFilter === currentFilter) return;
    
    currentFilter = newFilter;

    // Обновляем активную кнопку
    const allFilterButtons = document.querySelectorAll('button[data-filter]');
    allFilterButtons.forEach(btn => {
        if (btn === button) {
            btn.classList.add("is-active");
            btn.setAttribute("aria-pressed", "true");
        } else {
            btn.classList.remove("is-active");
            btn.setAttribute("aria-pressed", "false");
        }
    });

    renderApp();
}


// 6. ГЛАВНАЯ ФУНКЦИЯ ПЕРЕРИСОВКИ
function renderApp() {
    if (!taskListElement) return;

    // Получаем видимые задачи
    const visibleTasks = getVisibleTasks(currentTasks, currentFilter);

    // Отрисовываем список
    renderTaskList(taskListElement, visibleTasks);

    // Обновляем сводку и пустое состояние
    // (Убедитесь, что эти функции есть в task-view.js!)
    if (typeof renderSummary === 'function') {
        renderSummary(currentTasks, visibleTasks.length);
    }
    if (typeof renderEmptyState === 'function') {
        renderEmptyState(currentTasks.length, visibleTasks.length);
    }
}


// 7. ИНИЦИАЛИЗАЦИЯ (Запускается при загрузке страницы)
function init() {
    // Вешаем обработчики событий
    if (taskListElement) {
        taskListElement.addEventListener("click", handleTaskListClick);
    }

    // Ищем контейнер с кнопками фильтров и вешаем обработчик
    const filterContainer = document.querySelector("#filters"); // Замените на ваш ID контейнера фильтров!
    if (filterContainer) {
        filterContainer.addEventListener("click", handleFilterClick);
    } else {
        // Если фильтры лежат не в контейнере, а просто на странице:
        document.body.addEventListener("click", (e) => {
            if (e.target.closest('button[data-filter]')) {
                handleFilterClick(e);
            }
        });
    }

    // Первая отрисовка
    renderApp();
}

// Запускаем приложение
init();