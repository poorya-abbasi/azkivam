const getTimestamp = () => {
  return (Date.now() / 1000) | 0;
};

const generateProviderId = () =>
  Math.floor(Math.floor(100000 + Math.random() * 900000));

export { getTimestamp, generateProviderId };
