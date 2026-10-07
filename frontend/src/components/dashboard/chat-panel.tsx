"use client";

import {
  ArrowUp,
  CalendarDays,
  Clock3,
  LoaderCircle,
  MessageSquarePlus,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  listThreads,
  loadThread,
  streamAgentChat,
  ThreadSummary,
} from "@/lib/agent";
import { ScrollArea } from "../ui/scroll-area";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
import { MarkdownMessage } from "./markdown-message";

const styles = {
  root: "flex h-svh overflow-hidden bg-background",

  /* Sidebar */
  aside:
    "fixed inset-y-0 left-0 z-40 flex w-[18.5rem] flex-col border-r border-sidebar-border bg-sidebar transition-transform md:static md:translate-x-0",
  asideOpen: "translate-x-0",
  asideClosed: "-translate-x-full",

  brandRow:
    "flex items-center justify-between gap-2 border-b border-sidebar-border px-4 py-4",
  brandLeft: "flex min-w-0 items-center gap-2.5",
  brandIcon:
    "flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm",
  brandIconSvg: "size-4",
  brandText: "min-w-0",
  brandTitle: "font-heading text-lg font-semibold tracking-tight",
  brandSubtitle: "text-[11px] text-muted-foreground",

  topActions: "space-y-2 px-3 py-3",

  newChatBtn:
    "w-full justify-start gap-2 rounded-xl border-sidebar-border bg-background/60 text-sm shadow-none hover:bg-sidebar-accent",
  newChatIcon: "size-4",

  separator: "opacity-70",

  /* Chats */
  chatsSection: "flex min-h-0 flex-1 flex-col px-2 pt-4",
  chatsTitle:
    "mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
  chatsScroll: "min-h-0 flex-1 px-1 pb-3",
  chatsEmpty: "px-2 py-3 text-sm leading-relaxed text-muted-foreground",
  threadList: "space-y-1",

  threadBtn:
    "w-full rounded-xl px-3 py-2.5 text-left transition-colors disabled:opacity-50",
  threadBtnActive: "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm",
  threadBtnIdle: "hover:bg-sidebar-accent/60",

  threadTitle: "line-clamp-2 text-sm font-medium leading-snug",
  threadTime: "mt-1 block text-[11px] text-muted-foreground",

  /* Connection area */
  connectionSection: "border-t border-sidebar-border px-3 py-3",
  connectionLabel:
    "mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",

  /* Footer */
  footer: "mt-auto border-t border-sidebar-border p-3",

  /* Main */
  main: "relative flex min-w-0 flex-1 flex-col",

  header:
    "flex h-14 shrink-0 items-center justify-between border-b border-border/70 bg-background/80 px-4 backdrop-blur-md md:px-6",

  headerLeft: "flex min-w-0 items-center gap-3",
  headerIcon:
    "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
  headerIconSvg: "size-4",

  headerText: "min-w-0",
  headerTitle: "truncate text-sm font-semibold",
  headerSubtitle: "truncate text-xs text-muted-foreground",

  headerStatus:
    "hidden items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground sm:flex",
  statusDot: "size-1.5 rounded-full bg-emerald-500",

  /* Chat */
  chatColumn: "relative flex min-h-0 flex-1 flex-col",
  messagesScroll: "h-full min-h-0 flex-1",

  messagesInner: "mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8",

  emptyState:
    "flex min-h-[58vh] flex-col items-center justify-center text-center",

  emptyIcon:
    "mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10",

  emptyIconSvg: "size-7",

  emptyEyebrow:
    "mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary",

  emptyTitle: "font-heading text-3xl font-semibold tracking-tight sm:text-4xl",

  emptyCopy:
    "mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base",

  suggestions: "mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2",

  suggestionBtn:
    "h-auto min-h-11 justify-start rounded-xl border-border/80 bg-card/70 px-4 py-3 text-left text-[13px] shadow-none hover:bg-accent",

  suggestionIcon: "mr-2 size-4 shrink-0 text-muted-foreground",

  /* Messages */
  messageList: "space-y-6",

  statusRow: "flex items-center gap-2 px-1 text-sm text-muted-foreground",

  statusIcon: "size-4 animate-spin",
  statusIconSm: "size-3.5 animate-spin",

  messageRow: "message-enter flex w-full min-w-0",
  messageRowUser: "justify-end",
  messageRowAssistant: "justify-start",

  bubble:
    "min-w-0 max-w-[min(100%,44rem)] overflow-hidden break-words [overflow-wrap:anywhere]",

  bubbleUser:
    "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground",

  bubbleAssistant:
    "rounded-2xl rounded-bl-md bg-card px-4 py-3 text-foreground ring-1 ring-border/70",

  bubbleSystem: "rounded-2xl bg-muted px-4 py-2.5 text-muted-foreground",

  thinking: "inline-flex items-center gap-2 text-sm text-muted-foreground",

  userText: "whitespace-pre-wrap text-[15px] leading-7",

  /* Composer */
  composerWrap:
    "shrink-0 border-t border-border/60 bg-background/80 px-4 py-4 backdrop-blur-md sm:px-6",

  composerForm:
    "composer-glow mx-auto flex w-full max-w-4xl items-end gap-2 rounded-2xl border border-border/80 bg-card p-2.5 shadow-sm",

  composerInput:
    "max-h-40 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-[15px] shadow-none focus-visible:ring-0",

  sendBtn: "mb-0.5 size-10 shrink-0 rounded-xl",

  sendIcon: "size-4",
  sendIconSpin: "size-4 animate-spin",

  composerHint:
    "mx-auto mt-2.5 max-w-4xl text-center text-[11px] text-muted-foreground",
} as const;

