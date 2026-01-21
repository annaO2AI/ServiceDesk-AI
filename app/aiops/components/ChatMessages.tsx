// ChatMessages.tsx
import { ReportCard } from "./chat"
import { LoganimationsIcon, DOCIcon, PDFIcon, LogIcon } from "./icons"

interface ExtractedData {
  application_name: string
  problem_datetime: string
  confidence_score: number
  raw_datetime_mention: string
}

interface Document {
  _id: string
  Time: string
  Instance: string
  "CPU_%": string
  Handles: string
  Memory_PageFile_MB: string
  Memory_Private_MB: string
  Memory_Virtual_MB: string
  Threads: string
  "Working Set - Private": string
}

interface DependencyDetail {
  name: string
  sys_id: string
  sys_class_name: string
  hostname?: string
  ip_address?: string
  environment?: string
  cloud_tenant?: string
  os?: string
  tenant_name?: string
  account_id?: string
  cloud_provider?: string
  owner?: string
  ci_name?: string
  ci_type?: string
  isp?: string
  site?: string
  status?: string
  lb_type?: string
  vip?: string
  storage_name?: string
  capacity_tb?: string
  storage_type?: string
  attached_to?: string
  db_name?: string
  database_type?: string
  host_server?: string | null
  version?: string
}

interface DependencyDetails {
  servers?: DependencyDetail[]
  Tenant?: DependencyDetail[]
  network?: DependencyDetail[]
  load_balancers?: DependencyDetail[]
  storage?: DependencyDetail[]
  databases?: DependencyDetail[]
  other?: DependencyDetail[]
}

interface CMDBItem {
  ci_name: string
  sys_id: string
  environment: string
  owner: {
    link: string
    value: string
  }
  servers: Array<{
    name: string
    ip: string
    os: string
    host: string
    version: string
  }>
  // dependencies: string[];
  dependency_details?: DependencyDetails
  recent_changes: Array<{
    change_number: string
    cmdb_ci: string
    description: string
    start_date: string
    end_date: string
  }>
}

interface Message {
  sender: "user" | "ai"
  content: string
  isLoading?: boolean
  fileType?: string
  extracted_data?: ExtractedData
  documents?: Document[]
  recommendation?: string
  cmdb_items?: CMDBItem
}

interface ChatMessagesProps {
  messages: Message[]
  initials: string
}

