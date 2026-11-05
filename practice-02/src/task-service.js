"use strict";

export function createTask(id, title, priority = "medium") {
    // 1. Проверка ID (число, безопасное целое, больше 0)
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
        return { ok: false, error: "Некорректный id: должно быть положительное безопасное целое число" };
    }

    // 2. Проверка Title (строка, после trim от 1 до 100 символов)
    if (typeof title !== "string") {
        return { ok: false, error: "Некорректное название: должно быть строкой" };
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
        return { ok: false, error: "Некорректная длина названия: от 1 до 100 символов" };
    }

    // 3. Проверка Priority (строго одно из значений)
    const allowedPriorities = ["low", "medium", "high"];
    if (!allowedPriorities.includes(priority)) {
        return { ok: false, error: "Некорректный приоритет: допустимо 'low', 'medium' или 'high'" };
    }

    // 4. Если все проверки пройдены, создаем задачу
    const task = {
        id: id,
        title: trimmedTitle,
        completed: false, // Всегда false при создании
        priority: priority
    };

    // 5. Возвращаем успешный результат
    return { ok: true, task: task };
}
// --- Задание 4: Добавление, изменение и удаление ---

export function addTask(tasks, id, title, priority = "medium") {
    // 1. Проверяем, есть ли уже задача с таким id
    const exists = tasks.some(task => task.id === id);
    if (exists) {
        return { ok: false, error: "Задача с таким id уже существует" };
    }

    // 2. Используем createTask для валидации данных (она вернет {ok: true/false, ...})
    const creationResult = createTask(id, title, priority);
    if (!creationResult.ok) {
        return creationResult; // Возвращаем ошибку от createTask
    }

    // 3. Возвращаем НОВЫЙ массив (копируем старый через spread) + новую задачу в конец
    return { ok: true, tasks: [...tasks, creationResult.task] };
}

export function setTaskCompleted(tasks, id, completed) {
    // 1. Проверка id по правилам
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
        return { ok: false, error: "Некорректный id" };
    }
    
    // 2. Проверка completed (только boolean)
    if (typeof completed !== "boolean") {
        return { ok: false, error: "Статус completed должен быть true или false" };
    }

    // 3. Ищем задачу. Если не нашли — ошибка
    const taskExists = tasks.some(task => task.id === id);
    if (!taskExists) {
        return { ok: false, error: "Задача не найдена" };
    }

    // 4. Создаем НОВЫЙ массив. Используем map и spread для объектов
    const newTasks = tasks.map(task => {
        if (task.id === id) {
            // Если это нужная задача, создаем её копию и меняем completed
            return { ...task, completed: completed };
        }
        // Остальные задачи возвращаем как есть
        return task;
    });

    return { ok: true, tasks: newTasks };
}

export function renameTask(tasks, id, title) {
    // 1. Проверка id
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
        return { ok: false, error: "Некорректный id" };
    }

    // 2. Проверка title (по тем же правилам, что в createTask)
    if (typeof title !== "string") {
        return { ok: false, error: "Название должно быть строкой" };
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
        return { ok: false, error: "Некорректная длина названия" };
    }

    // 3. Ищем задачу
    const taskExists = tasks.some(task => task.id === id);
    if (!taskExists) {
        return { ok: false, error: "Задача не найдена" };
    }

    // 4. Возвращаем новый массив
    const newTasks = tasks.map(task => {
        if (task.id === id) {
            // Меняем только title, остальное копируем
            return { ...task, title: trimmedTitle };
        }
        return task;
    });

    return { ok: true, tasks: newTasks };
}

export function removeTask(tasks, id) {
    // 1. Проверка id
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
        return { ok: false, error: "Некорректный id" };
    }

    // 2. Ищем задачу
    const taskExists = tasks.some(task => task.id === id);
    if (!taskExists) {
        return { ok: false, error: "Задача не найдена" };
    }

    // 3. Фильтруем массив (убираем нужный id). filter сам создает новый массив.
    const newTasks = tasks.filter(task => task.id !== id);

    return { ok: true, tasks: newTasks };
}