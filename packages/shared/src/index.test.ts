import { describe, expect, it } from "vitest";
import { fiscalInvoiceNumber } from "./index";

describe("fiscalInvoiceNumber", () => {
  it("formats Angolan fiscal invoice numbering", () => {
    expect(fiscalInvoiceNumber(2026, 1)).toBe("A/2026/000001");
  });
});
