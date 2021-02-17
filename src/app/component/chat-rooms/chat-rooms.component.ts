import {Component, OnInit} from '@angular/core';
import {UserDto} from '../../model/user/user-dto.model';
import {UserService} from '../../service/user/user.service';
import {ChatRoomService} from '../../service/chat-room/chat-room.service';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ModalComponent} from '../modal/modal.component';
import { FormControl } from '@angular/forms';
import {SocketService} from '../../service/socket/socket.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.component.html',
  styleUrls: ['./chat-rooms.component.css']
})
export class ChatRoomsComponent implements OnInit {


  constructor(private userService: UserService, private chatRoomService: ChatRoomService,
              private dialog: MatDialog,
              private  socketService: SocketService,
              private modalService: NgbModal) {
  }
  currentUser: UserDto;
  chatRooms = [];
  closeResult: any;
  model = {
    chatName: ''
  };

  queryField: FormControl = new FormControl();

  list: any;
  allParticipants: Array<UserDto>;
  privateChatRoom: ChatRoomDto;
  currentClickedRoom: ChatRoomDto;
  groupChats: ChatRoomDto[];
  chatRoomRef: MatDialogRef<ModalComponent>;


  ngOnInit(): void {
    this.list = [];
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
      hasBackdrop: false,
    });
  }
  // tslint:disable-next-line:typedef
  getChatRooms(name: string) {
    this.chatRoomService.getAllChatRoomsByQuery(name).subscribe(data => {this.chatRooms = data; });
  }
  deleteChatRoom(roomId): void {
    Swal.fire({
      title: 'Do you want to delete the chat-room?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `Yes`,
      denyButtonText: `No`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        if(this.currentClickedRoom.ownerId !== this.currentUser.id && this.currentClickedRoom.chatType === 'GROUP') {
          Swal.fire({
            icon: 'error',
            text: 'You are not owner of this chat',
          });
          return;
        }
        this.chatRoomService.deleteChatRoom(roomId);
        this.chatRooms.forEach( (cr, index) => {
          if (cr.id === roomId) {
            this.chatRooms.splice(index, 1);
          }
        } );
        Swal.fire('Success', '', 'success');
      } else if (result.isDenied) {
        Swal.fire('\n' +
          'The chat-room has not been deleted', '', '');
      }
    });
  }


  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', backdrop: 'static'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  add(member: any): void {
    this.list.push(member);
  }
  remove(member): void {
    this.list.forEach( (msg, index) => {
      if (msg.id === member.id) {
        this.list.splice(index, 1); }
    });
  }
  createGroupChat(): void {
    // this.list.push(this.currentUser);
    const name = (document.getElementById('chatName') as HTMLInputElement).value;
    this.chatRoomService.createGroupChatRoom(this.list, name);
    window.location.assign('/');
  }

  viewGroupInfo(info, room) {
    this.currentClickedRoom = room;
    this.modalService.open(info, {ariaLabelledBy: 'modal-basic-title', backdrop: 'static'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  rename(name, room) {
    this.currentClickedRoom = room;
    this.modalService.open(name, {ariaLabelledBy: 'modal-basic-title', backdrop: 'static'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  renameGroupChat(room: any) {
    room.name = this.model.chatName;
    this.chatRoomService.manageChatRoom(room);
    window.location.assign('/');
  };

  leaveGroupChat(id: number) {
    let room = new ChatRoomDto();
    this.chatRooms.forEach(r => {
      if(r.id === id) {
          room = r;
        }
    });
    this.chatRoomService.leaveChatRoom(room);
    window.location.assign('/');
  }

  removeParticipantsChatRoom(manage, room) {
    this.currentClickedRoom = room;
    this.list = this.currentClickedRoom.participants;
    this.modalService.open(manage, {ariaLabelledBy: 'modal-basic-title', backdrop: 'static'}).result.then((result) => {
      window.location.assign('/');
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      window.location.assign('/');
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  addParticipantsChatRoom(manage2, room) {
    this.currentClickedRoom = room;
    this.modalService.open(manage2, {ariaLabelledBy: 'modal-basic-title', backdrop: 'static'}).result.then((result) => {
      window.location.assign('/');
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      window.location.assign('/');
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  manageChatRoom(members: UserDto[]) {
    members.forEach(part => this.currentClickedRoom.participants.push(part));
    this.chatRoomService.manageChatRoom(this.currentClickedRoom);
    window.location.assign('/');
  }


}
