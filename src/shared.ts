const getTimestamp = () => {
  return (Date.now() / 1000) | 0;
};

export { getTimestamp };
