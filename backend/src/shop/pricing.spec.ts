import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCartTotal,
  calculateLineTotal,
  moneyToNumber,
} from "./pricing";

test("moneyToNumber strips formatted price separators", () => {
  assert.equal(moneyToNumber("1,250,000"), 1250000);
});

test("calculateLineTotal multiplies unit price by quantity", () => {
  assert.equal(calculateLineTotal("300,000", 3), "900,000");
});

test("calculateCartTotal sums formatted line totals", () => {
  assert.equal(
    calculateCartTotal([{ lineTotal: "900,000" }, { lineTotal: "1,100,000" }]),
    "2,000,000",
  );
});
