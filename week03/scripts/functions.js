let firstName = "Antonia";
let lastName = "Francesca";

function fullName(first, last) {
  return `${first} ${last}`;
}

console.log(fullName(firstName, lastName));

fullName2 = function (first, last) {
  return `${first} ${last}`;
}
console.log(fullName2(firstName, lastName));

fullName3 = (first, last) => {
  return `${first} ${last}`;
}
console.log(fullName3(firstName, lastName));