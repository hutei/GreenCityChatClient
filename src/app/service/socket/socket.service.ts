import {Injectable} from '@angular/core';

declare var SockJS;
declare var Stomp;
import {participantLink, webSocketEndPointLink, webSocketLink} from '../../../links';
import {ChatMessageDto} from '../../model/chat-message/chat-message-dto.model';
import {UserDto} from '../../model/user/user-dto.model';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {ChatRoomService} from '../chat-room/chat-room.service';
import {ChatRoomsComponent} from '../../component/chat-rooms/chat-rooms.component';
import {MessageLike} from '../../model/chat-message/message-like';
import {GroupChatRoomCreateDto} from '../../model/chat-room/group-chat-room-create-dto.model';
import {root} from 'rxjs/internal-compatibility';

// @ts-ignore
@Injectable({
  providedIn: 'root'
})
export class SocketService {

  webSocket: any;
  stompClient: any;
  chatRoom: ChatRoomDto;
  currentUser: UserDto;
  chatRooms: ChatRoomDto[];

  constructor(private chatService: ChatRoomService) {
    this.chatService.getAllVisibleRooms().subscribe(data => {this.chatRooms = data; });
  }
  connect(): void {
    this.webSocket = new SockJS(webSocketLink + webSocketEndPointLink);
    this.stompClient = Stomp.over(this.webSocket);
    this.stompClient.connect({}, this.onConnected, this.onError);
    console.log(this.stompClient);
  }

  onConnected = () => {
    console.log('connected');
    this.stompClient.subscribe('/rooms/user/' + this.currentUser.id + '', this.onRoomReceived);

    this.chatRooms.forEach(chatRoom => {this.stompClient.subscribe('/room/' + chatRoom.id + '' + '/queue/messages',
      this.onMessageReceived); });
  }
  onError = (err) => {
    console.log(err);
  }
  onRoomReceived = (room) => {
    console.log('onRoomReceived');
    const  chatRoom = JSON.parse(room.body);
    console.log(chatRoom);
    if (room.headers.createRoom !== undefined){
      console.log('if111111111111');
      this.getAllRooms().push(chatRoom);
      console.log(this.chatRooms);

      // tslint:disable-next-line:no-shadowed-variable
      this.getAllRooms().forEach(chatRoom => {this.stompClient.subscribe('/room/' + chatRoom.id + '' + '/queue/messages',
        this.onMessageReceived); });
      // window.location.assign('/');

    }else if (room.headers.updateRoom !== undefined){
      // updateRoom or rename
      console.log('if111111111111');
      let addedNewParticipant = true;
      this.getAllRooms().forEach((cr, index) => {
        if (cr.id === chatRoom.id ){
          if (chatRoom.participants.includes(this.currentUser)) {
            this.getAllRooms().splice(index, 1, chatRoom);
          }else {
            // chat is updated but this user are not in participants (user was removed)
            this.getAllRooms().splice(index, 1);
          }
          addedNewParticipant = false;
        }
      });
      //  new user is added
      if (addedNewParticipant){
        console.log("Add new User");
        this.getAllRooms().push(chatRoom);
      }
      console.log('afterUpdate');
      console.log(this.chatRooms);

      this.getAllRooms().forEach(chatRoom => {this.stompClient.subscribe('/room/' + chatRoom.id + '' + '/queue/messages',
        this.onMessageReceived); });

    }else  if (room.headers.deleteRoom !== undefined){
      console.log('delete Chat Room');
      this.getAllRooms().forEach((cr, index) => {
       if (cr.id === chatRoom.id){
         this.getAllRooms().splice(index, 1);
       }
      });
      console.log(this.chatRooms);
    }else if (room.headers.leaveRoom !== undefined){
      console.log('leaveRoom');
      this.getAllRooms().forEach((cr, index) => {
        if (cr.id === chatRoom.id){
          // cr.participants.forEach((participant, participantIndex) => {
            if (this.compareParticipantArrays(cr.participants, chatRoom.participants)){
              console.log('UPDATE');
              // update room if participant exist
              this.getAllRooms().splice(index, 1, chatRoom);
            }else {
              // delete room if participant does not exist
              console.log('LEAVED');
              this.getAllRooms().splice(index, 1);
            }
          // });
        }
      });
      console.log(this.chatRooms);
    }
    else {
      console.log('HJKKJKBKJKJBKJBKBJKB');
    }
}

