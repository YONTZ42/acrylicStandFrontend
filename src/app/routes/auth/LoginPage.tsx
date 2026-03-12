import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/features/auth/AuthProvider";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              width?: number;
              logo_alignment?: "left" | "center";
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function LoginPage() {
  const nav = useNavigate();
  const auth = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) return;
    if (!window.google?.accounts?.id) return;
    if (!googleBtnRef.current) return;

    googleBtnRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        const idToken = response.credential;
        if (!idToken) {
          setErr("Google認証に失敗しました");
          return;
        }

        setErr(null);
        setGoogleLoading(true);
        try {
          await auth.loginWithGoogle(idToken);
          nav("/app");
        } catch (e: any) {
          setErr(e?.message ?? "Googleログインに失敗しました");
        } finally {
          setGoogleLoading(false);
        }
      },
    });

    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "signin_with",
      width: 380,
      logo_alignment: "left",
    });
  }, [auth, nav]);

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">ログイン</h1>

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
          <div className="text-sm text-zinc-500">Password</div>
          <input
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button
          className="w-full rounded-md bg-black px-3 py-2 text-white disabled:opacity-50"
          disabled={loading || googleLoading || !email || !password}
          onClick={async () => {
            setErr(null);
            setLoading(true);
            try {
              await auth.login(email.trim(), password);
              nav("/app");
            } catch (e: any) {
              setErr(e?.message ?? "ログインに失敗しました");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-xs text-zinc-500">または</span>
          </div>
        </div>

        <div className="space-y-2">
          <div
            ref={googleBtnRef}
            className="flex min-h-[44px] w-full items-center justify-center"
          />
          {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="text-xs text-amber-600">
              VITE_GOOGLE_CLIENT_ID が未設定です
            </div>
          )}
          {googleLoading && (
            <div className="text-xs text-zinc-500">Googleログイン中...</div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <button className="underline" onClick={() => nav("/register")}>
            新規登録
          </button>
          <button className="underline" onClick={() => nav("/")}>
            LPへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}