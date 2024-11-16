import { Component } from '@angular/core';
import { UsbSerial } from 'usb-serial-plugin';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  serialData: string[] = [];
  connectedDevices: any[] = [];

  constructor() {}

  async fetchConnectedDevices() {
    try {
      const result = await UsbSerial.connectedDevices();
      this.connectedDevices = result.devices.map(device => JSON.stringify(device, null, 2));
    } catch (error) {
      console.error('Error fetching connected devices', error);
    }
  }
}
