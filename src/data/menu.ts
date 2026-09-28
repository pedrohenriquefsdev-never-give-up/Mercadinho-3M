export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  oldPrice?: number;
  emoji: string;
  tag?: string;
};

export const categories = [
  "Todos",
  "Pratos do dia",
  "Acompanhamentos",
  "Sobremesas",
  "Bebidas",
];

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Buchada",
    description: "Receita tradicional, bem temperada e com sabor de comida feita em casa.",
    category: "Pratos do dia",
    price: 18,
    emoji: "🍲",
    tag: "Destaque",
  },
  {
    id: "2",
    name: "Bife de frango acebolado",
    description: "Frango suculento com cebola dourada e tempero da casa.",
    category: "Pratos do dia",
    price: 16,
    emoji: "🍗",
  },
  {
    id: "3",
    name: "Rabada com pirão",
    description: "Rabada macia e encorpada acompanhada de pirão.",
    category: "Pratos do dia",
    price: 22,
    emoji: "🍖",
    tag: "Mais pedido",
  },
  {
    id: "4",
    name: "Costela de porco fritada",
    description: "Bem douradinha, saborosa e perfeita para um almoço caprichado.",
    category: "Pratos do dia",
    price: 19,
    emoji: "🥩",
  },
  {
    id: "5",
    name: "Lombo ao molho",
    description: "Lombo macio servido com molho especial da casa.",
    category: "Pratos do dia",
    price: 17,
    oldPrice: 19,
    emoji: "🍛",
    tag: "Oferta",
  },
  {
    id: "6",
    name: "Feijão verde",
    description: "Cremoso, fresco e temperado na medida certa.",
    category: "Acompanhamentos",
    price: 5,
    emoji: "🫘",
  },
  {
    id: "7",
    name: "Arroz refogado",
    description: "Arroz soltinho feito no ponto certo.",
    category: "Acompanhamentos",
    price: 4,
    emoji: "🍚",
  },
  {
    id: "8",
    name: "Macarrão espaguete",
    description: "Espaguete simples e saboroso para acompanhar.",
    category: "Acompanhamentos",
    price: 5,
    emoji: "🍝",
  },
  {
    id: "9",
    name: "Farofa de cuscuz",
    description: "Leve, crocante e cheia de sabor.",
    category: "Acompanhamentos",
    price: 4.5,
    emoji: "🥣",
  },
  {
    id: "10",
    name: "Vinagrete",
    description: "Fresco, colorido e perfeito para acompanhar.",
    category: "Acompanhamentos",
    price: 4,
    emoji: "🥗",
  },
  {
    id: "11",
    name: "Pudim de leite",
    description: "Sobremesa clássica, lisinha e bem cremosa.",
    category: "Sobremesas",
    price: 8,
    emoji: "🍮",
    tag: "Clássico",
  },
  {
    id: "12",
    name: "Panetone gourmet",
    description: "Recheio generoso para quem quer fechar com doce.",
    category: "Sobremesas",
    price: 12,
    emoji: "🍰",
  },
  {
    id: "13",
    name: "Refrigerante 350ml",
    description: "Opções variadas para acompanhar o pedido.",
    category: "Bebidas",
    price: 5,
    emoji: "🥤",
  },
  {
    id: "14",
    name: "Suco natural",
    description: "Sucos gelados com sabores do dia.",
    category: "Bebidas",
    price: 6,
    emoji: "🧃",
  },
  {
    id: "15",
    name: "Água mineral",
    description: "Garrafa gelada para completar seu pedido.",
    category: "Bebidas",
    price: 3,
    emoji: "💧",
  }
];
