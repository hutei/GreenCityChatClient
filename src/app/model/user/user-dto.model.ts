import { ChatRoomDto } from "../chat-room/chat-room-dto.model";

export class UserDto {
  id: number;
  name: string;
  email: string;
  profilePicture: string;
  role: string;
  rooms: ChatRoomDto[];
}
