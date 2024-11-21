import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  savedMessages: string[] = [];

  constructor(private storage: Storage, private platform: Platform) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
  }

  async loadMessagesFromStorage() {
    const messages = await this.storage.get('messages') || [];
    this.savedMessages = messages;
  }

  async deleteMessage(index: number) {
    this.savedMessages.splice(index, 1);
    await this.storage.set('messages', this.savedMessages);
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.loadMessagesFromStorage(); // Load messages from storage on init
    });
  }

  ionViewWillEnter() {
    this.loadMessagesFromStorage(); // Refresh messages when the view is about to enter
  }
}
