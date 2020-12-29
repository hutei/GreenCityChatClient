import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {backendChatLink} from '../../../links';
import {Observable} from 'rxjs';
import {ChatMessageDto} from '../../model/chat-message/chat-message-dto.model';

/*import {Observable} from 'rxjs';
import {ChatMessageDto} from '../../model/chat-message/chat-message-dto.model';*/


@Injectable({
  providedIn: 'root'
})
export class ChatMessageService{

  constructor(private http: HttpClient) {
  }
  deleteMessage(messageId): void {
    this.http.get(`${backendChatLink}` + '/message/' + messageId + '/delete').subscribe();
  }
  updateMessage(messageId, content): void {
    this.http.put(`${backendChatLink}` + '/message/' + messageId + '/update', content, { headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }), responseType: 'blob',
    }).subscribe();
  }
  getLastMessageId(): Observable<number> {
    return this.http.get<number>(`${backendChatLink}` + '/last/message');
  }
}
