import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Options } from "ng2-opd-popup/components/popup/options";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
  })
  export class ChatFileService {

  constructor(private http: HttpClient) {
  }

  sendFile(body: FormData): Observable<any> {
    return this.http.post<any>('http://localhost:8070/chat/upload/file', body);
  }

  sendVoiceFile(body: FormData): Observable<any> {
    return this.http.post<any>('http://localhost:8070/chat/upload/voice/', body);
  }

  deleteFile(fileName) {
    return this.http.delete('http://localhost:8070/chat/delete/file/' + fileName);
  }
}

