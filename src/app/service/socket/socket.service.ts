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
import {UserService} from '../user/user.service';
import {Subject} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';
import {HttpHeaders} from '@angular/common/http';

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
  chatRooms$ = new Subject();


  constructor(private chatService: ChatRoomService,
              private cookieService: CookieService) {
    this.chatService.getAllVisibleRooms().subscribe(data => {
      this.chatRooms = data;
    });

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
    //this.allUsers.forEach(user => {this.stompClient.subscribe('/rooms/user/' + user.id + '', this.onRoomReceived)});
    this.chatRooms.forEach(chatRoom => {
      this.stompClient.subscribe('/room/' + chatRoom.id + '' + '/queue/messages',
        this.onMessageReceived);
    });
  };
  onError = (err) => {
    console.log(err);
  };
  onRoomReceived = (room) => {
    console.log('onRoomReceived');
    const chatRoom = JSON.parse(room.body);
    console.log(chatRoom);
    if (room.headers.createRoom !== undefined) {

      this.stompClient.subscribe('/room/' + chatRoom.id + '' + '/queue/messages', this.onMessageReceived);

      this.getAllRooms().push(chatRoom);
      this.chatRooms$.next(this.chatRooms);
      console.log(this.chatRooms);

    } else if (room.headers.updateRoom !== undefined) {

      // перевірка наявності юзера
      if (this.ifCurrentUserExistInChatRoom(chatRoom)) {
        // Якщо є user тоді оновляємо або створюємо нову
        let updateRoomBool = false;
        // оновлення
        this.chatRooms.forEach((cr, index) => {
          if (cr.id === chatRoom.id) {
            // @ts-ignore
            this.getAllRooms().splice(index, 1, chatRoom);
            //this.chatRooms$.next(this.chatRooms);
            updateRoomBool = true;
          }
        });
        if (!updateRoomBool) {
          this.chatRooms.push(chatRoom);
          //this.chatRooms$.next(this.chatRooms);
        }

      } else {
        // якщо юзера немає то його було видалено, видаляємо чат
        this.chatRooms.forEach((cr, index) => {
          if (cr.id === chatRoom.id) {
            this.getAllRooms().splice(index, 1);
            console.log('after remove');
            console.log(this.chatRooms);
            // this.chatRooms$.next(this.chatRooms);
          }
        });
      }
      // tslint:disable-next-line:no-shadowed-variable
      console.log('1111');
      console.log(this.getAllRooms());
      this.chatRooms$.next(this.chatRooms);


    } else if (room.headers.deleteRoom !== undefined) {
      console.log('delete Chat Room');
      this.getAllRooms().forEach((cr, index) => {
        if (cr.id === chatRoom.id) {
          this.getAllRooms().splice(index, 1);
        }
      });
      console.log(this.chatRooms);
      this.chatRooms$.next(this.chatRooms);
    } else if (room.headers.leaveRoom !== undefined) {
      console.log('leaveRoom');
      this.getAllRooms().forEach((cr, index) => {
        if (cr.id === chatRoom.id) {
          // cr.participants.forEach((participant, participantIndex) => {
          if (this.compareParticipantArrays(cr.participants, chatRoom.participants)) {
            console.log('UPDATE');
            // update room if participant exist
            this.getAllRooms().splice(index, 1, chatRoom);
          } else {
            // delete room if participant does not exist
            console.log('LEAVED');
            this.getAllRooms().splice(index, 1);
          }
          // });
        }
      });
      console.log(this.chatRooms);
      this.chatRooms$.next(this.chatRooms);
    } else {
      console.log('HJKKJKBKJKJBKJBKBJKB');
    }
  };

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
    } else {
      if (this.chatRoom === undefined) {
        this.chatRooms.forEach((r, index) => {
          if (r.id === chatMsg.roomId) {
            r.amountUnreadMessages = r.amountUnreadMessages + 1;
            this.chatRooms.splice(index, 1, r);
            this.chatRooms$.next(this.chatRooms);
          }
        });
      } else if (this.chatRoom.id === chatMsg.roomId) {
        this.chatService.cleanUnreadMessages(this.currentUser.id, this.getChatRoomDto().id);
        this.chatRoom.amountUnreadMessages = 0;
      } else if (this.chatRoom.id !== chatMsg.roomId) {
        this.chatRooms.forEach((r, index) => {
          if (r.id === chatMsg.roomId) {
            r.amountUnreadMessages = r.amountUnreadMessages + 1;
            this.chatRooms.splice(index, 1, r);
            this.chatRooms$.next(this.chatRooms);
          }
        });
      }
      if (this.getChatRoomDto().messages.length === 0) {
        this.getChatRoomDto().messages.push(chatMsg);
        return;
      }
      if (this.getChatRoomDto().messages[this.getChatRoomDto().messages.length - 1].id !== chatMsg.id) {
        this.getChatRoomDto().messages.push(chatMsg);
      }
    }
  };

  sendMessage = (chatMessageDto: ChatMessageDto) => {
    let ind = 0;
    this.chatService.getAllVisibleRooms().subscribe(data => {
      this.chatRooms = data;
    });
    const len = this.chatRooms.length;
    this.chatRooms.forEach(cr => {
      if (cr.id !== this.getChatRoomDto().id) {
        ind++;
      }
    });
    if (len === ind) {
      this.stompClient.subscribe('/room/' + this.getChatRoomDto().id + '' + '/queue/messages',
        this.onMessageReceived);
    }
    this.stompClient.send('/app/chat', {}, JSON.stringify(chatMessageDto));
  };

  deleteMessage = (chatMessageDto: ChatMessageDto) => {
    this.stompClient.send('/app/chat/delete', {}, JSON.stringify(chatMessageDto));
  };

  updateMessage = (chatMessageDto: ChatMessageDto) => {
    this.stompClient.send('/app/chat/update', {}, JSON.stringify(chatMessageDto));
  };

  public closeWebSocket(): void {
    this.webSocket.close();
  }

  setCurrentUser(currentUser: UserDto): void {
    this.currentUser = currentUser;
  }

  setChatRoomDto(chatRoom: ChatRoomDto): void {
    this.chatRoom = chatRoom;
  }

  getChatRoomDto(): ChatRoomDto {
    return this.chatRoom;
  }

  setAllRooms(chatRooms: ChatRoomDto[]): void {
    this.chatRooms = chatRooms;
  }

  getAllRooms(): any {
    return this.chatRooms;
  }

  likeMessage = (messageLike: MessageLike) => {
    this.stompClient.send('/app/chat/like', {}, JSON.stringify(messageLike));
  };
  createNewChatRoom = (groupChatRoomCreateDto: GroupChatRoomCreateDto) => {
    console.log(groupChatRoomCreateDto);

    this.stompClient.send('/app/chat/users/create-room', {}, JSON.stringify(groupChatRoomCreateDto));
  };

  updateChatRoom = (room: any) => {
    console.log('upadte chat Room');
    console.log(room);
    this.stompClient.send('/app/chat/users/update-room', {}, JSON.stringify(room));
  };
  deleteParticipantChatRoom = (room: any) => {
    console.log('upadte chat Room');
    console.log(room);
    this.stompClient.send('/app/chat/users/delete-participants-room', {}, JSON.stringify(room));
  };
  // addPatricipantsToChatRoom = (room: any) => {
  //   console.log('upadte chat Room');
  //   console.log(room);
  //   this.stompClient.send('/app/chat/users/add-participants-room', {}, JSON.stringify(room));
  // }

  deleteChatRoom = (room: any) => {
    console.log('delete in soket');
    console.log(room);
    this.stompClient.send('/app/chat/users/delete-room', {}, JSON.stringify(room));
  };
  leaveChatRoom = (leaveChatDto: any) => {
    this.stompClient.send('/app/chat/users/leave-room', {}, JSON.stringify(leaveChatDto));
  };


  compareParticipantArrays(currentList: any, newList: any): boolean {
    newList.forEach(cp => {
      if (!currentList.includes(cp)) {
        return false;
      }
    });
    return true;
  }

  ifCurrentUserExistInChatRoom(chatRoom: any): boolean {
    let userExist = false;
    chatRoom.participants.forEach(participant => {
      if (participant.id === this.currentUser.id) {
        console.log(participant.id);
        userExist = true;
      }
    });
    console.log(this.currentUser.id);
    return userExist;
  }

}

