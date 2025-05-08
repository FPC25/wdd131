// Declare and Instantiate Variables of different types and then add them together using the + operator.
const one = 1;
let two = '2';
console.log(one + two); // ❔1️⃣: What is the output of this statement?


// Using built-in JS functions, change variable data types
let result;
result = one + parseInt(two); 
console.log(result); // ❔2️⃣: What is the output of this statement?

// What about multiplication?
result = one * two;
console.log(result);

// A new variable is declared and assigned an alpha character and added to the varaible identified as one.
const three = "e";
result = one * three;
console.log(result);

// Let's try changing the value of the variable two.
two = 4;
result = one + two;
console.log(result);

// Let's declare an array and initialize it with 4 values
const myArray = [1,2,3,5];
result = myArray;
result.splice(3, 0, 4);
console.log(result);
