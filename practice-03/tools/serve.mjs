import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Получаем путь к папке practice-03 (на уровень выше папки tools)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = 5503; // Порт, на котором будет работать сервер

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Если запрос идет на корень, отдаем index.html
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Убираем параметры из URL (например, ?v=1)
    const urlParts = filePath.split('?');
    filePath = urlParts[0];

    // Формируем полный путь к файлу
    const fullPath = path.join(rootDir, filePath);

    // Проверяем, существует ли файл
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        // Определяем тип контента по расширению
        const ext = path.extname(fullPath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Читаем и отдаем файл
        fs.readFile(fullPath, (error, content) => {
            if (error) {
                res.writeHead(500);
                res.end('500 Internal Server Error');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Сервер запущен: http://127.0.0.1:${PORT}/`);
    console.log(`Для остановки нажмите Ctrl+C`);
});