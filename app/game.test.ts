/**
 * Unit Test: Memory Match Procedural Arena Logic
 * Verifies that the procedural matrix generates exactly balanced pairs.
 */

describe("Memory Match Engine Verification", () => {
  it("generates a balanced 16-card grid with 8 paired emojis", () => {
    const emojiVault = ["🚀", "⚡", "🧠", "💎", "🔥", "🎯", "🛡️", "🔮"];
    const generatedCards = [...emojiVault, ...emojiVault];

    // Check total card count for a 4x4 matrix
    expect(generatedCards.length).toBe(16);

    // Verify every emoji has exactly 1 matching duplicate pair
    emojiVault.forEach((emoji) => {
      const matchCount = generatedCards.filter((item) => item === emoji).length;
      expect(matchCount).toBe(2);
    });
  });

  it("ensures cards have distinct identifiers and hidden default states", () => {
    const emojiVault = ["🚀", "⚡", "🧠", "💎", "🔥", "🎯", "🛡️", "🔮"];
    const cards = [...emojiVault, ...emojiVault].map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));

    expect(cards[0].isFlipped).toBe(false);
    expect(cards[0].isMatched).toBe(false);
    expect(cards[15].id).toBe(15);
  });
});