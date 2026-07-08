export interface CreateRentalItem {
    gearItemId :string;
    quantity:number;
}

export interface CreateRentalPayload{
    startDate:string;
    endDate:string;
    items:CreateRentalItem[];
}