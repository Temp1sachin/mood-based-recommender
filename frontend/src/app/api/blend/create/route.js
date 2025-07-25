
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// This explicitly tells Next.js not to cache this route.
export const dynamic = 'force-dynamic';

// THE FIX: The function must be declared as 'async'
export async function POST(request) {
  try {
    // 1. Get the authorization token from the incoming request headers
    const headersList = headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json({ error: 'Authorization header is missing' }, { status: 401 });
    }

    // 2. Forward the request to your actual backend server
    const response = await fetch('http://localhost:8000/blend/create-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization, // Pass the token along
      },
      // Force the fetch request itself to be dynamic
      cache: 'no-store',
    });

    // 3. Check if the backend request was successful
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || 'Failed to create room on backend' }, { status: response.status });
    }

    // 4. Get the JSON response from your backend
    const data = await response.json();

    // 5. Return the data to the client.
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
