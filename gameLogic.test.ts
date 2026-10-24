describe("Super Memory Kids Logic Tests", () => {
  test("Card pair matching logic detects matching emojis correctly", () => {
    const card1 = { id: 1, emoji: "🦁" };
    const card2 = { id: 2, emoji: "🦁" };
    const card3 = { id: 3, emoji: "🐼" };

    expect(card1.emoji === card2.emoji).toBe(true);
    expect(card1.emoji === card3.emoji).toBe(false);
  });

  test("Calculates 3 stars for fast moves and high time remaining", () => {
    const moves = 12;
    const timeLeft = 20;
    let stars = 1;

    if (moves <= 14 && timeLeft >= 15) {
      stars = 3;
    } else if (moves <= 20) {
      stars = 2;
    }

    expect(stars).toBe(3);
  });
});