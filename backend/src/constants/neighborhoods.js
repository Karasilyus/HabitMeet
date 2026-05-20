const NEIGHBORHOODS = [
  'Kadıköy',
  'Beşiktaş',
  'Üsküdar',
  'Şişli',
  'Bakırköy',
  'Maltepe',
  'Ataşehir',
  'Kartal',
  'Pendik',
  'Sarıyer',
  'Beyoğlu',
  'Fatih',
  'Ümraniye',
  'Bağcılar',
  'Esenyurt',
  'Beylikdüzü',
  'Tuzla',
  'Sultanbeyli',
  'Çekmeköy',
  'Sancaktepe',
  'Eyüpsultan'
];

const NEARBY_OPTION = 'Yakın semt';

function isValidNeighborhood(value) {
  if (!value || value.trim().length < 2) return false;
  if (NEIGHBORHOODS.includes(value)) return true;
  if (value.startsWith(`${NEARBY_OPTION}:`) || value.startsWith(`${NEARBY_OPTION} -`)) {
    return value.length >= NEARBY_OPTION.length + 3;
  }
  return false;
}

function normalizeNeighborhood(selected, nearbyText = '') {
  if (selected === NEARBY_OPTION) {
    const detail = nearbyText.trim();
    if (!detail) return null;
    return `${NEARBY_OPTION}: ${detail}`;
  }
  return selected;
}

module.exports = { NEIGHBORHOODS, NEARBY_OPTION, isValidNeighborhood, normalizeNeighborhood };
