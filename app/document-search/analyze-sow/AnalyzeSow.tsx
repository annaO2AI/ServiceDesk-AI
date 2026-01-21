"use client"
import { useState } from "react"
import CompareSOWs from "./CompareSOWs"
import SummarizeSOW from "./SummarizeSOW"

const AnalyzeSow = () => {
  const [activeTab, setActiveTab] = useState<"analyze" | "summarize">("analyze")

  return (
    <div className="w-[80%] mx-auto">
      <h2 className="text-xl font-bold mt-3 mb-4">Analyze SOW</h2>

      <div className="flex border-b mb-6">
        <button
          className={`py-4 px-12 font-medium ${
            activeTab === "analyze"
              ? "text-blue-600 border-b-2 border-blue-600 bg-white shadow-md"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("analyze")}
        >
          Compare SOWs
        </button>
        <button
          className={`py-4 px-12 font-medium ${
            activeTab === "summarize"
              ? "text-blue-600 border-b-2 border-blue-600 bg-white shadow-md"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("summarize")}
        >
          Summarize SOW
        </button>
      </div>

      <div className="analyze-section">
        {activeTab === "analyze" ? <CompareSOWs /> : <SummarizeSOW />}
      </div>
    </div>
  )
}

export default AnalyzeSow