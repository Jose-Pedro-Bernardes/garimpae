function soma(a: number, b: number) {
  return a + b;
}

test("deve somar dois números", () => {
  expect(soma(2, 3)).toBe(5);
});
