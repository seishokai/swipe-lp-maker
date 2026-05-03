"use client";

import { useEffect, useState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/env";
import { translateAuthMessage } from "@/lib/auth-messages";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    if (params.get("type") === "recovery" || params.get("access_token")) {
      window.location.href = `/reset-password${hash}`;
    }
  }, []);

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getSiteUrl()}/callback`,
      },
    });
    setLoading(false);
    setMessage(error ? translateAuthMessage(error.message) : "ログインリンクを送信しました。メールを確認してください。");
  }

  async function loginWithPassword() {
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setMessage(translateAuthMessage(error.message));
      return;
    }

    window.location.href = "/dashboard/lps";
  }

  async function sendPasswordReset() {
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getSiteUrl()}/reset-password`,
    });
    setLoading(false);
    setMessage(error ? translateAuthMessage(error.message) : "パスワード再設定リンクを送信しました。最新のメールを開いてください。");
  }

  return (
    <form onSubmit={sendMagicLink} className="grid gap-5 rounded-lg border border-line bg-white p-6 shadow-sm">
      <Field label="メールアドレス">
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" required />
      </Field>
      <Field label="パスワード">
        <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="パスワードログイン時だけ入力" type="password" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={loading || !email || !password} onClick={loginWithPassword}>
          <LogIn size={18} />
          パスワードでログイン
        </Button>
        <Button type="submit" disabled={loading} className="bg-slate-700 hover:bg-slate-800">
          <LogIn size={18} />
          ログインリンクを送信
        </Button>
      </div>
      <button
        className="w-fit text-left text-sm font-medium text-accent underline-offset-4 hover:underline disabled:text-slate-400"
        type="button"
        disabled={loading || !email}
        onClick={sendPasswordReset}
      >
        パスワード再設定リンクを送信
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
