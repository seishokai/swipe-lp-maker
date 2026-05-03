"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { translateAuthMessage } from "@/lib/auth-messages";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    async function restoreSessionFromUrl() {
      const supabase = createSupabaseBrowserClient();
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const errorDescription = hash.get("error_description");

      if (errorDescription) {
        setMessage(translateAuthMessage(errorDescription.replace(/\+/g, " ")));
        return;
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setMessage(translateAuthMessage(error.message));
          return;
        }

        window.history.replaceState(null, "", "/reset-password");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      setHasSession(Boolean(session));
    }

    restoreSessionFromUrl();
  }, []);

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
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
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setMessage(error ? translateAuthMessage(error.message) : "パスワード再設定リンクを送信しました。最新のメールを開いてください。");
  }

  return (
    <form onSubmit={updatePassword} className="grid gap-5 rounded-lg border border-line bg-white p-6 shadow-sm">
      {hasSession ? (
        <>
          <Field label="新しいパスワード">
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} required />
          </Field>
          <Button disabled={loading || password.length < 6}>パスワードを設定</Button>
        </>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            最新のパスワード再設定メールを開いてください。リンクが切れている場合は、ここから新しいリンクを送れます。
          </p>
          <Field label="メールアドレス">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" required />
          </Field>
          <Button type="button" disabled={loading || !email} onClick={sendPasswordReset}>
            パスワード再設定リンクを送信
          </Button>
        </>
      )}
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
