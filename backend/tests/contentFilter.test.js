const { containsForbiddenWords } = require('../src/services/contentFilter');

describe('contentFilter', () => {
  test('returns false for empty or clean text', () => {
    expect(containsForbiddenWords('')).toBe(false);
    expect(containsForbiddenWords(null)).toBe(false);
    expect(containsForbiddenWords('Sabah koşusu')).toBe(false);
  });

  test('detects forbidden words as whole words', () => {
    expect(containsForbiddenWords('bu siktir kelimesi')).toBe(true);
    expect(containsForbiddenWords('CLASSIC')).toBe(false);
  });

  test('is case insensitive', () => {
    expect(containsForbiddenWords('FUCK this')).toBe(true);
  });
});
