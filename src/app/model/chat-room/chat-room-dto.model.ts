import {UserDto} from '../user/user-dto.model';
import {ChatMessageDto} from '../chat-message/chat-message-dto.model';

export class ChatRoomDto {
  public id: number;
  public name: string;
  public messages: ChatMessageDto[];
  public chatType: string;
  public participants: UserDto[];
  public ownerId: number;
}
