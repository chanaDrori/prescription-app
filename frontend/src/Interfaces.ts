

export type ErrorMessage = {
    errorCode: number,
    errorTitle: string;
    errorDescription: string;
}

export type DrugDetail = {
    name: string,
    date?: string,
    id: string,
    details?: string
}

export type WarningComb =
{
    description: string,
    severity: "info" | "warning" | "error",
    
}

export type HomeState = {
    data: DrugDetail[];
    options: DrugDetail[];
    value?: DrugDetail;
    errorMessageSearch?: string;
    warningsList: WarningComb[];
    selectedDrug?: DrugDetail;
}

