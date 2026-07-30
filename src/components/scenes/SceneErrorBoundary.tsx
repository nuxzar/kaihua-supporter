"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { HandButton } from "@/components/ds/HandButton";
import { PaperCard } from "@/components/ds/PaperCard";

type Props = {
  /** Remount / clear error when the active scene changes */
  resetKey: string;
  onReset?: () => void;
  children: ReactNode;
};

type State = {
  error: Error | null;
};

/**
 * Isolates render/runtime failures to the active scene paper.
 * Without this, any scene throw blank the entire KaihuaApp tree.
 */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SceneErrorBoundary]", error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  private clear = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center p-6">
        <PaperCard tone="cream" className="ds-pad max-w-sm text-center">
          <p className="font-cn-pixel text-lg text-ink">这一步卡住了</p>
          <p className="font-hand mt-2 text-sm leading-snug text-ink-soft">
            工作台这一页出了点问题，不影响其他步骤。返回首页再试一次。
          </p>
          <HandButton onClick={this.clear} className="mt-4">
            回到总部
          </HandButton>
        </PaperCard>
      </div>
    );
  }
}
