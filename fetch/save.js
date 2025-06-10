async function runWithTimeout(func, timeout) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timeout of ${timeout}ms reached`)), timeout);
  });

  try {
    return await Promise.race([
      func(),
      timeoutPromise
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function saveExec(func, ...args) {
  try {
    return await runWithTimeout(() => func(...args), 30000);
  } catch (err) {
    console.error(err);
    return null;
  }
}
