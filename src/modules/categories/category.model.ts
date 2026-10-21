
export interface Category{
    id : string
    name : string;
    description: string;
    status : boolean;
    deleted_at: Date | string;
    created_at: Date | string;
    updated_at: Date | string;
}

export interface SubCategory{
    id : number
    category_id: number;
    name : string;
    description: string;
    status : boolean;
    deleted_at: Date | string;
    created_at: Date | string;
    updated_at: Date | string;
}