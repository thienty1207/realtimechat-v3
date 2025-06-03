import mongoose from "mongoose";

const groupChatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    description: {
      type: String,
      maxlength: 200
    },
    avatar: {
      type: String,
      default: ""
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    streamChannelId: {
      type: String,
      required: true,
      unique: true
    },
    // Có thể xóa hoặc giữ lại để tương lai mở rộng:
    // isPrivate: {
    //   type: Boolean,
    //   default: false
    // },
    maxMembers: {
      type: Number,
      default: 50
    }
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
groupChatSchema.index({ members: 1 });
groupChatSchema.index({ creator: 1 });
groupChatSchema.index({ streamChannelId: 1 });

const GroupChat = mongoose.model("GroupChat", groupChatSchema);
export default GroupChat;