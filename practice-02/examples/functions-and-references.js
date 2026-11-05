// Эксперимент 1: Функция sum
function sum(a, b) {
  return a + b;
}
console.log("1:", sum(2, 3));       // Сложение двух чисел
console.log("1:", sum("2", 3));     // Сложение строки и числа

// Эксперимент 2: Стрелочная функция с фигурными скобками (ОШИБКА ЗДЕСЬ)
const square = (x) => { x * x; }; 
// ВАМ НУЖНО ИСПРАВИТЬ ЭТУ СТРОКУ НА: const square = (x) => { return x * x; };
console.log("2:", square(4));       // Сейчас выведет undefined

// Эксперимент 3: Присваивание объекта
const user1 = { name: "Ivan", age: 20 };
const user2 = user1;                // Копирование по ссылке
user2.age = 21;                     // Изменяем свойство
console.log("3:", user1.age, user2.age); // Оба будут 21

// Эксперимент 4: Копирование массива объектов (shallow copy)
const arr1 = [{ id: 1 }, { id: 2 }];
const arr2 = [...arr1];             // Поверхностное копирование
arr2[0].id = 99;                    // Изменяем вложенный объект
console.log("4:", arr1[0].id, arr2[0].id); // Оба будут 99

// Эксперимент 5: Spread объекта
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, b: 3 };     // b перезаписывается
console.log("5:", obj2);            // { a: 1, b: 3 }

// Эксперимент 6: Параметры по умолчанию
function greet(name = "Гость") {
  return "Привет, " + name;
}
console.log("6:", greet());         // "Привет, Гость" (сработало умолчание)
console.log("6:", greet(undefined));// "Привет, Гость"
console.log("6:", greet(null));     // "Привет, null" (null не заменяется)