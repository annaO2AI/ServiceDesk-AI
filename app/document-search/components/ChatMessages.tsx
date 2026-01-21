// ChatMessages.tsx
import React from "react";
import { LoganimationsIcon, DOCIcon, PDFIcon, LogIcon } from "./icons";

interface Message {
  sender: "user" | "ai";
  content: string;
  isLoading?: boolean;
  fileType?: string;
  followup_questions?: string[];
}

interface ChatMessagesProps {
  messages: Message[];
  initials: string;
}

export default function ChatMessages({ messages, initials }: ChatMessagesProps) {
  // Function to format markdown content
  const formatMessageContent = (content: string) => {
    let formattedContent = content;

    // Handle JSON-parsed content
    try {
      const parsed = JSON.parse(content);
      if (parsed.response) {
        formattedContent = parsed.response;
      }
    } catch (error) {
      // Treat as raw markdown if not JSON
    }

    // Remove triple backticks and their language identifier (e.g., ```markdown
    formattedContent = formattedContent.replace(/```(?:markdown)?[\s\S]*?```/g, '');

    // Remove <pre> and <code> tags but preserve their inner content
    formattedContent = formattedContent.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g, '$1');
    formattedContent = formattedContent.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/g, '$1');

    // Trim any leading/trailing whitespace or newlines
    formattedContent = formattedContent.trim();

    // Remove --- separators
    formattedContent = formattedContent.replace(/---/g, '');

    // Convert markdown to HTML with Tailwind CSS styling
    return formattedContent
      .replace(/#+/g, '')
      .replace(/Protection of PHI under the Agreement/g, '<h3 class="text-xl font-semibold my-4 text-gray-900">Protection of PHI under the Agreement</h3>')
      .replace(/1\. Prohibited Uses and Disclosures/g, '<h4 class="text-lg font-semibold my-3 text-gray-900">1. Prohibited Uses and Disclosures</h4>')
      .replace(/2\. Reporting of Unauthorized Use\/Disclosure/g, '<h4 class="text-lg font-semibold my-3 text-gray-900">2. Reporting of Unauthorized Use/Disclosure</h4>')
      .replace(/3\. Mitigation of Harmful Effects/g, '<h4 class="text-lg font-semibold my-3 text-gray-900">3. Mitigation of Harmful Effects</h4>')
      .replace(/\*\*([^\*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/^(\d+\.\s+)(.+)$/gm, '<li class="my-1">$1$2</li>')
      .replace(/(<li class="my-1">\d+\.\s+.+<\/li>(\n<li class="my-1">\d+\.\s+.+<\/li>)*)/g, '<ol class=" my-1 mt-4">$1</ol>')
      .replace(/^\s*-\s+(.+)/gm, '<li class="my-1">$1</li>')
      .replace(/(<li class="my-1">.+<\/li>(\n<li class="my-1">.+<\/li>)*)/g, '<ul class=" my-1">$1</ul>')
      .replace(/\*\*Sources:\*\*/g, '<strong class="block my-4 font-semibold">Sources:</strong>')
      .replace(/\((\w+(,\s*\w+)*)\)/g, '<span class="text-gray-600 italic ml-1">($1)</span>');
  };

  return (
    <div id="chat-box" className="flex-1 overflow-y-auto px-0 py-2 space-y-2">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${
            msg.sender === "user" ? "justify-end gap-2" : "justify-start gap-2"
          }`}
        >
          {msg.sender === "user" && !msg.isLoading ? (
            <div>
              {initials && (
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-normal text-xs">
                  {initials}
                </div>
              )}
            </div>
          ) : msg.sender === "ai" && !msg.isLoading ? (
            <LogIcon width={36} height={36} />
          ) : (
            <div></div>
          )}
          <div
            className={`max-w-[70%] rounded-xl text-sm ${
              msg.sender === "user"
                ? "bg-white font-bold border-o3 px-4 py-3 boxshadow rounded-br-none"
                : msg.isLoading
                ? "p-0"
                : "bg-white text-gray-800 rounded-bl-none border-o3 p-5"
            }`}
          >
            {msg.isLoading ? (
              <div className="flex items-center gap-2">
                <LoganimationsIcon width={40} height={40} />
              </div>
            ) : msg.sender === "user" && msg.content?.startsWith("📎") && msg.fileType ? (
              <div className="flex items-center gap-2">
                {msg.fileType === "pdf" ? <PDFIcon width={20} /> : null}
                {msg.fileType === "doc" || msg.fileType === "docx" ? (
                  <DOCIcon width={20} />
                ) : null}
                <span>{msg.content.replace("📎 ", "")}</span>
              </div>
            ) : (
              <div
                className="font-sans break-words m-0 leading-5 procruement-search-chat"
                dangerouslySetInnerHTML={{
                  __html: formatMessageContent(msg.content),
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}