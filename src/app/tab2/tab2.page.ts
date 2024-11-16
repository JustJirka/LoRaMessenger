import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UsbSerial, UsbSerialOptions } from 'usb-serial-plugin';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  serialData: string[] = [];
  connectedDevices: any[] = [];
  messageToSend: string = '';

  constructor(
    private toastController: ToastController, 
    private cdr: ChangeDetectorRef,
    private storage: Storage // Add storage to constructor
  ) {
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
  }

  async saveMessageToStorage(message: string) {
    let messages = await this.storage.get('messages') || [];
    messages.push(message);
    await this.storage.set('messages', messages);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
  
  async fetchConnectedDevices() {
    try {
      const result = await UsbSerial.connectedDevices();
      this.connectedDevices = result.devices.map(device => JSON.stringify(device, null, 2));
    } catch (error) {
      this.presentToast('Error fetching connected devices');
      console.error('Error fetching connected devices', error);
    }
  }

  async openSerialConnection() {
    if (this.connectedDevices.length === 0) {
      await this.fetchConnectedDevices();
    }

    if (this.connectedDevices.length > 0) {
      const firstDevice = JSON.parse(this.connectedDevices[0]);
      //this.presentToast(JSON.stringify(firstDevice));
      //console.log('First connected device:', firstDevice);

      const options: UsbSerialOptions = {
        deviceId: firstDevice.device.deviceId, // Ensure this matches the actual property name for device ID
        portNum: 0, // replace with actual port number
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 0,
        dtr: false,
        rts: false
      };

      console.log('USB Serial Options:', options);
      this.presentToast(JSON.stringify(options));
      try {
        await UsbSerial.openSerial(options);
        this.presentToast('Serial connection opened successfully');
      } catch (error) {
        this.presentToast('Error opening serial connection');
        console.error('Error opening serial connection', error);
      }
    } else {
      this.presentToast('No connected devices found');
      console.error('No connected devices found');
    }
  }

  async sendMessage() {
    if (this.messageToSend.trim().length === 0) {
      this.presentToast('Message cannot be empty');
      return;
    }

    try {
      await UsbSerial.writeSerial({ data: this.messageToSend });
      this.serialData.push("ME: "+this.messageToSend);
      await this.saveMessageToStorage("ME: "+this.messageToSend); // Save message to storage
      this.presentToast('Message sent successfully');
      this.messageToSend = ''; // Clear the input field
    } catch (error) {
      this.presentToast('Error sending message');
      console.error('Error sending message', error);
    }
  }

  async loadMessagesFromStorage() {
    const messages = await this.storage.get('messages') || [];
    this.serialData = messages;
  }

  ngOnInit() {
    this.openSerialConnection();
    this.addSerialDataListener();
    this.loadMessagesFromStorage(); // Load messages from storage on init
  }

  hexToString(hex: string): string {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }

  async addSerialDataListener() {
    try {
      await UsbSerial.addListener('data', async (data: { data: string }) => {
        if (data.data) {
          const receivedMessage = "Received: " + data.data;
          this.serialData.push(receivedMessage);
          await this.saveMessageToStorage(receivedMessage); // Save received message to storage
          this.presentToast('Serial data read successfully');
          this.presentToast(data.data);
          this.cdr.detectChanges(); // Trigger change detection
        }
      });
    } catch (error) {
      this.presentToast('Error adding serial data listener');
      console.error('Error adding serial data listener', error);
    }
  }

  async readSerialData() {
    try {
      const result = await UsbSerial.readSerial();
      if (result.data) {
        const message = this.hexToString(result.data);
        this.serialData.push("Received: "+message);
        this.presentToast('Serial data read successfully');
      }
    } catch (error) {
      this.presentToast('Error reading serial data');
      console.error('Error reading serial data', error);
    }
  }
}
