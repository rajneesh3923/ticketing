import { Publisher, Subjects, PaymentCreatedEvent } from '@mytickets/common';


export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {

  readonly subject = Subjects.PaymentCreated;

}