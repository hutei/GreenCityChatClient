import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { UserDto } from '../../model/user/user-dto.model';
import {allParticipantsByQuery, allParticipantsLink, participantLink} from '../../../links';

@Injectable({
  providedIn: 'root'
})
export class UserService{

  constructor(private http: HttpClient) {
  }

  getCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(`${participantLink}`);
  }
  getAllUsers(): Observable<Array<UserDto>> {
    return this.http.get<Array<UserDto>>(`${allParticipantsLink}`);
  }
  getAllUsersByQuery(name): Observable<Array<UserDto>> {
    return this.http.get<Array<UserDto>>(`${allParticipantsByQuery}` + name);
  }
}
