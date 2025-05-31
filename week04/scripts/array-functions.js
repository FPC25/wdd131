let names = ['Nancy','Blessing','Jorge','Svetlana','Bob'];

// Using the array.filter() method, create an array named namesB with only those names from the name array that start with the character 'B'.

let namesB = names.filter(name => name.startsWith('B'));
console.log(namesB);

// Using the array.map() method, create a new array named namesLength that contains the length of each name in the names array. Expected output is [5, 8, 5, 8, 3].

let namesLength = names.map(name => name.length);
console.log(namesLength);

// Using the names.reduce() method, create an expression that returns the average string length of the names in the names array. Expected output is 5.8.

let averageLength = namesLength.reduce((total, length) => total + length, 0) / namesLength.length;
console.log(averageLength);

