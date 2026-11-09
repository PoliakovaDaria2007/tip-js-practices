"use strict";

export function createTask(id, title, priority = "medium") {
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
        return { ok: false, error: "Некорректный id" };
    }
    if (typeof title !== "string") {
        return { ok: false, error: "Название должно быть строкой" };
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
        return { ok: false, error: "Некорректная длина названия" };
    }
    const allowedPriorities = ["low", "medium", "high"];
    if (!allowedPriorities.includes(priority)) {
        return { ok: false, error: "Некорректный приоритет" };
    }

    return { 
        ok: true, 
        task: { id, title: trimmedTitle, completed: false, priority } 
    };
}

export function addTask(tasks, id, title, priority = "medium") {
    if (tasks.some(task => task.id === id)) {
        return { ok: false, error: "Задача с таким id уже существует" };
    }
    const creationResult = createTask(id, title, priority);
    if (!creationResult.ok) return creationResult;
    return { ok: true, tasks: [...tasks, creationResult.task] };
}

export function setTaskCompleted(tasks, id, completed) {
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
        return { ok: false, error: "Некорректный id" };
    }
    if (typeof completed !== "boolean") {
        return { ok: false, error: "Статус должен быть true или false" };
    }
    if (!tasks.some(task => task.id === id)) {
        return { ok: false, error: "Задача не найдена" };
    }

    const newTasks = tasks.map(task => {
        if (task.id === id) return { ...task, completed };
        return task;
    });
    return { ok: true, tasks: newTasks };
}

export function renameTask(tasks, id, title) {
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
        return { ok: false, error: "Некорректный id" };
    }
    if (typeof title !== "string") {
        return { ok: false, error: "Название должно быть строкой" };
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
        return { ok: false, error: "Некорректная длина названия" };
    }
    if (!tasks.some(task => task.id === id)) {
        return { ok: false, error: "Задача не найдена" };
    }

    const newTasks = tasks.map(task => {
        if (task.id === id) return { ...task, title: trimmedTitle };
        return task;
    });
    return { ok: true, tasks: newTasks };
}

export function removeTask(tasks, id) {
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
        return { ok: false, error: "Некорректный id" };
    }
    if (!tasks.some(task => task.id === id)) {
        return { ok: false, error: "Задача не найдена" };
    }
    const newTasks = tasks.filter(task => task.id !== id);
    return { ok: true, tasks: newTasks };
}

// НОВОЕ в ПР4: Обновление задачи
export function updateTask(tasks, id, title, priority) {
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
        return { ok: false, error: "Некорректный id" };
    }
    if (typeof title !== "string") {
        return { ok: false, error: "Название должно быть строкой" };
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
        return { ok: false, error: "Некорректная длина названия" };
    }
    const allowedPriorities = ["low", "medium", "high"];
    if (!allowedPriorities.includes(priority)) {
        return { ok: false, error: "Некорректный приоритет" };
    }
    if (!tasks.some(task => task.id === id)) {
        return { ok: false, error: "Задача не найдена" };
    }

    const newTasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, title: trimmedTitle, priority: priority };
        }
        return task;
    });
    return { ok: true, tasks: newTasks };
}