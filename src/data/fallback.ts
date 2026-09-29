import type { Product } from "@/lib/types";

export const fallbackProducts: Product[] = [
  { id:"local-1", storeId:"tempero-da-vovo-marly", categoryId:"pratos-do-dia", categoryName:"Pratos do dia", name:"Buchada", description:"Receita tradicional, bem temperada e com sabor de comida feita em casa.", price:18, imageUrl:"", emoji:"🍲", active:true, featured:true, dailySpecial:true, order:1 },
  { id:"local-2", storeId:"tempero-da-vovo-marly", categoryId:"pratos-do-dia", categoryName:"Pratos do dia", name:"Bife de frango acebolado", description:"Frango suculento com cebola dourada e tempero da casa.", price:16, imageUrl:"", emoji:"🍗", active:true, featured:true, dailySpecial:true, order:2 },
  { id:"local-3", storeId:"tempero-da-vovo-marly", categoryId:"pratos-do-dia", categoryName:"Pratos do dia", name:"Rabada com pirão", description:"Rabada macia e encorpada acompanhada de pirão.", price:22, imageUrl:"", emoji:"🍖", active:true, featured:true, dailySpecial:true, order:3 }
];
