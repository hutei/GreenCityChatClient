import {Injectable} from '@angular/core';

declare var SockJS;
declare var Stomp;
import {webSocketEndPointLink, webSocketLink} from '../../../links';
import {ChatMessageDto} from '../../model/chat-message/chat-message-dto.model';
import {UserDto} from '../../model/user/user-dto.model';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';


@Injectable({
  providedIn: 'root'
})
export class SocketService {

  webSocket: any;
  stompClient: any;
  chatRoom: ChatRoomDto;
  currentUser: UserDto;

  constructor() {
    this.connect();
  }

  connect(): void {
    this.webSocket = new SockJS(webSocketLink + webSocketEndPointLink);
    this.stompClient = Stomp.over(this.webSocket);
    this.stompClient.connect({}, this.onConnected, this.onError);
    console.log(this.stompClient);
  }

  onConnected = () => {
    console.log('connected');
    this.stompClient.subscribe(
      '/room/' + this.chatRoom.id + '' + '/queue/messages',
      this.onMessageReceived
    );
  }
  onError = (err) => {
    console.log(err);
  }

  onMessageReceived = (msg) => {
    console.log(msg);
    const chatMsg = JSON.parse(msg.body);
    this.chatRoom.messages.unshift(chatMsg);
  }

  sendMessage = (chatMessageDto: ChatMessageDto) => {
    this.stompClient.send('/app/chat', {}, JSON.stringify(chatMessageDto));
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
}

