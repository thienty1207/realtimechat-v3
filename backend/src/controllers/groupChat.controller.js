import GroupChat from "../models/GroupChat.js";
import User from "../models/User.js";
import { generateStreamToken } from "../lib/stream.js";
import { StreamChat } from "stream-chat";
import { io, connectedUsers } from "../server.js";

const streamClient = StreamChat.getInstance(
  process.env.STEAM_API_KEY,
  process.env.STEAM_API_SECRET
);

// Create new group chat
export async function createGroupChat(req, res) {
  try {
    // Remove isPrivate = false from destructuring
    const { name, description, memberIds = [] } = req.body;
    const creatorId = req.user.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Group name is required" });
    }

    if (memberIds.length > 49) { // Creator + 49 members = 50 max
      return res.status(400).json({ message: "Group can only have a maximum of 50 members" });
    }

    // Create unique channel ID for Stream
    const streamChannelId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create member list (including creator)
    const allMembers = [creatorId, ...memberIds.filter(id => id !== creatorId)];
    
    // Create group in database with default image
    const groupChat = await GroupChat.create({
      name: name.trim(),
      description: description?.trim() || "",
      avatar: "/groupchat.png", // Add default image
      creator: creatorId,
      members: allMembers,
      admins: [creatorId],
      streamChannelId
    });

    // Populate member information
    await groupChat.populate('members', 'fullName profilePic');
    await groupChat.populate('creator', 'fullName profilePic');

    // Create channel in Stream Chat
    const channel = streamClient.channel('messaging', streamChannelId, {
      name: name.trim(),
      created_by_id: creatorId,
      members: allMembers.map(id => id.toString()),
      custom: {
        isGroupChat: true,
        groupId: groupChat._id.toString(),
        description: description?.trim() || ""
      }
    });

    await channel.create();

    // Send real-time notifications to members
    allMembers.forEach(memberId => {
      if (memberId.toString() !== creatorId) {
        const memberSocketId = connectedUsers.get(memberId.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("groupChatInvite", {
            groupId: groupChat._id,
            groupName: name.trim(),
            creator: {
              _id: creatorId,
              fullName: req.user.fullName,
              profilePic: req.user.profilePic
            },
            timestamp: new Date()
          });
        }
      }
    });

    res.status(201).json({
      success: true,
      group: groupChat
    });
  } catch (error) {
    console.error("Error in createGroupChat controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get user's group chats list
export async function getUserGroupChats(req, res) {
  try {
    const userId = req.user.id;

    const groupChats = await GroupChat.find({
      members: userId
    })
    .populate('creator', 'fullName profilePic')
    .populate('members', 'fullName profilePic')
    .sort({ updatedAt: -1 });

    res.status(200).json(groupChats);
  } catch (error) {
    console.error("Error in getUserGroupChats controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Add member to group
export async function addMemberToGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user.id;

    const group = await GroupChat.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check admin permissions
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ message: "Only admins can add members" });
    }

    // Check member limit
    const newMemberCount = group.members.length + memberIds.length;
    if (newMemberCount > group.maxMembers) {
      return res.status(400).json({ 
        message: `Group can only have a maximum of ${group.maxMembers} members` 
      });
    }

    // Add new members (remove duplicates)
    const newMembers = memberIds.filter(id => !group.members.includes(id));
    
    if (newMembers.length === 0) {
      return res.status(400).json({ message: "All users are already members of the group" });
    }

    // Get new member information to display names in system message
    const newMemberUsers = await User.find({ _id: { $in: newMembers } }).select('fullName');

    group.members.push(...newMembers);
    await group.save();

    // Update Stream channel
    const channel = streamClient.channel('messaging', group.streamChannelId);
    await channel.addMembers(newMembers.map(id => id.toString()));

    // Send system message notifying new members added
    for (const newMemberUser of newMemberUsers) {
      await channel.sendMessage({
        text: `${newMemberUser.fullName} has been added to the group`,
        type: 'system',
        user: {
          id: 'system',
          name: 'System'
        }
      });
    }

    // Send socket notification
    newMembers.forEach(memberId => {
      const memberSocketId = connectedUsers.get(memberId.toString());
      if (memberSocketId) {
        io.to(memberSocketId).emit("addedToGroup", {
          groupId: group._id,
          groupName: group.name,
          addedBy: {
            _id: userId,
            fullName: req.user.fullName,
            profilePic: req.user.profilePic
          },
          timestamp: new Date()
        });
      }
    });

    await group.populate('members', 'fullName profilePic');
    res.status(200).json({ success: true, group });
  } catch (error) {
    console.error("Error in addMemberToGroup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Leave group
export async function leaveGroup(req, res) {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await GroupChat.findById(groupId).populate('creator', 'fullName');
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    // Get leaving user information
    const leavingUser = await User.findById(userId).select('fullName');

    // Remove from members and admins list
    group.members = group.members.filter(id => id.toString() !== userId);
    group.admins = group.admins.filter(id => id.toString() !== userId);

    // If creator leaves and there are other members, transfer creator rights
    if (group.creator.toString() === userId && group.members.length > 0) {
      group.creator = group.members[0];
      if (!group.admins.includes(group.members[0])) {
        group.admins.push(group.members[0]);
      }
    }

    // If no members left, delete group
    if (group.members.length === 0) {
      await GroupChat.findByIdAndDelete(groupId);
      // Delete Stream channel
      const channel = streamClient.channel('messaging', group.streamChannelId);
      await channel.delete();
      return res.status(200).json({ success: true, message: "Group has been deleted" });
    }

    await group.save();

    // Update Stream channel
    const channel = streamClient.channel('messaging', group.streamChannelId);
    await channel.removeMembers([userId]);

    // Send system message notifying member left
    await channel.sendMessage({
      text: `${leavingUser.fullName} has left the group`,
      type: 'system',
      user: {
        id: 'system',
        name: 'System'
      }
    });

    res.status(200).json({ success: true, message: "Left the group successfully" });
  } catch (error) {
    console.error("Error in leaveGroup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update group information
export async function updateGroupInfo(req, res) {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    const group = await GroupChat.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check admin permissions
    if (!group.admins.includes(userId)) {
      return res.status(403).json({ message: "Only admins can update group information" });
    }

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();

    await group.save();

    // Update Stream channel
    const channel = streamClient.channel('messaging', group.streamChannelId);
    await channel.update({
      name: group.name,
      custom: {
        ...channel.data.custom,
        description: group.description
      }
    });

    res.status(200).json({ success: true, group });
  } catch (error) {
    console.error("Error in updateGroupInfo controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete group chat (only creator has permission)
export async function deleteGroup(req, res) {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await GroupChat.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only creator can delete group
    if (group.creator.toString() !== userId) {
      return res.status(403).json({ message: "Only group creator can delete the group" });
    }

    // Delete Stream channel
    try {
      const channel = streamClient.channel('messaging', group.streamChannelId);
      await channel.delete();
    } catch (streamError) {
      console.warn("Error deleting Stream channel:", streamError);
    }

    // Send notification to all members
    group.members.forEach(memberId => {
      if (memberId.toString() !== userId) {
        const memberSocketId = connectedUsers.get(memberId.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("groupDeleted", {
            groupId: group._id,
            groupName: group.name,
            deletedBy: {
              _id: userId,
              fullName: req.user.fullName
            },
            timestamp: new Date()
          });
        }
      }
    });

    // Delete group from database
    await GroupChat.findByIdAndDelete(groupId);

    res.status(200).json({ success: true, message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Search members in group
export async function searchGroupMembers(req, res) {
  try {
    const { groupId } = req.params;
    const { query } = req.query;
    const userId = req.user.id;

    const group = await GroupChat.findById(groupId)
      .populate('members', 'fullName profilePic nativeLanguage learningLanguage');
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is a member of the group
    if (!group.members.some(member => member._id.toString() === userId)) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    let filteredMembers = group.members;
    
    if (query && query.trim()) {
      const searchQuery = query.trim().toLowerCase();
      filteredMembers = group.members.filter(member => 
        member.fullName.toLowerCase().includes(searchQuery)
      );
    }

    res.status(200).json({
      success: true,
      members: filteredMembers,
      total: filteredMembers.length
    });
  } catch (error) {
    console.error("Error in searchGroupMembers controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Kick member from group
export async function kickMember(req, res) {
  try {
    const { groupId, memberId } = req.params;
    const kickerId = req.user.id;

    const group = await GroupChat.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check admin or creator permissions
    if (!group.admins.includes(kickerId)) {
      return res.status(403).json({ message: "Only admins can kick members" });
    }

    // Cannot kick yourself
    if (kickerId === memberId) {
      return res.status(400).json({ message: "Cannot kick yourself" });
    }

    // Cannot kick creator
    if (group.creator.toString() === memberId) {
      return res.status(400).json({ message: "Cannot kick group creator" });
    }

    // Check if member is in the group
    if (!group.members.includes(memberId)) {
      return res.status(400).json({ message: "Member is not in the group" });
    }

    // Get kicked member information
    const kickedUser = await User.findById(memberId);
    if (!kickedUser) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Remove member from group
    group.members = group.members.filter(member => member.toString() !== memberId);
    
    // Remove from admin if is admin
    if (group.admins.includes(memberId)) {
      group.admins = group.admins.filter(admin => admin.toString() !== memberId);
    }

    await group.save();

    // Update Stream channel
    const channel = streamClient.channel('messaging', group.streamChannelId);
    await channel.removeMembers([memberId]);

    // Send system message notifying member was kicked
    await channel.sendMessage({
      text: `${kickedUser.fullName} was kicked from the group by ${req.user.fullName}`,
      type: 'system',
      user: {
        id: 'system',
        name: 'System'
      }
    });

    // Send socket notification to kicked member (if online)
    if (connectedUsers.has(memberId)) {
      const memberSocketId = connectedUsers.get(memberId);
      io.to(memberSocketId).emit('kickedFromGroup', {
        groupId: group._id,
        groupName: group.name,
        kickedBy: {
          _id: req.user.id,
          fullName: req.user.fullName,
          profilePic: req.user.profilePic
        },
        timestamp: new Date()
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `${kickedUser.fullName} has been kicked from the group` 
    });
  } catch (error) {
    console.error("Error in kickMember controller:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}