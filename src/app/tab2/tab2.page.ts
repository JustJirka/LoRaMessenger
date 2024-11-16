import { Component } from '@angular/core';
import { UsbSerial, UsbSerialOptions } from 'usb-serial-plugin';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  serialData: string[] = [];
  connectedDevices: any[] = [];

  constructor(private toastController: ToastController) {}

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
        dtr: true,
        rts: true
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
}
