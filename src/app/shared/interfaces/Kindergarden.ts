export interface Kindergarden {
    id: number;
    name: string;
    address: string;
    typ: KindergardenTyp; // Klare Benennung für den Enum
  }
  
  export enum KindergardenTyp {
    Privat = 'Privat',
    Oeffentlich = 'Oeffentlich',
  }
  