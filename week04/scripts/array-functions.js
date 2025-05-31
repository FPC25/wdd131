let names = ['Nancy','Blessing','Jorge','Svetlana','Bob'];

// Using the array.filter() method, create an array named namesB with only those names from the name array that start with the character 'B'.

let namesB = names.filter(name => name.startsWith('B'));
console.log(namesB);

let namesLength = names.map(name => name.length);
console.log(namesLength);

let averageLength = namesLength.reduce((total, length) => total + length, 0) / namesLength.length;
console.log(averageLength);

