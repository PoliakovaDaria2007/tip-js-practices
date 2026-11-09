"use strict";

import { createApiClient } from "./api-client.js";
import { createTaskApi } from "./task-api.js";
// Предполагается, что variant.js экспортирует объект с настройками (URL, фильтры)
import { variant } from "./variant.js"; 

async function main() {
    console.log("=== Запуск контрольного сценария ===");

    // 1. Инициализация клиента
    const baseUrl = process.env.API_URL || variant.baseUrl || "http://127.0.0.1:5505/api";
    const client = createApiClient(baseUrl);
    const api = createTaskApi(client);

    // 2. Загрузка начальных данных (параллельно)
    console.log("\nЗагрузка задач и категорий...");
    const filters = variant.filters || {}; // Например, { completed: false, priority: "high" }
    const initialData = await api.loadInitialData(filters);

    if (!initialData.ok) {
        console.error("Ошибка загрузки:", initialData.message);
        return;
    }

    const taskIds = initialData.tasks.map(t => t.id);
    console.log("Загруженные ID задач:", taskIds);
    console.log("Количество категорий:", initialData.categories.length);
    console.log("Метаданные:", initialData.meta);

    // 3. Обработка ошибки (задача с id=999)
    console.log("\nПроверка обработки ошибки (задача 999)...");
    const badTask = await api.getTaskById(999);
    if (!badTask.ok) {
        console.log(`Ожидаемая ошибка: kind="${badTask.kind}", status=${badTask.status}, message="${badTask.message}"`);
    } else {
        console.log("Ошибка: задача 999 неожиданно найдена!");
    }

    // 4. Проверка тайм-аута (Задание 8)
    console.log("\nПроверка тайм-аута...");
    const timeoutRes = await client.requestJson("/debug/delay", {
        query: { ms: 150 },
        timeoutMs: 20
    });
    console.log(`Результат тайм-аута: kind="${timeoutRes.kind}"`);

    // 5. Проверка внешней отмены (Задание 8)
    console.log("\nПроверка внешней отмены...");
    const controller = new AbortController();
    const pending = client.requestJson("/debug/delay", {
        query: { ms: 150 },
        signal: controller.signal,
        timeoutMs: 1000
    });
    controller.abort(); // Отменяем сразу
    const abortRes = await pending;
    console.log(`Результат отмены: kind="${abortRes.kind}"`);

    console.log("\n=== Сценарий завершен ===");
}

// Запуск
main().catch(err => {
    console.error("Критическая ошибка в сценарии:", err);
});