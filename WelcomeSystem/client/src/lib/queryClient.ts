import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Helper to get base URL for API requests
const getApiBaseUrl = () => {
  // In Node.js environment (should never happen in this app)
  if (typeof window === 'undefined') return 'http://localhost:12000';
  
  // Use the environment variable if available
  const envApiUrl = import.meta.env.VITE_API_URL;
  if (envApiUrl) {
    console.log(`Using API URL from environment: ${envApiUrl}`);
    return envApiUrl;
  }
  
  // Fallback to relative URL
  console.log('Using relative URL for API requests');
  return '/api';
};

// Simple retry mechanism for failed requests
async function makeRequest<T>(
  method: string,
  url: string,
  options: {
    body?: unknown;
    credentials?: RequestCredentials;
    headers?: Record<string, string>;
    unauthorizedBehavior?: "returnNull" | "throw";
  } = {},
  retryCount = 0
): Promise<T> {
  const MAX_RETRIES = 3;
  const { body, credentials = "include", headers = {}, unauthorizedBehavior = "throw" } = options;
  
  try {
    // Always use relative URLs with simplified approach
    const apiUrl = url.startsWith('http') ? url : `${getApiBaseUrl()}${url}`;
    
    console.log(`Request ${method} ${apiUrl} (retry: ${retryCount})`);
    
    const res = await fetch(apiUrl, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials,
    });
    
    // Handle 401 based on specified behavior
    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null as unknown as T;
      }
      throw new Error("Unauthorized");
    }
    
    // For other errors, throw
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    
    // For GET requests and others expecting JSON
    if (method === "GET" || res.headers.get("content-type")?.includes("application/json")) {
      return await res.json();
    }
    
    // For non-JSON responses
    return res as unknown as T;
  } catch (error) {
    // Simple retry logic - just retry the same URL
    if (retryCount < MAX_RETRIES) {
      console.log(`Request failed, retrying (${retryCount + 1}/${MAX_RETRIES})`);
      return makeRequest<T>(method, url, options, retryCount + 1);
    }
    
    console.error('All request attempts failed');
    throw error;
  }
}

// API request function simplified to use the generic makeRequest
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const response = await makeRequest<Response>(method, url, { 
    body: data 
  });
  return response;
}

type UnauthorizedBehavior = "returnNull" | "throw";

// QueryFunction for TanStack Query
export const getQueryFn = <TData>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<TData> =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    return makeRequest<TData>("GET", url, { 
      unauthorizedBehavior: options.on401 
    });
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});