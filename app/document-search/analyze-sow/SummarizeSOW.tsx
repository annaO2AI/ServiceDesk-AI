"use client"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { API_ROUTES } from "@/app/constants/api"
import Image from 'next/image'

interface SummarizeValues {
  file: File | null
  temperature: string
  toc_hint: string
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

const SummarizeSOW = () => {
  const [summarizeResult, setSummarizeResult] = useState<SummarizeResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fileMetadata, setFileMetadata] = useState<
    Record<string, { path: string; size: string; lastModified: string }>
  >({})

  // Helper function to clear file inputs
  const clearFileInput = (elementId: string) => {
    const fileInput = document.getElementById(elementId) as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const summarizeInitialValues: SummarizeValues = {
    file: null,
    temperature: "0.3",
    toc_hint: "",
  }

  const SUPPORTED_MIME_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]

  const SUPPORTED_FILE_EXTENSIONS = ".pdf,.doc,.docx"

  const summarizeValidationSchema = Yup.object({
    file: Yup.mixed<File>()
      .required("File is required")
      .test("fileSize", "File too large (max 5MB)", (value) =>
        value ? value.size <= 5 * 1024 * 1024 : true
      )
      .test("fileType", "Only PDF and Word documents are supported", (value) =>
        value ? SUPPORTED_MIME_TYPES.includes(value.type) : true
      ),
    temperature: Yup.string()
      .matches(/^-?\d*\.?\d+$/, "Must be a number")
      .notRequired(),
    toc_hint: Yup.string().notRequired(),
  })

