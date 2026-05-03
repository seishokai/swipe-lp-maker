export function translateAuthMessage(message: string) {
  if (message.includes("only request this after")) {
    const seconds = message.match(/after (\d+) seconds?/)?.[1];
    return seconds ? `${seconds}秒後にもう一度送信できます。` : "少し待ってからもう一度送信してください。";
  }

  if (message.includes("email rate limit exceeded") || message.includes("over_email_send_rate_limit")) {
    return "メール送信回数の上限に達しました。少し時間を置いてからもう一度試してください。";
  }

  if (message.includes("Email link is invalid") || message.includes("otp_expired")) {
    return "メールリンクが無効、または期限切れです。新しいリンクを送信してください。";
  }

  if (message.includes("Invalid login credentials")) {
    return "メールアドレスまたはパスワードが違います。";
  }

  if (message.includes("Auth session missing")) {
    return "認証セッションがありません。最新の再設定メールを開いてください。";
  }

  if (message.includes("Password should be at least")) {
    return "パスワードが短すぎます。6文字以上で入力してください。";
  }

  return message;
}
