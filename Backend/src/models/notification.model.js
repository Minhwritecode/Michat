import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, // target user
    type: {
      type: String,
      enum: [
        "message",
        "group_message",
        "story_created",
        "story_reply",
        "profile_update",
        "missed_call",
        "group_created",
        "system",
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    icon: { type: String, default: "" }, // optional icon hint
    link: { type: String, default: "" }, // deep link to navigate
    meta: { type: Object, default: {} },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;


