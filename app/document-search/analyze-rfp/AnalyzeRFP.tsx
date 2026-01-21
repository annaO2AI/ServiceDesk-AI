"use client"
import { useState } from "react"

interface ComparisonResult {
  ok: boolean
  comparison_table: Array<{
    title: string
    left_doc: string
    right_doc: string
    columns: string[]
    rows: Array<{
      section: string
      left: string
      right: string
    }>
  }>
}

interface SummarizeResult {
  ok: boolean
  filename: string
  doc_type: string
  executive_summary: string
  sections: Array<{
    title: string
    summary: string
  }>
  docx_download_url?: string
}

interface FileMetadata {
  path: string
  size: string
  lastModified: string
}

// Import your actual components
import CompareRFPs from "./CompareRFPs"
import SummarizeRFP from "./SummarizeRFP"

const AnalyzeRFP = () => {
  const [activeTab, setActiveTab] = useState<"analyze" | "summarize">("analyze")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // State for Compare RFPs tab - persists across tab switches
  const [analysisResult, setAnalysisResult] = useState<ComparisonResult | null>(null)
  const [compareFileMetadata, setCompareFileMetadata] = useState<Record<string, FileMetadata>>({})
  const [compareExistingFiles, setCompareExistingFiles] = useState<File[]>([])
  const [compareNewFile, setCompareNewFile] = useState<File | null>(null)
  
  // State for Summarize RFP tab - persists across tab switches
  const [summarizeResult, setSummarizeResult] = useState<SummarizeResult | null>(null)
  const [summarizeFileMetadata, setSummarizeFileMetadata] = useState<Record<string, FileMetadata>>({})
  const [summarizeFile, setSummarizeFile] = useState<File | null>(null)
  const [summarizeTocHint, setSummarizeTocHint] = useState<string>("")

  return (
    <div className="w-[80%] mx-auto">
      <h2 className="text-xl font-bold mt-6 mb-4">Analyze RFP</h2>
      <div className="flex border-b mb-6">
        <button
          className={`py-4 px-12 font-medium ${
            activeTab === "analyze"
              ? "text-blue-600 border-b-2 border-blue-600 bg-white shadow-md"
              : "text-gray-500 "
          }`}
          onClick={() => setActiveTab("analyze")}
        >
          Compare RFPs
        </button>
        <button
          className={`py-4 px-12 font-medium ${
            activeTab === "summarize"
              ? "text-blue-600 border-b-2 border-blue-600 bg-white shadow-md"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("summarize")}
        >
          Summarize RFP
        </button>
      </div>
      <div className="analyze-section">
        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
        )}
        {activeTab === "analyze" ? (
          <CompareRFPs 
            setErrorMessage={setErrorMessage}
            analysisResult={analysisResult}
            setAnalysisResult={setAnalysisResult}
            fileMetadata={compareFileMetadata}
            setFileMetadata={setCompareFileMetadata}
            existingFiles={compareExistingFiles}
            setExistingFiles={setCompareExistingFiles}
            newFile={compareNewFile}
            setNewFile={setCompareNewFile}
          />
        ) : (
          <SummarizeRFP 
            setErrorMessage={setErrorMessage}
            summarizeResult={summarizeResult}
            setSummarizeResult={setSummarizeResult}
            fileMetadata={summarizeFileMetadata}
            setFileMetadata={setSummarizeFileMetadata}
            file={summarizeFile}
            setFile={setSummarizeFile}
            tocHint={summarizeTocHint}
            setTocHint={setSummarizeTocHint}
          />
        )}
      </div>
    </div>
  )
}

export default AnalyzeRFP