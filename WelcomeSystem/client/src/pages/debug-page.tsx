import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const [apiStatus, setApiStatus] = useState<string>("Not tested");
  const [userApiResult, setUserApiResult] = useState<string>("Not tested");
  const [ports, setPorts] = useState<string[]>(["5000", "8080", "3000", "3001"]);
  const [activePort, setActivePort] = useState<string>("5000");

  // Function to test the API
  const testApi = async (port: string) => {
    try {
      setApiStatus("Testing...");
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:${port}/api/user`, {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache"
        }
      });
      
      const statusText = `Status: ${response.status} - ${response.statusText}`;
      setApiStatus(statusText);
      
      // If status is 200, we got a successful response
      if (response.status === 200) {
        const data = await response.json();
        setUserApiResult(JSON.stringify(data, null, 2));
      } else if (response.status === 401) {
        setUserApiResult("Received 401 Unauthorized (expected when not logged in)");
      } else {
        setUserApiResult(`Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setApiStatus("Error");
      setUserApiResult(`Connection error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Test registration API
  const testRegistration = async () => {
    try {
      const testUser = {
        username: `test_${Math.floor(Math.random() * 1000)}`,
        email: `test_${Math.floor(Math.random() * 1000)}@example.com`,
        password: "password123",
        fullName: "Test User"
      };
      
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:${activePort}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(testUser),
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserApiResult(`Registration successful: ${JSON.stringify(data, null, 2)}`);
      } else {
        setUserApiResult(`Registration failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setUserApiResult(`Registration error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Testing login API
  const testLogin = async () => {
    try {
      const loginData = {
        username: "testuser",
        password: "password123"
      };
      
      const response = await fetch(`${window.location.protocol}//${window.location.hostname}:${activePort}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(loginData),
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserApiResult(`Login successful: ${JSON.stringify(data, null, 2)}`);
      } else {
        setUserApiResult(`Login failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setUserApiResult(`Login error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Debug</CardTitle>
          <CardDescription>Test the connection to the server API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">API Status: {apiStatus}</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ports.map(port => (
                <Button 
                  key={port} 
                  onClick={() => { 
                    setActivePort(port);
                    testApi(port);
                  }}
                  variant={activePort === port ? "default" : "outline"}
                >
                  Test Port {port}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium">Authentication Tests</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button onClick={testRegistration}>Test Registration API</Button>
              <Button onClick={testLogin}>Test Login API</Button>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium">API Response:</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto mt-2 max-h-60">
              {userApiResult}
            </pre>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            This page helps debug API connectivity issues in the Replit environment.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}