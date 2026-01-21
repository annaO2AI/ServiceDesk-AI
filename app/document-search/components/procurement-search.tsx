"use client";
import { useEffect, useState, useRef } from "react";
import {
  LoganimationsIcon,
  SendIcon,
  AttachemntIcon,
  AIsearchIcon,
  DOCIcon,
  PDFIcon,
  LogIcon,
  StopIcon
} from "./icons";
import { useAISearch } from "../../context/AISearchContext";
import { fetchWithAuth } from "@/app/utils/axios";
import { API_ROUTES } from "../../constants/api";
import { decodeJWT } from "@/app/utils/decodeJWT";
import FollowUpQuestions from "./FollowUpQuestions";
import WelcomeMessage from "./WelcomeMessage";
import ChatMessages from "./ChatMessages";
import { marked } from "marked";

interface FileData {
  file: File;
  name: string;
  type: string;
}



function parseAndFormatResponse(response: string) {
  try {
    const parsed = JSON.parse(response);
    if (parsed.response) {
      return marked.parse(parsed.response);
    }
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
      return formatResumeData(parsed);
    }
    if (typeof parsed === "object" && parsed.message) {
      return marked.parse(parsed.message);
    }
    return marked.parse(response);
  } catch (error) {
    console.error("Error parsing response:", error, response);
    return response;
  }
}

type ResumeData = {
  name: string;
  content?: string;
  resume_url?: string;
};

function formatResumeData(resumeArray: ResumeData[]) {
  return resumeArray
    .map((resume: ResumeData) => {
      let formatted = `**${resume.name}**\n\n`;
      if (resume.content) {
        formatted += `**Summary:**\n${resume.content}\n\n`;
      }
      if (resume.resume_url) {
        formatted += `**Resume:** <a href="${resume.resume_url}" target="_blank" style="color: #007bff; text-decoration: underline; rel="noopener noreferrer">View Resume</a>\n`;
      }
      return formatted;
    })
    .join("\n---\n\n");
}

export default function ProcurementSearch({ onSend }: { onSend: () => void }) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  const {
    query,
    setQuery,
    isLoading,
    setIsLoading,
    setConversationId,
    setMessages,
    messages,
    conversationId,
    setConversationHistory,
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

  const sendQuery = async (formData: FormData) => {
    abortControllerRef.current = new AbortController();
    try {
      const res = await fetchWithAuth(API_ROUTES.querySow, {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API request failed with status ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setSelectedFiles([]);
        setIsLoading(false);
        setMessages((prev) =>
          (prev || []).filter((msg) => !msg.isLoading).concat([
            { sender: "ai", content: "The request was aborted." },
          ])
        );
      }
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!query?.trim() && selectedFiles.length === 0) return;

    setIsLoading(true);
    setIsSkipped(false);
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append("query", query || "");
      formData.append("temperature", "0.7");
       if (conversationId) {
      formData.append('conversation_id', conversationId);
    }

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((fileData) => {
          formData.append("files", fileData.file, fileData.name);
        });
      }

      if (query?.trim()) {
        setMessages((prev) => [...(prev || []), { sender: "user", content: query }]);
      }

      setMessages((prev) => [...(prev || []), { sender: "ai", content: "Thinking...", isLoading: true }]);
      setQuery("");

      if (selectedFiles.length > 0) {
        selectedFiles.forEach((fileData) => {
          setMessages((prev) =>
            (prev || []).filter((msg) => !msg.isLoading).concat([
              {
                sender: "user",
                content: `📎 ${fileData.name}`,
                fileType: fileData.type,
              },
            ])
          );
        });
      }

      const data = await sendQuery(formData);
      if (data) {
        setConversationId(data?.conversation_id)
        const formattedResponse = parseAndFormatResponse(JSON.stringify(data));
        if (formattedResponse instanceof Promise) {
          formattedResponse.then((resolvedContent) => {
            setMessages((prev) =>
              (prev || []).filter((msg) => !msg.isLoading).concat([
                {
                  sender: "ai",
                  content: resolvedContent,
                  followup_questions: data.followup_questions || [],
                },
              ])
            );
            setConversationHistory(data?.conversation_history);
          });
        } else {
          setMessages((prev) =>
            (prev || []).filter((msg) => !msg.isLoading).concat([
              {
                sender: "ai",
                content: formattedResponse,
                followup_questions: data.followup_questions || [],
              },
            ])
          );
          setConversationHistory(data?.conversation_history);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setMessages((prev) =>
          (prev || []).filter((msg) => !msg.isLoading).concat([
            { sender: "ai", content: "The request was aborted." },
          ])
        );
      } else {
        setMessages((prev) =>
          (prev || []).filter((msg) => !msg.isLoading).concat([
            {
              sender: "ai",
              content: `Error: ${err instanceof Error ? err.message : "Something went wrong."}`,
            },
          ])
        );
      }
    } finally {
      setSelectedFiles([]);
      setIsLoading(false);
      if (inputRef.current && !isLoading) {
        inputRef.current.focus();
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length > 0) {
      const newFiles: FileData[] = files.map((file) => ({
        file,
        name: file.name,
        type: file.name.split(".").pop()?.toLowerCase() || "",
      }));
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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

  const handleLoadingState = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsSkipped(true);
    setIsLoading(false);
  };

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
                sendMessage={handleSendMessage}
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
              {!isLoading && selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((fileData, index) => (
                    <div
                      key={index}
                      className="flex flex-row items-center rounded-md border border-solid border-gray-200 p-3 bg-white gap-3 relative"
                    >
                      {fileData.type === "doc" || fileData.type === "docx" ? (
                        <DOCIcon width={26} />
                      ) : fileData.type === "pdf" ? (
                        <PDFIcon width={24} />
                      ) : null}
                      <p className="text-sm text-gray-600">{fileData.name}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex-1 text-gray-400 flex items-center space-x-2 mb-2">
                <AIsearchIcon width={36} />
                <input
                  type="text"
                  placeholder="Type your messages here..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  disabled={isLoading}
                  className={`w-full outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  ref={inputRef}
                />
              </div>
              <div className="flex flex-row w-full justify-between mb-2">
                <div>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 text-white rounded">
                    <AttachemntIcon width={15} />
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".doc,.docx,.pdf"
                      multiple
                      ref={fileInputRef}
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  {isLoading ? (
                    <button
                      className=" flex items-center gap-1 text-sm cursor-pointer"
                      onClick={handleLoadingState}
                    >
                      <StopIcon width={20} />
                    </button>
                  ) : (
                    <button
                      disabled={isLoading}
                      onClick={handleSendMessage}
                      className={`bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 py-2 rounded-full flex items-center gap-1 text-sm cursor-pointer ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      Send <SendIcon width={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
