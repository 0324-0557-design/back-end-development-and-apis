function isPrime(n) {
  if (typeof n !== 'number' || n <= 1 || !Number.isInteger(n)) {
    return false;
  }

  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      return false;
    }
  }

  return true;
}

module.exports = {
  isPrime
};