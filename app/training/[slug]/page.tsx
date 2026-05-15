import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublishedTrainingCourse } from "@/lib/trainings";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("training_courses").select("title, description").eq("slug", slug).eq("status", "published").single();

  return {
    title: data?.title || "研修資料",
    description: data?.description || undefined,
  };
}

export default async function PublicTrainingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  let training;
  try {
    training = await getPublishedTrainingCourse(supabase, slug);
  } catch {
    notFound();
  }

  const sections = [...(training.training_sections || [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <main className="min-h-svh bg-[#f5f7fb]">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-4xl px-5 py-10">
          <p className="text-sm font-semibold text-accent">Training</p>
          <h1 className="mt-3 text-3xl font-semibold text-ink md:text-5xl">{training.title}</h1>
          {training.description ? <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{training.description}</p> : null}
        </div>
      </section>

      <div className="mx-auto grid max-w-4xl gap-5 px-5 py-8">
        {sections.length === 0 ? (
          <div className="rounded-lg border border-line bg-white p-8 text-center text-sm text-slate-500">この研修にはまだセクションがありません。</div>
        ) : (
          sections.map((section, index) => {
            const assets = [...(section.training_assets || [])].sort((a, b) => a.sort_order - b.sort_order);

            return (
              <section key={section.id} className="rounded-lg border border-line bg-white p-5 shadow-soft">
                <p className="text-xs font-semibold text-accent">SECTION {index + 1}</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{section.title}</h2>
                {section.body ? <div className="mt-4 whitespace-pre-wrap text-base leading-8 text-slate-700">{section.body}</div> : null}

                {assets.length > 0 ? (
                  <div className="mt-5 grid gap-4">
                    {assets.map((asset) => (
                      <div key={asset.id} className="overflow-hidden rounded-md border border-line bg-paper">
                        {asset.asset_type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={asset.public_url} alt={asset.file_name || section.title} className="w-full bg-white object-contain" />
                        ) : asset.asset_type === "video" ? (
                          <video src={asset.public_url} controls playsInline className="w-full bg-black" />
                        ) : asset.asset_type === "pdf" ? (
                          <a href={asset.public_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 font-semibold text-ink">
                            <FileText size={20} />
                            {asset.file_name || "PDFを開く"}
                          </a>
                        ) : (
                          <a href={asset.public_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 font-semibold text-ink">
                            <FileText size={20} />
                            {asset.file_name || "ファイルを開く"}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}
