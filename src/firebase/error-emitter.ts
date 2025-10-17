
import { EventEmitter } from 'events';

// This is a simple event emitter that can be used to broadcast errors
// from anywhere in the application.

// We export a single instance of the emitter
export const errorEmitter = new EventEmitter();