type Props = {
  sessionToken: string;
  connections?: ReactNode;
  footer?: ReactNode;
};

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

const WELCOME =
  "I can help you manage your calendar, find available time, create meetings, and reschedule events.";

const SUGGESTIONS = [
  {
    label: "What's on my calendar today?",
    icon: CalendarDays,
  },
  {
    label: "Find a free slot tomorrow morning",
    icon: Clock3,
  },
  {
    label: "Create a 30-minute meeting tomorrow at 10 AM",
    icon: Plus,
  },
  {
    label: "Help me reschedule my next meeting",
    icon: Clock3,
  },
];

function WelcomeMessage(): Message {
  return {
    id: "welcome",
    role: "assistant",
    content: WELCOME,
  };
}

function ChatPanel({ sessionToken, connections, footer }: Props) {
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([WelcomeMessage()]);
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const showEmpty =
    messages.length === 1 && messages[0]?.id === "welcome" && !running;

  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshThreads = useCallback(async () => {
    try {
      const data = await listThreads(sessionToken);
      setThreads(data.threads);
    } catch {}
  }, [sessionToken]);

  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, progress]);

  function startNewChat() {
    if (running) return;

    setThreadId(crypto.randomUUID());
    setMessages([WelcomeMessage()]);
    setPrompt("");
    setProgress(null);
  }

  async function resumeThread(nextThreadId: string) {
    if (running || loadingThread || nextThreadId === threadId) return;

    setLoadingThread(true);
    setProgress(null);

    try {
      const data = await loadThread(sessionToken, nextThreadId);

      setThreadId(data.threadId);
      setMessages(
        data.messages.length > 0 ? data.messages : [WelcomeMessage()],
      );
      setPrompt("");
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: "Could not load the chat.",
        },
      ]);
    } finally {
      setLoadingThread(false);
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();

    if (!trimmed || running || loadingThread) return;

    const assistantId = crypto.randomUUID();

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
      },
    ]);

    setPrompt("");
    setRunning(true);
    setProgress(null);

    try {
      await streamAgentChat(
        sessionToken,
        {
          message: trimmed,
          threadId,
        },
        (event) => {
          if (event.type === "progress" && event.message) {
            setProgress(event.message);
          }

          if (event.type === "token" && event.token) {
            setProgress(null);

            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? {
                      ...message,
                      content: message.content + event.token,
                    }
                  : message,
              ),
            );
          }

          if (event.type === "error") {
            setProgress(null);

            setMessages((current) =>
              current.map((message) =>
                message.id === assistantId
                  ? {
                      ...message,
                      content: event.message ?? "Agent failed",
                    }
                  : message,
              ),
            );
          }
        },
      );

      refreshThreads();
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "system",
          content: "Could not reach the agent API.",
        },
      ]);
    } finally {
      setRunning(false);
      setProgress(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    sendMessage(prompt);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(prompt);
    }
  }

  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <aside className={styles.aside}>
        <div className={styles.brandRow}>
          <div className={styles.brandLeft}>
            <div className={styles.brandIcon}>
              <Sparkles className={styles.brandIconSvg} />
            </div>

            <div className={styles.brandText}>
              <p className={styles.brandTitle}>MeetFlow</p>
              <p className={styles.brandSubtitle}>AI calendar assistant</p>
            </div>
          </div>
        </div>

        <div className={styles.topActions}>
          <Button
            onClick={startNewChat}
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
                      onClick={() => resumeThread(thread.id)}
                      className={cn(
                        styles.threadBtn,
                        active ? styles.threadBtnActive : styles.threadBtnIdle,
                      )}
                    >
                      <span className={styles.threadTitle}>{thread.title}</span>

                      <span className={styles.threadTime}>
                        {thread.updatedAt}
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
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <CalendarDays className={styles.headerIconSvg} />
            </div>

            <div className={styles.headerText}>
              <p className={styles.headerTitle}>Calendar Assistant</p>

              <p className={styles.headerSubtitle}>
                Schedule, reschedule, and plan your day
              </p>
            </div>
          </div>

          <div className={styles.headerStatus}>
            <span className={styles.statusDot} />
            AI Assistant
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

                  <p className={styles.emptyEyebrow}>MeetFlow Assistant</p>

                  <h2 className={styles.emptyTitle}>
                    Your calendar, managed by AI.
                  </h2>

                  <p className={styles.emptyCopy}>{WELCOME}</p>

                  <div className={styles.suggestions}>
                    {SUGGESTIONS.map(({ label, icon: Icon }) => (
                      <Button
                        key={label}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => sendMessage(label)}
                        className={styles.suggestionBtn}
                        disabled={running || loadingThread}
                      >
                        <Icon className={styles.suggestionIcon} />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.messageList}>
                  {loadingThread ? (
                    <div className={styles.statusRow}>
                      <LoaderCircle className={styles.statusIcon} />
                      Loading conversation...
                    </div>
                  ) : (
                    messages.map((message) => {
                      if (message.id === "welcome" && messages.length > 1) {
                        return null;
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
                              message.role === "assistant" &&
                                styles.bubbleAssistant,
                              message.role === "system" && styles.bubbleSystem,
                            )}
                          >
                            {!message.content && running ? (
                              <span className={styles.thinking}>
                                <LoaderCircle className={styles.statusIconSm} />
                                Thinking...
                              </span>
                            ) : message.role === "user" ? (
                              <p className={styles.userText}>
                                {message.content}
                              </p>
                            ) : (
                              <MarkdownMessage
                                content={message.content}
                                tone={
                                  message.role === "system"
                                    ? "system"
                                    : "assistant"
                                }
                              />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {progress ? (
                    <div className={styles.statusRow}>
                      <LoaderCircle className={styles.statusIconSm} />
                      {progress}
                    </div>
                  ) : null}

                  <div ref={bottomRef} />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Composer */}
          <div className={styles.composerWrap}>
            <form onSubmit={onSubmit} className={styles.composerForm}>
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
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

export default ChatPanel;
