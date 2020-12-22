import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import {backendChatLink, concreteRoom, participantLink} from '../../../links';
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
}
