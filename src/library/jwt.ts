import jsonwebtoken from 'jsonwebtoken';
const secret = (process.env.JWT_SECRET || 'r6xhAaU:Hn9xuVV>z?_c') as string;

export async function sign(payload: Record<string, unknown>) {
  return jsonwebtoken.sign(payload, secret);
}

export async function verify(token: string) {
  return jsonwebtoken.verify(token, secret) as { id: string };
}
