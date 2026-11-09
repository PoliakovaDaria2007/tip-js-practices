"use strict";

function isValidTask(task) {
    return task && typeof task.id === "number" && typeof task.title === "string" &&
           typeof task.completed === "boolean" && ["low", "medium", "high"].includes(task.priority);
}

function isValidCategory(cat) {
    return cat && typeof cat.id === "number" && typeof cat.name === "string";
}

export function createTaskApi(client) {
    if (!client || typeof client.requestJson !== "function") {
        throw new Error("client должен содержать requestJson");
    }

    // Чтение (из ПР5)
    async function getTasks(filters = {}, options = {}) {
        const res = await client.requestJson("/tasks", { query: filters, ...options });
        if (!res.ok) return res;
        
        if (!res.data || !Array.isArray(res.data.tasks) || !res.data.meta) {
            return { ok: false, kind: "invalid-response", message: "Неверная структура" };
        }
        if (!res.data.tasks.every(isValidTask)) {
            return { ok: false, kind: "invalid-response", message: "Неверная схема задачи" };
        }
        return { ok: true, tasks: res.data.tasks, meta: res.data.meta };
    }

    async function getCategories(options = {}) {
        const res = await client.requestJson("/categories", options);
        if (!res.ok) return res;

        if (!res.data || !Array.isArray(res.data.categories)) {
            return { ok: false, kind: "invalid-response", message: "Неверная структура категорий" };
        }
        if (!res.data.categories.every(isValidCategory)) {
            return { ok: false, kind: "invalid-response", message: "Неверная схема категории" };
        }
        return { ok: true, categories: res.data.categories };
    }

    async function loadInitialData(filters, options = {}) {
        const [tasksRes, catsRes] = await Promise.all([
            getTasks(filters, options),
            getCategories(options)
        ]);
        if (!tasksRes.ok) return tasksRes;
        if (!catsRes.ok) return catsRes;
        return { ok: true, tasks: tasksRes.tasks, meta: tasksRes.meta, categories: catsRes.categories };
    }

    // Изменение (ПР6)
    async function getTaskById(id, options = {}) {
        if (!Number.isSafeInteger(id) || id <= 0) return { ok: false, kind: "invalid-id" };
        const res = await client.requestJson(`/tasks/${id}`, options);
        if (!res.ok) return res;
        if (!res.data || !isValidTask(res.data)) return { ok: false, kind: "invalid-response" };
        return { ok: true, task: res.data };
    }

    async function createTask(draft, options = {}) {
        const res = await client.requestJson("/tasks", {
            method: "POST",
            body: draft,
            ...options
        });
        if (!res.ok) return res;
        if (!res.data || !isValidTask(res.data)) return { ok: false, kind: "invalid-response" };
        return { ok: true, task: res.data };
    }

    async function updateTask(id, changes, options = {}) {
        if (!Number.isSafeInteger(id) || id <= 0) return { ok: false, kind: "invalid-id" };
        const res = await client.requestJson(`/tasks/${id}`, {
            method: "PATCH",
            body: changes,
            ...options
        });
        if (!res.ok) return res;
        if (!res.data || !isValidTask(res.data)) return { ok: false, kind: "invalid-response" };
        return { ok: true, task: res.data };
    }

    async function setTaskCompleted(id, completed, options = {}) {
        return updateTask(id, { completed }, options);
    }

    async function deleteTask(id, options = {}) {
        if (!Number.isSafeInteger(id) || id <= 0) return { ok: false, kind: "invalid-id" };
        const res = await client.requestJson(`/tasks/${id}`, { method: "DELETE", ...options });
        if (!res.ok) return res;
        if (res.data !== null) return { ok: false, kind: "invalid-response", message: "Ожидался пустой ответ" };
        return { ok: true, data: null };
    }

    async function resetDemoData(options = {}) {
        const res = await client.requestJson("/debug/reset", { method: "POST", ...options });
        if (!res.ok) return res;
        return { ok: true, data: res.data };
    }

    return { 
        getTasks, getCategories, loadInitialData, getTaskById, 
        createTask, updateTask, setTaskCompleted, deleteTask, resetDemoData 
    };
}