"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { HeaderBar } from "@/components/ds/HeaderBar";
import { WorkSpace } from "@/components/layout/WorkSpace";
import { ActionBar, type ActionBarItem } from "@/components/ui/ActionBar";

export type WorkshopChrome = {
  backLabel?: string | null;
  onBack?: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  note?: ReactNode;
  actions?: ActionBarItem[];
  footerExtra?: ReactNode;
  wide?: boolean;
};

type SetChrome = (chrome: WorkshopChrome) => void;

const WorkshopChromeContext = createContext<SetChrome | null>(null);

/**
 * Scene registers header / footer into the fixed WorkshopShell.
 * Shell stays mounted; only paper content slides in SceneContainer.
 */
export function useWorkshopChrome(chrome: WorkshopChrome, deps: unknown[]) {
  const setChrome = useContext(WorkshopChromeContext);
  useLayoutEffect(() => {
    if (!setChrome) return;
    setChrome(chrome);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

type WorkshopShellProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Fixed Kaihua desk — background, brand header, action footer.
 * Children (SceneContainer) only animate paper content.
 */
export function WorkshopShell({ children, className = "" }: WorkshopShellProps) {
  const [chrome, setChromeState] = useState<WorkshopChrome>({
    title: "开花支持计划",
    actions: [],
  });

  const setChrome = useCallback<SetChrome>((next) => {
    setChromeState(next);
  }, []);

  return (
    <WorkSpace
      wide={Boolean(chrome.wide)}
      contentAlign="stretch"
      className={className}
      header={
        <HeaderBar
          backLabel={chrome.backLabel ?? null}
          onBack={chrome.onBack}
          title={chrome.title ?? "开花支持计划"}
          subtitle={chrome.subtitle}
        />
      }
      footer={
        <>
          <ActionBar note={chrome.note} items={chrome.actions ?? []} />
          {chrome.footerExtra}
        </>
      }
    >
      <WorkshopChromeContext.Provider value={setChrome}>
        <div className="relative h-full min-h-0 w-full overflow-hidden">{children}</div>
      </WorkshopChromeContext.Provider>
    </WorkSpace>
  );
}
