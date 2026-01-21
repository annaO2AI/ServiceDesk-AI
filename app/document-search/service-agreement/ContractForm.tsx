// components/ContractForm.tsx
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactMarkdown from "react-markdown";
import { API_ROUTES } from "@/app/constants/api";

interface ContractFormValues {
  company_name: string;
  company_address: string;
  company_state: string;
  company_country: string;
  client_name: string;
  client_address: string;
  client_state: string;
  client_country: string;
  services: string;
  payment: string;
  termination: string;
  effective_date: string;
  start_date: string;
  end_date: string;
  temperature?: string;
}

interface ApiResponse {
  message: string;
  markdown: string;
  docx_download_url: string;
  pdf_download_url: string;
}

const ContractForm = () => {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialValues: ContractFormValues = {
    company_name: "",
    company_address: "",
    company_state: "",
    company_country: "",
    client_name: "",
    client_address: "",
    client_state: "",
    client_country: "",
    services: "",
    payment: "",
    termination: "",
    effective_date: "",
    start_date: "",
    end_date: "",
    temperature: "0.7",
  };

  const validationSchema = Yup.object({
    company_name: Yup.string().required("Company name is required"),
    company_address: Yup.string().required("Company address is required"),
    company_state: Yup.string().required("Company state is required"),
    company_country: Yup.string().required("Company country is required"),
    client_name: Yup.string().required("Client name is required"),
    client_address: Yup.string().required("Client address is required"),
    client_state: Yup.string().required("Client state is required"),
    client_country: Yup.string().required("Client country is required"),
    services: Yup.string().required("Services description is required"),
    payment: Yup.string().required("Payment terms are required"),
    termination: Yup.string().required("Termination terms are required"),
    effective_date: Yup.string().required("Effective date is required"),
    start_date: Yup.string().required("Start date is required"),
    end_date: Yup.string().required("End date is required"),
    temperature: Yup.string(),
  });

 const BASE_API_URL= "https://procuremindai-hvf9hxhbhfgvaaa7.centralindia-01.azurewebsites.net";
  const handleSubmit = async (values: ContractFormValues) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Convert form values to URLSearchParams
      const params = new URLSearchParams();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(API_ROUTES.generateMsa, {
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
    } catch (err) {
      console.error("Failed to generate contract:", err);
      setError("Failed to generate contract. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-8 mt-16 m-16">
      {/* Form Section */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Generate Service Agreement
        </h1>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Company Information Section */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.company_name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.company_name && formik.errors.company_name ? (
                  <div className="text-red-500 text-sm">{formik.errors.company_name}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="company_address" className="block text-sm font-medium text-gray-700">
                  Company Address *
                </label>
                <input
                  id="company_address"
                  name="company_address"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.company_address}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.company_address && formik.errors.company_address ? (
                  <div className="text-red-500 text-sm">{formik.errors.company_address}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="company_state" className="block text-sm font-medium text-gray-700">
                  Company State *
                </label>
                <input
                  id="company_state"
                  name="company_state"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.company_state}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.company_state && formik.errors.company_state ? (
                  <div className="text-red-500 text-sm">{formik.errors.company_state}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="company_country" className="block text-sm font-medium text-gray-700">
                  Company Country *
                </label>
                <input
                  id="company_country"
                  name="company_country"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.company_country}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.company_country && formik.errors.company_country ? (
                  <div className="text-red-500 text-sm">{formik.errors.company_country}</div>
                ) : null}
              </div>
            </div>
          </div>
          
          {/* Client Information Section */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client_name" className="block text-sm font-medium text-gray-700">
                  Client Name *
                </label>
                <input
                  id="client_name"
                  name="client_name"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.client_name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.client_name && formik.errors.client_name ? (
                  <div className="text-red-500 text-sm">{formik.errors.client_name}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="client_address" className="block text-sm font-medium text-gray-700">
                  Client Address *
                </label>
                <input
                  id="client_address"
                  name="client_address"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.client_address}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.client_address && formik.errors.client_address ? (
                  <div className="text-red-500 text-sm">{formik.errors.client_address}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="client_state" className="block text-sm font-medium text-gray-700">
                  Client State *
                </label>
                <input
                  id="client_state"
                  name="client_state"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.client_state}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.client_state && formik.errors.client_state ? (
                  <div className="text-red-500 text-sm">{formik.errors.client_state}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="client_country" className="block text-sm font-medium text-gray-700">
                  Client Country *
                </label>
                <input
                  id="client_country"
                  name="client_country"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.client_country}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.client_country && formik.errors.client_country ? (
                  <div className="text-red-500 text-sm">{formik.errors.client_country}</div>
                ) : null}
              </div>
            </div>
          </div>
          
          {/* Contract Details Section */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3">Contract Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="services" className="block text-sm font-medium text-gray-700">
                  Services Description *
                </label>
                <textarea
                  id="services"
                  name="services"
                  rows={3}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.services}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.services && formik.errors.services ? (
                  <div className="text-red-500 text-sm">{formik.errors.services}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="payment" className="block text-sm font-medium text-gray-700">
                  Payment Terms *
                </label>
                <textarea
                  id="payment"
                  name="payment"
                  rows={3}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.payment}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.payment && formik.errors.payment ? (
                  <div className="text-red-500 text-sm">{formik.errors.payment}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="termination" className="block text-sm font-medium text-gray-700">
                  Termination Terms *
                </label>
                <textarea
                  id="termination"
                  name="termination"
                  rows={3}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.termination}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.termination && formik.errors.termination ? (
                  <div className="text-red-500 text-sm">{formik.errors.termination}</div>
                ) : null}
              </div>
            </div>
          </div>
          
          {/* Dates Section */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-3">Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="effective_date" className="block text-sm font-medium text-gray-700">
                  Effective Date *
                </label>
                <input
                  id="effective_date"
                  name="effective_date"
                  type="date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.effective_date}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.effective_date && formik.errors.effective_date ? (
                  <div className="text-red-500 text-sm">{formik.errors.effective_date}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Start Date *
                </label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.start_date}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.start_date && formik.errors.start_date ? (
                  <div className="text-red-500 text-sm">{formik.errors.start_date}</div>
                ) : null}
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  End Date *
                </label>
                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.end_date}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                />
                {formik.touched.end_date && formik.errors.end_date ? (
                  <div className="text-red-500 text-sm">{formik.errors.end_date}</div>
                ) : null}
              </div>
            </div>
          </div>
          
          {/* Temperature Field */}
          <div>
            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
              Temperature (Optional)
            </label>
            <input
              id="temperature"
              name="temperature"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.temperature || ""}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
            />
            {formik.touched.temperature && formik.errors.temperature ? (
              <div className="text-red-500 text-sm">{formik.errors.temperature}</div>
            ) : null}
          </div>

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Generating MSA..." : "Generate MSA"}
            </button>
          </div>
        </form>
      </div>

      {/* Response Display Section */}
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
  );
};

export default ContractForm;