export type RegisterInput = {
  email: string;
};

export type UserJWT = {
  email: string;
  userId: string;
};

export type RegisterOutput = {
  user: {
    email: string;
  };
  tokens: {
    refreshToken: string;
    accessToken: string;
  };
};

export type VerifyTokenInput = {
  token: string;
};

export type CreatePasswordInput = {
  token: string;
  password: string;
};

export type UpdateInformationInput = {
  fullName: string;
  mobile: string;
  title: string;
  memo: string | null;
};

export type LoginInput = {
  email: string;
  password: string;
};
