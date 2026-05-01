import pool from "../config/db.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const receiverId = parseInt(req.params.receiverId);
    const senderId = req.user.id;

    if (!message || !receiverId || !senderId) {
      return res
        .status(400)
        .json({ error: "Message and receiverId, senderId are required" });
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
    const newMessage = {
      senderId,
      receiverId,
      message,
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

    // 2. Also insert into the messages table for detailed tracking/querying
    await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)",
      [senderId, receiverId, message],
    );

    // 3. Socket implementation for real-time
    const receiverSocketId = getReceiverSocketId(receiverId);
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
