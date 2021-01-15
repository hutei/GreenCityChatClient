import {Injectable} from '@angular/core';

declare var SockJS;
declare var Stomp;
import {webSocketEndPointLink, webSocketLink} from '../../../links';
import {ChatMessageDto} from '../../model/chat-message/chat-message-dto.model';
import {UserDto} from '../../model/user/user-dto.model';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {ChatRoomService} from '../chat-room/chat-room.service';


@Injectable({
  providedIn: 'root'
})
export class SocketService {

  webSocket: any;
  stompClient: any;
  chatRoom: ChatRoomDto;
  currentUser: UserDto;
  chatRooms: ChatRoomDto[];

  constructor(private chatService: ChatRoomService) {
    this.chatService.getAllVisibleRooms().subscribe(data => {this.chatRooms = data; });
  }
  connect(): void {
    this.webSocket = new SockJS(webSocketLink + webSocketEndPointLink);
    this.stompClient = Stomp.over(this.webSocket);
    this.stompClient.connect({}, this.onConnected, this.onError);
    console.log(this.stompClient);
  }

  onConnected = () => {
    console.log('connected');
    this.chatRooms.forEach(chatRoom => {this.stompClient.subscribe('/room/' + chatRoom.id + '' + '/queue/messages',
      this.onMessageReceived); });
  }
  onError = (err) => {
    console.log(err);
  }

  onMessageReceived = (msg) => {
    console.log(msg);
    const chatMsg = JSON.parse(msg.body);
    if (msg.headers.delete !== undefined) {
      this.getChatRoomDto().messages.forEach((m, index) => {
        if (m.id === chatMsg.id) {
          this.getChatRoomDto().messages.splice(index, 1);
        }
      });
    } else if (msg.headers.update !== undefined) {
      this.getChatRoomDto().messages.forEach((m, index) => {
        if (m.id === chatMsg.id) {
          this.getChatRoomDto().messages.splice(index, 1, chatMsg);
          return;
        }
      });
    }
    else {
      if (this.getChatRoomDto().messages.length === 0) {
        this.getChatRoomDto().messages.push(chatMsg);
        return;
      }
      if (this.getChatRoomDto().messages[this.getChatRoomDto().messages.length - 1].id !== chatMsg.id) {
      this.getChatRoomDto().messages.push(chatMsg);
      }
    }
  }

  sendMessage = (chatMessageDto: ChatMessageDto) => {
    let ind = 0;
    this.chatService.getAllVisibleRooms().subscribe(data => {this.chatRooms = data; });
    const len = this.chatRooms.length;
    this.chatRooms.forEach( cr => {
      if (cr.id !== this.getChatRoomDto().id) {
        ind++;
      }
    });
    if (len === ind) {
      this.stompClient.subscribe('/room/' + this.getChatRoomDto().id + '' + '/queue/messages',
        this.onMessageReceived);
    }
    this.stompClient.send('/app/chat', {}, JSON.stringify(chatMessageDto));
  }

  deleteMessage = (chatMessageDto: ChatMessageDto) => {
    this.stompClient.send('/app/chat/delete', {}, JSON.stringify(chatMessageDto));
  }

  updateMessage = (chatMessageDto: ChatMessageDto) => {
    this.stompClient.send('/app/chat/update', {}, JSON.stringify(chatMessageDto));
  }

  public closeWebSocket(): void {
    this.webSocket.close();
  }

  setCurrentUser(currentUser: UserDto): void {
    this.currentUser = currentUser;
  }

  setChatRoomDto(chatRoom: ChatRoomDto): void {
    this.chatRoom = chatRoom;
  }
  getChatRoomDto(): ChatRoomDto{
    return this.chatRoom;
  }
  setAllRooms(chatRooms: ChatRoomDto[]): void {
    this.chatRooms = chatRooms;
  }
}

