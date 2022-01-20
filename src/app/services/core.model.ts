export class Departement {
    nom: string;
    code: string;
    codeRegion: string;
}

export class Region {
    nom: string;
    code: string;
}

export class DataChartBar {
  labels: string[];
  datasets: DataSetBar[];
}

export class DataSetBar {
  label: string;
  borderColor: string;
  backgroundColor: string;
  data: number[];
}

export class DataChart {
  labels: string[];
  datasets: DataSet[];
}

export class DataSet {
  label: string;
  fill: boolean;
  borderColor: string;
  data: number[];
}
