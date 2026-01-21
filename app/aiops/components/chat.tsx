// ChatMessages.tsx
import { useMemo } from "react"
import { LoganimationsIcon, DOCIcon, PDFIcon, LogIcon } from "./icons"



// StatusBadge Component
const StatusBadge = ({ status }: { status?: string }) => {
  const normalizedStatus = status?.toUpperCase() || "UP"

  const statusConfig = {
    UP: { bg: "bg-emerald-100", text: "text-emerald-700", label: "UP" },
    DOWN: { bg: "bg-red-100", text: "text-red-700", label: "DOWN" },
    DEGRADED: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      label: "DEGRADED",
    },
    UNKNOWN: { bg: "bg-gray-100", text: "text-gray-700", label: "UNKNOWN" },
  }

  const config =
    statusConfig[normalizedStatus as keyof typeof statusConfig] ||
    statusConfig.UP

  return (
    <span
      className={`${config.bg} ${config.text} text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-tight`}
    >
      {config.label}
    </span>
  )
}
const SectionHeader = ({ title }:{
  title: string
}) => (
  <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
    <h2 className="text-slate-700 font-bold text-sm">{title}</h2>
  </div>
);


// ReportCard Component
export const ReportCard = ({ msg }: any) => {
    const parsedRecommendation = useMemo(() => {
    const text = msg.recommendation;
    const rootCauseMatch = text.match(/### Root Cause:([\s\S]*?)(?=---|###)/);
    const recommendationsMatch = text.match(/### Recommendations:([\s\S]*?)(?=---|###|$)/);
    
    interface RecommendationItem {
      title: string;
      text: string;
    }

    interface ParsedRecommendation {
      rootCause: string;
      recommendations: RecommendationItem[];
    }

    return {
      rootCause: rootCauseMatch ? rootCauseMatch[1].trim() : "Unable to extract root cause.",
      recommendations: recommendationsMatch 
        ? recommendationsMatch[1].trim().split(/\n\d+\.\s+\*\*/).filter((i: string) => i.trim()).map((i: string) => {
            const [title, ...rest] = i.split('**');
            return { title: title.replace(':', '').trim(), text: rest.join('**').trim() };
          })
        : []
    } as ParsedRecommendation;
  }, [msg.recommendation]);
  return (
    <div className="w-full max-w-4xl bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden text-gray-800">
      {/* Main Header */}
      <header className="flex justify-between items-start p-6 border-b border-slate-200">
        <div>
          <h1 className="text-slate-800 font-bold text-xl uppercase tracking-tight">
            Extracted Report
          </h1>
          <div className="mt-1 text-sm text-slate-500 flex gap-4">
            <span>
              Application:{" "}
              <span className="font-semibold text-slate-700">
                {msg?.extracted_data?.application_name || ""}
              </span>
            </span>
            <span>|</span>
            <span>
              Environment:{" "}
              <span className="font-semibold text-slate-700">
                {msg?.cmdb_items?.environment}
              </span>
            </span>
          </div>
        </div>
        <div className="bg-rose-600 text-white px-4 py-2 rounded-lg text-center">
          <div className="text-xs font-bold uppercase tracking-widest opacity-90">
            Issue
          </div>
          <div className="text-lg font-semibold leading-tight">
                            {new Date(msg?.extracted_data?.problem_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}

          </div>
        </div>
      </header>
      <main className="p-6 space-y-6">
        {/* Summary Section */}
        <section className="border border-slate-200 rounded-md">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
            <h2 className="text-slate-700 font-bold text-sm">
              Extracted Summary
            </h2>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-slate-500 uppercase font-medium mb-1">
                Problem Time:
              </p>
              <p className="text-sm font-bold text-slate-800">
                {msg?.extracted_data?.raw_datetime_mention}
                
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-medium mb-1">
                CI Name:
              </p>
              <p className="text-sm font-bold text-slate-800">
                {msg?.cmdb_items?.ci_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-medium mb-1">
                Confidence Score:
              </p>
              <p className="text-sm font-bold text-emerald-600">
                {msg?.extracted_data?.confidence_score}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-medium mb-1">
                Environment:
              </p>
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                {msg?.cmdb_items?.environment}
              </span>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Infrastructure Status */}
          <section className="border border-slate-200 rounded-md flex flex-col">
            <SectionHeader title="Infrastructure Status" />
            <div className="p-4 space-y-4 flex-grow">
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Servers
                </h3>
                <div className="space-y-1.5">
                  {msg?.cmdb_items?.dependency_details?.servers.map(
                    (s: any) => (
                      <div
                        key={s.sys_id}
                        className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <span className="text-slate-600">
                          <span className="font-bold text-slate-800">
                            {s.hostname}
                          </span>{" "}
                          ({s.ip_address})
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            OS: {s.os}
                          </span>
                          <StatusBadge status={s.status} />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Network Infrastructure
                </h3>
                <div className="space-y-1.5">
                  {msg.cmdb_items.dependency_details.network.map((n:any) => (
                      <div key={n.name} className={`flex justify-between items-center text-sm p-2 rounded border ${n.status.toLowerCase() !== 'up' ? 'bg-rose-50 border-rose-100' : 'border-transparent'}`}>
                        <span className="text-slate-700 font-bold">{n.name} <span className="font-normal text-slate-500 text-xs">({n.ci_type})</span></span>
                        <StatusBadge status={n.status} />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>
          {/* Services Status */}
          <section className="border border-slate-200 rounded-md flex flex-col">
            <SectionHeader title="Services Status" />
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Load Balancers
                </h3>
                <div className="space-y-1.5">
                  {msg?.cmdb_items?.dependency_details?.load_balancers.map(
                    (s: any) => (
                      <div
                        key={s.sys_id}
                        className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <span className="text-slate-600">
                          <span className="font-bold text-slate-800">
                            {s.ci_name}
                          </span>{" "}
                          ({s.lb_type})
                          <span className="text-slate-600 uppercase">
                            ( {s.vip} )
                          </span>
                        </span>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={s.status} />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Storage
                </h3>
                <div className="space-y-1.5">
                  {msg?.cmdb_items?.dependency_details?.storage.map(
                    (s: any) => (
                      <div
                        key={s.sys_id}
                        className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <span className="text-slate-600">
                          <span className="font-bold text-slate-800">
                            {s.storage_name}
                          </span>{" "}
                          ({s.storage_type})
                        </span>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={s.status} />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Database
                </h3>
                <div className="space-y-1.5">
                  {msg?.cmdb_items?.dependency_details?.databases.map(
                    (s: any) => (
                      <div
                        key={s.sys_id}
                        className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                      >
                        <span className="text-slate-600">
                          <span className="font-bold text-slate-800">
                            {s.db_name}
                          </span>{" "}
                          ({s.database_type} {s?.version})
                        </span>
                        <div className="flex items-center gap-4">
                          <StatusBadge status={s.status} />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Tenant
                </h3>
                <div className="space-y-1.5">
                  {msg?.cmdb_items?.dependency_details?.Tenant.map((s: any) => (
                    <div
                      key={s.sys_id}
                      className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                    >
                      <span className="text-slate-600">
                        <span className="font-bold text-slate-800">
                          {s.tenant_name}
                        </span>{" "}
                        ({s.cloud_provider})
                      </span>
                      <div className="flex items-center gap-4">
                        <StatusBadge status={s.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
        {/* Recent Changes Table */}
        <section className="border border-slate-200 rounded-md overflow-hidden">
          <SectionHeader title="Recent Changes:" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="px-4 py-2">Change Number</th>
                  <th className="px-4 py-2">Application Name</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Start Date</th>
                  <th className="px-4 py-2">End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {msg?.cmdb_items?.recent_changes.map((chg: any) => (
                  <tr
                    key={chg.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-2 font-medium text-slate-600">
                      {chg.change_number}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{chg.cmdb_ci}</td>
                    <td className="px-4 py-2 text-slate-600">
                      {chg.description}
                    </td>
                    <td className="px-4 py-2 text-slate-500 font-mono text-xs">
                      {chg.start_date}
                    </td>
                    <td className="px-4 py-2 text-slate-500 font-mono text-xs">
                      {chg.end_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        {/* Performance Metrics */}
        <section className="space-y-4">
          <h2 className="text-slate-800 font-bold text-base">
            Performance Metrics (9:32 AM)
          </h2>
          {msg?.documents.map((m: any) => (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" key={m._id}>
              {[
                {
                  no: 1,
                  name: "CPU Usage",
                  value: m?.["CPU_%"],
                },
                {
                  no: 2,
                  name: "Memory",
                  value: m?.Memory_PageFile_MB,
                },
                {
                  no: 3,
                  name: "Threads",
                  value: m?.Threads,
                },
                {
                  no: 4,
                  name: "Working Sets",
                  value: m?.["Working Set - Private"],
                },
              ]?.map((item: any) => (
                <div
                  key={item?.no}
                  className="bg-white border-2 border-slate-200 rounded p-4 text-center"
                >
                  <div className="text-[10px] text-slate-500 font-bold tracking-wider mb-1">
                    {item.name}
                  </div>
                  <div className={`text-xl font-bold ${m.color}`}>
                    {item?.value}
                  </div>
                </div>
              ))}
              <div className="lg:col-span-1 flex items-center justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-tight">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  All metrics normal
                </div>
              </div>
            </div>
          ))}
        </section>
        {/* Root Cause Analysis (Red Box) */}
          {/* Root Cause Analysis */}
          <section className="bg-rose-50 border border-rose-100 rounded-md p-6">
            <h2 className="text-rose-700 font-bold text-lg mb-4">Root Cause Analysis</h2>
            <div className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
                {parsedRecommendation.rootCause}
            </div>
          </section>
            {/* Recommended Actions */}
          <section className="border border-slate-200 rounded-md">
             <SectionHeader title="Recommended Actions" />
             <div className="p-6 space-y-6">
                {parsedRecommendation.recommendations.map((action, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-800 text-sm">{action.title}</h3>
                      <p className="text-slate-600 text-sm">{action.text}</p>
                    </div>
                  </div>
                ))}
                
             </div>
          </section>
      </main>
      <footer className="p-4 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em]">
        Automated System Observation Report — Generated Nov 20, 2025 09:35:12
      </footer>
    </div>
  )
}

