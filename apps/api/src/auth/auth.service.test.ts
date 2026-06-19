import { describe, expect, it } from "vitest";
import { RegisterDto } from "./dto";

describe("RegisterDto contract", () => {
  it("documents required registration payload", () => {
    const dto: RegisterDto = {
      companyName: "Growth Demo",
      name: "Admin",
      email: "admin@growtherp.ao",
      password: "Password123!"
    };

    expect(dto.companyName).toBe("Growth Demo");
  });
});
