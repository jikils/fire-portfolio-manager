
import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp(
          { email, password },
          {
            emailRedirectTo: import.meta.env.VITE_HOME_URL,
          }
        );
        if (error) throw error;
        alert('회원가입 완료! 이메일을 확인하여 계정을 활성화해주세요.');
      }
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${import.meta.env.VITE_HOME_URL}/password-reset`,
      });
      if (error) throw error;
      alert('비밀번호 재설정 링크를 이메일로 보냈습니다. 받은편지함을 확인해주세요.');
      setIsResettingPassword(false); // Reset UI back to login
    } catch (error) {
      alert(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isResettingPassword) {
    return (
      <div className="w-full max-w-md mx-auto p-4 pt-20">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center text-white mb-6">비밀번호 재설정</h1>
          <p className="text-center text-gray-400 mb-8">
            가입 시 사용한 이메일 주소를 입력하시면<br/>비밀번호 재설정 링크를 보내드립니다.
          </p>
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">이메일 주소</label>
              <input
                id="email"
                className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-indigo-500 focus:border-indigo-500"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 disabled:bg-gray-500" disabled={loading}>
                {loading ? '처리 중...' : '재설정 링크 보내기'}
              </button>
            </div>
          </form>
          <div className="text-center mt-6">
            <button onClick={() => setIsResettingPassword(false)} className="text-sm text-gray-400 hover:text-indigo-400 transition">
              로그인으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 pt-20">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          {isLogin ? '로그인' : '회원가입'}
        </h1>
        <p className="text-center text-gray-400 mb-8">
          포트폴리오를 관리하고 AI 진단을 받아보세요.
        </p>
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">이메일 주소</label>
            <input
              id="email"
              className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-indigo-500 focus:border-indigo-500"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">비밀번호</label>
            <input
              id="password"
              className="w-full bg-gray-700 border-gray-600 rounded-lg p-3 text-white focus:ring-indigo-500 focus:border-indigo-500"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>
          <div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition duration-300 disabled:bg-gray-500" disabled={loading}>
              {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-400 hover:text-indigo-400 transition">
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
        <div className="text-center mt-4">
            <button onClick={() => setIsResettingPassword(true)} className="text-sm text-gray-400 hover:text-indigo-400 transition">
                비밀번호를 잊으셨나요?
            </button>
        </div>
      </div>
    </div>
  );
}
