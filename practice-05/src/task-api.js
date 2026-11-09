"use strict";

// Проверка схемы задачи
function isValidTask(task) {
    return task && 
           typeof task.id === "number" && 
           typeof task.title === "string" && 
           typeof task.completed === "boolean" &&
           ["low", "medium", "high"].includes(task.priority);
}

// Проверка схемы категории
function isValidCategory(cat) {
    return cat && typeof cat.id === "number" && typeof cat.name === "string";
}

export function createTaskApi(client) {
    if (!client || typeof client.requestJson !== "function") {
        throw new Error("client должен содержать метод requestJson");
    }

    // Нормализация фильтров (разрешенные ключи)
    function normalizeFilters(filters) {
        const allowed = ["completed", "priority", "categoryId", "q"];
        const result = {};
        for (const key of allowed) {
            if (filters[key] !== undefined && filters[key] !== null && filters[key] !== "") {
                result[key] = filters[key];
            }
        }
        return result;
    }

    // Задание 6: Получение задач с фильтрами
    async function getTasks(filters = {}) {
        const normalized = normalizeFilters(filters);
        const res = await client.requestJson("/tasks", { query: normalized });
        
        if (!res.ok) return res;

        // Проверка структуры ответа
        if (!res.data || !Array.isArray(res.data.tasks) || !res.data.meta) {
            return { ok: false, kind: "invalid-response", message: "Неверная структура ответа" };
        }

        const tasks = res.data.tasks;
        const meta = res.data.meta;

        // Проверка каждой задачи
        for (const task of tasks) {
            if (!isValidTask(task)) {
                return { ok: false, kind: "invalid-response", message: "Неверная схема задачи" };
            }
        }

        // Проверка уникальности id
        const ids = new Set(tasks.map(t => t.id));
        if (ids.size !== tasks.length) {
            return { ok: false, kind: "invalid-response", message: "Дублирование id в задачах" };
        }

        // Сверка meta.total с длиной
        if (meta.total !== undefined && meta.total !== tasks.length) {
            return { ok: false, kind: "invalid-response", message: "meta.total не совпадает с длиной" };
        }

        return { ok: true, tasks, meta };
    }

    // Задание 6: Получение задачи по ID
    async function getTaskById(id) {
        const res = await client.requestJson(`/tasks/${id}`);
        if (!res.ok) return res;
        
        if (!res.data || !isValidTask(res.data)) {
            return { ok: false, kind: "invalid-response", message: "Неверная схема задачи" };
        }
        return { ok: true, task: res.data };
    }

    // Задание 6: Получение категорий
    async function getCategories() {
        const res = await client.requestJson("/categories");
        if (!res.ok) return res;

        if (!res.data || !Array.isArray(res.data.categories)) {
            return { ok: false, kind: "invalid-response", message: "Неверная структура категорий" };
        }

        const categories = res.data.categories;
        for (const cat of categories) {
            if (!isValidCategory(cat)) {
                return { ok: false, kind: "invalid-response", message: "Неверная схема категории" };
            }
        }

        // Проверка уникальности id категорий
        const ids = new Set(categories.map(c => c.id));
        if (ids.size !== categories.length) {
            return { ok: false, kind: "invalid-response", message: "Дублирование id в категориях" };
        }

        return { ok: true, categories };
    }

    // Задание 7: Параллельная загрузка
    async function loadInitialData(filters) {
        // Запускаем оба запроса параллельно
        const [tasksRes, catsRes] = await Promise.all([
            getTasks(filters),
            getCategories()
        ]);

        if (!tasksRes.ok) return tasksRes;
        if (!catsRes.ok) return catsRes;

        return {
            ok: true,
            tasks: tasksRes.tasks,
            meta: tasksRes.meta,
            categories: catsRes.categories
        };
    }

    return { getTasks, getTaskById, getCategories, loadInitialData };
}