  const summarizeFormik = useFormik({
    initialValues: summarizeInitialValues,
    validationSchema: summarizeValidationSchema,
    onSubmit: async (values) => {
      setErrorMessage(null)
      setSummarizeResult(null)

      if (!values.file) {
        setErrorMessage("File is required")
        return
      }

      const formData = new FormData()
      formData.append("file", values.file)
      formData.append("temperature", values.temperature)
      formData.append("toc_hint", values.toc_hint)

      try {
        const response = await fetch(API_ROUTES.summarizeSow, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            `Failed to summarize file: ${
              errorData.message || response.statusText
            }`
          )
        }

        const result = await response.json()
        setSummarizeResult(result)
        summarizeFormik.resetForm()
        setFileMetadata({})
        clearFileInput("summarize-file-input")
      } catch (error: any) {
        setErrorMessage(
          error.message || "An error occurred while summarizing the file."
        )
      }
    },
  })

  const handleSummarizeFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null
    if (file) {
      // @ts-ignore - webkitRelativePath is browser-specific
      const fullPath = file.webkitRelativePath || file.name
      setFileMetadata((prev) => ({
        ...prev,
        [file.name]: {
          path: fullPath,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          lastModified: new Date(file.lastModified).toLocaleString(),
        },
      }))
    }
    summarizeFormik.setFieldValue("file", file)
  }

  return (
      <div className="space-y-4">
          <form onSubmit={summarizeFormik.handleSubmit} className="space-y-4">
              <h3 className="block font-medium text-gray-700 mb-1 text-[18px] mb-3">
                  SOW File to Summarize *
              </h3>
              <div className="bg-white p-16 p-12 bg-white rounded-lg shadow-md border-o2 relative">
                  <div className="inputdesign rounded-lg flex flex-col items-center">
                      <Image
                          src="/browse-a-file.svg"
                          alt="Browse a file"
                          width={188}
                          height={81}
                          className="imagfilter mb-6"
                      />
                      <label
                           htmlFor="summarize-file-input"
                          className="mb-4 bluebtn-custome block w-full text-sm text-gray-500 p-6 mx-auto w-[350px] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      >
                          Choose a file
                      </label>
                      <input
                          id="summarize-file-input"
                          type="file"
                          onChange={handleSummarizeFileChange}
                          onBlur={summarizeFormik.handleBlur}
                          className="hidden"
                          accept={SUPPORTED_FILE_EXTENSIONS}
                          key={summarizeFormik.values.file?.name || "empty"}
                      />
                      <div className="osubtitle mb-6">*.PDF, *.DOC format are supported. Max 10 MB</div>
                  </div>
                  {summarizeFormik.touched.file && summarizeFormik.errors.file && (
                      <div className="text-red-500 text-sm mt-1">
                          {String(summarizeFormik.errors.file)}
                      </div>
                  )}
                  {summarizeFormik.values.file && (
                      <div className="flex items-center gap-3 mb-2 bg-[#3C77EF] p-6 rounded-lg mt-2">
                        <div className="">
                            <svg width="38" height="43" viewBox="0 0 38 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M28.3477 0.240234V9.36873H37.4761L28.3477 0.240234Z" fill="white"/>
                                <path d="M27.6128 10.75C27.2404 10.75 26.9393 10.4497 26.9393 10.0781V0H2.69393C1.20486 0 0 1.20198 0 2.6875V40.3125C0 41.798 1.20486 43 2.69393 43H35.0211C36.5102 43 37.7151 41.798 37.7151 40.3125V10.75H27.6128ZM7.40832 12.0938H18.1841C18.5565 12.0938 18.8575 12.3941 18.8575 12.7656C18.8575 13.1372 18.5565 13.4375 18.1841 13.4375H7.40832C7.03588 13.4375 6.73484 13.1372 6.73484 12.7656C6.73484 12.3941 7.03588 12.0938 7.40832 12.0938ZM30.3068 34.2656H7.40832C7.03588 34.2656 6.73484 33.9653 6.73484 33.5938C6.73484 33.2222 7.03588 32.9219 7.40832 32.9219H30.3068C30.6792 32.9219 30.9802 33.2222 30.9802 33.5938C30.9802 33.9653 30.6792 34.2656 30.3068 34.2656ZM30.3068 30.2344H7.40832C7.03588 30.2344 6.73484 29.934 6.73484 29.5625C6.73484 29.191 7.03588 28.8906 7.40832 28.8906H30.3068C30.6792 28.8906 30.9802 29.191 30.9802 29.5625C30.9802 29.934 30.6792 30.2344 30.3068 30.2344ZM30.3068 26.2031H7.40832C7.03588 26.2031 6.73484 25.9028 6.73484 25.5312C6.73484 25.1597 7.03588 24.8594 7.40832 24.8594H30.3068C30.6792 24.8594 30.9802 25.1597 30.9802 25.5312C30.9802 25.9028 30.6792 26.2031 30.3068 26.2031ZM30.3068 22.1719H7.40832C7.03588 22.1719 6.73484 21.8715 6.73484 21.5C6.73484 21.1285 7.03588 20.8281 7.40832 20.8281H30.3068C30.6792 20.8281 30.9802 21.1285 30.9802 21.5C30.9802 21.8715 30.6792 22.1719 30.3068 22.1719ZM30.3068 18.1406H7.40832C7.03588 18.1406 6.73484 17.8403 6.73484 17.4688C6.73484 17.0972 7.03588 16.7969 7.40832 16.7969H30.3068C30.6792 16.7969 30.9802 17.0972 30.9802 17.4688C30.9802 17.8403 30.6792 18.1406 30.3068 18.1406Z" fill="white"/>
                            </svg>
                        </div>
                        <div className="mt-2 p-2">
                            <span className="text-base block font-medium text-white">
                                {summarizeFormik.values.file.name}
                            </span>
                            <div className="text-base flex gap-3">
                                <span className="text-white">
                                    Size: {fileMetadata[summarizeFormik.values.file.name]?.size || "Calculating..."}
                                </span>
                                <span className="text-white">|</span>
                                <span className="text-white">
                                    Modified: {fileMetadata[summarizeFormik.values.file.name]?.lastModified || "Unknown"}
                                </span>
                                {/* <div>
                                    Path: {fileMetadata[summarizeFormik.values.file.name]?.path || "Not available"}
                                </div> */}
                            </div>
                          </div>
                      </div>
                  )}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Table of Contents Hint
                    </label>
                    <input
                      type="text"
                      name="toc_hint"
                      value={summarizeFormik.values.toc_hint}
                      onChange={summarizeFormik.handleChange}
                      onBlur={summarizeFormik.handleBlur}
                      className="block w-full text-sm text-gray-700 border border-gray-300 rounded py-2 px-3"
                      placeholder="Enter TOC hint to help with summarization"
                    />
                    {summarizeFormik.touched.toc_hint && summarizeFormik.errors.toc_hint && (
                      <div className="text-red-500 text-sm mt-1">
                        {summarizeFormik.errors.toc_hint}
                      </div>
                    )}
                </div>
              </div>
              {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperature
          </label>
          <input
            type="text"
            name="temperature"
            value={summarizeFormik.values.temperature}
            onChange={summarizeFormik.handleChange}
            onBlur={summarizeFormik.handleBlur}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded py-2 px-3"
            placeholder="Enter temperature (e.g., 0.3)"
          />
          {summarizeFormik.touched.temperature &&
            summarizeFormik.errors.temperature && (
              <div className="text-red-500 text-sm mt-1">
                {summarizeFormik.errors.temperature}
              </div>
            )}
        </div> */}

        

              {errorMessage && (
                  <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
              )}
            <div className="flex m-6">
              <button
                  type="submit"
                  className=" bg-blue-600 text-white py-4 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 w-[250px] m-auto"
                  disabled={summarizeFormik.isSubmitting}
              >
                  {summarizeFormik.isSubmitting ? "Summarizing..." : "Summarize SOW"}
              </button>
              </div>
          </form>

          {summarizeResult && (
              <div className="bg-white p-16 p-12 bg-white rounded-lg shadow-md border-o2 relative"> 
                  <div className="p-4  rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Document Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <p className="text-sm text-gray-600">Filename:</p>
                              <p className="font-medium">{summarizeResult.filename}</p>
                          </div>
                          <div>
                              <p className="text-sm text-gray-600">Document Type:</p>
                              <p className="font-medium">{summarizeResult.doc_type}</p>
                          </div>
                      </div>
                  </div>

                  <div className="p-4  rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                      <div className="prose max-w-none">
                          <ReactMarkdown>{summarizeResult.executive_summary}</ReactMarkdown>
                      </div>
                  </div>

                  {summarizeResult.sections && summarizeResult.sections.length > 0 && (
                      <div className="p-4  rounded-lg">
                          <h3 className="text-lg font-semibold mb-2">Section Summaries</h3>
                          {summarizeResult.sections.map((section, index) => (
                              <div key={index} className="mb-4">
                                  {section.title && (
                                      <h4 className="font-medium text-gray-800">{section.title}</h4>
                                  )}
                                  <div className="prose max-w-none">
                                      <ReactMarkdown>{section.summary}</ReactMarkdown>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  {summarizeResult.docx_download_url && (
                      <div className="mt-4">
                          <a
                              href={`https://procuremindai-hvf9hxhbhfgvaaa7.centralindia-01.azurewebsites.net${summarizeResult.docx_download_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                              Download Summary Document
                          </a>
                      </div>
                  )}
              </div>
          )}
      </div>
  )
}

export default SummarizeSOW