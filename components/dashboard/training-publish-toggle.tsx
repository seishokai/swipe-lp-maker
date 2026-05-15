import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TrainingCourse } from "@/types/training";

export function TrainingPublishToggle({
  training,
  action,
}: {
  training: TrainingCourse;
  action: (formData: FormData) => Promise<void>;
}) {
  const published = training.status === "published";

  return (
    <form action={action}>
      <input type="hidden" name="publish" value={published ? "false" : "true"} />
      <Button className={published ? "bg-slate-100 text-ink hover:bg-slate-200" : ""}>
        {published ? <EyeOff size={17} /> : <Eye size={17} />}
        {published ? "非公開にする" : "公開する"}
      </Button>
    </form>
  );
}
