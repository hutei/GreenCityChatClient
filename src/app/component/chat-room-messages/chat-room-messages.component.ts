import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserDto} from '../../model/user/user-dto.model';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {SocketService} from '../../service/socket/socket.service';

@Component({
  selector: 'app-chat-room-messages',
  templateUrl: './chat-room-messages.component.html',
  styleUrls: ['./chat-room-messages.component.css'],
})
export class ChatRoomMessagesComponent implements OnInit, OnDestroy {

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
      this.socketService.sendMessage({
        content: this.newMessage,
        senderId: this.currentUser.id,
        roomId: this.room.id
      });
      this.newMessage = '';
    } catch (err) {
      console.log(err);
    }
  }


}
