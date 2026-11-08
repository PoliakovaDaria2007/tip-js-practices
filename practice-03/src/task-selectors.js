"use strict";

export function getVisibleTasks(tasks, filterMode) {
    if (filterMode === "pending") {
        return tasks.filter(task => task.completed === false);
    }
    if (filterMode === "completed") {
        return tasks.filter(task => task.completed === true);
    }
    // Для "all" или любого другого значения возвращаем новый массив со всеми задачами
    return [...tasks];
}