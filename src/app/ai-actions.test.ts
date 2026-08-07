import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getTopicSuggestions } from "@/app/ai-actions";

describe("getTopicSuggestions", () => {
  const originalKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.ANTHROPIC_API_KEY;
    } else {
      process.env.ANTHROPIC_API_KEY = originalKey;
    }
  });

  it("fails with a clear, actionable message when no API key is configured", async () => {
    const result = await getTopicSuggestions("any-contact-id");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/ANTHROPIC_API_KEY/);
    }
  });
});
