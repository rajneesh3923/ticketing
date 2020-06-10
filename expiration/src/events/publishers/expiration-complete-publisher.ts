import {Subjects, ExpirationComplete, Publisher} from '@mytickets/common'


export class ExpirationCompletePublisher extends Publisher<ExpirationComplete> {

  readonly subject = Subjects.ExpirationComplete;
  
}