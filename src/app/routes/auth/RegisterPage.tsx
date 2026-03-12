import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "@/features/auth/api";

export function RegisterPage() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (done) {
    return (
      <div className="mx-auto max-w-md p-6">
        <h1 className="text-2xl font-bold">登録完了</h1>
        <p className="mt-3 text-sm text-zinc-600">
          メール認証を有効化したら、ここで「確認メールを送信しました」になります（バックエンド接続待ち）。
        </p>
        <button className="mt-6 w-full rounded-md bg-black px-3 py-2 text-white" onClick={() => nav("/login")}>
          ログインへ
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">新規登録</h1>

      <div className="mt-6 space-y-3">
        <label className="block">
          <div className="text-sm text-zinc-500">Email</div>
          <input
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="block">
          <div className="text-sm text-zinc-500">Display name（任意）</div>
          <input
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>

        <label className="block">
          <div className="text-sm text-zinc-500">Password</div>
          <input
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button
          className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-50"
          disabled={loading || !email || !password}
          onClick={async () => {
            setErr(null);
            setLoading(true);
            try {
              await registerUser({ email: email.trim(), password, displayName: displayName.trim() || undefined } as any);
              setDone(true);
            } catch (e: any) {
              setErr(e?.message ?? "登録に失敗しました");
            } finally {
              setLoading(false);
            }
          }}
        >
          登録する
        </button>

        <div className="text-sm">
          <button className="underline" onClick={() => nav("/login")}>
            ログインへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}