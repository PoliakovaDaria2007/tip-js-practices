"use strict";

// 1. Импортируем данные и функции
import { demoTasks } from "./data.js";
import { 
    addTask, 
    setTaskCompleted, 
    renameTask, 
    removeTask 
} from "./task-service.js";

// Вспомогательная функция для вывода статистики (если её нет в task-service)
function getTaskStats(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const progress = total === 0 ? 0 : (completed / total) * 100;
    return { total, completed, pending, progress };
}

// Функция для красивого вывода текущего состояния
function printStatus(label, tasks) {
    const { total, completed, pending, progress } = getTaskStats(tasks);
    console.log(`--- ${label} ---`);
    if (total === 0) {
        console.log("Задач пока нет");
    } else {
        console.log(`Всего: ${total}, Выполнено: ${completed}, Осталось: ${pending}, Прогресс: ${progress.toFixed(1)}%`);
    }
}

// --- НАЧАЛО СЦЕНАРИЯ ---

let currentTasks = demoTasks;

// 1. Вывод исходных данных
console.log("Исходный набор задач:");
console.log(currentTasks); // Выводим массив как есть
printStatus("Исходный набор", currentTasks);

// 2. Добавление задачи id = 20
console.log("\nДобавляем задачу id=20...");
let result = addTask(currentTasks, 20, "Добавить проверку", "high");
if (result.ok) {
    currentTasks = result.tasks;
} else {
    console.error("Ошибка:", result.error);
}
printStatus("После добавления", currentTasks);

// 3. Установка completed = true для id = 4
console.log("\nОтмечаем задачу id=4 как выполненную...");
result = setTaskCompleted(currentTasks, 4, true);
if (result.ok) {
    currentTasks = result.tasks;
} else {
    console.error("Ошибка:", result.error);
}
printStatus("После выполнения", currentTasks);

// 4. Переименование задачи id = 10
console.log("\nПереименовываем задачу id=10...");
result = renameTask(currentTasks, 10, "Подготовить инструкцию запуска");
if (result.ok) {
    currentTasks = result.tasks;
} else {
    console.error("Ошибка:", result.error);
}
printStatus("После переименования", currentTasks);

// 5. Удаление задачи id = 7
console.log("\nУдаляем задачу id=7...");
result = removeTask(currentTasks, 7);
if (result.ok) {
    currentTasks = result.tasks;
} else {
    console.error("Ошибка:", result.error);
}
printStatus("После удаления", currentTasks);

// 6. Демонстрация обработки отказа (например, добавление существующего id)
console.log("\nПроверка обработки ошибки (добавляем id=20 повторно):");
result = addTask(currentTasks, 20, "Дубликат");
if (!result.ok) {
    console.log("Успешно поймали ошибку:", result.error);
}

// 7. Доказательство, что исходный массив не изменился
console.log("\nПроверка исходного массива demoTasks (он должен остаться прежним):");
console.log(demoTasks);

// Вывод итоговых идентификаторов
const finalIds = currentTasks.map(t => t.id);
console.log("\nИтоговые идентификаторы:", finalIds);