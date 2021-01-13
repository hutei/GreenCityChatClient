import {Component, OnInit} from '@angular/core';
import {UserDto} from '../../model/user/user-dto.model';
import {UserService} from '../../service/user/user.service';
import {ChatRoomService} from '../../service/chat-room/chat-room.service';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ModalComponent} from '../modal/modal.component';
import { FormControl } from '@angular/forms';
import {SocketService} from '../../service/socket/socket.service';


@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.component.html',
  styleUrls: ['./chat-rooms.component.css']
})
export class ChatRoomsComponent implements OnInit {


  constructor(private userService: UserService, private chatRoomService: ChatRoomService, private dialog: MatDialog,
              private  socketService: SocketService) {
  }
  currentUser: UserDto;
  chatRooms: ChatRoomDto[];

  queryField: FormControl = new FormControl();


  allParticipants: Array<UserDto>;
  privateChatRoom: ChatRoomDto;
  currentClickedRoom: ChatRoomDto;
  groupChats: ChatRoomDto[];
  chatRoomRef: MatDialogRef<ModalComponent>;


  ngOnInit(): void {
    this.getAllRooms();
    this.getCurrentUser();
    this.getAllParticipants();
    this.getGroupsChatRooms();
    this.allParticipants = [];
    this.queryField.valueChanges
      .subscribe( result => this.userService.getAllUsersByQuery(result).subscribe(data => {this.allParticipants = data; } ));
  }

  getAllRooms(): void {
    this.chatRoomService.getAllVisibleRooms().subscribe(data => { this.chatRooms = data; console.log(this.chatRooms); });
  }
  getCurrentUser(): void {
    this.userService.getCurrentUser().subscribe(data => { this.currentUser = data; });
  }

  setCurrentRoom(room: ChatRoomDto): void {
    // room.messages.sort( (msg1, msg2) => ( msg1.id > msg2.id ? 1 : -1));
    this.ngOnInit();
    this.currentClickedRoom = room;
    if (this.currentClickedRoom !== undefined) {
      if (this.currentClickedRoom.messages !== undefined) {
        this.currentClickedRoom.messages.sort((msg1, msg2) => (msg1.id > msg2.id ? 1 : -1));
      }
    }
    this.socketService.setChatRoomDto(room);
  }
  getAllParticipants(): void {
    this.userService.getAllUsers().subscribe(data => {this.allParticipants = data; console.log(this.allParticipants); });
  }
  // tslint:disable-next-line:typedef
  getPrivateChatRoom(id) {
    // tslint:disable-next-line:max-line-length
    this.chatRoomService.getPrivateChatRoom(id).subscribe(data => {this.currentClickedRoom = data; });
    this.privateChatRoom = this.currentClickedRoom;
    if (this.currentClickedRoom !== undefined) {
      if (this.currentClickedRoom.messages !== undefined) {
        this.currentClickedRoom.messages.sort((msg1, msg2) => (msg1.id > msg2.id ? 1 : -1));
      }
    }
    this.setCurrentRoom(this.privateChatRoom);
  }
  // tslint:disable-next-line:typedef
  getParticipant(participant: any) {
    this.userService.getAllUsersByQuery(participant).subscribe(data => {this.allParticipants = data; });
  }
  // tslint:disable-next-line:typedef
  getGroupsChatRooms() {
    this.chatRoomService.getGroupChatRooms().subscribe(data => {this.groupChats = data; });
  }
  openAddFileDialog(): void {
    this.chatRoomRef = this.dialog.open(ModalComponent, {
      hasBackdrop: false
    });
  }
  // tslint:disable-next-line:typedef
  getChatRooms(name: string) {
    this.chatRoomService.getAllChatRoomsByQuery(name).subscribe(data => {this.chatRooms = data; });
  }

}
