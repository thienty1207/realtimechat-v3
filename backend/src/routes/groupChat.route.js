import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroupChat,
  getUserGroupChats,
  addMemberToGroup,
  leaveGroup,
  updateGroupInfo,
  deleteGroup,
  searchGroupMembers,
  kickMember
} from "../controllers/groupChat.controller.js";

const router = express.Router();

// Tạo nhóm chat mới
router.post("/create", protectRoute, createGroupChat);

// Lấy danh sách nhóm chat của user
router.get("/my-groups", protectRoute, getUserGroupChats);

// Thêm thành viên vào nhóm
router.post("/:groupId/add-members", protectRoute, addMemberToGroup);

// Rời khỏi nhóm
router.post("/:groupId/leave", protectRoute, leaveGroup);

// Kick member khỏi nhóm (chỉ admin/creator)
router.post("/:groupId/kick/:memberId", protectRoute, kickMember);

// Cập nhật thông tin nhóm
router.put("/:groupId/update", protectRoute, updateGroupInfo);

// Xóa nhóm (chỉ creator)
router.delete("/:groupId/delete", protectRoute, deleteGroup);

// Tìm kiếm thành viên trong nhóm
router.get("/:groupId/members/search", protectRoute, searchGroupMembers);

export default router;