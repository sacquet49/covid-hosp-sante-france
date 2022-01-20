export const TYPE_STAT = {
  HOSP: 'hosp',
  REA: 'rea',
  DC: 'dc'
};

export const LABEL = ['0 - 9', '10 - 19', '20 - 29', '30 - 39', '40 - 49', '50 - 59', '60 - 69', '70 - 79', '80 - 89', '>90'];

export const LABEL_HOSPITALISATION = `Patients covid hospitalisés au `;
export const LABEL_REANIMATION = `Patients covid hospitalisés en réanimation au `;
export const LABEL_DECEDE = `Nombre cumulé de personnes décédées au `;

export class RegionData {
  indice: string;
  label: string;
  color: string;
  data: number[];
  dataP: number[];
}
