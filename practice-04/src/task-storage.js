"use strict";

export function isValidTaskList(tasks) {
    if (!Array.isArray(tasks)) return false;
    const ids = new Set();
    for (const task of tasks) {
        if (!task || typeof task.id !== "number" || task.id <= 0) return false;
        if (ids.has(task.id)) return false;
        if (typeof task.title !== "string" || task.title.length < 1 || task.title.length > 100) return false;
        if (typeof task.completed !== "boolean") return false;
        if (!["low", "medium", "high"].includes(task.priority)) return false;
        ids.add(task.id);
    }
    return true;
}

export function loadTasks(storage, key, fallbackTasks) {
    const fallbackCopy = JSON.parse(JSON.stringify(fallbackTasks));
    try {
        const raw = storage.getItem(key);
        if (raw === null) {
            return { tasks: fallbackCopy, source: "initial", error: null };
        }
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 1 && isValidTaskList(parsed.tasks)) {
            return { tasks: parsed.tasks, source: "storage", error: null };
        }
        return { tasks: fallbackCopy, source: "initial", error: "Неверный формат данных" };
    } catch (e) {
        return { tasks: fallbackCopy, source: "initial", error: "Ошибка чтения данных" };
    }
}

export function saveTasks(storage, key, tasks) {
    if (!isValidTaskList(tasks)) {
        return { ok: false, error: "Попытка сохранить некорректные данные" };
    }
    try {
        const wrapper = { version: 1, tasks: tasks };
        storage.setItem(key, JSON.stringify(wrapper));
        return { ok: true, error: null };
    } catch (e) {
        return { ok: false, error: "Ошибка записи" };
    }
}

export function removeSavedTasks(storage, key) {
    try {
        storage.removeItem(key);
        return { ok: true, error: null };
    } catch (e) {
        return { ok: false, error: "Ошибка удаления" };
    }
}