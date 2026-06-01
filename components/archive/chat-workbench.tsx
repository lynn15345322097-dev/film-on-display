/* eslint-disable @next/next/no-img-element */

"use client";

import {
  ArrowUp,
  Bot,
  Clock3,
  Database,
  Layers,
  LocateFixed,
  Plus,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { archiveImages } from "./data";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

type WorkbenchContext = {
  stats: {
    museums: number;
    photos: number;
    exhibitions: number;
    visited: number;
    provinces: number;
    cities: number;
  };
  featuredMuseum?: {
    id: string;
    name: string;
    province: string;
    city: string;
    address: string;
    description: string;
  };
  topProvinces: { label: string; count: number }[];
  photoCategories: { label: string; count: number }[];
  routeTitles: string[];
};

const STORAGE_KEY = "film-on-display-chat";

const starterMessages: ChatMessage[] = [
  {
    id: "system-1",
    role: "assistant",
    content:
      "研究助手已连接。现在可以围绕已导入的电影展示空间、GIS 分布、图像元数据与研究展线提问；回复调用 DeepSeek，聊天记录只保存在当前浏览器。",
    timestamp: "Archive.GIS.v2.4",
  },
];

const prompts = [
  "总结北京电影展示空间的样本特点",
  "比较制片厂旧址和电影资料馆的展陈逻辑",
  "列出图像元数据里主要的对象类型",
  "帮我设计一条上海附近的田野路线",
];

export function ChatWorkbench({ context }: { context: WorkbenchContext }) {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    panelRef.current?.scrollTo({ top: panelRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const archiveCount = useMemo(
    () => messages.filter((message) => message.role === "assistant").length,
    [messages],
  );

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isThinking) return;

    const now = new Date();
    const userMessage: ChatMessage = {
      id: `user-${now.getTime()}`,
      role: "user",
      content: text,
      timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsThinking(true);

    void (async () => {
      const replyTime = new Date();
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: nextMessages.map(({ role, content }) => ({ role, content })),
          }),
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "DeepSeek request failed.");
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${replyTime.getTime()}`,
          role: "assistant",
          content: result.message,
          timestamp: replyTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((current) => [...current, assistantMessage]);
      } catch (error) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${replyTime.getTime()}`,
          role: "assistant",
          content:
            error instanceof Error
              ? `DeepSeek API error: ${error.message}`
              : "DeepSeek API error: request failed.",
          timestamp: replyTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((current) => [...current, assistantMessage]);
      } finally {
        setIsThinking(false);
      }
    })();
  };

  const resetChat = () => {
    setMessages(starterMessages);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="archive-workbench">
      <section className="archive-map-panel">
        <div className="archive-map-grid" />
        <img alt="Digital GIS map of China" src={archiveImages.map} />
        <div className="archive-map-stats">
          <article>
            <span>SPACES</span>
            <b>{context.stats.museums}</b>
          </article>
          <article>
            <span>PHOTOS</span>
            <b>{context.stats.photos}</b>
          </article>
          <article>
            <span>VISITED</span>
            <b>{context.stats.visited}</b>
          </article>
        </div>
        <div className="archive-map-toolbar">
          <button title="GIS View" type="button">
            <Layers size={20} />
          </button>
          <button title="Temporal Layer" type="button">
            <Clock3 size={20} />
          </button>
          <button title="Zoom In" type="button">
            <Plus size={20} />
          </button>
          <button title="Locate" type="button">
            <LocateFixed size={20} />
          </button>
        </div>
        <button className="archive-map-pin" type="button">
          <span />
          <strong>{context.topProvinces[0]?.label ?? "北京"} ({context.topProvinces[0]?.count ?? 0} SITES)</strong>
        </button>
        <div className="archive-map-card">
          <img alt="China Film Museum facade" src={archiveImages.museum} />
          <div>
            <span>FEATURED SITE</span>
            <small>ID: {context.featuredMuseum?.id ?? "cn-film-museum"}</small>
            <h2>{context.featuredMuseum?.name ?? "中国电影博物馆"}</h2>
            <p>{context.featuredMuseum?.address ?? "北京市朝阳区南影路9号"}</p>
            <div>
              <Database size={15} />
              <b>{context.stats.photos} Photo Metadata Records</b>
            </div>
          </div>
        </div>
      </section>

      <section className="archive-chat-panel">
        <div className="archive-chat-header">
          <div>
            <span>CHAT WORKTABLE</span>
            <h1>Research Assistant</h1>
          </div>
          <button onClick={resetChat} type="button">
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        <div className="archive-prompt-strip">
          {prompts.map((prompt) => (
            <button key={prompt} onClick={() => setInput(prompt)} type="button">
              {prompt}
            </button>
          ))}
        </div>

        <div className="archive-message-list" ref={panelRef}>
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <article className={isUser ? "user" : "assistant"} key={message.id}>
                <div className="archive-message-icon">
                  {isUser ? <UserRound size={16} /> : <Bot size={16} />}
                </div>
                <div className="archive-message-bubble">
                  <p>{message.content}</p>
                  <span>{message.timestamp}</span>
                </div>
              </article>
            );
          })}
          {isThinking && (
            <article className="assistant">
              <div className="archive-message-icon">
                <Bot size={16} />
              </div>
              <div className="archive-message-bubble thinking">
                <p>Calling DeepSeek deepseek-v4-pro...</p>
              </div>
            </article>
          )}
        </div>

        <form className="archive-chat-form" onSubmit={submitMessage}>
          <textarea
            aria-label="Archive assistant prompt"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about spatial records, photo metadata, or technology classifications..."
            value={input}
          />
          <button disabled={!input.trim() || isThinking} type="submit">
            <ArrowUp size={18} />
          </button>
        </form>
        <p className="archive-local-note">
          {archiveCount} assistant notes saved in browser localStorage. DeepSeek replies are not stored
          in Supabase.
        </p>
      </section>
    </div>
  );
}
