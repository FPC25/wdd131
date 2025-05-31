let person = {
  name: "Antonia Francesca",
  age: 30,
  profession: "Software Engineer",
  hobbies: ["reading", "playing guitar", "hiking"],
  address: {
    street: "123 Camino Real",
    city: "Santa Rosa",
    country: "Honduras"
  },
  isEmployed: true,
  greet: function() {
    console.log(`Hello, my name is ${this.name}.`);
  }
};

/* What are the output of the following expressions? */

console.log(person['isEmployed']);
console.log(person.hobbies[0]);
console.log(person.age);
console.log(person['address'].city);

/* Can we change the value of a property? */

person.age = 31;
console.log(`Updated age: ${person.age}`);