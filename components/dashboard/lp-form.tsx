import { Save } from "lucide-react";
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
    <form action={action} className="grid gap-5 rounded-lg border border-line bg-white p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="LPタイトル">
          <Input name="title" required defaultValue={lp?.title} placeholder="Spring Campaign" />
        </Field>
        <Field label="公開slug">
          <Input name="slug" required defaultValue={lp?.slug} placeholder="spring-campaign" pattern="[a-zA-Z0-9-]+" />
        </Field>
      </div>
      <Field label="共通CTA URL">
        <Input name="cta_url" type="url" defaultValue={lp?.cta_url || ""} placeholder="https://example.com/apply" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Meta Pixel ID">
          <Input name="meta_pixel_id" defaultValue={lp?.meta_pixel_id || ""} placeholder="1234567890" />
        </Field>
        <Field label="Google Analytics ID">
          <Input name="google_analytics_id" defaultValue={lp?.google_analytics_id || ""} placeholder="G-XXXXXXXXXX" />
        </Field>
      </div>
      <Button className="w-fit">
        <Save size={18} />
        保存
      </Button>
    </form>
  );
}
