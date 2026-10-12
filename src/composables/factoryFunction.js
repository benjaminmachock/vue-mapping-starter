//closure example

// function createCounter() {
//   let count = 0;

//   return {
//     increment: function () {
//       return (count = count + 1);
//     },
//   };
// }

// let num2 = createCounter();
// let num = createCounter();

// console.log(num2.increment());
// console.log(num.increment());

console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
