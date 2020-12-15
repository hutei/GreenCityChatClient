import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UserDto } from '../../model/user/user-dto.model';
import {currentUserLink, participantLink} from '../../../links';

@Injectable({
  providedIn: 'root'
})
export class UserService{

  constructor(private http: HttpClient) {
  }

  getUserById(id: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${participantLink}/` + id);
  }

  getCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(`${participantLink}`);
  }
}
