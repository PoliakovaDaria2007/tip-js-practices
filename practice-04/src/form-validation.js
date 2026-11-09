"use strict";

export function validateTaskDraft(draft, tasks, editingId = null) {
    const errors = {};

    // Проверка ID
    if (editingId === null) {
        const id = Number(draft.id);
        if (!draft.id || draft.id.trim() === "" || !Number.isSafeInteger(id) || id <= 0) {
            errors.id = "ID должен быть положительным целым числом";
        } else if (tasks.some(t => t.id === id)) {
            errors.id = "Задача с таким ID уже существует";
        }
    } else {
        if (!tasks.some(t => t.id === editingId)) {
            errors.id = "Редактируемая задача не найдена";
        }
    }

    // Проверка Title
    if (typeof draft.title !== "string" || draft.title.trim().length < 1 || draft.title.trim().length > 100) {
        errors.title = "Название должно быть от 1 до 100 символов";
    }

    // Проверка Priority
    const allowed = ["low", "medium", "high"];
    if (!allowed.includes(draft.priority)) {
        errors.priority = "Выберите корректный приоритет";
    }

    return {
        ok: Object.keys(errors).length === 0,
        errors: errors,
        data: { 
            id: editingId !== null ? editingId : Number(draft.id),
            title: draft.title.trim(),
            priority: draft.priority
        }
    };
}