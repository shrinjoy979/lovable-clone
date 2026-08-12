"use client";

import { useState } from "react";

import type { Message } from "@repo/shared/chat";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";

import chatService from "../../services/chat.service";

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! How can I help you today?",
    },
  ]);

  function updateLastMessage(content: string) {
    setMessages((prev) => {
      const updated = [...prev];
  
      const lastMessage = updated[updated.length - 1];
  
      if (!lastMessage) {
        return prev;
      }
  
      updated[updated.length - 1] = {
        ...lastMessage,
        content,
      };
  
      return updated;
    });
  }

  async function handleSend(content: string) {
    const userMessage: Message = {
      role: "user",
      content,
    };
    
    const assistantMessage: Message = {
      role: "assistant",
      content: "",
    };
    
    // Create the conversation snapshot once
    const conversation: Message[] = [
      ...messages,
      userMessage,
    ];
    
    // Update the UI
    setMessages([
      ...conversation,
      assistantMessage,
    ]);
    
    try {
      let response = "";
    
      const stream = chatService.generateStream({
        messages: conversation,
      });
    
      for await (const chunk of stream) {
        response += chunk;
        updateLastMessage(response);
      }
    } catch (error) {
      console.error(error);
    
      updateLastMessage("Something went wrong.");
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col p-6">
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={messages} />
      </div>

      <div className="mt-4">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}