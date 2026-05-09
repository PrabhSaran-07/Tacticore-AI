exports.triggerEvent = (eventName, context) => {
  return {
    event: eventName,
    context,
    triggeredAt: new Date().toISOString()
  };
};
