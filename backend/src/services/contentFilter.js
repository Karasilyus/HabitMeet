const forbiddenWords = [
  'sex',
  'porn',
  'fuck',
  'shit',
  'bitch',
  'ass',
  'damn',
  'orospu',
  'siktir',
  'sik',
  'pezevenk',
  'anan',
  'kahpe',
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsForbiddenWords(value) {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return forbiddenWords.some((word) => {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
    return regex.test(normalized);
  });
}

module.exports = { containsForbiddenWords };