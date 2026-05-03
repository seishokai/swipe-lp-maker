import { BarChart3, Link2, Megaphone, Save, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { LandingPage } from "@/types/lp";

export function LpForm({
  lp,
  action,
}: {
  lp?: LandingPage;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-accent/10 text-accent">
          <Smartphone size={20} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-ink">LP基本設定</h2>
          <p className="text-sm text-slate-500">公開URL、CTA、計測タグをまとめて設定します。</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="LPタイトル">
          <Input name="title" required defaultValue={lp?.title} placeholder="春のキャンペーンLP" />
        </Field>
        <Field label="公開slug">
          <Input name="slug" required defaultValue={lp?.slug} placeholder="spring-campaign" pattern="[a-zA-Z0-9-]+" />
        </Field>
      </div>

      <div className="grid gap-4 rounded-lg bg-mist p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Link2 size={17} />
          CTA設定
        </div>
        <Field label="共通CTA URL">
          <Input name="cta_url" type="url" defaultValue={lp?.cta_url || ""} placeholder="https://example.com/apply" />
        </Field>
        <label className="flex items-center gap-3 rounded-md bg-white p-3 text-sm font-semibold text-ink ring-1 ring-line">
          <input name="fixed_cta_enabled" type="checkbox" defaultChecked={lp?.fixed_cta_enabled ?? false} className="h-4 w-4 accent-accent" />
          固定CTAボタンを表示する
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="固定CTA文言">
            <Input name="fixed_cta_label" defaultValue={lp?.fixed_cta_label || "詳しく見る"} placeholder="詳しく見る" />
          </Field>
          <label className="grid gap-2 text-sm font-medium text-ink">
            <span>固定CTAデザイン</span>
            <select
              name="fixed_cta_style"
              defaultValue={lp?.fixed_cta_style || "solid"}
              className="h-11 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/15"
            >
              <option value="solid">しっかり目立つ</option>
              <option value="glass">半透明でなじませる</option>
              <option value="minimal">控えめ</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 rounded-lg bg-white ring-1 ring-line md:grid-cols-2">
        <div className="grid gap-3 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Megaphone size={17} />
            Meta Pixel
          </div>
          <Input name="meta_pixel_id" defaultValue={lp?.meta_pixel_id || ""} placeholder="1234567890" />
        </div>
        <div className="grid gap-3 border-t border-line p-4 md:border-l md:border-t-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <BarChart3 size={17} />
            Google Analytics
          </div>
          <Input name="google_analytics_id" defaultValue={lp?.google_analytics_id || ""} placeholder="G-XXXXXXXXXX" />
        </div>
      </div>

      <Button className="w-fit">
        <Save size={18} />
        保存する
      </Button>
    </form>
  );
}
