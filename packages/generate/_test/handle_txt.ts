export function GET(req: Request) {
  const { pathname } = new URL(req.url);
  const fileUrl = import.meta.resolve(`./routes${pathname}.txt`);
  return fetch(fileUrl);
}
