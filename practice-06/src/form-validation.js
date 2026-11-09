"use strict";

export function validateTaskDraft(draft, categories) {
    const errors = {};
    
    // Title
    let validTitle = "";
    if (typeof draft.title !== "string" || draft.title.trim().length < 1 || draft.title.trim().length > 100) {
        errors.title = "Название должно быть от 1 до 100 символов";
    } else {
        validTitle = draft.title.trim();
    }

    // Priority
    const priorities = ["low", "medium", "high"];
    let validPriority = draft.priority;
    if (!priorities.includes(draft.priority)) {
        errors.priority = "Некорректный приоритет";
        validPriority = "medium"; // fallback
    }

    // CategoryId
    const catId = Number(draft.categoryId);
    const catExists = categories && categories.some(c => c.id === catId);
    let validCategoryId = catId;
    if (!Number.isSafeInteger(catId) || !catExists) {
        errors.categoryId = "Выберите корректную категорию";
    }

    return {
        valid: Object.keys(errors).length === 0,
        value: {
            title: validTitle,
            priority: validPriority,
            categoryId: validCategoryId
        },
        errors
    };
}