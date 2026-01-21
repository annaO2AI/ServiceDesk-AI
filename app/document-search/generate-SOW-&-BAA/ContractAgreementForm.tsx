import { API_ROUTES } from '@/app/constants/api';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type FormData = {
  doc_type: string;
  company_name: string;
  company_address: string,
  company_state: string,
  company_country: string,
  client_name: string;
  client_address: string;
  client_state:string;
  client_country:string;
  services: string;
  effective_date: string;
  payment: string;
  start_date: string;
  end_date: string;
  termination: string;
  // confidentiality: string;
  // signer_1: string;
  // title_1: string;
  // signer_2: string;
  // title_2: string;
  temperature: number;
};

type ApiResponse = {
  message: string;
  docx_download_url: string;
  pdf_download_url: string;
  markdown: string;
};

export default function DocumentGeneratorForm() {
  const [formData, setFormData] = useState<FormData>({
    doc_type: '',
    company_name: '',
    company_address: '',
    company_state:'',
    company_country:'',
    client_name: '',
    client_address: '',
    client_state:'',
    client_country:'',
    services: '',
    payment: '',
    effective_date:'',
    start_date: '',
    end_date: '',
    termination: '',
    // confidentiality: '',
    // signer_1: '',
    // title_1: '',
    // signer_2: '',
    // title_2: '',
    temperature: 0.7
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
 const BASE_API_URL= "https://procuremindai-hvf9hxhbhfgvaaa7.centralindia-01.azurewebsites.net";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'temperature' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setResponse(null);

    try {
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, value.toString());
      });

      const response = await fetch(API_ROUTES.generateBaaSow , {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result: ApiResponse = await response.json();
      setResponse(result);
      setSubmitMessage('Document generated successfully!');
    } catch (error) {
      setSubmitMessage('Error generating document. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto pt-12 mb-16'>
      <h1 className="text-2xl font-bold mb-6 pt-6 mt-6">Generate SOW & BAA
</h1>
      <div className="p-12 bg-white rounded-lg shadow-md mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Type and Temperature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="doc_type" className="block text-sm font-medium text-gray-700 mb-1">
                Document Type *
              </label>
              <select
                id="doc_type"
                name="doc_type"
                value={formData.doc_type}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 p-2"
              >
                <option value="">Select document type</option>
                <option value="BAA">BAA</option>
                <option value="SOW">SOW</option>
              </select>
            </div>

            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                Temperature
              </label>
              <input
                type="number"
                id="temperature"
                name="temperature"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full rounded border border-gray-300 p-2"
              />
              <p className="mt-1 text-sm text-gray-500">Controls randomness (default: 0.7)</p>
            </div>
          </div>

          {/* Company and Client Information */}
           <h2 className="text-lg font-semibold mb-3">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label htmlFor="company_address" className="block text-sm font-medium text-gray-700 mb-1">
                Company Address*
              </label>
              <input
                type="text"
                id="company_address"
                name="company_address"
                value={formData.company_address}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label htmlFor="company_state" className="block text-sm font-medium text-gray-700 mb-1">
                Company State*
              </label>
              <input
                type="text"
                id="company_state"
                name="company_state"
                value={formData.company_state}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label htmlFor="company_country" className="block text-sm font-medium text-gray-700 mb-1">
                Company Country*
              </label>
              <input
                type="text"
                id="company_country"
                name="company_country"
                value={formData.company_country}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-3">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  id="client_name"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <div>
                <label htmlFor="client_address" className="block text-sm font-medium text-gray-700 mb-1">
                  Client Address *
                </label>
                <input
                  type="text"
                  id="client_address"
                  name="client_address"
                  value={formData.client_address}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <div>
                <label htmlFor="client_state" className="block text-sm font-medium text-gray-700 mb-1">
                  Client State*
                </label>
                <input
                  type="text"
                  id="client_state"
                  name="client_state"
                  value={formData.client_state}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <div>
                <label htmlFor="client_country" className="block text-sm font-medium text-gray-700 mb-1">
                  Client Country*
                </label>
                <input
                  type="text"
                  id="client_country"
                  name="client_country"
                  value={formData.client_country}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
          </div>
          {/* Services */}
          <div>
            <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-1">
              Services *
            </label>
            <textarea
              id="services"
              name="services"
              value={formData.services}
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

          {/* payment  */}
          <div>
            <label htmlFor="Payment" className="block text-sm font-medium text-gray-700 mb-1">
              Payment  *
            </label>
            <textarea
              id="payment"
              name="payment"
              value={formData.payment }
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>
           {/* Terms  */}
          <div>
            <label htmlFor="termination" className="block text-sm font-medium text-gray-700 mb-1">
              termination  *
            </label>
            <textarea
              id="termination"
              name="termination"
              value={formData.termination }
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded border border-gray-300 p-2"
            />
          </div>

         {/* Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <div>
              <label htmlFor="termination" className="block text-sm font-medium text-gray-700 mb-1">
                Termination Terms *
              </label>
              <input
                type="text"
                id="termination"
                name="termination"
                value={formData.termination}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 p-2"
              />
            </div> */}

            {/* <div>
              <label htmlFor="confidentiality" className="block text-sm font-medium text-gray-700 mb-1">
                Confidentiality Terms *
              </label>
              <input
                type="text"
                id="confidentiality"
                name="confidentiality"
                value={formData.confidentiality}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 p-2"
              />
            </div> */}
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div>
              <label htmlFor="effective_date" className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date  *
              </label>
              <input
                type="date"
                id="effective_date"
                name="effective_date"
                value={formData.effective_date }
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full rounded border border-gray-300 p-2"
              />
            </div>
            
          </div>

         

          {/* Signers
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border p-4 rounded">
              <h3 className="font-medium mb-3">Company Representative</h3>
              <div className="mb-3">
                <label htmlFor="signer_1" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="signer_1"
                  name="signer_1"
                  value={formData.signer_1}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <div>
                <label htmlFor="title_1" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title_1"
                  name="title_1"
                  value={formData.title_1}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
            </div>

            <div className="border p-4 rounded">
              <h3 className="font-medium mb-3">Client Representative</h3>
              <div className="mb-3">
                <label htmlFor="signer_2" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="signer_2"
                  name="signer_2"
                  value={formData.signer_2}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
              <div>
                <label htmlFor="title_2" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title_2"
                  name="title_2"
                  value={formData.title_2}
                  onChange={handleChange}
                  required
                  className="w-full rounded border border-gray-300 p-2"
                />
              </div>
            </div>
          </div>*/}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded hover:bg-indigo-700 disabled:bg-indigo-300 font-medium"
            >
              {isSubmitting ? 'Generating...' : 'Generate Document'}
            </button>
          </div> 

          {submitMessage && (
            <div className={`mt-4 p-3 rounded text-center ${submitMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {submitMessage}
            </div>
          )}
        </form> 

        {/* Response Display */}
        {response && (
          <div className="mt-8 space-y-6 p-6 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{response.message}</h2>
              <div className="flex space-x-3">
                <a
                  href={`${BASE_API_URL}${response.docx_download_url}`}
                  download
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Download DOCX
                </a>
                <a
                  href={`${BASE_API_URL}${response.pdf_download_url}`}
                  download
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Download PDF
                </a>
              </div>
            </div>

            <div className="p-4 bg-white rounded-md border overflow-auto max-h-[500px]">
              <div className="prose max-w-none procruement-search-chat">
                <ReactMarkdown>{response.markdown}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}