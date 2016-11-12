function* bar() {
  yield 'x';
  yield* foo();
  yield 'y';
}

const b = bar();

console.log(b.next())
console.log(b.next())
console.log(b.return())