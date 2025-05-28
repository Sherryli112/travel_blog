//文章類別對應
export const categoryOptions = [
  { label: '全部', value: '' },
  { label: '美食', value: 'FOOD' },
  { label: '住宿', value: 'STAY' },
  { label: '景點', value: 'SPOT' },
  { label: '其他', value: 'OTHERS' },
] as const;

//參數 value 只能是 categoryOptions 裡面的每一個項目內的 value 值
export const getCategoryLabel = (value: (typeof categoryOptions)[number]['value']) => {
  const found = categoryOptions.find(option => option.value === value);
  return found ? found.label : value;
};

export type ArticleCategory = '美食' | '住宿' | '景點' | '其他';

//將中文標籤轉換為英文值
export const getCategoryValue = (label: ArticleCategory) => {
  const found = categoryOptions.find(option => option.label === label);
  return found ? found.value : null;
};

//獲取所有可用的中文標籤（排除全部選項）
export const getAvailableCategoryLabels = () => {
  return categoryOptions
    .filter(option => option.value !== '')
    .map(option => option.label);
};
