import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UserDto} from '../../model/user/user-dto.model';
import {ChatRoomDto} from '../../model/chat-room/chat-room-dto.model';
import {SocketService} from '../../service/socket/socket.service';
import {ChatMessageDto} from '../../model/chat-message/chat-message-dto.model';
import {DatePipe} from '@angular/common';
import {ChatMessageService} from '../../service/chat-message/chat-message.service';
import {ChatRoomsComponent} from '../chat-rooms/chat-rooms.component';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ChatFileService} from 'src/app/service/chat-file/chat-file.service';

declare var $: any;
import * as RecordRTC from 'recordrtc';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.css'],
  providers: [DatePipe],
})
export class ChatMessagesComponent implements OnInit, OnDestroy {

  title = 'micRecorder';
//Lets declare Record OBJ
  record;
//Will use this flag for toggeling recording
  recording = false;
//URL of Blob
  url;
  error;



  static lastMessage: number;
  newMessage = '';
  webSocket: any;
  stompClient: any;
  encodedString: string;
  file: any;
  fileName: string;
  fileType: string;


  @Input() room: ChatRoomDto;
  @Input() currentUser: UserDto;
  // tslint:disable-next-line:max-line-length
  constructor(private socketService: SocketService,
              private chatMessageService: ChatMessageService,
              private chatRoomComponent: ChatRoomsComponent,
              private formBuilder: FormBuilder,
              private fileService: ChatFileService,
              private domSanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.socketService.setChatRoomDto(this.room);
    this.room.messages.sort( (msg1, msg2) => ( msg1.id > msg2.id ? 1 : -1));
    console.log(this.room.messages);
    this.socketService.setCurrentUser(this.currentUser);
    this.getLastMessageId();
    this.uploadForm = this.formBuilder.group({
      profile: ['']
    });
  }

  ngOnDestroy(): void {
     this.socketService.closeWebSocket();
  }

  // tslint:disable-next-line:typedef
  async sendMessage() {
        try {
      this.socketService.setChatRoomDto(this.room);
      const chatMessage = new ChatMessageDto();
      ++ChatMessagesComponent.lastMessage;
      chatMessage.id = ChatMessagesComponent.lastMessage;
      chatMessage.content = this.newMessage;
      chatMessage.senderId = this.currentUser.id;
      chatMessage.roomId = this.room.id;
      chatMessage.fileName = this.fileName;
      chatMessage.fileType = this.fileType;
      if (this.newMessage.trim() === '' && chatMessage.fileName === undefined) {
        return;
      }
      this.socketService.sendMessage(chatMessage);
      this.newMessage = '';
      if (this.room.messages.length === 0 && this.room.chatType === 'PRIVATE') {
        this.chatRoomComponent.chatRooms.push(this.room);
      }
    } catch (err) {
      console.log(err);
    }
  }
  deleteMessage(messageId): void {
    this.socketService.setChatRoomDto(this.room);
    this.room.messages.forEach( (msg, index) => {
      if (msg.id === messageId) {/*this.room.messages.splice(index, 1);*/
      this.socketService.deleteMessage(this.room.messages[index]); }
    });
    if (this.room.messages.length === 1 && this.room.chatType === 'PRIVATE') {
      this.chatRoomComponent.chatRooms.forEach( (cr, index) => {
        if (this.room.id === cr.id) {
          this.chatRoomComponent.chatRooms.splice(index, 1);
        }
      });
    }
  }
  updateMessage(messageId, content): void {
    this.socketService.setChatRoomDto(this.room);
    content = prompt('Update message please', content);
    this.room.messages.forEach( (msg, index) => {
      if (msg.id === messageId) {
      this.room.messages[index].content = content;
      this.socketService.updateMessage(this.room.messages[index]); }
    });
  }
  getLastMessageId(): void {
    this.chatMessageService.getLastMessageId().subscribe(data => {ChatMessagesComponent.lastMessage = data; } );
  }

      /*fileChange(event) {
        this.file = event.target.files[0];
    ​var reader = new FileReader();
    ​reader.onload = this._handleReaderLoaded.bind(this);
    ​reader.readAsBinaryString(this.file);
  }
  ​_handleReaderLoaded(readerEvt) {
    ​var binaryString = readerEvt.target.result;
    ​this.encodedString = btoa(binaryString);  // Converting binary string data.
}*/

uploadForm: FormGroup;


onFileSelect(event) {
  if (event.target.files.length > 0) {
    const file = event.target.files[0];
    this.uploadForm.get('profile').setValue(file);
    const formData = new FormData();
    formData.append('file', this.uploadForm.get('profile').value);
    this.sendFile(formData);
  }
}

sendFile(file: FormData): void {
  console.log("&&&&&&&&&&&&");
  console.log(file);
  this.fileService.sendFile(file).subscribe(data => {this.fileName = data.fileName;
    this.fileType = data.fileType;
    console.log(data);
  });
}


  sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }
  /**
   * Start recording.
   */
  initiateRecording() {
    this.recording = true;
    let mediaConstraints = {
      video: false,
      audio: true
    };
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }
  /**
   * Will be called automatically.
   */
  successCallback(stream) {
    var options = {
      mimeType: "audio/wav",
      numberOfAudioChannels: 1,
      sampleRate: 45000, // швидкість відтворення
    };
//Start Actuall Recording
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();
  }
  /**
   * Stop recording.
   */
  stopRecording() {
    this.recording = false;

     this.record.stop(this.processRecording.bind(this));

     //спробував витягти  масив
    //  var buffer = this.record.buffer;
    // console.log("!!!!!!!!!!!!!");
    // console.log(buffer);

  }
  /**
   * processRecording Do what ever you want with blob
   * @param  {any} blob Blog
   */
  bl: any;
  method(){
    console.log("METHODDATA");
    // const text = this.bl.text();
    // console.log(text);
    console.log(this.bl);
    // const arrayBuffer = this.bl.arrayBuffer();
    // console.log(arrayBuffer);

    this.fileService.sendvoiceMessageFile(this.bl).subscribe(data=>{

      console.log(data);
    });
  }
  processRecording(blob) {
    console.log("1111111111");
    console.log(blob);
    this.url = URL.createObjectURL(blob);

    console.log("blob", blob);
    console.log("url", this.url);
  }
  /**
   * Process Error.
   */
  errorCallback(error) {
    this.error = 'Can not play audio in your browser';
  }




}
