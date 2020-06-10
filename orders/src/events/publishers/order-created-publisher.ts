import { Publisher, OrderCreatedEvent, Subjects } from '@mytickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {

  readonly subject = Subjects.OrderCreated;
  
}
