import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserDto} from '../../model/user/user-dto.model';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {SocketService} from '../../service/socket/socket.service';
import {ChatMessageDto} from '../../model/chat-message/chat-message-dto.model';

@Component({
  selector: 'app-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.css'],
})
export class ChatMessagesComponent implements OnInit, OnDestroy {

  newMessage = '';

  @Input() room: ChatRoomDto;
  @Input() currentUser: UserDto;

  constructor(private socketService: SocketService) {
  }

  ngOnInit(): void {
    this.socketService.setChatRoomDto(this.room);
    this.socketService.setCurrentUser(this.currentUser);
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
      chatMessage.content = this.newMessage;
      chatMessage.senderId = this.currentUser.id;
      chatMessage.roomId = this.room.id;
      this.socketService.sendMessage(chatMessage);
      this.newMessage = '';
    } catch (err) {
      console.log(err);
    }
  }

}
