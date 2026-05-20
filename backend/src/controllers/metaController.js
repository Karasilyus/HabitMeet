const { NEIGHBORHOODS, NEARBY_OPTION } = require('../constants/neighborhoods');

function neighborhoods(req, res) {
  res.status(200).json({
    neighborhoods: NEIGHBORHOODS,
    nearbyOption: NEARBY_OPTION,
  });
}

module.exports = { neighborhoods };
