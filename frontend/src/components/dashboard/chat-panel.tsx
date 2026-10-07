"use client";

import {
  FormEvent,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  listThreads,
  loadThread,
  streamAgentChat,
  ThreadSummary,
} from "@/lib/agent";

import { ChatPanelUI, Message } from "./chat-panel-ui";

type Props = {
  sessionToken: string;
  connections?: ReactNode;
  footer?: ReactNode;
};

const WELCOME =
  "I can help you manage your calendar, find available time, create meetings, and reschedule events.";

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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
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
    <ChatPanelUI
      connections={connections}
      footer={footer}
      messages={messages}
      threads={threads}
      threadId={threadId}
      prompt={prompt}
      running={running}
      loadingThread={loadingThread}
      progress={progress}
      showEmpty={showEmpty}
      bottomRef={bottomRef}
      onNewChat={startNewChat}
      onResumeThread={resumeThread}
      onSendMessage={sendMessage}
      onSubmit={onSubmit}
      onKeyDown={onKeyDown}
      onPromptChange={setPrompt}
    />
  );
}

export default ChatPanel;