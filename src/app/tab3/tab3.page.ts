import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  savedMessages: string[] = [];

  constructor(private storage: Storage) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
  }

  async loadMessagesFromStorage() {
    const messages = await this.storage.get('messages') || [];
    this.savedMessages = messages;
  }

  ngOnInit() {
    this.loadMessagesFromStorage(); // Load messages from storage on init
  }
}
