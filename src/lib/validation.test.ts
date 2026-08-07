import { describe, expect, it } from "vitest";
import {
  contactInputSchema,
  contactUpdateSchema,
  interactionInputSchema,
} from "@/lib/validation";

describe("contactInputSchema", () => {
  it("requires a non-empty name", () => {
    const result = contactInputSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("defaults favorite to false and tags to an empty array", () => {
    const result = contactInputSchema.parse({ name: "Ada Lovelace" });
    expect(result.favorite).toBe(false);
    expect(result.tags).toEqual([]);
  });

  it("rejects an invalid email", () => {
    const result = contactInputSchema.safeParse({
      name: "Ada",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid email and trims whitespace", () => {
    const result = contactInputSchema.parse({
      name: "  Ada Lovelace  ",
      email: "  ada@example.com  ",
    });
    expect(result.name).toBe("Ada Lovelace");
    expect(result.email).toBe("ada@example.com");
  });

  it("treats an empty-string email as absent, not invalid", () => {
    const result = contactInputSchema.safeParse({
      name: "Ada",
      email: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeUndefined();
    }
  });
});

describe("contactUpdateSchema", () => {
  it("omits favorite and tags entirely when not provided, instead of defaulting them", () => {
    const result = contactUpdateSchema.parse({ company: "US Navy" });
    expect(result).not.toHaveProperty("favorite");
    expect(result).not.toHaveProperty("tags");
    expect(result.company).toBe("US Navy");
  });

  it("still validates provided fields", () => {
    const result = contactUpdateSchema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });

  it("allows an empty object (no-op update)", () => {
    const result = contactUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("omits cadenceDays entirely when not provided, instead of clearing it", () => {
    const result = contactUpdateSchema.parse({ company: "US Navy" });
    expect(result).not.toHaveProperty("cadenceDays");
  });

  it("treats an explicit null cadenceDays as clearing the reminder", () => {
    const result = contactUpdateSchema.safeParse({ cadenceDays: null });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cadenceDays).toBeNull();
    }
  });

  it("rejects a non-positive cadenceDays", () => {
    const result = contactUpdateSchema.safeParse({ cadenceDays: 0 });
    expect(result.success).toBe(false);
  });
});

describe("interactionInputSchema", () => {
  it("allows an empty note", () => {
    const result = interactionInputSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("trims and keeps a provided note", () => {
    const result = interactionInputSchema.parse({
      note: "  Caught up over coffee  ",
    });
    expect(result.note).toBe("Caught up over coffee");
  });
});
