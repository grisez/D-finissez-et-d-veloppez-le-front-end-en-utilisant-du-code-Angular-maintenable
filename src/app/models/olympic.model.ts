import { Participation, Participations } from './participation.model';

export interface Olympic {
  id: number;
  country: string;
  participations: Participations;
}

export type Olympics = Olympic[];