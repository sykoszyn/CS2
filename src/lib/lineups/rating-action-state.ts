export type RatingActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export const initialRatingActionState: RatingActionState = { status: "idle" };
