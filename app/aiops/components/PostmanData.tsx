import React from 'react';

interface Document {
  _id: string;
  Time: string;
  "CPU_%": number;
  Handles: number;
  Memory_PageFile_MB: number;
  Memory_Private_MB: number;
  Memory_Virtual_MB: number;
  Threads: number;
  'Working Set - Private': number;
}

interface ExtractedData {
  application_name: string;
  problem_datetime: string;
  confidence_score: number;
  raw_datetime_mention: string;
}

interface PostmanDataProps {
  postmanData: {
    documents: Document[];
    extracted_data: ExtractedData;
  } | null; // Allow postmanData to be null
}

const PostmanData: React.FC<PostmanDataProps> = ({ postmanData }) => {
  // Return null or a fallback UI if postmanData is null or undefined
  if (!postmanData || !postmanData.documents || !postmanData.extracted_data) {
    return null; // Or you could return a fallback UI like: <div>No Postman data available</div>
  }

  return (
    <div className="max-w-[100%] rounded-xl text-sm bg-white text-gray-800 rounded-bl-none border-o3 p-5 ml-12">
      <div className="text-md font-semibold mb-2">Postman Issue Details</div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPU %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handles</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory PageFile MB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory Private MB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Memory Virtual MB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threads</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Set Private</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {postmanData.documents.map((doc: Document) => (
              <tr key={doc._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.Time}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc["CPU_%"]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.Handles}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.Memory_PageFile_MB}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.Memory_Private_MB}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.Memory_Virtual_MB}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.Threads}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc['Working Set - Private']}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <p><strong>Application:</strong> {postmanData.extracted_data.application_name}</p>
        <p><strong>Problem Datetime:</strong> {postmanData.extracted_data.problem_datetime}</p>
        <p><strong>Confidence Score:</strong> {postmanData.extracted_data.confidence_score}</p>
        <p><strong>Raw Datetime Mention:</strong> {postmanData.extracted_data.raw_datetime_mention}</p>
      </div>
    </div>
  );
};

export default PostmanData;