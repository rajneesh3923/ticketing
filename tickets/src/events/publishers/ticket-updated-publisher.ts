import { TicketUpdatedEvent, Publisher, Subjects } from '@mytickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {

  readonly subject = Subjects.TicketUpdated;
  
}
