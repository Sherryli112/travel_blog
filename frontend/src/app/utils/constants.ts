//文章類別對應
export const categoryOptions = [
    { label: '全部', value: '' },
    { label: '美食', value: 'FOOD' },
    { label: '住宿', value: 'STAY' },
    { label: '景點', value: 'SPOT' },
    { label: '其他', value: 'OTHERS' },
] as const;

export const getCategoryLabel = (value: (typeof categoryOptions)[number]['value']) => {
    const found = categoryOptions.find(option => option.value === value);
    return found ? found.label : value;
};
