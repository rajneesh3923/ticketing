import {Listener} from './base-listener';
import {Message} from 'node-nats-streaming';
import { Subjects } from './subjects';
import { TicketCreatedEvent } from './ticket-created-events';


export class TicketCreatedListener extends Listener<TicketCreatedEvent> {

  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = 'payments-service'

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
      console.log('Event Data', data);
      
      msg.ack();
  }


}

