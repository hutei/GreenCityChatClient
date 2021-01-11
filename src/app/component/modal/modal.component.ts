import {Component, Input, OnInit} from '@angular/core';
import {UserService} from '../../service/user/user.service';
import {UserDto} from '../../model/user/user-dto.model';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {ChatRoomService} from '../../service/chat-room/chat-room.service';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {SocketService} from '../../service/socket/socket.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  form: FormGroup;
  chatRoomRef: MatDialogRef<ModalComponent>;
  allParticipants: UserDto[];
  list: UserDto[];
  // currentUser: UserDto;


  constructor(
    private userService: UserService,
    private socketService: SocketService,
    private chatRoomService: ChatRoomService,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ModalComponent>
  ) {}

  // tslint:disable-next-line:typedef
  ngOnInit() {
    this.userService.getAllUsers().subscribe(data => {this.allParticipants = data; } );
    // this.userService.getCurrentUser().subscribe(data => {this.currentUser = data; } );
    this.list = [];
    this.form = this.formBuilder.group({
      name: ''
    });
  }
  add(member): void {
    this.list.push(member);
  }
  remove(member): void {
    this.list.forEach( (msg, index) => {
      if (msg.id === member.id) {
        this.list.splice(index, 1); }
    });
  }
  createGroupChat(): void {
    // this.list.push(this.currentUser);
    const name = (document.getElementById('chatName') as HTMLInputElement).value;
    this.chatRoomService.createGroupChatRoom(this.list, name);
    this.dialogRef.close();
  }

}
