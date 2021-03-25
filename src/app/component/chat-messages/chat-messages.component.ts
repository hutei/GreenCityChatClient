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
import {MessageLike} from "../../model/chat-message/message-like";


@Component({
  selector: 'app-chat-messages',
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.css'],
  providers: [DatePipe],
})
export class ChatMessagesComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:max-line-length
  constructor(private socketService: SocketService,
              private chatMessageService: ChatMessageService,
              private chatRoomComponent: ChatRoomsComponent,
              private formBuilder: FormBuilder,
              private fileService: ChatFileService,
              private domSanitizer: DomSanitizer) {
  }
  static lastMessage: number;
  spiner: boolean;
  sendBtnDisabled: boolean;
  nameFileHide: boolean;

// Record OBJ
  record;
// Will use this flag for toggeling recording
  recording = false;

  error;
  newMessage = '';
  webSocket: any;
  stompClient: any;
  encodedString: string;
  file: any;
  fileName: string;
  fileUrl: string;
  fileType: string;
  showFileSelected: boolean;
  showVoiceMessageName: boolean;

  @Input() room: ChatRoomDto;
  @Input() currentUser: UserDto;

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

  ngOnInit(): void {
    this.socketService.setChatRoomDto(this.room);
    this.room.messages.sort( (msg1, msg2) => ( msg1.id > msg2.id ? 1 : -1));
    console.log(this.room.messages);
    this.socketService.setCurrentUser(this.currentUser);
    this.getLastMessageId();
    this.uploadForm = this.formBuilder.group({
      profile: ['']
    });
    this.showFileSelected = false;
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
      chatMessage.fileUrl = this.fileUrl;
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
        this.fileName = null;
        this.fileType = null;
        this.fileUrl = null;
        this.showVoiceMessageName = false;
        this.showFileSelected = false;
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
  likeMessage(messageId):void{
    const messageLike = new MessageLike();
    messageLike.messageId = messageId;
    messageLike.participantId = this.currentUser.id;
    this.socketService.likeMessage(messageLike);
  }
  getLastMessageId(): void {
    this.chatMessageService.getLastMessageId().subscribe(data => {ChatMessagesComponent.lastMessage = data; } );
  }


onFileSelect(event) {
  if (event.target.files.length > 0) {
    const file = event.target.files[0];
    this.uploadForm.get('profile').setValue(file);
    document.getElementById('file-select-id').innerText = this.uploadForm.get('profile').value.name;
    const formData = new FormData();
    formData.append('file', this.uploadForm.get('profile').value);
    this.sendFile(formData);
  }
}

sendFile(file: FormData): void {
    this.spiner = true;
    this.sendBtnDisabled = true;
    this.nameFileHide = false;
  console.log(file);
  this.fileService.sendFile(file).subscribe(data => {this.fileName = data.fileName;
                                                     this.fileType = data.fileType;
                                                     this.fileUrl = data.fileUrl;
                                                     console.log(data);
                                                     this.spiner = false;
                                                     this.sendBtnDisabled = false;

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
    const mediaConstraints = {
      video: false,
      audio: true
    };
    document.getElementById('msg_voice_btn_id').style.backgroundColor = 'red';
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.successCallback.bind(this), this.errorCallback.bind(this));
  }
  /**
   * Will be called automatically.
   */
  successCallback(stream) {
    const options = {
      mimeType: 'audio/wav',
      numberOfAudioChannels: 1,
      sampleRate: 45000, // швидкість відтворення
    };
// Start Actuall Recording
    const StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();
  }
  /**
   * Stop recording.
   */
  stopRecording() {
    this.recording = false;
    this.record.stop(this.processRecording.bind(this));
    document.getElementById('msg_voice_btn_id').style.backgroundColor = '#10804E';

  }


  processRecording(blob) {
    this.spiner = true;
    this.sendBtnDisabled = true;
    console.log(blob);
    const  formData  = new FormData();
    formData.append('file', blob);
    this.fileService.sendVoiceFile(formData).subscribe(data => {
      this.fileName = data.fileName;
      this.fileType = data.fileType;
      this.fileUrl = data.fileUrl;
      this.showVoiceMessageName = true;
      console.log(data);
      this.spiner = false;
      this.sendBtnDisabled = false;
    });
  }
  /**
   * Process Error.
   */
  errorCallback(error) {
    this.error = 'Can not play audio in your browser';
  }
  deleteVoiceMessage(){
    this.fileService.deleteFile(this.fileName).subscribe(data => {
      console.log(data);
    });
    this.fileName = null;
    this.fileType = null;
  }
  deleteFile(){
    this.fileService.deleteFile(this.fileName).subscribe(data=>{
      console.log(data);
    });
    this.fileName = null;
    this.fileType = null;
    document.getElementById('file-upload').nodeValue = '';
    document.getElementById('file-select-id').innerText = '';
    this.nameFileHide = true;
  }
  recordVoiceMessage(){
    if( !this.recording ){
      this.initiateRecording();
    }else {
      this.stopRecording();
    }
  }


}
