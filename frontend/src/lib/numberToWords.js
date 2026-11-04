// Converts a number to Bangladeshi Taka in words (English format)
const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const convertBelowThousand = (num) => {
  let str = '';
  if (num >= 100) {
    str += `${ones[Math.floor(num / 100)]} Hundred `;
    num %= 100;
  }
  if (num >= 20) {
    str += `${tens[Math.floor(num / 10)]} `;
    num %= 10;
  }
  if (num > 0) {
    str += `${ones[num]} `;
  }
  return str.trim();
};

export const numberToWordsBDT = (amount) => {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return 'Zero Taka Only';
  if (num < 0) return `Minus ${numberToWordsBDT(Math.abs(num))}`;

  let remainder = num;
  const crore = Math.floor(remainder / 10000000);
  remainder %= 10000000;
  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;
  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;

  const parts = [];
  if (crore > 0) parts.push(`${convertBelowThousand(crore)} Crore`);
  if (lakh > 0) parts.push(`${convertBelowThousand(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${convertBelowThousand(thousand)} Thousand`);
  if (remainder > 0) parts.push(convertBelowThousand(remainder));

  return `${parts.join(' ')} Taka Only`;
};
