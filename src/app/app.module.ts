import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import { ChatComponent } from './component/chat/chat.component';
import {HttpClientModule} from '@angular/common/http';
import {ChatMessagesComponent} from './component/chat-messages/chat-messages.component';
import {ChatRoomsComponent} from './component/chat-rooms/chat-rooms.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    ChatMessagesComponent,
    ChatRoomsComponent
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
