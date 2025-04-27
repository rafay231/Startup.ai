import { useState, useEffect } from 'react';

export default function HealthCheck() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [apiInfo, setApiInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [envInfo, setEnvInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check backend status
    fetch('/api/info')
      .then(response => {
        if (response.ok) {
          setBackendStatus('online');
          return response.json();
        } else {
          setBackendStatus('offline');
          throw new Error(`Backend responded with status: ${response.status}`);
        }
      })
      .then(data => {
        setApiInfo(data);
      })
      .catch(err => {
        setError(err.message);
      });

    // Collect environment information
    const env: Record<string, string> = {};
    if (import.meta.env.VITE_API_URL) env['VITE_API_URL'] = import.meta.env.VITE_API_URL;
    if (import.meta.env.BASE_URL) env['BASE_URL'] = import.meta.env.BASE_URL;
    if (import.meta.env.MODE) env['MODE'] = import.meta.env.MODE;
    if (import.meta.env.DEV) env['DEV'] = import.meta.env.DEV.toString();
    if (import.meta.env.PROD) env['PROD'] = import.meta.env.PROD.toString();
    setEnvInfo(env);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Startup.ai System Health Check</h1>
      
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Backend Status</h2>
        <div className="flex items-center mb-2">
          <div className={`w-4 h-4 rounded-full mr-2 ${
            backendStatus === 'online' ? 'bg-green-500' : 
            backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></div>
          <span className="capitalize">{backendStatus}</span>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
            Error: {error}
          </div>
        )}
      </div>

      {apiInfo && (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">API Information</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(apiInfo, null, 2)}
          </pre>
        </div>
      )}

      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
          {JSON.stringify(envInfo, null, 2)}
        </pre>
      </div>

      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Browser Information</h2>
        <table className="w-full border-collapse">
          <tbody>
            <tr className="border-b">
              <td className="py-2 font-medium">User Agent</td>
              <td className="py-2">{navigator.userAgent}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Window Location</td>
              <td className="py-2">{window.location.href}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 font-medium">Window Origin</td>
              <td className="py-2">{window.location.origin}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center mt-8">
        <a href="/" className="text-blue-500 hover:underline">Return to Home</a>
      </div>
    </div>
  );
}