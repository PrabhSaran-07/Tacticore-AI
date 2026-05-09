exports.getCurrentTime = () => {
  return new Date().toISOString();
};

exports.advanceTime = (minutes) => {
  return new Date(Date.now() + minutes * 60000).toISOString();
};
