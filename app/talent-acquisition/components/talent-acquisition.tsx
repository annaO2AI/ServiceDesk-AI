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
import WelcomeMessage from "./WelcomeMessage"; // Import the new component
import ChatMessages from "./ChatMessages";

interface FileData {
  file: File;
  name: string;
  type: string;
}

function generateSessionToken(): string {
  const now = new Date();
  // Format: YYYYMMDD-HHMMSS-milliseconds-random
  const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
  const datePart = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate())
  ].join("");
  const timePart = [
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join("");
  const msPart = pad(now.getMilliseconds(), 3);
  const randPart = Math.random().toString(36).slice(2, 8);
  return `${datePart}-${timePart}-${msPart}-${randPart}`;
}

function parseAndFormatResponse(response: string) {
  try {
    const parsed = JSON.parse(response);

    // Case 1: Resume data (array of objects with name fields)
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
      return formatResumeData(parsed);
    }

    // Case 2: Message object
    if (typeof parsed === 'object' && parsed.message) {
      return parsed.message;
    }

    return response;
  } catch (error) {
    return response;
  }
}


// Function to format resume data into readable format
type ResumeData = {
  name: string;
  content?: string;
  resume_url?: string;
};

function formatResumeData(resumeArray: ResumeData[]) {
  return resumeArray.map((resume: ResumeData) => {
    let formatted = `**${resume.name}**\n\n`;

    if (resume.content) {
      formatted += `**Summary:**\n${resume.content}\n\n`;
    }

// if (resume.resume_url?.startsWith('http')) {
//   formatted += `**Resume:** <a href="${resume.resume_url}" target="_blank" style="color: #007bff; text-decoration: underline; rel="noopener noreferrer">View Resume</a>\n`;
// } else {
//   formatted += `**Resume:** Not provided\n`;
// }
    return formatted;
  }).join('\n---\n\n');
}

export default function Aisearch({ onSend }: { onSend: () => void }) {
   const abortControllerRef = useRef<AbortController | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
 const [isSkipped, setIsSkipped] = useState(false);
 const [uploadFileCount, setUploadFileCount] = useState(0);
 
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
    const fetchConversationId = async () => {
      try {
        const res = await fetchWithAuth(API_ROUTES.conversations, {
          method: "POST",
        });
        const data = await res.json();
        if (data?.conversation_id) {
          setConversationId(data?.conversation_id);
        }
      } catch (err) {
        console.error("Failed to fetch conversation ID:", err);
      }
    };

    fetchConversationId();
  }, [setConversationId]);

  function extractLastResponse(response: string): string {
    if (!response?.trim()) return response;

    // Check if response contains numbered items (1. 2. 3. etc)
    const numberedItems = response.match(/^\d+\.\s+.+/gm);
    if (numberedItems && numberedItems.length > 0) {
      return numberedItems.join('\n');
    }

    // Check for markdown-style numbered items (### 1. etc)
    const markdownNumbered = response.match(/###\s+\d+\.\s+.+/g);
    if (markdownNumbered && markdownNumbered.length > 0) {
      return markdownNumbered.map(item => 
        item.replace(/^###\s+/, '')
      ).join('\n');
    }

    // Return full response if no patterns matched
    return response;
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
}, [messages, isLoading]); // Added isLoading to dependencies


// Function to handle file upload progress
const uploadFile = async (file: FileData[], sessionId:string, id:number) => {
  const formData = new FormData();
    // Create a new AbortController for this request
  abortControllerRef.current = new AbortController();
  try{
     file.forEach((fileData) => {
          formData.append(`file`, fileData.file);
        });
        formData.append(`session_id`, sessionId);
         const uploadRes = await fetchWithAuth(API_ROUTES.upload, {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current.signal,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");
        setUploadFileCount(id)
  }catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      setSelectedFiles([]);
      setIsLoading(false);
      setMessages((prev) =>
          (prev || []).filter((msg) => !msg.isLoading).concat([
            { sender: "ai", content: "The request was aborted." },
          ]))
      }
  }
}


// function to fetch ask api information
const fetchAskApi = async () => {
   // Create a new AbortController for this request
  abortControllerRef.current = new AbortController();
try{
      const res = await fetchWithAuth(API_ROUTES.ask, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          query: query,
        }),
         signal: abortControllerRef.current.signal,
      });

      const data = await res.json();
     return data
  }catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      setSelectedFiles([]);
   setIsLoading(false);
   setMessages((prev) =>
          (prev || []).filter((msg) => !msg.isLoading).concat([
            { sender: "ai", content: "The request was aborted." },
          ]))


    }
}}

