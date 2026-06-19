import { describe, expect, it } from "vitest";
import { fiscalInvoiceNumber } from "@growth/shared";

describe("invoice fiscal numbering", () => {
  it("uses A/ANO/000001 pattern", () => {
    expect(fiscalInvoiceNumber(2026, 42)).toBe("A/2026/000042");
  });
});
