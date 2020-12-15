import {Component, OnInit} from '@angular/core';
import {UserDto} from '../../model/user/user-dto.model';
import {UserService} from '../../service/user/user.service';
import {ChatRoomService} from '../../service/chat-room/chat-room.service';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  currentUser: UserDto;
  chatRooms: ChatRoomDto[];

  currentClickedRoom: ChatRoomDto;

  constructor(private userService: UserService, private chatRoomService: ChatRoomService) {
  }

  ngOnInit(): void {
    this.getAllRooms();
    this.getCurrentUser();
  }

  getAllRooms(): void {
    this.chatRoomService.getAllRooms().subscribe(data => { this.chatRooms = data; console.log(this.chatRooms); });
  }
  getCurrentUser(): void {
    this.userService.getCurrentUser().subscribe(data => { this.currentUser = data; });
  }

  setCurrentRoom(room: ChatRoomDto): void {
    this.currentClickedRoom = room;
  }
}
