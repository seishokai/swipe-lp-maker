import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LandingPage } from "@/types/lp";

export function PublishToggle({
  lp,
  action,
}: {
  lp: LandingPage;
  action: (formData: FormData) => Promise<void>;
}) {
  const published = lp.status === "published";

  return (
    <form action={action}>
      <input type="hidden" name="publish" value={published ? "false" : "true"} />
      <Button className={published ? "bg-slate-600 hover:bg-slate-700" : ""}>
        {published ? <EyeOff size={18} /> : <Eye size={18} />}
        {published ? "非公開にする" : "公開する"}
      </Button>
    </form>
  );
}
