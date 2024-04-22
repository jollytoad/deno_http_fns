export function GET() {
  return new Response();
}

export function PUT() {
  return new Response(null, { status: 202, statusText: "Accepted" });
}