//handle multiple file uploads
  const handleMultipleUpload = async () => {
     // Create a new AbortController for this request
  abortControllerRef.current = new AbortController();
  if (!query?.trim() && selectedFiles.length === 0) return;
setIsLoading(true);
  if (query?.trim()) {
 setMessages((prev) => [...(prev || []), { sender: "user", content: query }]);
}

setMessages((prev) => [...(prev || []), { sender: "ai", content: "Thinking...", isLoading: true }]);

setQuery("");
    try{    
    if (selectedFiles.length === 0) {
  const data = await fetchAskApi();
  if(data){
    // Parse and format the response
    const formattedResponse = parseAndFormatResponse(data?.response || "");
    
    setMessages((prev) =>
        (prev || []).filter((msg) => !msg.isLoading).concat([
          {
          sender: "ai",
           content: formattedResponse,
          followup_questions: data.followup_questions || [],
          },
        ]))
        setConversationHistory(data?.conversation_history);
      
  }
    }else{
       const sessionId = generateSessionToken();
  
    for (let i = 0; i < selectedFiles.length; i++) {
      // Check if the request was aborted before uploading the next file
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }
    await uploadFile([selectedFiles[i]], sessionId, i + 1);
  }
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

         if (!query.trim() && selectedFiles.length === 0) {
        setIsLoading(false);
        setSelectedFiles([]);
        setMessages((prev) => (prev || []).filter((msg) => !msg.isLoading));
        return;
      }
  // After all uploads are done, call the next API here  
  if (abortControllerRef.current?.signal.aborted) {
    setIsLoading(false);
    setMessages((prev) =>
      (prev || []).filter((msg) => !msg.isLoading).concat([
        { sender: "ai", content: "The request was aborted." },
      ])
    );
    return;
  }
  const data = await fetchAskApi();
  if(data){
    // Parse and format the response
    const formattedResponse = parseAndFormatResponse(data?.response || "");
    
    setMessages((prev) =>
        (prev || []).filter((msg) => !msg.isLoading).concat([
          {
          sender: "ai",
           content: formattedResponse,
          followup_questions: data.followup_questions || [],
          },
        ]))
        setConversationHistory(data?.conversation_history);
      
  }
}
setSelectedFiles([]);
   setIsLoading(false);

 if (inputRef.current && !isLoading) {
     inputRef.current.focus();
 }
   
 
  }catch(error) {
    }
    finally{
      setSelectedFiles([]);
   setIsLoading(false);

 if (inputRef.current && !isLoading) {
     inputRef.current.focus();
 }
    }
  }

