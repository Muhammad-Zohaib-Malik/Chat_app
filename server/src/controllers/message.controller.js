import pool from "../config/db.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message, attachment, fileName } = req.body;
    const receiverId = parseInt(req.params.receiverId);
    const senderId = req.user.id;

    if ((!message && !attachment) || !receiverId || !senderId) {
      return res.status(400).json({
        error: "Message or attachment, and receiverId, senderId are required",
      });
    }

    // 1. Check if a conversation already exists between these two participants
    const conversationResult = await pool.query(
      `SELECT id FROM conversations 
       WHERE participants @> ARRAY[$1, $2]::INTEGER[] 
       AND array_length(participants, 1) = 2`,
      [senderId, receiverId],
    );

    let conversationId;

    if (conversationResult.rows.length > 0) {
      conversationId = conversationResult.rows[0].id;
    } else {
      // Conversation doesn't exist, create it
      const newConversation = await pool.query(
        "INSERT INTO conversations (participants) VALUES (ARRAY[$1, $2]::INTEGER[]) RETURNING id",
        [senderId, receiverId],
      );
      conversationId = newConversation.rows[0].id;
    }

    // 2. Insert into the messages table
    const messageResult = await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, conversation_id, message, attachment, file_name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at",
      [senderId, receiverId, conversationId, message, attachment, fileName],
    );

    const messageId = messageResult.rows[0].id;
    const newMessage = {
      messageId,
      senderId,
      receiverId,
      message,
      attachment,
      fileName,
      timestamp: messageResult.rows[0].created_at,
    };

    // 3. Update conversation updated_at (optional but good practice)
    await pool.query(
      "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [conversationId],
    );

    // 4. Socket implementation for real-time
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("receiverId", receiverId);
    console.log("receiverSocketId", receiverSocketId);
    if (receiverSocketId) {
      console.log("📡 Emitting socket message:", newMessage);
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
    const convResult = await pool.query(
      `SELECT id FROM conversations 
       WHERE participants @> ARRAY[$1, $2]::INTEGER[] 
       AND array_length(participants, 1) = 2`,
      [senderId, userToChatId],
    );

    if (convResult.rows.length === 0) {
      return res.status(200).json([]);
    }

    const conversationId = convResult.rows[0].id;

    // Query messages for this conversation
    const result = await pool.query(
      `SELECT id, sender_id , receiver_id, message, attachment, file_name , created_at FROM messages WHERE conversation_id = $1`,
      [conversationId],
    );

    res.status(200).json(result.rows);
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

    // Find the message
    const msgResult = await pool.query(
      `SELECT sender_id, conversation_id FROM messages WHERE id = $1`,
      [messageId],
    );

    if (msgResult.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const message = msgResult.rows[0];

    // Verify the user is the sender of this message
    if (message.sender_id !== senderId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own messages" });
    }

    // Delete from the messages table by id
    await pool.query("DELETE FROM messages WHERE id = $1 AND sender_id = $2", [
      messageId,
      senderId,
    ]);

    // Notify the other participant via socket
    const convResult = await pool.query(
      `SELECT participants FROM conversations WHERE id = $1`,
      [message.conversation_id],
    );

    if (convResult.rows.length > 0) {
      const participants = convResult.rows[0].participants;
      const receiverId = participants.find((p) => p !== senderId);
      if (receiverId) {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageDeleted", { messageId });
        }
      }
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
