const DAYS = 6;
const LIMIT = 30;
let studentReport = [11, 42, 33, 64, 29, 37, 44];

console.log("Using for loop");
for (let i = 0; i < studentReport.length; i++) {
    if (studentReport[i] < LIMIT) {
        console.log(studentReport[i]);
    }
}

console.log("Using while loop");
let i = 0;
while (i < studentReport.length) {
    if (studentReport[i] < LIMIT) {
        console.log(studentReport[i]);
    }
    i++;
}

console.log("Using for in loop");
for (const i in studentReport) {
    if (studentReport[i] < LIMIT) {
        console.log(studentReport[i]);
    }
}

console.log("Using forEach loop");
studentReport.forEach((value) => {
    if (value < LIMIT) {
        console.log(value);
    }
});

console.log(`\nNext ${DAYS} days`);

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const today = new Date().getDay();

for (let i = 1; i <= DAYS; i++) {
    const nextDay = (today + i) % 7;
    
    if (i === DAYS) {
        console.log(`Next day is ${weekdays[nextDay]}`);
    }
}
