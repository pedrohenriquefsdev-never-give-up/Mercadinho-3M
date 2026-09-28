export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  oldPrice?: number;
  emoji: string;
};

export const categories = [
  "Todos",
  "Pratos do dia",
  "Acompanhamentos",
  "Sobremesas",
  "Bebidas",
];

export const dailySpecials: MenuItem[] = [
  {
    id: "daily-1",
    name: "Buchada",
    description: "Prato tradicional e temperado no capricho, com sabor bem caseiro.",
    category: "Pratos do dia",
    price: 18,
    emoji: "🍲",
  },
  {
    id: "daily-2",
    name: "Bife de frango acebolado",
    description: "Filé suculento com cebola dourada, perfeito para o almoço.",
    category: "Pratos do dia",
    price: 16,
    emoji: "🍗",
  },
  {
    id: "daily-3",
    name: "Rabada com pirão",
    description: "Prato forte, encorpado e muito pedido por quem gosta de comida raiz.",
    category: "Pratos do dia",
    price: 22,
    emoji: "🍖",
  },
  {
    id: "daily-4",
    name: "Costela de porco fritada",
    description: "Bem douradinha, sabor marcante e com cara de comida de domingo.",
    category: "Pratos do dia",
    price: 19,
    emoji: "🥩",
  }
];

export const menuItems: MenuItem[] = [
  ...dailySpecials,
  {
    id: "dish-5",
    name: "Lombo ao molho",
    description: "Lombo macio com molho especial e tempero da casa.",
    category: "Pratos do dia",
    price: 17,
    oldPrice: 19,
    emoji: "🍛",
  },
  {
    id: "dish-6",
    name: "Feijão verde",
    description: "Acompanhamento fresco, cremoso e muito querido.",
    category: "Acompanhamentos",
    price: 5,
    emoji: "🫘",
  },
  {
    id: "dish-7",
    name: "Arroz refogado",
    description: "Arroz soltinho feito no ponto certo para acompanhar qualquer prato.",
    category: "Acompanhamentos",
    price: 4,
    emoji: "🍚",
  },
  {
    id: "dish-8",
    name: "Macarrão espaguete",
    description: "Porção de espaguete simples, saborosa e bem servida.",
    category: "Acompanhamentos",
    price: 5,
    emoji: "🍝",
  },
  {
    id: "dish-9",
    name: "Farofa de cuscuz",
    description: "Leve, crocante e ótima para completar o prato.",
    category: "Acompanhamentos",
    price: 4.5,
    emoji: "🥣",
  },
  {
    id: "dish-10",
    name: "Vinagrete",
    description: "Tomate, cebola e tempero na medida certa.",
    category: "Acompanhamentos",
    price: 4,
    emoji: "🥗",
  },
  {
    id: "dish-11",
    name: "Pudim de leite",
    description: "Sobremesa clássica, lisinha e bem cremosa.",
    category: "Sobremesas",
    price: 8,
    emoji: "🍮",
  },
  {
    id: "dish-12",
    name: "Panetone gourmet",
    description: "Recheado, generoso e ideal para quem quer fechar com doce.",
    category: "Sobremesas",
    price: 12,
    emoji: "🍰",
  },
  {
    id: "dish-13",
    name: "Refrigerante 350ml",
    description: "Opções variadas para acompanhar o pedido.",
    category: "Bebidas",
    price: 5,
    emoji: "🥤",
  },
  {
    id: "dish-14",
    name: "Suco natural",
    description: "Suco gelado e refrescante em sabores do dia.",
    category: "Bebidas",
    price: 6,
    emoji: "🧃",
  },
  {
    id: "dish-15",
    name: "Água mineral",
    description: "Garrafa gelada para completar seu pedido.",
    category: "Bebidas",
    price: 3,
    emoji: "💧",
  }
];
