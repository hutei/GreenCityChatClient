import {Component, OnInit} from '@angular/core';
import {UserDto} from '../../model/user/user-dto.model';
import {UserService} from '../../service/user/user.service';
import {ChatRoomService} from '../../service/chat-room/chat-room.service';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ModalComponent} from '../modal/modal.component';
import {FormControl} from '@angular/forms';
import {SocketService} from '../../service/socket/socket.service';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {GroupChatRoomCreateDto} from '../../model/chat-room/group-chat-room-create-dto.model';
import {interval} from 'rxjs';
import {LeaveChatDto} from '../../model/chat-room/leave-chat-dto';

//emit value in sequence every 1 second
// const source = interval(function (x){
//   console.log("INTERVA;");
//   this.chatRooms = this.socketService.getAllRooms();
// },1000);


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

  // const interval
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


  /// витягнення з часом всіх повідомлень із сервісу
//   source = interval(1000);
// //output: 0,1,2,3,4,5....
//   subscribe = this.source.subscribe(val => {console.log(val);
//     this.chatRooms =  this.socketService.getAllRooms();
//   });

  ngOnInit(): void {
    this.list = [];
    this.getAllRooms();
    //this.socketService.setAllRooms(this.chatRooms);
    this.getCurrentUser();
    this.getAllParticipants();
    this.getGroupsChatRooms();
    this.allParticipants = [];
    this.queryField.valueChanges
      .subscribe(result => this.userService.getAllUsersByQuery(result).subscribe(data => {
        this.allParticipants = data;
      }));
    this.socketService.chatRooms$.subscribe(data => {
      // @ts-ignore
      this.chatRooms = data;
    });

    //this.socketService.connect();

    // setTimeout(function(){
    //   this.chatRooms = this.socketService.getAllRooms();
    //   console.log("TIME");
    // }, 1000);
  }

  // tslint:disable-next-line:use-lifecycle-interface
  ngOnDestroy(): void {
    this.socketService.closeWebSocket();
  }

  cleanUnreadMessagesForCurrentRoom(): void {
    this.chatRoomService.cleanUnreadMessages(this.currentUser.id, this.currentClickedRoom.id);
  }

  getAllRooms(): void {
    this.chatRoomService.getAllVisibleRooms().subscribe(data => {
      this.chatRooms = data;
      console.log(this.chatRooms);
    });
  }

  getCurrentUser(): void {
    this.userService.getCurrentUser().subscribe(data => {
      this.currentUser = data;
      this.socketService.setCurrentUser(data);
    });
  }

  setCurrentRoom(room: ChatRoomDto): void {
    // room.messages.sort( (msg1, msg2) => ( msg1.id > msg2.id ? 1 : -1));
    //this.ngOnInit();
    this.currentClickedRoom = room;
    if (this.currentClickedRoom !== undefined) {
      if (this.currentClickedRoom.messages !== undefined) {
        this.currentClickedRoom.messages.sort((msg1, msg2) => (msg1.id > msg2.id ? 1 : -1));
      }
    }
    this.socketService.setChatRoomDto(room);
  }

  getAllParticipants(): void {
    this.userService.getAllUsers().subscribe(data => {
      this.allParticipants = data;
      console.log(this.allParticipants);
    });
  }

  // tslint:disable-next-line:typedef
  getPrivateChatRoom(id) {
    // tslint:disable-next-line:max-line-length
    this.chatRoomService.getPrivateChatRoom(id).subscribe(data => {
      this.currentClickedRoom = data;
    });
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
    this.userService.getAllUsersByQuery(participant).subscribe(data => {
      this.allParticipants = data;
    });
  }

  // tslint:disable-next-line:typedef
  getGroupsChatRooms() {
    this.chatRoomService.getGroupChatRooms().subscribe(data => {
      this.groupChats = data;
    });
  }

  openAddFileDialog(): void {
    this.chatRoomRef = this.dialog.open(ModalComponent, {
      hasBackdrop: false,
    });
  }

  // tslint:disable-next-line:typedef
  getChatRooms(name: string) {
    this.chatRoomService.getAllChatRoomsByQuery(name).subscribe(data => {
      this.chatRooms = data;
    });
  }

  deleteChatRoom(room): void {
    Swal.fire({
      title: 'Do you want to delete the chat-room?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: `Yes`,
      denyButtonText: `No`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        if (this.currentClickedRoom.ownerId !== this.currentUser.id && this.currentClickedRoom.chatType === 'GROUP') {
          Swal.fire({
            icon: 'error',
            text: 'You are not owner of this chat',
          });
          return;
        }
        // this.chatRoomService.deleteChatRoom(roomId);
        this.socketService.deleteChatRoom(room);
        this.chatRooms.forEach((cr, index) => {
          if (cr.id === room.id) {
            this.chatRooms.splice(index, 1);
          }
        });
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
    this.list.forEach((msg, index) => {
      if (msg.id === member.id) {
        this.list.splice(index, 1);
      }
    });
  }

  createGroupChat(): void {
    // this.list.push(this.currentUser);
    const name = (document.getElementById('chatName') as HTMLInputElement).value; // не бажано так робити
    // this.socketService.setAllRooms(this.chatRooms);
    const chatRoom = new GroupChatRoomCreateDto();
    // tslint:disable-next-line:only-arrow-functions typedef
    chatRoom.usersId = this.list.map(function(i) {
      return i.id;
    });
    chatRoom.chatName = name;
    chatRoom.ownerId = this.currentUser.id;

    this.socketService.createNewChatRoom(chatRoom);
    //this.chatRoomService.createGroupChatRoom(this.list, name);
    window.location.assign('/'); // поміняти
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

  // tslint:disable-next-line:typedef
  renameGroupChat(room: any) {
    this.socketService.setChatRoomDto(room);
    // this.socketService.setAllRooms(this.chatRooms);
    room.name = this.model.chatName;
    // this.chatRoomService.manageChatRoom(room);
    this.socketService.updateChatRoom(room);
    window.location.assign('/');
  };

  leaveGroupChat(id: number) {
    let leaveChatDto = new LeaveChatDto();
    let room = new ChatRoomDto();
    this.chatRooms.forEach((r, index) => {
      if (r.id === id) {
        room = r;
        this.chatRooms.slice(index, 1);
      }
    });
    // this.chatRoomService.leaveChatRoom(room);
    this.socketService.setCurrentUser(this.currentUser);
    leaveChatDto.chatRoomDto = room;
    leaveChatDto.userId = this.currentUser.id;
    this.socketService.leaveChatRoom(leaveChatDto);
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

  // rename or add new participants to chat room
  // tslint:disable-next-line:typedef
  manageChatRoom(members: UserDto[]) {
    members.forEach(part => this.currentClickedRoom.participants.push(part));
    this.socketService.updateChatRoom(this.currentClickedRoom);
    window.location.assign('/');
  }

  // tslint:disable-next-line:typedef
  removeParticipantsFromChatRoom(members: UserDto[]) {
    members.forEach(part => this.currentClickedRoom.participants.push(part));
    this.socketService.deleteParticipantChatRoom(this.currentClickedRoom);
    window.location.assign('/');
  }

  // addParticipantsToChatRoom(members: UserDto[]) {
  //   members.forEach(part => this.currentClickedRoom.participants.push(part));
  //   // this.chatRoomService.manageChatRoom(this.currentClickedRoom);
  //   this.socketService.addPatricipantsToChatRoom(this.currentClickedRoom);
  //   window.location.assign('/');
  // }


//   interval(1000).subscribe(n =>
//   console.log(n);
// );
  // getRoomFromService(){
  //   this.chatRooms = this.socketService.getAllRooms();
  // }

}
