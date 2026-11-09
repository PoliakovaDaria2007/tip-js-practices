"use strict";

export function buildUrl(baseUrl, path, query) {
    if (typeof baseUrl !== "string" || !/^https?:\/\//.test(baseUrl)) {
        throw new Error("baseUrl должен быть абсолютным URL");
    }
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(cleanBase + cleanPath);

    if (query && typeof query === "object") {
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined || value === null || value === "") continue;
            url.searchParams.append(key, String(value));
        }
    }
    return url.toString();
}

export function createApiClient(baseUrl, fetchFn = fetch) {
    if (!baseUrl || typeof fetchFn !== "function") {
        throw new Error("Некорректная конфигурация клиента");
    }

    async function requestJson(path, options = {}) {
        const { method = "GET", body, query, timeoutMs, signal, ...rest } = options;
        const httpMethod = method.toUpperCase();

        if (!["GET", "POST", "PATCH", "DELETE"].includes(httpMethod)) {
            return { ok: false, kind: "invalid-method", message: "Неподдерживаемый метод" };
        }
        if (httpMethod === "GET" && body) {
            return { ok: false, kind: "invalid-body", message: "GET не может содержать body" };
        }

        let url;
        try {
            url = buildUrl(baseUrl, path, query);
        } catch (err) {
            return { ok: false, kind: "invalid-url", message: err.message };
        }

        // Подготовка заголовков
        const headers = { Accept: "application/json", ...(rest.headers || {}) };
        let finalBody = body;
        if (body !== undefined && body !== null) {
            headers["Content-Type"] = "application/json";
            finalBody = JSON.stringify(body);
        }

        // Тайм-аут и отмена
        let timeoutId;
        let finalSignal = signal;
        if (timeoutMs) {
            const controller = new AbortController();
            timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            if (signal) {
                if (signal.aborted) controller.abort();
                else signal.addEventListener("abort", () => controller.abort());
            }
            finalSignal = controller.signal;
        }

        try {
            const response = await fetchFn(url, {
                method: httpMethod,
                headers,
                body: finalBody,
                signal: finalSignal,
                ...rest
            });

            // 204 No Content
            if (response.status === 204) {
                return { ok: true, data: null };
            }

            const contentType = response.headers.get("content-type") || "";
            
            // HTTP-ошибка
            if (!response.ok) {
                let code = "HTTP_ERROR";
                let message = `HTTP ошибка: ${response.status}`;
                let details = null;
                try {
                    const payload = await response.json();
                    if (payload && payload.error) {
                        code = payload.error.code || code;
                        message = payload.error.message || message;
                        details = payload.error.details || null;
                    }
                } catch (e) { /* ignore */ }
                return { ok: false, kind: "http", status: response.status, code, message, details, url };
            }

            // Проверка Content-Type
            if (!contentType.includes("application/json")) {
                return { ok: false, kind: "invalid-response", message: "Ответ не JSON" };
            }

            const data = await response.json();
            return { ok: true, data };

        } catch (err) {
            if (err.name === "AbortError") {
                if (timeoutMs && !signal?.aborted) return { ok: false, kind: "timeout", message: "Тайм-аут" };
                return { ok: false, kind: "aborted", message: "Отменено" };
            }
            return { ok: false, kind: "network", message: "Сетевая ошибка" };
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
        }
    }

    return { requestJson };
}