"use strict";

import { createApiClient } from "./api-client.js";
import { createTaskApi } from "./task-api.js";
import { createAppController } from "./app-controller.js";
import { createDomView } from "./dom-app.js";
import { variantNumber } from "./variant.js";

// 1. Определяем адрес API (из URL или по умолчанию)
const urlParams = new URLSearchParams(window.location.search);
const apiUrl = urlParams.get("api") || "http://127.0.0.1:5505/api";

// Показываем адрес API в шапке (если есть такой элемент)
const apiInfo = document.querySelector("#api-info");
if (apiInfo) apiInfo.textContent = `API: ${apiUrl}`;

// 2. Создаем экземпляры клиента, API и интерфейса
const client = createApiClient(apiUrl);
const api = createTaskApi(client);
const view = createDomView();

// 3. Создаем контроллер
const controller = createAppController({ api, view });

// 4. Настраиваем фильтры (по номеру варианта)
// (Если variant.js пуст, можно использовать фильтр по умолчанию)
const filters = variantNumber ? { /* настройки для вашего варианта */ } : {};

// 5. Инициализация приложения
async function init() {
    // Вешаем обработчик на форму добавления/редактирования
    const form = document.querySelector("#task-form");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const draft = {
                title: form.querySelector("#task-title").value,
                priority: form.querySelector("#task-priority").value,
                categoryId: form.querySelector("#task-category").value
            };
            controller.submit(draft);
        });
    }

    // Делегирование кликов по кнопкам в списке задач
    const list = document.querySelector("#task-list");
    if (list) {
        list.addEventListener("click", (e) => {
            const btn = e.target.closest("button[data-action]");
            if (!btn) return;
            
            const card = btn.closest("li[data-task-id]");
            const id = Number(card.dataset.taskId);
            const action = btn.dataset.action;

            if (action === "toggle") controller.toggleTask(id);
            if (action === "delete") controller.deleteTask(id);
            if (action === "edit") controller.beginEdit(id);
        });
    }

    // Кнопка сброса данных
    const resetBtn = document.querySelector("#reset-btn");
    if (resetBtn) resetBtn.addEventListener("click", () => controller.resetData());

    // Запуск начальной загрузки
    await controller.start(filters);
    
    // Тестовый крючок для браузерных проверок
    window.practice06 = { ready: true };
}

// Запуск
init().catch(err => {
    console.error("Ошибка инициализации:", err);
});