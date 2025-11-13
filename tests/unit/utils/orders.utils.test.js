const { calculateTotalAmount } = require("../../../src/utils/orders.utils");

describe("calculateTotalAmount", () => {
  it("retourne 0 pour un tableau vide", () => {
    const result = calculateTotalAmount([]);
    expect(result).toBe(0);
  });

  it("calcule le total pour une liste d’items", () => {
    const items = [
      { quantity: 2, unitPrice: 10 },
      { quantity: 1, unitPrice: 5 },
    ];
    const result = calculateTotalAmount(items);
    expect(result).toBe(25);
  });

  it("gère les valeurs manquantes", () => {
    const items = [
      { quantity: 2, unitPrice: 10 },
      { quantity: 1 }, // unitPrice manquant -> 0
    ];
    const result = calculateTotalAmount(items);
    expect(result).toBe(20);
  });

  it("lève une erreur si items n’est pas un tableau", () => {
    expect(() => calculateTotalAmount(null)).toThrow(
      "items doit être un tableau"
    );
  });
});
