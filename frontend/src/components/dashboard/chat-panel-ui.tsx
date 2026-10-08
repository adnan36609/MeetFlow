"use client";

import {
  ArrowUp,
  CalendarDays,
  Check,
  Copy,
  LoaderCircle,
  MessageSquarePlus,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  RefObject,
  useState,
} from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { ThreadSummary } from "@/lib/agent";
import { MarkdownMessage } from "./markdown-message";
import Link from "next/link";

const styles = {
  root: "app-shell-bg flex h-svh overflow-hidden",

  aside:
    "panel fixed inset-y-0 left-0 z-40 flex w-[20rem] flex-col transition-transform md:static md:translate-x-0",
  asideOpen: "translate-x-0",
  asideClosed: "-translate-x-full",
  brandRow:
    "flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-3.5",
  brandLeft: "flex min-w-0 items-center gap-2.5",
  brandLink: "rounded-xl outline-offset-4 transition-opacity hover:opacity-80",
  brandIcon:
    "flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.45_0.12_185)] text-primary-foreground shadow-md ring-1 ring-white/20",
  brandIconSvg: "size-4",
  brandText: "min-w-0",
  brandTitle: "font-heading text-lg font-semibold tracking-tight",
  brandSubtitle: "text-[11px] text-muted-foreground",
  topActions: "space-y-2 px-3 py-3",
  newChatBtn:
    "w-full justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-none hover:bg-primary/15",
  newChatIcon: "size-4",
  calendarBtn:
    "w-full justify-start gap-2 rounded-xl border-transparent text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  calendarIcon: "size-4",
  separator: "opacity-70",

  chatsSection: "flex min-h-0 flex-1 flex-col px-3 pt-5",
  chatsTitle:
    "mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
  chatsScroll: "min-h-0 flex-1 px-1 pb-3",
  chatsEmpty: "px-2 py-3 text-sm leading-relaxed text-muted-foreground",
  threadList: "space-y-1",
  threadBtn:
    "w-full rounded-lg px-3 py-3 text-left transition-colors disabled:opacity-50",
  threadBtnActive:
    "bg-card text-foreground shadow-[inset_3px_0_0_var(--primary)]",
  threadBtnIdle: "hover:bg-sidebar-accent/60",
  threadTitle: "line-clamp-2 text-sm font-medium leading-snug",
  threadTime: "mt-1 block text-[11px] text-muted-foreground",

  connectionSection: "border-t border-sidebar-border px-3 py-3",
  connectionLabel:
    "mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",

  footer: "mt-auto border-t border-sidebar-border p-3",

  main: "relative isolate flex min-w-0 flex-1 flex-col",
  header:
    "panel flex h-16 shrink-0 items-center justify-between border-x-0 border-t-0 px-4 md:px-6",
  headerLeft: "flex min-w-0 items-center gap-3",
  headerIcon:
    "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
  headerIconSvg: "size-4",
  headerText: "min-w-0",
  headerTitle: "truncate text-sm font-semibold",
  headerSubtitle: "truncate text-xs text-muted-foreground",
  headerStatus: "status-pill max-sm:hidden",

  chatColumn: "chat-bg relative flex min-h-0 flex-1 flex-col",
  messagesScroll: "h-full min-h-0 flex-1",
  messagesInner: "mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8",
  emptyState:
    "flex min-h-[58vh] flex-col items-center justify-center text-center",
  emptyIcon:
    "mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10",
  emptyIconSvg: "size-7",
  emptyEyebrow: "eyebrow mb-2",
  emptyTitle: "hero-title",
  emptyCopy:
    "mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base",
  suggestions: "mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2",
  suggestionBtn:
    "chip h-auto min-h-14 justify-start whitespace-normal px-4 py-3.5 text-left text-sm leading-5 hover:bg-card",
  suggestionIcon: "mr-2 size-4 shrink-0 text-muted-foreground",

  messageList: "space-y-6",
  statusRow: "flex items-center gap-2 px-1 text-sm text-muted-foreground",
  statusIcon: "size-4 animate-spin",
  statusIconSm: "size-3.5 animate-spin",
  messageRow: "message-enter flex w-full min-w-0",
  messageRowUser: "justify-end",
  messageRowAssistant: "justify-start",
  bubble:
    "min-w-0 max-w-[min(100%,44rem)] overflow-hidden break-words [overflow-wrap:anywhere]",
  bubbleUser: "bubble-user px-4 py-3",
  bubbleAssistant:
    "bubble-ai max-w-[min(100%,48rem)] px-5 py-4 text-foreground",
  bubbleSystem: "rounded-2xl bg-muted px-4 py-2.5 text-muted-foreground",
  userText: "whitespace-pre-wrap text-[15px] leading-7",

  composerWrap: "panel shrink-0 border-x-0 border-b-0 px-4 py-4 sm:px-6",
  composerForm:
    "composer-glow mx-auto flex w-full max-w-4xl items-end gap-2 rounded-2xl px-3 py-2",
  composerInput:
    "max-h-40 min-h-[44px] field-sizing-content flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-[15px] shadow-none focus-visible:ring-0",
  sendBtn:
    "mb-0.5 size-10 shrink-0 rounded-xl shadow-sm transition-transform hover:scale-105 active:scale-95",
  sendIcon: "size-4",
  sendIconSpin: "size-4 animate-spin",
  composerHint:
    "mx-auto mt-2 max-w-4xl text-center text-[11px] text-muted-foreground/80",
} as const;

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatPanelUIProps = {
  connections?: ReactNode;
  footer?: ReactNode;
  messages: Message[];
  threads: ThreadSummary[];
  threadId: string;
  prompt: string;
  running: boolean;
  loadingThread: boolean;
  progress: string | null;
  showEmpty: boolean;
  bottomRef: RefObject<HTMLDivElement | null>;
  onNewChat: () => void;
  onResumeThread: (threadId: string) => void;
  onSendMessage: (text: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPromptChange: (value: string) => void;
};

const SUGGESTIONS = [
  {
    label: "What's on my calendar today?",
    icon: CalendarDays,
  },
  {
    label: "Find a free slot tomorrow morning",
    icon: Search,
  },
  {
    label: "Create a 30-minute meeting tomorrow at 10 AM",
    icon: Plus,
  },
  {
    label: "Help me reschedule my next meeting",
    icon: RefreshCcw,
  },
];

function formatThreadTime(value: string) {
  const date = new Date(value);
  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

const QUICK_ACTIONS = [
  "Summarize my week",
  "Find a free slot today",
  "Reschedule my next meeting",
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label="Copy message"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function ChatPanelUI({
  connections,
  footer,
  messages,
  threads,
  threadId,
  prompt,
  running,
  loadingThread,
  progress,
  showEmpty,
  bottomRef,
  onNewChat,
  onResumeThread,
  onSendMessage,
  onSubmit,
  onKeyDown,
  onPromptChange,
}: ChatPanelUIProps) {
  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <aside className={styles.aside}>
        <div className={styles.brandRow}>
          <Link
            href="/"
            aria-label="Go to homepage"
            className={cn(styles.brandLeft, styles.brandLink)}
          >
            <div className={styles.brandIcon}>
              <CalendarDays className={styles.brandIconSvg} />
            </div>

            <div className={styles.brandText}>
              <p className={styles.brandTitle}>MeetFlow</p>
              <p className={styles.brandSubtitle}>Your intelligent meeting assistant</p>
            </div>
          </Link>
        </div>

        <div className={styles.topActions}>
          <Button
            onClick={onNewChat}
            variant="outline"
            className={styles.newChatBtn}
          >
            <MessageSquarePlus className={styles.newChatIcon} />
            New Chat
          </Button>
        </div>

        <Separator className={styles.separator} />

        <div className={styles.chatsSection}>
          <p className={styles.chatsTitle}>Recent chats</p>

          <ScrollArea className={styles.chatsScroll}>
            {threads.length === 0 ? (
              <p className={styles.chatsEmpty}>
                Your conversations will appear here.
              </p>
            ) : (
              <div className={styles.threadList}>
                {threads.map((thread) => {
                  const active = thread.id === threadId;

                  return (
                    <button
                      key={thread.id}
                      type="button"
                      disabled={running || loadingThread}
                      onClick={() => onResumeThread(thread.id)}
                      className={cn(
                        styles.threadBtn,
                        active ? styles.threadBtnActive : styles.threadBtnIdle,
                      )}
                    >
                      <span className={styles.threadTitle}>{thread.title}</span>

                      <span className={styles.threadTime}>
                        {formatThreadTime(thread.updatedAt)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Connections */}
        {connections ? (
          <div className={styles.connectionSection}>
            <p className={styles.connectionLabel}>Calendar connection</p>
            {connections}
          </div>
        ) : null}

        <div className={styles.footer}>{footer}</div>
      </aside>

      {/* Main */}
      <section className={styles.main}>
        <div className="dot-grid pointer-events-none absolute inset-0 -z-10" />
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <CalendarDays className={styles.headerIconSvg} />
            </div>

            <div className={styles.headerText}>
              <p className={styles.headerTitle}>MeetFlow Workspace</p>
              <p className={styles.headerSubtitle}>
                Plan meetings and manage your calendar with AI
              </p>
            </div>
          </div>
        </header>

        <div className={styles.chatColumn}>
          <ScrollArea className={styles.messagesScroll}>
            <div className={styles.messagesInner}>
              {showEmpty ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>
                    <Sparkles className={styles.emptyIconSvg} />
                  </div>

                  <p className={styles.emptyEyebrow}>
                    YOUR SCHEDULING WORKSPACE
                  </p>

                  <h2 className={styles.emptyTitle}>
                    Plan your day with MeetFlow.
                  </h2>

                  <p className={styles.emptyCopy}>
                    Tell me what you need to schedule, find, or change. I’ll
                    work with your calendar and help you get it done.
                  </p>

                  <div className={styles.suggestions}>
                    {SUGGESTIONS.map(({ label, icon: Icon }) => (
                      <Button
                        key={label}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSendMessage(label)}
                        className={styles.suggestionBtn}
                        disabled={running || loadingThread}
                      >
                        <span className="mr-3 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </span>
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.messageList}>
                  {loadingThread ? (
                    <div className="space-y-4">
                      <div className="h-10 w-1/2 ml-auto animate-pulse rounded-2xl bg-muted" />
                      <div className="h-24 w-3/4 animate-pulse rounded-2xl bg-muted" />
                      <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-muted" />
                    </div>
                  ) : (
                    messages.map((message) => {
                      if (message.id === "welcome" && messages.length > 1) {
                        return null;
                      }

                      const body =
                        !message.content && running ? (
                          <span className="typing">
                            <span />
                            <span />
                            <span />
                          </span>
                        ) : message.role === "user" ? (
                          <p className={styles.userText}>{message.content}</p>
                        ) : (
                          <MarkdownMessage
                            content={message.content}
                            tone={
                              message.role === "system" ? "system" : "assistant"
                            }
                          />
                        );

                      if (message.role === "assistant") {
                        return (
                          <div
                            key={message.id}
                            className={cn(
                              styles.messageRow,
                              styles.messageRowAssistant,
                            )}
                          >
                            <div className="group flex min-w-0 max-w-[min(100%,48rem)] gap-3">
                              <div className="mt-5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                <Sparkles className="size-4" />
                              </div>

                              <div className="min-w-0">
                                <p className="mb-1 text-xs font-semibold text-muted-foreground">
                                  MeetFlow
                                </p>

                                <div
                                  className={cn(
                                    styles.bubble,
                                    styles.bubbleAssistant,
                                  )}
                                >
                                  {body}
                                </div>

                                {message.content && !running ? (
                                  <CopyButton text={message.content} />
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            styles.messageRow,
                            message.role === "user"
                              ? styles.messageRowUser
                              : styles.messageRowAssistant,
                          )}
                        >
                          <div
                            className={cn(
                              styles.bubble,
                              message.role === "user" && styles.bubbleUser,
                              message.role === "system" && styles.bubbleSystem,
                            )}
                          >
                            {body}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {progress ? (
                    <div className="ml-11">
                      <span className="status-pill">{progress}</span>
                    </div>
                  ) : null}

                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Composer */}
          <div className={styles.composerWrap}>
            {!showEmpty ? (
              <div className="mx-auto mb-3 flex w-full max-w-4xl flex-wrap gap-2">
                {QUICK_ACTIONS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    disabled={running || loadingThread}
                    onClick={() => onSendMessage(label)}
                    className="chip px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}
            <form onSubmit={onSubmit} className={styles.composerForm}>
              <Textarea
                value={prompt}
                onChange={(event) => onPromptChange(event.target.value)}
                rows={1}
                onKeyDown={onKeyDown}
                disabled={running}
                placeholder="Ask MeetFlow about your calendar..."
                className={styles.composerInput}
              />

              <Button
                type="submit"
                size="icon"
                disabled={!prompt.trim() || running}
                className={styles.sendBtn}
                aria-label="Send message"
              >
                {running ? (
                  <LoaderCircle className={styles.sendIconSpin} />
                ) : (
                  <ArrowUp className={styles.sendIcon} />
                )}
              </Button>
            </form>

            <p className={styles.composerHint}>
              MeetFlow can read your calendar and help schedule meetings. Review
              suggested changes before confirming.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
