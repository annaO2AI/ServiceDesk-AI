"use client";
import { useEffect, useState, useRef } from "react";
import { SendIcon, AIsearchIcon } from "./icons";
import { useAISearch } from "../../context/AISearchContext";
import { fetchWithAuth } from "../../utils/axios";
import { API_ROUTES } from "../../constants/api";
import { decodeJWT } from "../../utils/decodeJWT";
import FollowUpQuestions from "./FollowUpQuestions";
import WelcomeMessage from "./WelcomeMessage";
import ChatMessages from "./ChatMessages";

export default function HumanResources({ onSend }: { onSend: () => void }) {
  const [username, setUsername] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const {
    query,
    setQuery,
    isLoading,
    setIsLoading,
    setConversationId,
    setMessages,
    messages,
    conversationId,
  } = useAISearch();

  useEffect(() => {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const token = cookies
      .find((c) => c.startsWith("access_token="))
      ?.split("=")[1];

    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.name) {
        setUsername(decoded.name);
      }
    }
  }, []);

  useEffect(() => {
    const fetchConversationId = async () => {
      try {
        const res = await fetchWithAuth(API_ROUTES.hrconversations, {
          method: "POST",
        });
        const data = await res.json();
        if (data?.conversation_id) {
          setConversationId(data.conversation_id);
        }
      } catch (err) {
        console.error("Failed to fetch conversation ID:", err);
      }
    };

    fetchConversationId();
  }, [setConversationId]);

  // Extract only the response field
  function extractLastResponse(data: any): any {
    return data.response || "No response received.";
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      setTimeout(() => {
        chatContainerRef.current!.scrollTo({
          top: chatContainerRef.current!.scrollHeight,
          behavior: "smooth",
        });
      }, 0);
    }
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!query?.trim()) return;

    setIsLoading(true);

    if (query?.trim()) {
      setMessages((prev) => [...(prev || []), { sender: "user", content: query }]);
    }

    setMessages((prev) => [...(prev || []), { sender: "ai", content: "Thinking...", isLoading: true }]);

    setQuery("");

    try {
      const res = await fetchWithAuth(API_ROUTES.hrask, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          query: query,
        }),
      });

      const data = await res.json();
      const extracted = extractLastResponse(data);

      // Update messages with only the latest response, exclude conversation_history
      setMessages((prev) =>
        (prev || []).filter((msg) => !msg.isLoading).concat([
          {
            sender: "ai",
            content: extracted,
            followup_questions: data.followup_questions || [],
          },
        ])
      );

      // Update conversation_id if a new one is provided
      if (data?.conversation_id) {
        setConversationId(data.conversation_id);
      }
    } catch (err) {
      console.error("Error during ask:", err);
      setMessages((prev) =>
        (prev || []).filter((msg) => !msg.isLoading).concat([
          { sender: "ai", content: "Something went wrong." },
        ])
      );
    }

    setIsLoading(false);

    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  function getInitials(name: string | null): string {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const initials = getInitials(username);

  const latestAIMessage = messages
    .slice()
    .reverse()
    .find((msg) => msg.sender === "ai" && !msg.isLoading);

  return (
    <div id="chat-box-main" ref={chatContainerRef} className="flex flex-col minarea-max-hright">
      <div
        className={
          messages.length === 0
            ? "o2AlignSearch-center"
            : "o2AlignSearch-center o2AlignSearchm1-center"
        }
      >
        <div className="flex flex-col gap-3 text-left mt-auto text-xs subtitle w-full max-w-7xl m-auto">
          {messages.length === 0 && <WelcomeMessage username={username} />}
          <div className="flex flex-col h-full">
            <ChatMessages messages={messages} initials={initials} />
            {latestAIMessage && (
              <FollowUpQuestions
                followupQuestions={latestAIMessage.followup_questions || []}
                isLoading={isLoading}
                setQuery={setQuery}
                sendMessage={sendMessage}
                inputRef={inputRef}
              />
            )}
          </div>
          <div className="text-base bottom-0 sticky">
            <div
              className={`flex flex-col w-full w-[100%] px-4 p-2 rounded-xl bg-white border-o2 aisearchinput ${
                isInputFocused ? "aisearchinput-focused" : ""
              }`}
            >
              <div className="flex-1 text-gray-400 flex items-center space-x-2">
                <AIsearchIcon width={36} />
                <input
                  type="text"
                  placeholder="Type your messages here..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  disabled={isLoading}
                  className={`w-full outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  ref={inputRef}
                />
                <button
                  disabled={isLoading}
                  onClick={sendMessage}
                  className={`bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 py-2 rounded-full flex items-center gap-1 text-sm cursor-pointer ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Processing..." : "Send"} <SendIcon width={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}