const PORTFOLIO_STORAGE_KEY = 'portfolio';

export const savePortfolio = (assets) => {
  localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(assets));
};

export const loadPortfolio = () => {
  const storedAssets = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
  if (storedAssets) {
    return JSON.parse(storedAssets);
  }

  // 기본값으로 빈 배열 또는 초기 데이터를 반환할 수 있습니다.
  return [];
};

// 자산 데이터 구조 예시
const exampleAsset = {
  id: '1',
  assetName: 'Bitcoin',
  amount: 1.5,
  buyPrice: 50000,
  category: 'Cryptocurrency',
  updatedAt: new Date().toISOString(),
};
