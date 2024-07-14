export default function isCnpj(cnpj: string) {
  if (!cnpj) {
    return false;
  }

  if (cnpj.length !== 14) {
    return false;
  }

  const cnpjSamesNumbers = checkCnpjSameNumbers(cnpj);
  if (cnpjSamesNumbers) {
    return false;
  }

  const firstIdNumberTest = cnpj.substring(0, 12);
  const secondIdNumberTest = cnpj.substring(0, 13);

  const firstVerifyingDigit = calculateCnpj(firstIdNumberTest, 'first');
  const secondVerifyingDigit = calculateCnpj(secondIdNumberTest, 'second');

  const firstDigitValid = String(firstVerifyingDigit) === cnpj.charAt(12);
  const secondDigitValid = String(secondVerifyingDigit) === cnpj.charAt(13);

  return firstDigitValid && secondDigitValid;
}

function calculateCnpj(cnpj: string, order: 'first' | 'second') {
  const multiplyingNumbers = {
    first: [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
    second: [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  };

  const multiplyingSequence = multiplyingNumbers[order];

  const { length } = cnpj;
  let i = 0;
  const results = [];
  for (; i < length; i++) {
    const result = Number(cnpj.charAt(i)) * multiplyingSequence[i];
    results.push(result);
  }

  const resultsSum = results.reduce((prev, current) => prev + current);
  const rest = resultsSum % 11;

  if (rest < 2) {
    return 0;
  }
  return 11 - rest;
}

function checkCnpjSameNumbers(Cnpj: string) {
  let equalNumbersCount = 0;
  const singleNumbers = [];

  let i = 0;
  for (; i < 11; i++) {
    const char = Cnpj.charAt(i);
    if (singleNumbers.indexOf(char) > -1) {
      equalNumbersCount++;
    } else {
      singleNumbers.push(char);
    }
  }
  if (equalNumbersCount === 11) {
    return true;
  }
  return false;
}
