import {Component, OnInit} from '@angular/core';
import {UserDto} from '../../model/user/user-dto.model';
import {UserService} from '../../service/user/user.service';
import {ChatRoomService} from '../../service/chat-room/chat-room.service';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {newArray} from '@angular/compiler/src/util';

@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.component.html',
  styleUrls: ['./chat-rooms.component.css']
})
export class ChatRoomsComponent implements OnInit {
  currentUser: UserDto;
  chatRooms: ChatRoomDto[];
  allParticipants: Array<UserDto>;
  privateChatRoom: ChatRoomDto;
  currentClickedRoom: ChatRoomDto;

  constructor(private userService: UserService, private chatRoomService: ChatRoomService) {
  }

  ngOnInit(): void {
    this.getAllRooms();
    this.getCurrentUser();
    this.getAllParticipants();
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
  getAllParticipants(): void {
    this.userService.getAllUsers().subscribe(data => {this.allParticipants = data; console.log(this.allParticipants); });
  }
  // tslint:disable-next-line:typedef
  getPrivateChatRoom(id) {
    // tslint:disable-next-line:max-line-length
    this.chatRoomService.getPrivateChatRoom(id).subscribe(data => {this.privateChatRoom = data; console.log(this.privateChatRoom); });
    return this.privateChatRoom;
  }
  // tslint:disable-next-line:typedef
  getParticipant(participant: any) {
    this.userService.getAllUsersByQuery(participant).subscribe(data => {this.allParticipants = data; });
  }
}
