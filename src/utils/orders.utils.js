function calculateTotalAmount(items) {
  // items: [{ quantity, unitPrice }]
  // ON VERIFIE SI C'EST UN TABLEAU
  if (!Array.isArray(items)) {
    throw new Error("items doit être un tableau");
  }
  // CALCUL DU TOTAL
  return items.reduce((sum, item) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    return sum + quantity * unitPrice;
  }, 0);
}

module.exports = { calculateTotalAmount };
