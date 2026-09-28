"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  Clock3,
  Leaf,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { categories, menuItems, MenuItem } from "@/data/menu";

type CartItem = MenuItem & { quantity: number };

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const WHATSAPP = "5582996451844";

export default function Home() {
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [openCart, setOpenCart] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vovo-marly-cart");
    if (!saved) return;
    try {
      setCart(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("vovo-marly-cart", JSON.stringify(cart));
  }, [cart]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menuItems.filter((item) => {
      const matchCategory = category === "Todos" || item.category === category;
      const haystack = `${item.name} ${item.description} ${item.category}`.toLowerCase();
      const matchQuery = !q || haystack.includes(q);
      return matchCategory && matchQuery;
    });
  }, [category, query]);

  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  function addToCart(item: MenuItem) {
    setCart((current) => {
      const existing = current.find((x) => x.id === item.id);
      if (existing) {
        return current.map((x) =>
          x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  }

  function changeQuantity(id: string, delta: number) {
    setCart((current) =>
      current
        .map((x) => (x.id === id ? { ...x, quantity: x.quantity + delta } : x))
        .filter((x) => x.quantity > 0)
    );
  }

  const orderLink = useMemo(() => {
    const lines = [
      "Olá! Quero fazer um pedido no Tempero da Vovó Marly:",
      "",
      ...cart.map(
        (item) =>
          `• ${item.quantity}x ${item.name} — ${money.format(item.price * item.quantity)}`
      ),
      "",
      `Subtotal: ${money.format(subtotal)}`,
      "",
      "Pode me passar os próximos passos?"
    ];
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [cart, subtotal]);

  return (
    <main>
      <header className="topbar">
        <div className="container nav">
          <a className="brand" href="#">
            <img src="/brand/logo-round.png" alt="Tempero da Vovó Marly" />
            <div>
              <strong>Tempero da Vovó Marly</strong>
              <span>Sabor de casa, carinho de vó.</span>
            </div>
          </a>

          <div className="navActions">
            <a className="waButton" href={`https://wa.me/${WHATSAPP}`} target="_blank">
              <MessageCircle size={18} />
              WhatsApp
            </a>
            <button className="cartButton" onClick={() => setOpenCart(true)}>
              <ShoppingBag size={18} />
              Carrinho
              {count > 0 && <b>{count}</b>}
            </button>
          </div>
        </div>
      </header>

      <section className="heroSection">
        <div className="container heroGrid">
          <div className="heroCopy">
            <span className="eyebrow">Cardápio online</span>
            <h1>Comida boa, caseira e com a cara da sua marca.</h1>
            <p>
              Escolha seu prato, monte seu pedido e fale com a equipe em poucos
              cliques.
            </p>

            <div className="heroInfo">
              <span><Clock3 size={16} /> Aberto hoje até 16h</span>
              <span><Bike size={16} /> Delivery e retirada</span>
              <span><MapPin size={16} /> Atendimento local</span>
            </div>

            <div className="heroButtons">
              <a href="#cardapio" className="btnPrimary">Ver cardápio</a>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" className="btnSecondary">
                Pedir no WhatsApp
              </a>
            </div>
          </div>

          <div className="heroSide">
            <div className="brandCard woodCard">
              <div className="woodTop"></div>
              <img src="/brand/logo-round.png" alt="Logo da marca" />
              <div className="brandMiniText">
                <strong>Tempero da Vovó Marly</strong>
                <span>Sabor de casa, carinho de vó.</span>
              </div>
              <div className="priceSeal">
                <small>ALMOÇO</small>
                <span>a partir de</span>
                <b>R$ 16,00</b>
              </div>
            </div>

            <div className="posterCard">
              <img src="/brand/poster-dia.jpg" alt="Cardápio do dia" />
            </div>
          </div>
        </div>
      </section>

      <section className="container features">
        <article>
          <div className="featureNumber">01</div>
          <strong>Sabor de casa</strong>
          <p>Temperos marcantes, comida de verdade e cara de almoço caprichado.</p>
        </article>
        <article>
          <div className="featureNumber">02</div>
          <strong>Pedido rápido</strong>
          <p>O cliente escolhe no site e finaliza o pedido no WhatsApp.</p>
        </article>
        <article>
          <div className="featureNumber">03</div>
          <strong>Identidade da marca</strong>
          <p>Mais calor, mais madeira, mais dourado e menos visual genérico.</p>
        </article>
      </section>

      <section className="container postersSection">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">Comunicação da marca</span>
            <h2>Artes reais para reforçar a identidade.</h2>
          </div>
          <p>Elementos visuais da própria comunicação entram para dar mais verdade ao layout.</p>
        </div>

        <div className="postersGrid">
          <article className="posterWide"><img src="/brand/poster-almoco.jpg" alt="Cardápio do almoço" /></article>
          <article className="posterTall"><img src="/brand/poster-churrasco.jpg" alt="Churrasco na brasa" /></article>
        </div>
      </section>

      <section className="container menuSection" id="cardapio">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">Peça do seu jeito</span>
            <h2>Escolha o que vai para a mesa.</h2>
          </div>
          <p>{filtered.length} opções disponíveis</p>
        </div>

        <div className="searchBar">
          <Search size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar prato, acompanhamento, sobremesa..."
          />
        </div>

        <div className="categories">
          {categories.map((item) => (
            <button
              key={item}
              className={item === category ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="menuGrid">
          {filtered.map((item) => (
            <article className="foodCard" key={item.id}>
              <div className="foodVisual">
                <span>{item.emoji}</span>
                {item.tag && <b>{item.tag}</b>}
              </div>

              <div className="foodBody">
                <small>{item.category}</small>
                <h3>{item.name}</h3>
                <p>{item.description}</p>

                <div className="foodBottom">
                  <div>
                    {item.oldPrice && <del>{money.format(item.oldPrice)}</del>}
                    <strong>{money.format(item.price)}</strong>
                  </div>

                  <button onClick={() => addToCart(item)} aria-label={`Adicionar ${item.name}`}>
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container brandCallout">
        <div>
          <span className="eyebrow light">Tempero da Vovó Marly</span>
          <h2>Sabor de casa, carinho de vó.</h2>
          <p>Monte seu pedido e chame a equipe para concluir no WhatsApp.</p>
        </div>

        <a href={`https://wa.me/${WHATSAPP}`} target="_blank">
          <Leaf size={18} />
          Fazer pedido
        </a>
      </section>

      <footer className="footer">
        <div className="container footerInner">
          <div className="footerBrand">
            <img src="/brand/logo-round.png" alt="" />
            <div>
              <strong>Tempero da Vovó Marly</strong>
              <span>Delivery: (82) 9 9645-1844</span>
            </div>
          </div>
          <span>Feito com carinho para você.</span>
        </div>
      </footer>

      {openCart && (
        <>
          <button className="overlay" onClick={() => setOpenCart(false)} aria-label="Fechar carrinho" />

          <aside className="cartPanel">
            <div className="cartHead">
              <div>
                <small>SEU PEDIDO</small>
                <h2>Carrinho</h2>
              </div>
              <button onClick={() => setOpenCart(false)} aria-label="Fechar">
                <X size={22} />
              </button>
            </div>

            <div className="cartContent">
              {cart.length === 0 ? (
                <div className="cartEmpty">
                  <ShoppingBag size={40} />
                  <h3>Seu carrinho está vazio</h3>
                  <p>Adicione seus pratos favoritos.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cartItem" key={item.id}>
                    <div className="cartEmoji">{item.emoji}</div>
                    <div className="cartInfo">
                      <strong>{item.name}</strong>
                      <span>{money.format(item.price)}</span>
                      <div className="counter">
                        <button onClick={() => changeQuantity(item.id, -1)}>
                          <Minus size={14} />
                        </button>
                        <b>{item.quantity}</b>
                        <button onClick={() => changeQuantity(item.id, 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <strong className="cartTotal">{money.format(item.price * item.quantity)}</strong>
                  </div>
                ))
              )}
            </div>

            <div className="cartFooter">
              <div className="subtotal">
                <span>Subtotal</span>
                <strong>{money.format(subtotal)}</strong>
              </div>
              <p>Entrega e pagamento são combinados no atendimento.</p>
              {cart.length > 0 ? (
                <a href={orderLink} target="_blank">Enviar pedido no WhatsApp</a>
              ) : (
                <button disabled>Enviar pedido no WhatsApp</button>
              )}
            </div>
          </aside>
        </>
      )}

      {count > 0 && !openCart && (
        <button className="mobileCart" onClick={() => setOpenCart(true)}>
          <span><ShoppingBag size={18} /> {count} {count === 1 ? "item" : "itens"}</span>
          <strong>{money.format(subtotal)}</strong>
        </button>
      )}
    </main>
  );
}
