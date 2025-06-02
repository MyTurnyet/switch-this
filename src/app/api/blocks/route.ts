// Helper to create a response with CORS headers
function createResponse(body: unknown, status = 200) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HTTP-Method-Override, X-Requested-With'
      }
    }
  );
}

export async function GET() {
  return createResponse({ error: 'Not implemented' }, 501);
}

export async function POST() {
  return createResponse({ error: 'Not implemented' }, 501);
}

export function OPTIONS() {
  return createResponse({}, 204);
} 