"use client"
import { useFormik } from "formik"
import * as Yup from "yup"
import Image from 'next/image'
import { API_ROUTES } from "@/app/constants/api"
import { useEffect } from "react"

interface FileUploadValues {
  existing_files: File[]
  new_file: File | null
  temperature: string
}

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

interface FileMetadata {
  path: string
  size: string
  lastModified: string
}

interface CompareRFPsProps {
  setErrorMessage: (message: string | null) => void
  analysisResult: ComparisonResult | null
  setAnalysisResult: (result: ComparisonResult | null) => void
  fileMetadata: Record<string, FileMetadata>
  setFileMetadata: (metadata: Record<string, FileMetadata>) => void
  existingFiles: File[]
  setExistingFiles: (files: File[]) => void
  newFile: File | null
  setNewFile: (file: File | null) => void
}

const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

const SUPPORTED_FILE_EXTENSIONS = ".pdf,.doc,.docx"

const CompareRFPs = ({ 
  setErrorMessage, 
  analysisResult, 
  setAnalysisResult,
  fileMetadata,
  setFileMetadata,
  existingFiles,
  setExistingFiles,
  newFile,
  setNewFile
}: CompareRFPsProps) => {
  const clearFileInput = (elementId: string) => {
    const fileInput = document.getElementById(elementId) as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const analyzeInitialValues: FileUploadValues = {
    existing_files: existingFiles,
    new_file: newFile,
    temperature: "0.7",
  }

  const analyzeValidationSchema = Yup.object({
    existing_files: Yup.array()
      .of(
        Yup.mixed<File>()
          .test("fileSize", "File too large (max 5MB)", (value) =>
            value ? value.size <= 5 * 1024 * 1024 : true
          )
          .test(
            "fileType",
            "Only PDF and Word documents are supported",
            (value) =>
              value ? SUPPORTED_MIME_TYPES.includes(value.type) : true
          )
      )
      .min(1, "At least one existing file is required")
      .required("Existing files are required"),
    new_file: Yup.mixed<File>()
      .required("New file is required")
      .test("fileSize", "File too large (max 5MB)", (value) =>
        value ? value.size <= 5 * 1024 * 1024 : true
      )
      .test("fileType", "Only PDF and Word documents are supported", (value) =>
        value ? SUPPORTED_MIME_TYPES.includes(value.type) : true
      ),
    temperature: Yup.string()
      .matches(/^-?\d*\.?\d+$/, "Must be a number")
      .notRequired(),
  })

  const analyzeFormik = useFormik({
    initialValues: analyzeInitialValues,
    validationSchema: analyzeValidationSchema,
    enableReinitialize: true, // Important: reinitialize form when props change
    onSubmit: async (values) => {
      setErrorMessage(null)
      const formData = new FormData()

      values.existing_files.forEach((file) => {
        formData.append("existing_files", file)
      })

      if (values.new_file) {
        formData.append("new_file", values.new_file)
      }

      if (values.temperature) {
        formData.append(
          "temperature",
          parseFloat(values.temperature).toString()
        )
      } else {
        formData.append("temperature", "")
      }

      try {
        const response = await fetch(API_ROUTES.analyzeRFP, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            `Failed to analyze files: ${errorData.message || response.statusText}`
          )
        }

        const result: ComparisonResult = await response.json()

        if (result.ok && result.comparison_table) {
          setAnalysisResult(result)
        } else {
          throw new Error("Invalid response format from server")
        }

        // Clear form after successful submission
        analyzeFormik.resetForm()
        setFileMetadata({})
        setExistingFiles([])
        setNewFile(null)
        clearFileInput("existing-files-input")
        clearFileInput("new-file-input")
      } catch (error: any) {
        setErrorMessage(
          error.message || "An error occurred while uploading files."
        )
      }
    },
  })

  // Sync form values with parent state
  useEffect(() => {
    setExistingFiles(analyzeFormik.values.existing_files)
  }, [analyzeFormik.values.existing_files])

  useEffect(() => {
    setNewFile(analyzeFormik.values.new_file)
  }, [analyzeFormik.values.new_file])

  const handleExistingFilesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      const uniqueFiles = fileArray.filter(
        (newFile) =>
          !analyzeFormik.values.existing_files.some(
            (existingFile) => existingFile.name === newFile.name
          )
      )

      const newMetadata = { ...fileMetadata }
      fileArray.forEach((file) => {
        const fullPath = file.webkitRelativePath || file.name
        newMetadata[file.name] = {
          path: fullPath,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          lastModified: new Date(file.lastModified).toLocaleString(),
        }
      })
      setFileMetadata(newMetadata)

      analyzeFormik.setFieldValue("existing_files", [
        ...analyzeFormik.values.existing_files,
        ...uniqueFiles,
      ])
    }
  }

  const handleNewFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      const fullPath = file.webkitRelativePath || file.name
      setFileMetadata({
        ...fileMetadata,
        [file.name]: {
          path: fullPath,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          lastModified: new Date(file.lastModified).toLocaleString(),
        },
      })
    }
    analyzeFormik.setFieldValue("new_file", file)
  }

  const removeExistingFile = (index: number) => {
    const updatedFiles = analyzeFormik.values.existing_files.filter(
      (_, i) => i !== index
    )
    analyzeFormik.setFieldValue("existing_files", updatedFiles)
  }

  const renderExistingFilesErrors = (errors: unknown): React.ReactNode => {
    if (typeof errors === "string") {
      return <div>{errors}</div>
    }
    if (Array.isArray(errors)) {
      return errors.map((error, index) => {
        if (typeof error === "string") {
          return <div key={index}>{error}</div>
        }
        if (error && typeof error === "object") {
          return (
            <div key={index}>
              {Object.values(error).map((err, i) => (
                <div key={i}>{String(err)}</div>
              ))}
            </div>
          )
        }
        return null
      })
    }
    if (errors && typeof errors === "object") {
      return Object.values(errors).map((err, i) => (
        <div key={i}>{String(err)}</div>
      ))
    }
    return null
  }


  return (
    <div className="space-y-4">
      <form onSubmit={analyzeFormik.handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          {/* Existing Files details*/}

          <div className="w-[50%] p-12 bg-white rounded-lg shadow-md border-o2 relative">
            <h3 className="block font-medium text-gray-700 mb-1 text-[20px] mb-3">
              Existing Files *
            </h3>
            <div className="inputdesign rounded-lg  flex flex-col items-center">
              <Image
                src="/browse-a-file.svg"
                alt="Browse a file"
                width={188}
                height={81}
                className="imagfilter mb-4"
              />
              <label
                htmlFor="existing-files-input"
                className="mb-4 bluebtn-custome block w-full text-sm text-gray-500 p-6 mx-auto w-[350px] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              >
                Choose a file
              </label>
              <input
                id="existing-files-input"
                type="file"
                multiple
                onChange={handleExistingFilesChange}
                onBlur={analyzeFormik.handleBlur}
                className="hidden"
                accept={SUPPORTED_FILE_EXTENSIONS}
                key={analyzeFormik.values.existing_files.length}
              />
              <div className="osubtitle mb-6">*.PDF, *.DOC format are supported. Max 10 MB</div>
            </div>
            {analyzeFormik.values.existing_files.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {analyzeFormik.values.existing_files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 bg-[#3C77EF] p-6 rounded-lg">
                    <div>
                      <svg width="38" height="43" viewBox="0 0 38 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M28.3477 0.240234V9.36873H37.4761L28.3477 0.240234Z" fill="white"/>
                        <path d="M27.6128 10.75C27.2404 10.75 26.9393 10.4497 26.9393 10.0781V0H2.69393C1.20486 0 0 1.20198 0 2.6875V40.3125C0 41.798 1.20486 43 2.69393 43H35.0211C36.5102 43 37.7151 41.798 37.7151 40.3125V10.75H27.6128ZM7.40832 12.0938H18.1841C18.5565 12.0938 18.8575 12.3941 18.8575 12.7656C18.8575 13.1372 18.5565 13.4375 18.1841 13.4375H7.40832C7.03588 13.4375 6.73484 13.1372 6.73484 12.7656C6.73484 12.3941 7.03588 12.0938 7.40832 12.0938ZM30.3068 34.2656H7.40832C7.03588 34.2656 6.73484 33.9653 6.73484 33.5938C6.73484 33.2222 7.03588 32.9219 7.40832 32.9219H30.3068C30.6792 32.9219 30.9802 33.2222 30.9802 33.5938C30.9802 33.9653 30.6792 34.2656 30.3068 34.2656ZM30.3068 30.2344H7.40832C7.03588 30.2344 6.73484 29.934 6.73484 29.5625C6.73484 29.191 7.03588 28.8906 7.40832 28.8906H30.3068C30.6792 28.8906 30.9802 29.191 30.9802 29.5625C30.9802 29.934 30.6792 30.2344 30.3068 30.2344ZM30.3068 26.2031H7.40832C7.03588 26.2031 6.73484 25.9028 6.73484 25.5312C6.73484 25.1597 7.03588 24.8594 7.40832 24.8594H30.3068C30.6792 24.8594 30.9802 25.1597 30.9802 25.5312C30.9802 25.9028 30.6792 26.2031 30.3068 26.2031ZM30.3068 22.1719H7.40832C7.03588 22.1719 6.73484 21.8715 6.73484 21.5C6.73484 21.1285 7.03588 20.8281 7.40832 20.8281H30.3068C30.6792 20.8281 30.9802 21.1285 30.9802 21.5C30.9802 21.8715 30.6792 22.1719 30.3068 22.1719ZM30.3068 18.1406H7.40832C7.03588 18.1406 6.73484 17.8403 6.73484 17.4688C6.73484 17.0972 7.03588 16.7969 7.40832 16.7969H30.3068C30.6792 16.7969 30.9802 17.0972 30.9802 17.4688C30.9802 17.8403 30.6792 18.1406 30.3068 18.1406Z" fill="white"/>
                      </svg>
                    </div>
                    <div className="p-2">
                      <span className="text-sm text-gray-600 block font-medium text-white mb-2">
                        {file.name}
                      </span>
                      <div className="text-sm text-gray-500 flex gap-2 content-center">
                        <span className="text-white">
                          Size: {fileMetadata[file.name]?.size || "Calculating..."}
                        </span>
                        <span className="text-white">|</span>
                        <span className="text-white">
                          Modified: {fileMetadata[file.name]?.lastModified || "Unknown"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingFile(index)}
                      className="text-white px-5 py-1 text-[20px] rounded"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {analyzeFormik.touched.existing_files &&
              analyzeFormik.errors.existing_files && (
                <div className="text-red-500 text-sm mt-1">
                  {renderExistingFilesErrors(analyzeFormik.errors.existing_files)}
                </div>
              )}
            <div className="CompareIcon absolute">
              <svg width="39" height="32" viewBox="0 0 39 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M37.2262 21.3551H23.7783L27.8431 17.2787C28.1661 16.9434 28.3447 16.4943 28.3407 16.0282C28.3367 15.5621 28.1502 15.1162 27.8215 14.7866C27.4929 14.457 27.0482 14.27 26.5834 14.2659C26.1186 14.2619 25.6708 14.4411 25.3365 14.7649L18.2456 21.876C17.9133 22.2094 17.7266 22.6615 17.7266 23.1329C17.7266 23.6043 17.9133 24.0564 18.2456 24.3898L25.3365 31.5009C25.6708 31.8247 26.1186 32.0039 26.5834 31.9999C27.0482 31.9958 27.4929 31.8089 27.8215 31.4793C28.1502 31.1496 28.3367 30.7038 28.3407 30.2376C28.3447 29.7715 28.1661 29.3224 27.8431 28.9871L23.7783 24.9107H37.2262C37.6963 24.9107 38.1472 24.7234 38.4797 24.39C38.8121 24.0566 38.9989 23.6044 38.9989 23.1329C38.9989 22.6614 38.8121 22.2092 38.4797 21.8758C38.1472 21.5424 37.6963 21.3551 37.2262 21.3551Z" fill="#8337D4"/>
                <path d="M0 8.91073C0 8.43924 0.186769 7.98705 0.51922 7.65366C0.851671 7.32026 1.30257 7.13296 1.77273 7.13296H15.2206L11.1558 3.05651C10.9865 2.89252 10.8514 2.69635 10.7585 2.47945C10.6656 2.26256 10.6167 2.02928 10.6146 1.79323C10.6126 1.55717 10.6575 1.32308 10.7466 1.10459C10.8357 0.886112 10.9674 0.687619 11.1338 0.520699C11.3002 0.353779 11.4982 0.221773 11.716 0.132385C11.9339 0.0429967 12.1673 -0.00198411 12.4027 6.7123e-05C12.6381 0.00211835 12.8707 0.0511606 13.087 0.144332C13.3033 0.237504 13.4989 0.372939 13.6624 0.542735L20.7533 7.65385C21.0857 7.98723 21.2723 8.43933 21.2723 8.91073C21.2723 9.38214 21.0857 9.83424 20.7533 10.1676L13.6624 17.2787C13.4989 17.4485 13.3033 17.584 13.087 17.6771C12.8707 17.7703 12.6381 17.8194 12.4027 17.8214C12.1673 17.8235 11.9339 17.7785 11.716 17.6891C11.4982 17.5997 11.3002 17.4677 11.1338 17.3008C10.9674 17.1338 10.8357 16.9354 10.7466 16.7169C10.6575 16.4984 10.6126 16.2643 10.6146 16.0282C10.6167 15.7922 10.6656 15.5589 10.7585 15.342C10.8514 15.1251 10.9865 14.929 11.1558 14.765L15.2206 10.6885H1.77273C1.30257 10.6885 0.851671 10.5012 0.51922 10.1678C0.186769 9.83441 0 9.38223 0 8.91073Z" fill="#3C77EF"/>
              </svg>
              <span className="osubtitle mt-1">Compare</span>
            </div>
          </div>
          {/* New File Upload */}
          <div className="w-[50%] p-12 bg-white rounded-lg shadow-md border-o2">
            <h3 className="block font-medium text-gray-700 mb-1 text-[20px] mb-3">
              New File Upload *
            </h3>
            <div className="inputdesign-new rounded-lg flex flex-col items-center">
              <Image
                src="/NewFileUpload.svg"
                alt="Browse a file"
                width={188}
                height={81}
                className="imagfilter mb-4"
              />
              <label
                htmlFor="new-file-input"
                className="mb-4 bluebtn-custome-new block w-full text-sm text-gray-500 p-6 mx-auto w-[350px] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              >
                Choose a file
              </label>
              <input
                id="new-file-input"
                type="file"
                onChange={handleNewFileChange}
                onBlur={analyzeFormik.handleBlur}
                className="hidden"
                accept={SUPPORTED_FILE_EXTENSIONS}
                key={analyzeFormik.values.new_file?.name || "empty"}
              />
              <div className="osubtitle mb-6">*.PDF, *.DOC format are supported. Max 10 MB</div>
            </div>
            {analyzeFormik.touched.new_file &&
              analyzeFormik.errors.new_file && (
                <div className="text-red-500 text-sm mt-1 text-white">
                  {String(analyzeFormik.errors.new_file)}
                </div>
              )}
            {analyzeFormik.values.new_file && (
              <div className="flex items-center gap-3 mt-2 bg-[#8337D4] p-6 rounded-lg">
                <div>
                  <svg width="38" height="43" viewBox="0 0 38 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M28.3477 0.240234V9.36873H37.4761L28.3477 0.240234Z" fill="white"/>
                    <path d="M27.6128 10.75C27.2404 10.75 26.9393 10.4497 26.9393 10.0781V0H2.69393C1.20486 0 0 1.20198 0 2.6875V40.3125C0 41.798 1.20486 43 2.69393 43H35.0211C36.5102 43 37.7151 41.798 37.7151 40.3125V10.75H27.6128ZM7.40832 12.0938H18.1841C18.5565 12.0938 18.8575 12.3941 18.8575 12.7656C18.8575 13.1372 18.5565 13.4375 18.1841 13.4375H7.40832C7.03588 13.4375 6.73484 13.1372 6.73484 12.7656C6.73484 12.3941 7.03588 12.0938 7.40832 12.0938ZM30.3068 34.2656H7.40832C7.03588 34.2656 6.73484 33.9653 6.73484 33.5938C6.73484 33.2222 7.03588 32.9219 7.40832 32.9219H30.3068C30.6792 32.9219 30.9802 33.2222 30.9802 33.5938C30.9802 33.9653 30.6792 34.2656 30.3068 34.2656ZM30.3068 30.2344H7.40832C7.03588 30.2344 6.73484 29.934 6.73484 29.5625C6.73484 29.191 7.03588 28.8906 7.40832 28.8906H30.3068C30.6792 28.8906 30.9802 29.191 30.9802 29.5625C30.9802 29.934 30.6792 30.2344 30.3068 30.2344ZM30.3068 26.2031H7.40832C7.03588 26.2031 6.73484 25.9028 6.73484 25.5312C6.73484 25.1597 7.03588 24.8594 7.40832 24.8594H30.3068C30.6792 24.8594 30.9802 25.1597 30.9802 25.5312C30.9802 25.9028 30.6792 26.2031 30.3068 26.2031ZM30.3068 22.1719H7.40832C7.03588 22.1719 6.73484 21.8715 6.73484 21.5C6.73484 21.1285 7.03588 20.8281 7.40832 20.8281H30.3068C30.6792 20.8281 30.9802 21.1285 30.9802 21.5C30.9802 21.8715 30.6792 22.1719 30.3068 22.1719ZM30.3068 18.1406H7.40832C7.03588 18.1406 6.73484 17.8403 6.73484 17.4688C6.73484 17.0972 7.03588 16.7969 7.40832 16.7969H30.3068C30.6792 16.7969 30.9802 17.0972 30.9802 17.4688C30.9802 17.8403 30.6792 18.1406 30.3068 18.1406Z" fill="white"/>
                  </svg>
                </div>
                <div className="p-2">
                  <span className="text-sm text-gray-600 block font-medium text-white mb-2">
                    {analyzeFormik.values.new_file.name}
                  </span>
                  <div className="text-sm text-white flex gap-3">
                    <span>
                      Size: {fileMetadata[analyzeFormik.values.new_file.name]?.size || "Calculating..."}
                    </span>
                    <span>|</span>
                    <span>
                      Modified: {fileMetadata[analyzeFormik.values.new_file.name]?.lastModified || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex mt-12 mb-12">
          <button
            type="submit"
            className="bg-blue-600 text-white py-4 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300 w-[250px] m-auto"
            disabled={analyzeFormik.isSubmitting}
          >
            {analyzeFormik.isSubmitting ? "Comparing..." : "Compare RFPs"}
          </button>
        </div>
      </form>

  {analysisResult && analysisResult.comparison_table && analysisResult.comparison_table.length > 0 && (
  <div className="mt-8 p-6 rounded-lg border border-gray-200 bg-white">
    {analysisResult.comparison_table.map((table, tableIndex) => (
      <div key={tableIndex}>
        <h3 className="text-lg font-semibold mb-4">{table.title}</h3>
        <div className="mb-4 text-base osubtitle">
          <p><strong>Document 1:</strong> {table.left_doc}</p>
          <p><strong>Document 2:</strong> {table.right_doc}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {table.columns.map((column, index) => (
                  <th key={index} className="border border-gray-200 px-4 py-4 text-left text-base font-semibold text-gray-700">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-gray-200 px-4 py-4 text-base font-semibold">{row.section}</td>
                  <td className="border border-gray-200 px-4 py-4 text-base">{row.left}</td>
                  <td className="border border-gray-200 px-4 py-4 text-base">{row.right}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
)}
    </div>
  )
}

export default CompareRFPs