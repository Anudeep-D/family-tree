import React, { useState } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Box,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Close, Send, Delete } from "@mui/icons-material";

interface Message {
  text: string;
  sender: "user" | "ai";
}

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() !== "") {
      const newMessages: Message[] = [
        ...messages,
        { text: input, sender: "user" },
      ];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch("http://localhost:8000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: input }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setMessages([...newMessages, { text: data.reply, sender: "ai" }]);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        setMessages([
          ...newMessages,
          { text: "Error: Could not connect to the server.", sender: "ai" },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 400,
          p: 2,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Chat with AI</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
        <Paper
          elevation={1}
          sx={{ flexGrow: 1, overflow: "auto", p: 2, my: 2 }}
        >
          <List>
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    bgcolor:
                      msg.sender === "user" ? "primary.main" : "grey.300",
                    color:
                      msg.sender === "user"
                        ? "primary.contrastText"
                        : "text.primary",
                    p: 1,
                    borderRadius: 2,
                    maxWidth: "70%",
                  }}
                >
                  <ListItemText
                    primary={msg.sender === "user" ? "You" : "AI"}
                    secondary={msg.text}
                    secondaryTypographyProps={{ style: { color: "inherit" } }}
                  />
                </Box>
              </ListItem>
            ))}
            {loading && (
              <ListItem sx={{ justifyContent: "flex-start" }}>
                <CircularProgress size={24} />
              </ListItem>
            )}
          </List>
        </Paper>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            variant="outlined"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            disabled={loading}
          />
          <IconButton onClick={handleSend} color="primary" disabled={loading}>
            <Send />
          </IconButton>
          <IconButton onClick={handleClearHistory} disabled={loading}>
            <Delete />
          </IconButton>
        </Box>
      </Box>
    </Drawer>
  );
};
