exports.allocateResources = (resources, assignments) => {
  return {
    allocated: assignments,
    remaining: resources
  };
};
