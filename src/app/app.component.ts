import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MqttConnectionState } from 'ngx-mqtt';
import { Observable, Subscription } from 'rxjs';
import { formatHour } from './helpers/date.helper';
import { MyMqttService } from './services/mqtt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Cliente MQTT con Angular 13';
  connectionForm: FormGroup;
  topicForm: FormGroup;
  messageForm: FormGroup;

  mLog: string[] = [];

  public mqttConnectionSub!: Subscription;
  public topicSub!: Subscription;
  private subs:Subscription[]=[];

  public connectionDetailsElementOpen = true;
  private connectButtonDOMElement: Element | null = null;
  private topicButtonDOMElement: Element | null = null;

  constructor(private fb: FormBuilder, private mqttService: MyMqttService) {
    this.connectionForm = this.fb.group({
      brokerHost: new FormControl('test.mosquitto.org', [Validators.required]),
      brokerPort: new FormControl(8081, [
        Validators.required,
        Validators.min(0),
        Validators.max(9999),
      ]),
      user: new FormControl('',),
      password: new FormControl('',),
    });
    this.topicForm = this.fb.group({
      mqttTopic: new FormControl('/fjmduran/test', [
        Validators.required,
        Validators.minLength(1),
      ]),
    });
    this.messageForm = this.fb.group({
      mqttMessage: new FormControl('Hola MQTT!', [
        Validators.required,
        Validators.minLength(1),
      ]),
    });
  }

  ngOnInit() {
    this.connectButtonDOMElement = document.getElementById('connectButtonDOMElement');
    this.topicButtonDOMElement = document.getElementById('topicButtonDOMElement');
    this.writeLog('https://fjmduran.com 🤓');
  }

  toConnect() {
    const hostName: string = this.connectionForm.get('brokerHost')?.value;
    const port: number = this.connectionForm.get('brokerPort')?.value;
    const user: string = this.connectionForm.get('user')?.value;
    const password: string = this.connectionForm.get('password')?.value;

    if (this.mqttConnectionSub && !this.mqttConnectionSub.closed) {
      this.mqttConnectionSub.unsubscribe();
      this.writeLog('🔴 CONEXIÓN CERRADA');
      this.changeConnectionStatus('desconectado');
      return;
    } 
    this.mqttConnectionSub = this.mqttService
      .connect(hostName, port,user,password)
      .subscribe((connectionState: MqttConnectionState) => {
        switch (connectionState) {
          case MqttConnectionState.CLOSED:
            this.writeLog('CONEXIÓN CERRADA, REINTENTANDO...');
            this.changeConnectionStatus('esperando');
            break;
          case MqttConnectionState.CONNECTING:
            this.writeLog('CONECTANDO...');
            this.changeConnectionStatus('esperando');
            break;
          case MqttConnectionState.CONNECTED:
            this.writeLog('🟢 CONECTADO');
            this.changeConnectionStatus('conectado');
            break;
        }
      });
      this.subs.push(this.mqttConnectionSub);
  }

  private changeConnectionStatus(
    status: 'conectado' | 'esperando' | 'desconectado'
  ) {
    switch (status) {
      case 'esperando':
        this.connectionDetailsElementOpen = true;
        this.connectButtonDOMElement?.setAttribute('aria-busy', String(true));
        if (this.connectButtonDOMElement) {
          this.connectButtonDOMElement.innerHTML = 'CONECTANDO...';
          this.connectButtonDOMElement.className = 'secondary';
        }
        break;
      case 'desconectado':
        this.connectionDetailsElementOpen = true;
        this.connectButtonDOMElement?.setAttribute('aria-busy', String(false));
        if (this.connectButtonDOMElement) {
          this.connectButtonDOMElement.innerHTML = 'CONECTAR';
          this.connectButtonDOMElement.className = 'primary';
        }
        break;
      case 'conectado':
        this.connectionDetailsElementOpen = false;
        this.connectButtonDOMElement?.setAttribute('aria-busy', String(false));
        if (this.connectButtonDOMElement) {
          this.connectButtonDOMElement.innerHTML = 'DESCONECTAR';
          this.connectButtonDOMElement.className = 'secondary';
        }
        break;
    }
  }

  public toSubcribeToTopic(){
    const topic=this.topicForm.get('mqttTopic')?.value;
    if(this.topicSub && !this.topicSub.closed){
      this.topicSub.unsubscribe();
      this.writeLog(`ELIMINADA SUBSCRIPCIÓN A ${topic}`);
      if (this.topicButtonDOMElement) {
        this.topicButtonDOMElement.innerHTML = 'SUBSCRIBIR';
        this.topicButtonDOMElement.className = 'primary';
      }
      return;
    } 
    this.topicSub= this.mqttService.topic(topic).subscribe(message=>{
      const messageUTF8=new TextDecoder('utf-8').decode(message.payload);
      console.log(messageUTF8);
      this.writeLog(`RECIBIDO: ${messageUTF8} 👈`)
    });
    this.writeLog(`SUBSCRITO AL TOPIC ${topic}`);
    if (this.topicButtonDOMElement) {
      this.topicButtonDOMElement.innerHTML = 'ELIMINAR SUBSCRIPCIÓN';
      this.topicButtonDOMElement.className = 'secondary';
    }
    this.subs.push(this.topicSub);
  }

  public toSendMessage(){
    const topic=this.topicForm.get('mqttTopic')?.value;
    const message=this.messageForm.get('mqttMessage')?.value;
    let logMessage=``;
    if(!topic){      
      logMessage=`Falta el topic`;
      console.log(logMessage);
      this.writeLog(logMessage);
      return;
    }
    if(!message){
      logMessage=`Falta el mensaje`;
      console.log(logMessage);
      this.writeLog(logMessage);
      return;
    }
    this.mqttService.sendmsg(topic,message);
    this.writeLog(`ENVIADO ${message} AL TOPIC ${topic} 👉`)
  }

  private writeLog(message: string): void {
    const now = new Date();
    const writeMessage = `${formatHour(now)} -> ${message}`;
    console.log(writeMessage);
    this.mLog.unshift(writeMessage);
  }

 

  ngOnDestroy() {
    this.subs.forEach(sub=>sub.unsubscribe());
  }
}
