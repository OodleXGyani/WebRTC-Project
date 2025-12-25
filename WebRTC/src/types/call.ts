export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

export interface CallUser {
  id: string;
  name?: string;
}

export interface CallData {
  from: string;
  to: string;
}

export interface OfferData {
  from: string;
  offer: any;
}

export interface AnswerData {
  answer: any;
}

export interface IceCandidateData {
  from?: string;
  candidate: any;
}

export interface EndCallData {
  from?: string;
  to?: string;
}
