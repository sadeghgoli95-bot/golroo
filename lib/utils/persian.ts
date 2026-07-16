const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => persianDigits[Number(digit)]);
}

export function formatArticleCount(count: number): string {
  return `${toPersianDigits(count)} مقاله`;
}
