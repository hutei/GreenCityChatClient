import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import { ChatComponent } from './component/chat/chat.component';
import {HttpClientModule} from '@angular/common/http';
import {ChatRoomMessagesComponent} from './component/chat-room-messages/chat-room-messages.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    ChatRoomMessagesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
