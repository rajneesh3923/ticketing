import { TicketCreatedEvent, Publisher, Subjects } from '@mytickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {

  readonly subject = Subjects.TicketCreated;
  
}
