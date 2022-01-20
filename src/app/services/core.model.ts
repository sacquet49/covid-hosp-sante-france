export class Departement {
    nom: string;
    code: string;
    codeRegion: string;
}

export class Ville {
    nom: string;
    code: string;
    codeRegion: string;
    codesPostaux: string[];
    codeDepartement: string;
    population: number;
}
