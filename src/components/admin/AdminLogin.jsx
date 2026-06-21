import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminLogin({ onLogin, onCancel }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !pw) return;
    setLoading(true);
    setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) {
      setErr('メールアドレスまたはパスワードが正しくありません');
      setPw('');
    } else {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f4efe9' }}>
      <div className="w-full max-w-sm px-8 font-sans-jp">
        <h1 className="font-serif-jp text-2xl font-light text-center mb-8">管理画面ログイン</h1>
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErr(''); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="メールアドレス"
            className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-sm"
            autoFocus
          />
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setErr(''); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="パスワード"
            className="w-full bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none py-2 text-sm"
          />
          {err && <p className="text-xs text-red-500">{err}</p>}
          <button
            onClick={submit}
            disabled={loading}
            type="button"
            className="w-full text-xs tracking-widest border border-stone-700 py-2.5 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? '確認中...' : 'ログイン'}
          </button>
          <button onClick={onCancel} type="button" className="w-full text-xs tracking-widest border border-stone-300 py-2.5 hover:border-stone-600 transition-colors cursor-pointer">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}
