"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { BarChart3, Images, MousePointer2, Settings } from "lucide-react";

type TabId = "slides" | "cta" | "basic" | "tracking";

const tabs: Array<{ id: TabId; label: string; description: string; icon: React.ElementType }> = [
  { id: "slides", label: "画像・動画", description: "まずここで追加・並び替え", icon: Images },
  { id: "cta", label: "CTAエリア", description: "画像内リンクを設定", icon: MousePointer2 },
  { id: "basic", label: "基本設定", description: "タイトル・URL・固定CTA", icon: Settings },
  { id: "tracking", label: "計測タグ", description: "Meta / GA", icon: BarChart3 },
];

export function EditLpTabs({
  slides,
  cta,
  basic,
  tracking,
}: {
  slides: ReactNode;
  cta: ReactNode;
  basic: ReactNode;
  tracking: ReactNode;
}) {
  const [active, setActive] = useState<TabId>("slides");
  const content = { slides, cta, basic, tracking };

  return (
    <div className="grid gap-4">
      <div className="sticky top-0 z-20 -mx-2 overflow-x-auto bg-paper/95 px-2 py-2 backdrop-blur">
        <div className="inline-grid min-w-full grid-cols-4 gap-2 rounded-lg border border-line bg-white p-1 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`grid min-w-[150px] gap-0.5 rounded-md px-3 py-2 text-left transition ${
                  selected ? "bg-ink text-white shadow-sm" : "text-slate-600 hover:bg-mist hover:text-ink"
                }`}
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold">
                  <Icon size={16} />
                  {tab.label}
                </span>
                <span className={selected ? "text-xs text-white/70" : "text-xs text-slate-400"}>{tab.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tabs.map((tab) => (
        <div key={tab.id} hidden={active !== tab.id}>
          {content[tab.id]}
        </div>
      ))}
    </div>
  );
}
