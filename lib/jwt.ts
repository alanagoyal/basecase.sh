import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createToken(startTime: number) {
  const token = await new SignJWT({ startTime })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m") // Token expires in 10 minutes
    .sign(SECRET);

  return token;
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { startTime: number };
  } catch {
    throw new Error("Invalid or expired token");
  }
}
