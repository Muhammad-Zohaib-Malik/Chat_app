import pool from "../config/db.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message, attachment, fileName } = req.body;
    const receiverId = parseInt(req.params.receiverId);
    const senderId = req.user.id;

    if ((!message && !attachment) || !receiverId || !senderId) {
      return res
        .status(400)
        .json({
          error: "Message or attachment, and receiverId, senderId are required",
        });
    }

    // 1. Check if a conversation already exists between these two participants
    // Using @> operator to check if array contains all elements
    const conversationResult = await pool.query(
      `SELECT id, messages FROM conversations 
       WHERE participants @> ARRAY[$1, $2]::INTEGER[] 
       AND array_length(participants, 1) = 2`,
      [senderId, receiverId],
    );

    let conversationId;

    // 2. Insert into the messages table first to get the auto-generated id
    const messageResult = await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, message, attachment, file_name) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [senderId, receiverId, message, attachment, fileName],
    );

    const messageId = messageResult.rows[0].id;
    const newMessage = {
      messageId,
      senderId,
      receiverId,
      message,
      attachment,
      fileName,
      timestamp: new Date().toISOString(),
    };

    if (conversationResult.rows.length > 0) {
      // Conversation exists, update it
      conversationId = conversationResult.rows[0].id;
      const existingMessages = conversationResult.rows[0].messages || [];
      const updatedMessages = [...existingMessages, newMessage];

      await pool.query(
        "UPDATE conversations SET messages = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [JSON.stringify(updatedMessages), conversationId],
      );
    } else {
      // Conversation doesn't exist, create it
      const newConversation = await pool.query(
        "INSERT INTO conversations (participants, messages) VALUES (ARRAY[$1, $2]::INTEGER[], $3) RETURNING id",
        [senderId, receiverId, JSON.stringify([newMessage])],
      );
      conversationId = newConversation.rows[0].id;
    }

    // 3. Socket implementation for real-time
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("receiverId",receiverId)
    console.log("receiverSocketId",receiverSocketId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userToChatId = parseInt(req.params.receiverId);
    const senderId = req.user.id;

    if (!userToChatId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    // Query the conversation between these two users
    const result = await pool.query(
      `SELECT messages FROM conversations 
       WHERE participants @> ARRAY[$1, $2]::INTEGER[] 
       AND array_length(participants, 1) = 2`,
      [senderId, userToChatId],
    );

    if (result.rows.length === 0) {
      return res.status(200).json([]);
    }

    // Return the messages array from the JSONB column
    res.status(200).json(result.rows[0].messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const senderId = req.user.id;

    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    // Find the conversation containing this message
    const convResult = await pool.query(
      `SELECT id, messages, participants FROM conversations
       WHERE EXISTS (
         SELECT 1 FROM jsonb_array_elements(messages) AS m
         WHERE (m->>'messageId')::int = $1
       )`,
      [messageId],
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const conversation = convResult.rows[0];
    const targetMessage = conversation.messages.find(
      (m) => m.messageId === messageId,
    );

    if (!targetMessage) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Verify the user is the sender of this message
    if (targetMessage.senderId !== senderId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own messages" });
    }

    // Remove the message from the JSONB array
    const updatedMessages = conversation.messages.filter(
      (m) => m.messageId !== messageId,
    );

    await pool.query(
      "UPDATE conversations SET messages = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [JSON.stringify(updatedMessages), conversation.id],
    );

    // Delete from the messages table by id
    await pool.query("DELETE FROM messages WHERE id = $1 AND sender_id = $2", [
      messageId,
      senderId,
    ]);

    // Notify the other participant via socket
    const receiverId = conversation.participants.find((p) => p !== senderId);
    if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", { messageId });
      }
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