// This function handles sending the user's query and selected files to the backend
  const sendMessage = async () => {
    if (!query?.trim() && selectedFiles.length === 0) return;

    setIsLoading(true);
    setIsSkipped(false);
 // Create a new AbortController for this request
  abortControllerRef.current = new AbortController();

    if (query?.trim()) {
      setMessages((prev) => [...(prev || []), { sender: "user", content: query }]);
    }

    setMessages((prev) => [...(prev || []), { sender: "ai", content: "Thinking...", isLoading: true }]);

    setQuery("");

    try {
      // Upload multiple files if any are selected
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        const sessionId = generateSessionToken();
        
        // Add all selected files to FormData
        selectedFiles.forEach((fileData) => {
          formData.append(`file`, fileData.file);
        });
        formData.append(`session_id`, sessionId);

        const uploadRes = await fetchWithAuth(API_ROUTES.upload, {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current.signal,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");

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

      if (!query.trim() && selectedFiles.length === 0) {
        setIsLoading(false);
        setSelectedFiles([]);
        setMessages((prev) => (prev || []).filter((msg) => !msg.isLoading));
        return;
      }

      const res = await fetchWithAuth(API_ROUTES.ask, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          query: query,
          files: selectedFiles.map(f => ({
            name: f.name,
            type: f.type
          }))
        }),
        signal: abortControllerRef.current.signal,
      });

      const data = await res.json();
      const extracted = extractLastResponse(data?.response || "")
      
      // Parse and format the response
      const formattedResponse = parseAndFormatResponse(data?.response || "");
       
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
    } catch (err) {
     if( err instanceof Error && err.name === "AbortError") {
         setMessages((prev) =>
          (prev || []).filter((msg) => !msg.isLoading).concat([
            { sender: "ai", content: "The request was aborted." },
          ])
        );
      }else{

      setMessages((prev) =>
        (prev || []).filter((msg) => !msg.isLoading).concat([
          { sender: "ai", content: "Something went wrong." },
        ])
      );
      }
    }

      setSelectedFiles([]);
      setIsLoading(false);

    if (inputRef.current && !isLoading) {
        inputRef.current.focus();
    }
  };

  // This function handles file selection and updates the selectedFiles state
  const handleFileChange = (e: any) => {
    const files = Array.from(e.target.files) as File[];
    
    if (files.length > 0) {
      const newFiles: FileData[] = files.map(file => ({
        file,
        name: file.name,
        type: file.name.split(".").pop()?.toLowerCase() || ""
      }));
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Function to get initials from the username
  // This function extracts the first letter of the first and last name
  function getInitials(name: string | null): string {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  const initials = getInitials(username);

  // Get the latest AI message for follow-up questions
  const latestAIMessage = messages
    .slice()
    .reverse()
    .find((msg) => msg.sender === "ai" && !msg.isLoading);

        const handleLoadingState = (idx: number) => {
       

           // Abort the ongoing request if it exists
           if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }

            setIsSkipped(true)
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
          <ChatMessages messages={messages} initials={initials} handleLoadingState={handleLoadingState}/>
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
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((fileData, index) => (
                    <div
                      key={index}
                      className="flex flex-row items-center rounded-md border border-solid border-gray-200 p-3 bg-white gap-3 relative"
                    >
                      {fileData.type === "doc" || fileData.type === "docx" ? (
                        <DOCIcon width={26} />
                      ) : null}
                      {fileData.type === "pdf" ? <PDFIcon width={24} /> : null}
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
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
                    />
                  </label>
                </div>
                {/* <button
                  disabled={isLoading}
                  onClick={() => {
                     abortControllerRef.current = null;
                     handleMultipleUpload()}}
                  // onClick={sendMessage}
                  className={`bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 py-2 rounded-full flex items-center gap-1 text-sm cursor-pointer ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Processing..." : "Send"} <SendIcon width={20} />
                </button> */}
                <div className="flex gap-2">
                  {isLoading ? (
                    <button
                      className=" flex items-center gap-1 text-sm cursor-pointer"
                      onClick={() => handleLoadingState(0)}
                    >
                      <StopIcon width={20} />
                    </button>
                  ) : (
                    <button
                      disabled={isLoading}
                      onClick={() => {
                     abortControllerRef.current = null;
                     handleMultipleUpload()}}
                      className={`bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-6 py-2 rounded-full flex items-center gap-1 text-sm cursor-pointer ${isLoading ? "opacity-50 cursor-not-allowed" : ""
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
