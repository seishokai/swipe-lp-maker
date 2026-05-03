import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ImageUploader({ action }: { action: (formData: FormData) => Promise<void> }) {
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-dashed border-line bg-white p-5">
      <label className="text-sm font-medium text-ink" htmlFor="image">
        画像アップロード
      </label>
      <input id="image" name="image" type="file" accept="image/*" required className="text-sm" />
      <Button className="w-fit">
        <Upload size={18} />
        追加
      </Button>
    </form>
  );
}
