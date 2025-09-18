import { GreetingsPipe } from './greeting/greetings.pipe';
import { StatusPipe } from './tthh/status.pipe';

export const pipes: any[] = [
    GreetingsPipe,
    StatusPipe
];

export * from './greeting/greetings.pipe';
export * from './tthh/status.pipe';