import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import {backendChatLink, participantLink, leaveChatRoomLink, manageParticipantsChatRoomLink} from '../../../links';
import { ChatRoomDto } from '../../model/chat-room/chat-room-dto.model';

@Injectable({
  providedIn: 'root'
})
export class ChatRoomService{

  constructor(private http: HttpClient) {
  }

  getAllRooms(): Observable<Array<ChatRoomDto>> {
    return this.http.get<Array<ChatRoomDto>>(`${backendChatLink}`);
  }
  getPrivateChatRoom(id): Observable<ChatRoomDto> {
    return this.http.get<ChatRoomDto>(`${participantLink}/` + id);
  }
  getGroupChatRooms(): Observable<Array<ChatRoomDto>> {
    return this.http.get<Array<ChatRoomDto>>(`${backendChatLink}/groups`);
  }
  createGroupChatRoom(list, chatName): void {
    let ids = '';
    for (const room of list) {
      ids = ids + room.id + ',';
    }
    ids = ids.slice(0, -1);
    this.http.get(`${backendChatLink}` + '/users/' + ids + '/room/' + chatName).subscribe();
  }
  getAllChatRoomsByQuery(name): Observable<Array<ChatRoomDto>> {
    return this.http.get<Array<ChatRoomDto>>(`${backendChatLink}` + `/rooms/` + name);
  }
  getAllVisibleRooms(): Observable<Array<ChatRoomDto>> {
    return this.http.get<Array<ChatRoomDto>>(`${backendChatLink}` + `/rooms/visible`);
  }
  // deleteChatRoom(roomId): void {
  //   this.http.delete(`${backendChatLink}` + `/delete/room/` + roomId).subscribe();
  // }
  // leaveChatRoom(room: any) {
  //   this.http.post(`${leaveChatRoomLink}`,room).subscribe();
  // }
  // manageChatRoom(room: any) {
  //   this.http.post(`${manageParticipantsChatRoomLink}`,room).subscribe();
  // }
}
