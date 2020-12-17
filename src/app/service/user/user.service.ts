import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { UserDto } from '../../model/user/user-dto.model';
import {participantLink} from '../../../links';

@Injectable({
  providedIn: 'root'
})
export class UserService{

  constructor(private http: HttpClient) {
  }

  getCurrentUser(): Observable<UserDto> {
    return this.http.get<UserDto>(`${participantLink}`);
  }
}
