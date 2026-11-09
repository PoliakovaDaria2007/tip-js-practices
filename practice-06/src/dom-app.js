"use strict";

import { renderTaskList } from "./task-view.js";

export function createDomView() {
    // Находим все элементы на странице (IDs должны совпадать с index.html)
    const listContainer = document.querySelector("#task-list");
    const statusArea = document.querySelector("#status-area");
    const form = document.querySelector("#task-form");
    const idInput = document.querySelector("#task-id");
    const titleInput = document.querySelector("#task-title");
    const priorityInput = document.querySelector("#task-priority");
    const categoryInput = document.querySelector("#task-category");
    
    // Блоки для вывода ошибок под полями
    const errorTitle = document.querySelector("#error-title");
    const errorPriority = document.querySelector("#error-priority");
    const errorCategory = document.querySelector("#error-category");

    return {
        // Отрисовка списка задач
        renderTasks(tasks, categories) {
            if (listContainer) {
                renderTaskList(listContainer, tasks, categories);
            }
        },

        // Заполнение выпадающего списка категорий в форме
        renderCategories(categories) {
            if (!categoryInput) return;
            categoryInput.innerHTML = '<option value="">Выберите категорию</option>';
            categories.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat.id;
                option.textContent = cat.name;
                categoryInput.appendChild(option);
            });
        },

        // Управление состоянием интерфейса (loading, ready, empty, error)
        setState(state, message = "") {
            if (!listContainer) return;
            
            if (state === "loading") {
                listContainer.setAttribute("aria-busy", "true");
                listContainer.innerHTML = "<li>Загрузка...</li>";
            } else {
                listContainer.setAttribute("aria-busy", "false");
                if (state === "empty") {
                    listContainer.innerHTML = `<li>${message || "Задач нет"}</li>`;
                } else if (state === "error") {
                    listContainer.innerHTML = `<li style="color:red;">Ошибка: ${message}</li>`;
                }
            }
        },

        // Показ сообщений об операциях (success/error)
        notify(message, type) {
            if (!statusArea) return;
            statusArea.textContent = message;
            statusArea.className = type === "error" ? "status-error" : "status-success";
        },

        // Управление блокировкой кнопок при отправке
        setMutationPending(isPending) {
            const buttons = document.querySelectorAll("button");
            buttons.forEach(btn => btn.disabled = isPending);
        },

        // Заполнение формы для редактирования
        fillForm(task) {
            if (idInput) idInput.value = task.id;
            if (titleInput) titleInput.value = task.title;
            if (priorityInput) priorityInput.value = task.priority;
            if (categoryInput) categoryInput.value = task.categoryId;
            
            if (titleInput) titleInput.focus();
            if (form) {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = "Сохранить";
            }
        },

        // Сброс формы в режим создания
        resetForm() {
            if (form) form.reset();
            if (idInput) idInput.value = "";
            if (form) {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = "Добавить";
            }
        },

        // Показ ошибок валидации полей
        showFormErrors(errors) {
            if (errorTitle) errorTitle.textContent = errors.title || "";
            if (errorPriority) errorPriority.textContent = errors.priority || "";
            if (errorCategory) errorCategory.textContent = errors.categoryId || "";
        },

        // Очистка ошибок
        clearFormErrors() {
            if (errorTitle) errorTitle.textContent = "";
            if (errorPriority) errorPriority.textContent = "";
            if (errorCategory) errorCategory.textContent = "";
        }
    };
}