
import { useState, useEffect, useMemo } from 'react';
import { supabase } from './services/supabaseClient';
import Auth from './components/Auth';
import { savePortfolio, loadPortfolio } from './services/AssetManager';
import { GoogleGenerativeAI } from "@google/generative-ai";

// New Component for password reset
function PasswordReset() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setMessage('비밀번호가 성공적으로 변경되었습니다. 잠시 후 자동으로 로그인됩니다.');
            setTimeout(() => window.location.assign(import.meta.env.VITE_HOME_URL), 3000);
        } catch (error) {
            setMessage(`오류: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 pt-20">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
                <h1 className="text-3xl font-bold text-center text-white mb-6">새 비밀번호 설정</h1>
                <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">새 비밀번호</label>
                        <input
                            id="password"
                            className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-indigo-500 focus:border-indigo-500"
                            type="password"
                            placeholder="새 비밀번호 (6자 이상)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="6"
                        />
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 disabled:bg-gray-500" disabled={loading}>
                            {loading ? '변경 중...' : '비밀번호 변경 및 로그인'}
                        </button>
                    </div>
                </form>
                {message && <p className="mt-4 text-center text-sm text-gray-400">{message}</p>}
            </div>
        </div>
    );
}

// 아이콘 컴포넌트...
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
  </svg>
);


const currencyFormatter = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' });

function App() {
  const [session, setSession] = useState(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetName, setAssetName] = useState('');
  const [amount, setAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [category, setCategory] = useState('stock');
  const [aiDiagnosis, setAiDiagnosis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordReset(true);
      } else {
        setSession(session);
        setIsPasswordReset(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if(session) {
        setAssets(loadPortfolio());
    }
  }, [session]);

  const totalAssets = useMemo(() => {
    return assets.reduce((total, asset) => total + asset.amount * asset.buyPrice, 0);
  }, [assets]);

  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!assetName || !amount || !buyPrice) return alert('모든 필드를 입력해주세요.');
    
    const newAsset = {
      user_id: session.user.id,
      assetName,
      amount: parseFloat(amount),
      buyPrice: parseFloat(buyPrice),
      category,
    };

    const updatedAssets = [...assets, { ...newAsset, id: `local_${Date.now()}` }];
    setAssets(updatedAssets);
    savePortfolio(updatedAssets);

    setAssetName('');
    setAmount('');
    setBuyPrice('');
  };

  const handleDeleteAsset = (id) => {
    if (window.confirm('정말로 이 자산을 삭제하시겠습니까?')) {
      const updatedAssets = assets.filter(asset => asset.id !== id);
      setAssets(updatedAssets);
      savePortfolio(updatedAssets);
    }
  };
  
  const handleEditAsset = (id) => {
    const assetToEdit = assets.find(asset => asset.id === id);
    if (assetToEdit) {
      setEditingAsset(assetToEdit);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateAsset = (e) => {
    e.preventDefault();
    if (!editingAsset) return;

    const updatedAssets = assets.map(asset =>
      asset.id === editingAsset.id ? editingAsset : asset
    );
    setAssets(updatedAssets);
    savePortfolio(updatedAssets);
    setIsEditModalOpen(false);
    setEditingAsset(null);
  };

  const handleAiDiagnosis = async () => {
     if (assets.length === 0) return alert('진단할 자산이 없습니다.');
    setIsLoading(true);
    setAiDiagnosis('');
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
      const assetList = assets.map(a => `- ${a.category} | ${a.assetName}: ${a.amount}개, 평단가 ${currencyFormatter.format(a.buyPrice)}`).join('\n');
      const prompt = `당신은 전문 자산관리사입니다. 다음 자산 목록을 보고 현재 투자 비중의 문제점과 개선 방향을 가독성 좋은 '3줄 요약'으로 한국어로 진단해주세요.\n\n[현재 자산 목록]\n${assetList}`;
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      setAiDiagnosis(text);
    } catch (error) {
      console.error("AI 진단 중 오류 발생:", error);
      alert("AI 진단에 실패했습니다. API 키 설정 또는 네트워크 연결을 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isPasswordReset) {
    return <PasswordReset />;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-md mx-auto p-4">
        <header className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-400">{session.user.email}</p>
                <button onClick={() => supabase.auth.signOut()} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-lg transition duration-300">로그아웃</button>
            </div>
            <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-400">총 보유자산</h2>
                <p className="text-4xl font-bold text-indigo-400 mt-2">
                    {currencyFormatter.format(totalAssets)}
                </p>
            </div>
        </header>
        
        <section className="mb-6">
          <button 
            onClick={handleAiDiagnosis} 
            disabled={isLoading}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 flex items-center justify-center disabled:bg-gray-500"
          >
             {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                AI 분석 중...
              </>
            ) : 'AI 포트폴리오 진단하기'}
          </button>
        </section>

        <section className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">자산 추가</h3>
            <form onSubmit={handleAddAsset} className="space-y-4">
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="stock">주식</option><option value="crypto">코인</option><option value="cash">현금</option>
                </select>
                <input type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)} placeholder="예: 삼성전자" className="w-full bg-gray-700 border-gray-600 rounded-lg p-2.5" />
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="보유 수량" className="w-full bg-gray-700 border-gray-600 rounded-lg p-2.5" />
                    <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="평단가 (원)" className="w-full bg-gray-700 border-gray-600 rounded-lg p-2.5" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg">자산 추가</button>
            </form>
        </section>

        {aiDiagnosis && <section className="bg-gray-800 rounded-xl p-6 mb-6 border border-teal-500/50"><h3 className="text-xl font-bold mb-4 text-teal-400">AI 3줄 요약</h3><div className="text-gray-300 whitespace-pre-wrap leading-relaxed">{aiDiagnosis}</div></section>}
        
        <section>
            <h3 className="text-xl font-bold mb-4">보유 자산 목록</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {assets.length > 0 ? assets.map(asset => (
                    <div key={asset.id} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${asset.category === 'stock' ? 'bg-blue-500/20 text-blue-300' : asset.category === 'crypto' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>{asset.category}</span>
                                <p className="font-bold text-lg">{asset.assetName}</p>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{asset.amount}개 &times; {currencyFormatter.format(asset.buyPrice)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-base mr-3">{currencyFormatter.format(asset.amount * asset.buyPrice)}</p>
                            <button onClick={() => handleEditAsset(asset.id)} className="text-gray-400 hover:text-white p-2 rounded-full"><EditIcon /></button>
                            <button onClick={() => handleDeleteAsset(asset.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full"><DeleteIcon /></button>
                        </div>
                    </div>
                )) : <div className="text-center py-10 bg-gray-800 rounded-xl"><p className="text-gray-500">자산을 추가하여 포트폴리오를 구성해보세요.</p></div>}
            </div>
        </section>

        {isEditModalOpen && editingAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center p-4">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">자산 수정</h3>
              <form onSubmit={handleUpdateAsset} className="space-y-4">
                <select 
                  value={editingAsset.category} 
                  onChange={(e) => setEditingAsset({ ...editingAsset, category: e.target.value })}
                  className="w-full bg-gray-700 border-gray-600 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="stock">주식</option>
                  <option value="crypto">코인</option>
                  <option value="cash">현금</option>
                </select>
                <input 
                  type="text" 
                  value={editingAsset.assetName}
                  onChange={(e) => setEditingAsset({ ...editingAsset, assetName: e.target.value })}
                  placeholder="예: 삼성전자" 
                  className="w-full bg-gray-700 border-gray-600 rounded-lg p-2.5" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" 
                    value={editingAsset.amount}
                    onChange={(e) => setEditingAsset({ ...editingAsset, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="보유 수량" 
                    className="w-full bg-gray-700 border-gray-600 rounded-lg p-2.5" 
                  />
                  <input 
                    type="number" 
                    value={editingAsset.buyPrice}
                    onChange={(e) => setEditingAsset({ ...editingAsset, buyPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="평단가 (원)" 
                    className="w-full bg-gray-700 border-gray-600 rounded-lg p-2.5" 
                  />
                </div>
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">취소</button>
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">저장</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
