import { graphqlRequest } from "./graphql";

export const SIGNUP = `
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      id
      name
      email
    }
  }
`;

export const LOGIN = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id name email role is_active }
    }
  }
`;

export async function signup(input: {
  name: string;
  email: string;
  password: string;
}) {
  // Note: backend mutations `signup` must exist for this to work
  const data = await graphqlRequest<{
    signup: { id: string; name: string; email: string };
  }>(SIGNUP, { input });

  return data.signup;
}

export async function login(input: { email: string; password: string }) {
  // Note: backend mutation `login` should return { token, user }
  const data = await graphqlRequest<{
    login: {
      token: string;
      user: { id?: string; name?: string; email?: string; role?: string; is_active?: boolean };
    };
  }>(LOGIN, { input });

  return data.login;
}

export function logout() {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("auth-token");
    }
  } catch {
    // ignore
  }
}
