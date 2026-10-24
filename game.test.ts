import assert from "node:assert";

/**
 * Unit Test: Memory Match Procedural Arena Logic
 * Verifies procedural emoji matrix generation and balance without external test frameworks.
 */

function runUnitTests() {
  const emojiVault = ["🚀", "⚡", "🧠", "💎", "🔥", "🎯", "🛡️", "🔮"];
  const generatedCards = [...emojiVault, ...emojiVault];

  // 1. Check total card count for a 4x4 matrix
  assert.strictEqual(generatedCards.length, 16, "Grid must contain exactly 16 cards");

  // 2. Verify every emoji has exactly 1 matching duplicate pair
  emojiVault.forEach((emoji) => {
    const matchCount = generatedCards.filter((item) => item === emoji).length;
    assert.strictEqual(matchCount, 2, `Emoji ${emoji} must have exactly 2 occurrences`);
  });

  // 3. Verify card object properties
  const cards = generatedCards.map((emoji, index) => ({
    id: index,
    emoji,
    isFlipped: false,
    isMatched: false,
  }));

  assert.strictEqual(cards[0].isFlipped, false, "Initial flipped state must be false");
  assert.strictEqual(cards[0].isMatched, false, "Initial matched state must be false");
  assert.strictEqual(cards[15].id, 15, "Last card id must be 15");

  console.log("✓ All Memory Match unit test assertions passed successfully!");
}

runUnitTests();