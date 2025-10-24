export const formatCurrency = (amount, currencyCode = 'EUR', includeSymbol = true, includeDecimals = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? `${getCurrencySymbol(currencyCode)}0` : '0';
  }

  const options = {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
    useGrouping: true // This ensures comma separators
  };

  if (includeSymbol) {
    options.style = 'currency';
    options.currency = currencyCode;
  }

  // Always use en-US locale for consistent comma separators
  return new Intl.NumberFormat('en-US', options).format(amount);
};

export const formatNumber = (amount, includeDecimals = false) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
    useGrouping: true
  }).format(amount);
};

const getCurrencySymbol = (currencyCode) => {
  const symbols = {
    EUR: '€',
    USD: '$',
    BDT: '৳'
  };
  return symbols[currencyCode] || currencyCode;
};
