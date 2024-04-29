import WaitingRoom from './WaitingRoom.tsx';
import { useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from './ChatRoom.tsx';

interface ChatProps {
  conn: HubConnection | undefined;
  messages: string[];
  joinChatRoom: (username: string, chatroom: string) => void;
  sendMessage: (message: string) => void;
}
const Chat = ({ conn, messages, joinChatRoom, sendMessage }: ChatProps) => {

  return (
    <div>
      <h1>Chat</h1>
      {
        conn ?
          <ChatRoom messages={messages} sendMessage={sendMessage}></ChatRoom>
          :
          <WaitingRoom joinChatRoom={joinChatRoom}></WaitingRoom>
      }
    </div>
  );
};
export default Chat;