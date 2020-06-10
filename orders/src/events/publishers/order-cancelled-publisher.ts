import { Publisher, OrderCancelledEvent, Subjects } from '@mytickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {

  readonly subject = Subjects.OrderCancelled;

}
