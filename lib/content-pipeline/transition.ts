import type { ArticleStateId } from "./types";
import { ARTICLE_LIFECYCLE_STATE_MAP } from "./lifecycleStates";

export function canTransition(from: ArticleStateId, to: ArticleStateId): boolean {
  const state = ARTICLE_LIFECYCLE_STATE_MAP[from];
  return state ? state.allowedTransitions.includes(to) : false;
}

export type TransitionResult = { allowed: true; to: ArticleStateId } | { allowed: false; reason: string };

export function transition(from: ArticleStateId, to: ArticleStateId): TransitionResult {
  if (!canTransition(from, to)) {
    return { allowed: false, reason: `انتقال از «${from}» به «${to}» مجاز نیست` };
  }
  return { allowed: true, to };
}
