export type Product={id:string;storeId:string;categoryId:string;categoryName:string;name:string;description:string;price:number;promotionalPrice?:number|null;imageUrl?:string;active:boolean;featured:boolean;dailySpecial:boolean;order:number};
export type Category={id:string;storeId:string;name:string;active:boolean;order:number};