  onMessageReceived = (msg) => {
    console.log(msg);
    const chatMsg = JSON.parse(msg.body);
    if (msg.headers.delete !== undefined) {
      this.getChatRoomDto().messages.forEach((m, index) => {
        if (m.id === chatMsg.id) {
          this.getChatRoomDto().messages.splice(index, 1);
        }
      });
    } else if (msg.headers.update !== undefined) {
      this.getChatRoomDto().messages.forEach((m, index) => {
        if (m.id === chatMsg.id) {
          this.getChatRoomDto().messages.splice(index, 1, chatMsg);
          return;
        }
      });
    }
    else {
      if (this.getChatRoomDto().messages.length === 0) {
        this.getChatRoomDto().messages.push(chatMsg);
        return;
      }
      if (this.getChatRoomDto().messages[this.getChatRoomDto().messages.length - 1].id !== chatMsg.id) {
      this.getChatRoomDto().messages.push(chatMsg);
      }
    }
  }

  sendMessage = (chatMessageDto: ChatMessageDto) => {
    let ind = 0;
    this.chatService.getAllVisibleRooms().subscribe(data => {this.chatRooms = data; });
    const len = this.chatRooms.length;
    this.chatRooms.forEach( cr => {
      if (cr.id !== this.getChatRoomDto().id) {
        ind++;
      }
    });
    if (len === ind) {
      this.stompClient.subscribe('/room/' + this.getChatRoomDto().id + '' + '/queue/messages',
        this.onMessageReceived);
    }
    this.stompClient.send('/app/chat', {}, JSON.stringify(chatMessageDto));
  }

  deleteMessage = (chatMessageDto: ChatMessageDto) => {
    this.stompClient.send('/app/chat/delete', {}, JSON.stringify(chatMessageDto));
  }

  updateMessage = (chatMessageDto: ChatMessageDto) => {
    this.stompClient.send('/app/chat/update', {}, JSON.stringify(chatMessageDto));
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
  getChatRoomDto(): ChatRoomDto{
    return this.chatRoom;
  }
  setAllRooms(chatRooms: ChatRoomDto[]): void {
    this.chatRooms = chatRooms;
  }
  getAllRooms(): any{
    return this.chatRooms;
  }

  likeMessage = (messageLike: MessageLike) => {
    this.stompClient.send('/app/chat/like', {}, JSON.stringify(messageLike));
  }
  createNewChatRoom = (groupChatRoomCreateDto: GroupChatRoomCreateDto) => {
    console.log(groupChatRoomCreateDto);
    const roomID = this.chatRooms.length + 1;

    this.stompClient.send('/app/chat/users/create-room', {}, JSON.stringify(groupChatRoomCreateDto));
    // this.stompClient.subscribe('/room/' + 37 + '' + '/queue/messages',
    //   this.onMessageReceived);
  }

  updateChatRoom = (room: any) => {
    console.log('upadte chat Room');
    console.log(room);
    this.stompClient.send('/app/chat/users/update-room', {}, JSON.stringify(room));
  }
  deleteChatRoom = (room: any) => {
    console.log('delete in soket');
    console.log(room);
    this.stompClient.send('/app/chat/users/delete-room', {}, JSON.stringify(room));
  }
  leaveChatRoom = (room: any) => {
  this.stompClient.send('/app/chat/users/leave-room', {}, JSON.stringify(room));
}
  getAllAviableChatRooms(){
    return this.chatRooms;
  }
  compareParticipantArrays(currentList: any, newList: any ): boolean{
   newList.forEach(cp => {
      if ( !currentList.includes(cp) ){
        return false;
      }
    });
   return true;
  }

}

