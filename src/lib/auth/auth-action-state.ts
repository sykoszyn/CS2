export type AuthActionState = {
  status: "idle" | "error" | "check-email";
  message?: string;
};

export const initialAuthActionState: AuthActionState = { status: "idle" };
