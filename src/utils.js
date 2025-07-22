function handleError(err, context, id) {
  console.error(`${context}: Error for ${id}:`, err);
}

module.exports = { handleError };