"use strict";

const totalTasks = 12;
const completedTasks = 5;
const dailyLimit = 3;

// --- БЛОК ПРОВЕРОК ---

// 1. Проверка totalTasks и completedTasks по правилам задания 3
if (typeof totalTasks !== "number" || typeof completedTasks !== "number" || Number.isNaN(totalTasks) || Number.isNaN(completedTasks)) {
    console.log("Ошибка: вместо числа передана строка или недопустимое значение.");
} 
else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
    console.log("Ошибка: дробное количество задач.");
} 
else if (totalTasks < 0 || completedTasks < 0) {
    console.log("Ошибка: отрицательное количество задач.");
} 
else if (totalTasks > 1000) {
    console.log("Ошибка: превышена верхняя граница задач.");
} 
else if (completedTasks > totalTasks) {
    console.log("Ошибка: некорректное число выполненных задач.");
} 
// 2. Проверка dailyLimit
else if (typeof dailyLimit !== "number" || Number.isNaN(dailyLimit)) {
    console.log("Ошибка: дневная норма задана строкой или недопустимым значением.");
} 
else if (!Number.isInteger(dailyLimit)) {
    console.log("Ошибка: дробной дневной нормы быть не должно.");
} 
else if (dailyLimit < 1 || dailyLimit > 1000) {
    console.log("Ошибка: дневная норма вне допустимого диапазона (1-1000).");
} 
// --- БЛОК РАСЧЕТА ---
else {
    let remainingTasks = totalTasks - completedTasks;
    
    // Выводим начальное состояние
    console.log(`Осталось задач: ${remainingTasks}`);

    // Если задачи уже все выполнены
    if (remainingTasks === 0) {
        console.log("Потребуется дней: 0");
    } else {
        let days = 0;

        // Цикл работает, пока есть невыполненные задачи
        while (remainingTasks > 0) {
            days++; // Увеличиваем номер дня
            
            // Определяем, сколько задач выполним в этот день.
            // Math.min выбирает меньшее: либо дневную норму, либо остаток.
            let tasksToday = Math.min(dailyLimit, remainingTasks);
            
            remainingTasks -= tasksToday; // Уменьшаем остаток
            
            console.log(`День ${days}: выполнено ${tasksToday}, осталось ${remainingTasks}`);
        }

        console.log(`Потребуется дней: ${days}`);
    }
}