export default function ChatMessages({
  messages,
  initials,
}: ChatMessagesProps) {
  // Column mappings for dependency tables
  const columnMappings: Record<
    string,
    Record<string, keyof DependencyDetail>
  > = {
    "Dependency Servers": {
      Name: "name",
      "Cloud Tenant": "cloud_tenant",
      "IP Address": "ip_address",
      Environment: "environment",
      OS: "os",
    },
    "Cloud Tenants": {
      Name: "name",
      "Cloud Provider": "cloud_provider",
      "Account ID": "account_id",
      Environment: "environment",
      Owner: "owner",
    },
    "Network Infrastructure": {
      Name: "ci_name",
      Type: "ci_type",
      Site: "site",
      Status: "status",
      ISP: "isp",
    },
    "Load Balancers": {
      Name: "ci_name",
      Type: "lb_type",
      VIP: "vip",
      Status: "status",
    },
    "Storage Devices": {
      Name: "storage_name",
      Type: "storage_type",
      "Attached To": "attached_to",
      Status: "status",
      Capacity: "capacity_tb",
    },
    Databases: {
      Name: "db_name",
      "Database Type": "database_type",
      Version: "version",
      Status: "status",
      "Host Server": "host_server",
    },
    "Other Dependencies": {
      Name: "ci_name",
      Type: "sys_class_name",
      Status: "status",
    },
  }

  const renderDependencyTable = (
    title: string,
    items: DependencyDetail[],
    columns: string[]
  ) => {
    let tableContent = `<br /><strong>${title}:</strong><br />`
    tableContent += `
      <div class="overflow-x-auto">
        <table class="min-w-full border-collapse border border-gray-200 text-sm mt-2">
          <thead>
            <tr class="bg-gray-100">
    `

    columns.forEach((column) => {
      tableContent += `<th class="border border-gray-200 px-4 py-2 text-left font-medium">${column}</th>`
    })

    tableContent += `
            </tr>
          </thead>
          <tbody>
    `

    items.forEach((item) => {
      tableContent += `<tr>`
      columns.forEach((column) => {
        // Get the correct property key from the mapping
        const propertyKey =
          columnMappings[title]?.[column] ||
          (column.toLowerCase().replace(/\s+/g, "_") as keyof DependencyDetail)
        const value = item[propertyKey] || "N/A"
        tableContent += `<td class="border border-gray-200 px-4 py-2">${value}</td>`
      })
      tableContent += `</tr>`
    })

    tableContent += `
          </tbody>
        </table>
      </div>
    `

    return tableContent
  }

  const formatMessageContent = (
    content: string,
    extracted_data?: ExtractedData,
    documents?: Document[],
    recommendation?: string,
    cmdb_items?: CMDBItem
  ) => {
    // Remove the backend message field (e.g., "Found 19 documents for Postman") from content
    let cleanedContent = content
      .replace(/Found \d+ documents for [^\.]+/, "")
      .trim()

    let formattedContent = cleanedContent
      .replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />")

    if (extracted_data) {
      formattedContent += `<br /><br /><strong>Extracted Information:</strong><br />`
      formattedContent += `Application: ${
        extracted_data.application_name || "N/A"
      }<br />`
      formattedContent += `Problem Time: ${
        extracted_data.problem_datetime || "N/A"
      }<br />`
      formattedContent += `Confidence Score: ${
        extracted_data.confidence_score
          ? (extracted_data.confidence_score * 100).toFixed(2) + "%"
          : "N/A"
      }<br />`
      formattedContent += `Time Mention: ${
        extracted_data.raw_datetime_mention || "N/A"
      }<br />`
    }

    if (cmdb_items) {
      let hasCmdbContent = false
      let cmdbContent = ""

      if (cmdb_items.ci_name || cmdb_items.environment) {
        cmdbContent += `<strong>CMDB Information:</strong><br />`
        if (cmdb_items.ci_name) {
          cmdbContent += `CI Name: ${cmdb_items.ci_name}<br />`
        }
        if (cmdb_items.environment) {
          cmdbContent += `Environment: ${cmdb_items.environment}<br />`
        }
        hasCmdbContent = true
      }

      if (cmdb_items.servers && cmdb_items.servers.length > 0) {
        cmdbContent += `<br /><strong>Application Servers:</strong><br />`
        cmdbContent += `
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse border border-gray-200 text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium">Name</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium">IP</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium">OS</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium">Host</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium">Version</th>
                </tr>
              </thead>
              <tbody>
        `

        cmdb_items.servers.forEach((server) => {
          cmdbContent += `
            <tr>
              <td class="border border-gray-200 px-4 py-2">${
                server.name || "N/A"
              }</td>
              <td class="border border-gray-200 px-4 py-2">${
                server.ip || "N/A"
              }</td>
              <td class="border border-gray-200 px-4 py-2">${
                server.os || "N/A"
              }</td>
              <td class="border border-gray-200 px-4 py-2">${
                server.host || "N/A"
              }</td>
              <td class="border border-gray-200 px-4 py-2">${
                server.version || "N/A"
              }</td>
            </tr>
          `
        })

        cmdbContent += `
              </tbody>
            </table>
          </div>
        `
        hasCmdbContent = true
      }

      if (cmdb_items.dependency_details) {
        const details = cmdb_items.dependency_details

        if (details.servers && details.servers.length > 0) {
          cmdbContent += renderDependencyTable(
            "Dependency Servers",
            details.servers,
            ["Name", "Cloud Tenant", "IP Address", "Environment", "OS"]
          )
          hasCmdbContent = true
        }

        if (details.Tenant && details.Tenant.length > 0) {
          cmdbContent += renderDependencyTable(
            "Cloud Tenants",
            details.Tenant,
            ["Name", "Cloud Provider", "Account ID", "Environment", "Owner"]
          )
          hasCmdbContent = true
        }

        if (details.network && details.network.length > 0) {
          cmdbContent += renderDependencyTable(
            "Network Infrastructure",
            details.network,
            ["Name", "Type", "Site", "Status", "ISP"]
          )
          hasCmdbContent = true
        }

        if (details.load_balancers && details.load_balancers.length > 0) {
          cmdbContent += renderDependencyTable(
            "Load Balancers",
            details.load_balancers,
            ["Name", "Type", "VIP", "Status"]
          )
          hasCmdbContent = true
        }

        if (details.storage && details.storage.length > 0) {
          cmdbContent += renderDependencyTable(
            "Storage Devices",
            details.storage,
            ["Name", "Type", "Attached To", "Status", "Capacity"]
          )
          hasCmdbContent = true
        }

        if (details.databases && details.databases.length > 0) {
          cmdbContent += renderDependencyTable("Databases", details.databases, [
            "Name",
            "Database Type",
            "Version",
            "Status",
            "Host Server",
          ])
          hasCmdbContent = true
        }

        if (details.other && details.other.length > 0) {
          cmdbContent += renderDependencyTable(
            "Other Dependencies",
            details.other,
            ["Name", "Type", "Status"]
          )
          hasCmdbContent = true
        }
      }

      if (cmdb_items.recent_changes && cmdb_items.recent_changes.length > 0) {
        cmdbContent += `<br /><strong>Recent Changes:</strong><br />`
        cmdbContent += `
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse border border-gray-200 text-sm">
              <thead>
                <tr class="bg-gray-100">
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium">Change Number</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium">Application Name</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium">Description</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium">Start Date</th>
                  <th class="border border-gray-200 px-4 py-2 text-left font-medium">End Date</th>
                </tr>
              </thead>
              <tbody>
        `

        cmdb_items.recent_changes.forEach((change) => {
          cmdbContent += `
            <tr>
              <td class="border border-gray-200 px-4 py-2">${
                change.change_number || "N/A"
              }</td>
              <td class="border border-gray-200 px-4 py-2">${
                change.cmdb_ci || "N/A"
              }</td>
              <td class="border border-gray-200 px-4 py-2">${
                change.description || "N/A"
              }</td>
               <td class="border border-gray-200 px-4 py-2">${
                 change.start_date || "N/A"
               }</td>
              <td class="border border-gray-200 px-4 py-2">${
                change.end_date || "N/A"
              }</td>
            </tr>
          `
        })

        cmdbContent += `
              </tbody>
            </table>
          </div>
        `
        hasCmdbContent = true
      }

      if (hasCmdbContent) {
        formattedContent += `<br />${cmdbContent}`
      }
    }

    if (documents && Array.isArray(documents) && documents.length > 0) {
      formattedContent += `<br /><strong>Performance Metrics:</strong><br />`
      formattedContent += `
        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-200 px-4 py-2 text-left font-medium">Time</th>
                <th class="border border-gray-200 px-4 py-2 text-left font-medium">CPU %</th>
                <th class="border border-gray-200 px-4 py-2 text-left font-medium">Handles</th>
                <th class="border border-gray-200 px-4 py-2 text-left font-medium">Memory PageFile (MB)</th>
                <th class="border border-gray-200 px-4 py-2 text-left font-medium">Memory Private (MB)</th>
                <th class="border border-gray-200 px-4 py-2 text-left font-medium">Memory Virtual (MB)</th>
                <th class="border border-gray-200 px-4 py-2 text-left font-medium">Threads</th>
                <th class="border border-gray-200 px-4 py-2 text-left font-medium">Working Set - Private</th>
              </tr>
            </thead>
            <tbody>
      `

      documents.forEach((doc) => {
        formattedContent += `
          <tr>
            <td class="border border-gray-200 px-4 py-2">${
              doc.Time || "N/A"
            }</td>
            <td class="border border-gray-200 px-4 py-2">${
              doc["CPU_%"] || "N/A"
            }</td>
            <td class="border border-gray-200 px-4 py-2">${
              doc.Handles || "N/A"
            }</td>
            <td class="border border-gray-200 px-4 py-2">${
              doc.Memory_PageFile_MB || "N/A"
            }</td>
            <td class="border border-gray-200 px-4 py-2">${
              doc.Memory_Private_MB || "N/A"
            }</td>
            <td class="border border-gray-200 px-4 py-2">${
              doc.Memory_Virtual_MB || "N/A"
            }</td>
            <td class="border border-gray-200 px-4 py-2">${
              doc.Threads || "N/A"
            }</td>
            <td class="border border-gray-200 px-4 py-2">${
              doc["Working Set - Private"] || "N/A"
            }</td>
          </tr>
        `
      })

      formattedContent += `
            </tbody>
          </table>
        </div>
      `
    }

    // Only include recommendation if documents array is not empty
    if (
      recommendation &&
      recommendation.trim() &&
      documents &&
      Array.isArray(documents) &&
      documents.length > 0
    ) {
      formattedContent += `<br /><br />`

      // Split recommendation into lines
      const lines = recommendation.split("\n").filter((line) => line.trim())
      let inList = false
      let listItems: string[] = []

      lines.forEach((line, index) => {
        // Handle bold text
        line = line.replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>")

        // Detect section headers
        if (line.startsWith("### ")) {
          // Close previous list if open
          if (inList && listItems.length > 0) {
            formattedContent += `<ul class="list-disc pl-5">${listItems
              .map((item) => `<li>${item}</li>`)
              .join("")}</ul>`
            listItems = []
            inList = false
          }
          // Add section as bold text
          formattedContent += `<br /><strong>${line.replace(
            "### ",
            ""
          )}</strong><br /> `
        }
        // Detect list items (e.g., "1. Check the API status:")
        else if (
          line.match(/^\d+\.\s/) &&
          (line.includes("What does this mean for you?") ||
            line.includes("What should you do?"))
        ) {
          // Start or continue a list
          if (!inList) {
            inList = true
          }
          // Remove numbering (e.g., "1. ") and add to list items
          const listItem = line.replace(/^\d+\.\s/, "").trim()
          listItems.push(listItem)
        }
        // Handle other lines
        else {
          // Close previous list if open
          if (inList && listItems.length > 0) {
            formattedContent += `<ul class="list-disc pl-5">${listItems
              .map((item) => `<li>${item}</li>`)
              .join("")}</ul>`
            listItems = []
            inList = false
          }
          // Add regular line
          formattedContent += `${line}<br />`
        }

        // Handle the last line
        if (index === lines.length - 1 && inList && listItems.length > 0) {
          formattedContent += `<ul class="list-disc pl-5">${listItems
            .map((item) => `<li>${item}</li>`)
            .join("")}</ul>`
        }
      })
    }

    return formattedContent
  }
  console.log(messages)
  return (
    <div id="chat-box" className="flex-1 overflow-y-auto px-0 py-2 space-y-2">
      {messages && messages.map((msg:any, idx) => (
        <div
          key={idx}
          className={`flex ${
            msg.sender === "user" ? "justify-end gap-2" : "justify-start gap-2"
          }`}
        >
          {msg.sender === "user" && !msg.isLoading ? (
            <div>
              {initials && (
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-normal text-md">
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
            className={`max-w-[100%] rounded-xl text-sm ${
              msg.sender === "user"
                ? " GeographyClass bg-white font-bold border-o3 px-4 py-3 boxshadow rounded-br-none"
                : msg.isLoading
                ? "p-0"
                : "bg-white text-gray-800 rounded-bl-none border-o3 p-5"
            }`}
          >
            {msg.isLoading ? (
              <div className="flex items-center gap-2">
                <LoganimationsIcon width={40} height={40} />
              </div>
            ) : msg.content?.startsWith("📎") && msg.fileType ? (
              <div className="flex items-center gap-2">
                {msg.fileType === "pdf" ? <PDFIcon width={20} /> : null}
                {msg.fileType === "doc" || msg.fileType === "docx" ? (
                  <DOCIcon width={20} />
                ) : null}
                <span>{msg.content.replace("📎 ", "")}</span>
              </div>
            ) : (
              <div>
                {  msg.sender === "user" && (
                <p>
                  {msg?.content}
                </p>
                )}
                {msg.sender === "ai" && msg.content !== undefined && msg?.cmdb_items !== undefined && msg?.extracted_data !== undefined ? (
                <ReportCard msg={msg}/>
                ):(msg.sender === "ai" &&
                  <p>{msg?.content || "Some Thing went wrong"}</p>
                )}
              </div>

            )}
          </div>
        </div>
      ))}
    </div>
  )
}