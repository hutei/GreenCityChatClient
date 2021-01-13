import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserDto} from '../../model/user/user-dto.model';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {SocketService} from '../../service/socket/socket.service';
import {ChatMessageDto} from '../../model/chat-message/chat-message-dto.model';
import {DatePipe} from '@angular/common';
import {ChatMessageService} from '../../service/chat-message/chat-message.service';
import {ChatRoomService} from '../../service/chat-room/chat-room.service';
import {ChatRoomsComponent} from '../chat-rooms/chat-rooms.component';


@Component({
  selector: 'app-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.css'],
  providers: [DatePipe],
})
export class ChatMessagesComponent implements OnInit, OnDestroy {

  static lastMessage: number;
  newMessage = '';
  webSocket: any;
  stompClient: any;

  @Input() room: ChatRoomDto;
  @Input() currentUser: UserDto;
  // tslint:disable-next-line:max-line-length
  constructor(private socketService: SocketService,
              private datePipe: DatePipe,
              private chatMessageService: ChatMessageService,
              private chatRoomService: ChatRoomService,
              private chatRoomComponent: ChatRoomsComponent) {
  }

  ngOnInit(): void {
    this.socketService.setChatRoomDto(this.room);
    this.room.messages.sort( (msg1, msg2) => ( msg1.id > msg2.id ? 1 : -1));
    console.log(this.room.messages);
    this.socketService.setCurrentUser(this.currentUser);
    this.getLastMessageId();
  }

  ngOnDestroy(): void {
     this.socketService.closeWebSocket();
  }

  // tslint:disable-next-line:typedef
  async sendMessage() {
    if (this.newMessage.trim() === '') {
      return;
    }
    try {
      this.socketService.setChatRoomDto(this.room);
      const chatMessage = new ChatMessageDto();
      ++ChatMessagesComponent.lastMessage;
      chatMessage.id = ChatMessagesComponent.lastMessage;
      chatMessage.content = this.newMessage;
      chatMessage.senderId = this.currentUser.id;
      chatMessage.roomId = this.room.id;
      this.socketService.sendMessage(chatMessage);
      this.newMessage = '';
      if (this.room.messages.length === 0 && this.room.chatType === 'PRIVATE') {
        this.chatRoomComponent.chatRooms.push(this.room);
      }
    } catch (err) {
      console.log(err);
    }
  }
  deleteMessage(messageId): void {
    this.socketService.setChatRoomDto(this.room);
    this.room.messages.forEach( (msg, index) => {
      if (msg.id === messageId) {/*this.room.messages.splice(index, 1);*/
      this.socketService.deleteMessage(this.room.messages[index]); }
    });
    if (this.room.messages.length === 1 && this.room.chatType === 'PRIVATE') {
      this.chatRoomComponent.chatRooms.forEach( (cr, index) => {
        if (this.room.id === cr.id) {
          this.chatRoomComponent.chatRooms.splice(index, 1);
        }
      });
    }
  }
  updateMessage(messageId, content): void {
    this.socketService.setChatRoomDto(this.room);
    content = prompt('Update message please', content);
    this.room.messages.forEach( (msg, index) => {
      if (msg.id === messageId) {
      this.room.messages[index].content = content;
      this.socketService.updateMessage(this.room.messages[index]); }
    });
  }
  getLastMessageId(): void {
    this.chatMessageService.getLastMessageId().subscribe(data => {ChatMessagesComponent.lastMessage = data; } );
  }
}
