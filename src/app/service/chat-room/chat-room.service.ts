import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { backendChatLink } from '../../../links';
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
}
