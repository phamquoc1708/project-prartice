import JWT from "jsonwebtoken";

export const createTokenPair = (payload: object, publicKey: string, privateKey: string) => {
  try {
    const accessToken = JWT.sign(payload, publicKey, { expiresIn: "7 days" });
    const refreshToken = JWT.sign(payload, privateKey, { expiresIn: "7 days" });

    return { accessToken, refreshToken };
  } catch (err) {}
};
