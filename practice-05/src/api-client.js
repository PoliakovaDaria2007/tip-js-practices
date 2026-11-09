"use strict";

// Задание 4: Формирование URL
export function buildUrl(baseUrl, path, query) {
    // 1. Проверка baseUrl
    if (typeof baseUrl !== "string" || baseUrl === "") {
        throw new Error("baseUrl должен быть непустой строкой");
    }
    // Проверка, что baseUrl абсолютный (начинается с http:// или https://)
    if (!/^https?:\/\//.test(baseUrl)) {
        throw new Error("baseUrl должен быть абсолютным URL (http или https)");
    }
    // Проверка, что в baseUrl нет query-параметров
    if (baseUrl.includes("?")) {
        throw new Error("baseUrl не должен содержать query-параметры");
    }
    
    // Убираем завершающий слэш у baseUrl и начальный у path для склейки
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    const url = new URL(cleanBase + cleanPath);

    // Обработка query-параметров
    if (query && typeof query === "object") {
        for (const [key, value] of Object.entries(query)) {
            // Исключаем undefined, null и пустые строки
            if (value === undefined || value === null || value === "") {
                continue;
            }
            // Сохраняем false как строку "false"
            url.searchParams.append(key, String(value));
        }
    }

    return url.toString();
}

// Задание 5: Общий JSON-клиент
export function createApiClient(baseUrl, fetchFn = fetch) {
    if (typeof baseUrl !== "string" || baseUrl === "") {
        throw new Error("Некорректный baseUrl");
    }
    if (typeof fetchFn !== "function") {
        throw new Error("fetchFn должен быть функцией");
    }

    async function requestJson(path, options = {}) {
        const { query, timeoutMs, signal, ...fetchOptions } = options;
        
        let url;
        try {
            url = buildUrl(baseUrl, path, query);
        } catch (err) {
            return { ok: false, kind: "invalid-url", message: err.message };
        }

        // Настройка тайм-аута и внешней отмены
        let timeoutId;
        let finalSignal = signal;

        if (timeoutMs) {
            const controller = new AbortController();
            timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            
            // Если есть внешний сигнал, нужно объединить его с тайм-аутом
            if (signal) {
                // Если внешний сигнал уже отменен, сразу отменяем
                if (signal.aborted) controller.abort();
                else signal.addEventListener("abort", () => controller.abort());
            }
            finalSignal = controller.signal;
        }

        try {
            const response = await fetchFn(url, { ...fetchOptions, signal: finalSignal });
            
            // Проверка типа результата (на случай, если fetchFn вернул не Response)
            if (!(response instanceof Response)) {
                return { ok: false, kind: "invalid-fetch", message: "fetchFn вернул не Response" };
            }

            // 1. Сначала HTTP-ошибка (response.ok === false)
            if (!response.ok) {
                let errorMessage = `HTTP ошибка: ${response.status}`;
                let errorData = null;
                try {
                    const payload = await response.json();
                    if (payload && payload.error) {
                        errorMessage = payload.error;
                        errorData = payload;
                    }
                } catch (e) {
                    // Если тело не JSON, просто игнорируем
                }
                return { 
                    ok: false, 
                    kind: "http", 
                    status: response.status, 
                    message: errorMessage,
                    data: errorData
                };
            }

            // 2. Проверка на 204 No Content
            if (response.status === 204) {
                return { ok: true, data: null };
            }

            // 3. Проверка Content-Type
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                return { ok: false, kind: "invalid-content-type", message: "Ответ не является JSON" };
            }

            // 4. Разбор JSON
            const data = await response.json();
            return { ok: true, data };

        } catch (err) {
            if (err.name === "AbortError") {
                // Различаем тайм-аут и ручную отмену
                if (timeoutMs && !signal?.aborted) {
                    return { ok: false, kind: "timeout", message: "Время ожидания истекло" };
                }
                return { ok: false, kind: "aborted", message: "Запрос отменен" };
            }
            // Сетевая ошибка (например, сервер недоступен)
            return { ok: false, kind: "network", message: "Сетевая ошибка" };
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
        }
    }

    return { requestJson };
}