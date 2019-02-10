import {Injectable, EventEmitter} from "@angular/core";    

@Injectable()
export class DataService {
    emitter: EventEmitter<any> = new EventEmitter();

    getData() {
        this.emitter.emit("yo");
    }
}