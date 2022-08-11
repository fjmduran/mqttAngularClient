import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';

//MQTT
import { IMqttServiceOptions, MqttModule } from "ngx-mqtt";
import { ServiceWorkerModule } from '@angular/service-worker';

const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: environment.mqtt.server,
  port: environment.mqtt.port,
  protocol: environment.production ? "wss" : "ws",
  path: '/mqtt'
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, FormsModule, ReactiveFormsModule,MqttModule.forRoot(MQTT_SERVICE_OPTIONS), ServiceWorkerModule.register('ngsw-worker.js', {
  enabled: environment.production,
  // Register the ServiceWorker as soon as the application is stable
  // or after 30 seconds (whichever comes first).
  registrationStrategy: 'registerWhenStable:30000'
}),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
