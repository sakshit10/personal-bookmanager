import { Schema, type HydratedDocument, models, model, Types } from "mongoose";

export const BOOK_STATUSES = ["want-to-read", "reading", "completed"] as const;
export type BookStatus = (typeof BOOK_STATUSES)[number];

export interface IBook {
  user: Types.ObjectId;
  title: string;
  author: string;
  tags: string[];
  status: BookStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type BookDocument = HydratedDocument<IBook>;

const BookSchema = new Schema<IBook>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // every query is scoped to a user; index keeps that fast
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 200,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxlength: 120,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags: string[]) =>
        // normalize so "Fiction" and "fiction" filter as the same tag
        Array.from(
          new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))
        ),
    },
    status: {
      type: String,
      enum: BOOK_STATUSES,
      default: "want-to-read",
    },
  },
  { timestamps: true }
);

export default models.Book || model<IBook>("Book", BookSchema);
