export const createId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

export const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const rollSecureDie = () => {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return (values[0] % 6) + 1;
};
