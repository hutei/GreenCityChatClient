import {Component, OnInit} from '@angular/core';
import {SocketService} from '../../service/socket/socket.service';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {ChatRoomService} from '../../service/chat-room/chat-room.service';
import {UserService} from "../../service/user/user.service";
import {UserDto} from "../../model/user/user-dto.model";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit{
  chatRooms: ChatRoomDto[];
  currentUser: UserDto;
  constructor(private socketService: SocketService, private chatRoomService: ChatRoomService,
              private userService: UserService) {
  }
  ngOnInit(): void {
    this.socketService.connect();
    this.getAllRooms();
    //this.getCurrentUser();
    this.socketService.setAllRooms(this.chatRooms);

  }
  // getCurrentUser(): void {
  //   this.userService.getCurrentUser().subscribe(data => { this.currentUser = data; });
  // }
  getAllRooms(): void {
    this.chatRoomService.getAllRooms().subscribe(data => { this.chatRooms = data; console.log(this.chatRooms); });
  }

}
