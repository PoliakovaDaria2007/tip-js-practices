"use strict";

const totalTasks = 12;
const completedTasks = 5;

// 1. Проверка на то, что это числа (и не NaN)
if (typeof totalTasks !== "number" || typeof completedTasks !== "number" || Number.isNaN(totalTasks) || Number.isNaN(completedTasks)) {
    console.log("Ошибка: вместо числа передана строка или недопустимое числовое значение.");
} 
// 2. Проверка на целые числа (дробные запрещены)
else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
    console.log("Ошибка: дробное количество.");
} 
// 3. Проверка на отрицательные числа
else if (totalTasks < 0 || completedTasks < 0) {
    console.log("Ошибка: отрицательное количество.");
} 
// 4. Проверка на верхнюю границу
else if (totalTasks > 1000) {
    console.log("Ошибка: превышена верхняя граница.");
} 
// 5. Проверка, что выполненных не больше, чем всего
else if (completedTasks > totalTasks) {
    console.log("Ошибка: выполнено больше, чем существует.");
} 
// 6. Если оба нуля
else if (totalTasks === 0 && completedTasks === 0) {
    console.log("Задач пока нет");
} 
// 7. Основной расчет (если данные корректны)
else {
    const remainingTasks = totalTasks - completedTasks;
    const percent = (completedTasks / totalTasks) * 100;
    
    // Определяем статус
    let status = "";
    if (completedTasks === 0) {
        status = "Не начато";
    } else if (completedTasks === totalTasks) {
        status = "Завершено";
    } else {
        status = "В работе";
    }

    // Выводим результат
    console.log(`Всего задач: ${totalTasks}`);
    console.log(`Выполнено: ${completedTasks}`);
    console.log(`Осталось: ${remainingTasks}`);
    // toFixed(1) оставляет ровно один знак после запятой
    console.log(`Прогресс: ${percent.toFixed(1)}%`); 
    console.log(`Статус: ${status}`);
}