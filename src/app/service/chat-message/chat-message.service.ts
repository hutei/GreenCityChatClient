import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ChatMessageDto} from '../../model/chat-message/chat-message-dto.model';
import {backendChatLink} from '../../../links';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ChatMessageService{

  constructor(private http: HttpClient) {
  }
  deleteMessage(roomId, senderId, content): void{
    this.http.get<ChatMessageDto>(`${backendChatLink}` + '/room/' + roomId + '/user/' + senderId + '/message/' + content + '/delete');
  }
  getAllMessagesByRoomId(roomId): Observable<ChatMessageDto[]>{
    return this.http.get<ChatMessageDto[]>(`${backendChatLink}` + '/messages/' + roomId);
  }
}
