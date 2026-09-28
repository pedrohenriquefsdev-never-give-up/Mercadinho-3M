"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  ChefHat,
  Clock3,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { categories, dailySpecials, menuItems, MenuItem } from "@/data/menu";

type CartItem = MenuItem & { quantity: number };

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem("marly-cart");
    if (!stored) return;

    try {
      setCart(JSON.parse(stored));
    } catch {
      window.localStorage.removeItem("marly-cart");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("marly-cart", JSON.stringify(cart));
  }, [cart]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchCategory =
        category === "Todos" || item.category === category;
      const matchQuery =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized) ||
        item.category.toLowerCase().includes(normalized);

      return matchCategory && matchQuery;
    });
  }, [query, category]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  function addToCart(item: MenuItem) {
    setCart((current) => {
      const exists = current.find((cartItem) => cartItem.id === item.id);

      if (exists) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });
  }

  function changeQuantity(itemId: string, delta: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  const whatsAppText = useMemo(() => {
    if (cart.length === 0) return "";

    const lines = [
      "Olá! Quero fazer um pedido:",
      "",
      ...cart.map(
        (item) =>
          `• ${item.quantity}x ${item.name} - ${money.format(item.price * item.quantity)}`
      ),
      "",
      `Subtotal: ${money.format(subtotal)}`,
      "",
      "Pode me passar os próximos passos para entrega/retirada?"
    ];

    return encodeURIComponent(lines.join("\n"));
  }, [cart, subtotal]);

  const checkoutHref = `https://wa.me/5582996451844?text=${whatsAppText}`;

  return (
    <main>
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <div className="brand-badge">VM</div>
            <div>
              <strong>Tempero da Vovó Marly</strong>
              <span>Sabor de casa • delivery</span>
            </div>
          </div>

          <div className="header-actions">
            <a
              className="whatsapp-link"
              href="https://wa.me/5582996451844"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>

            <button className="cart-button" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={20} />
              <span>Carrinho</span>
              {cartCount > 0 && <b>{cartCount}</b>}
            </button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker">Cardápio online</span>
            <h1>Comida caseira, delivery rápido e sabor de casa.</h1>
            <p>
              Monte seu pedido, escolha seus pratos favoritos e fale com a equipe
              sem complicação.
            </p>

            <div className="hero-pills">
              <div><Clock3 size={18} /> Aberto hoje até 16h</div>
              <div><Bike size={18} /> Delivery e retirada</div>
              <div><MapPin size={18} /> Atendimento local</div>
            </div>

            <div className="hero-actions">
              <a href="#cardapio" className="primary-button">
                Ver cardápio
              </a>
              <a
                href="https://wa.me/5582996451844"
                target="_blank"
                rel="noreferrer"
                className="secondary-button"
              >
                Pedir no WhatsApp
              </a>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-head">
              <span>Almoço do dia</span>
              <strong>A partir de {money.format(16)}</strong>
            </div>

            <div className="hero-card-list">
              {dailySpecials.slice(0, 3).map((item) => (
                <div key={item.id} className="mini-dish">
                  <div className="mini-dish-emoji">{item.emoji}</div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{money.format(item.price)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-card-note">
              Feito com carinho, do jeito que combina com a sua fome.
            </div>
          </div>
        </div>
      </section>

      <section className="info-strip">
        <div className="container info-strip-grid">
          <div className="info-box">
            <ChefHat size={20} />
            <div>
              <strong>Pratos do dia</strong>
              <span>Seleção fresca e caseira todos os dias</span>
            </div>
          </div>

          <div className="info-box">
            <Star size={20} />
            <div>
              <strong>Mais pedidos</strong>
              <span>Os queridinhos que o público sempre repete</span>
            </div>
          </div>

          <div className="info-box">
            <MessageCircle size={20} />
            <div>
              <strong>Pedido rápido</strong>
              <span>Monte no site e envie em segundos</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container specials">
        <div className="section-header">
          <div>
            <span className="eyebrow">Destaque</span>
            <h2>Cardápio do dia</h2>
          </div>
          <p>Uma prévia do que está saindo hoje</p>
        </div>

        <div className="specials-grid">
          {dailySpecials.map((item) => (
            <article className="special-card" key={item.id}>
              <div className="special-emoji">{item.emoji}</div>
              <div className="special-content">
                <strong>{item.name}</strong>
                <p>{item.description}</p>
                <div className="special-footer">
                  <span>{money.format(item.price)}</span>
                  <button onClick={() => addToCart(item)}>Adicionar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container menu-section" id="cardapio">
        <div className="section-header section-tight">
          <div>
            <span className="eyebrow">Cardápio</span>
            <h2>Escolha seu pedido</h2>
          </div>
          <p>Busque e filtre como quiser</p>
        </div>

        <div className="search-bar">
          <Search size={20} />
          <input
            placeholder="Buscar buchada, sobremesa, bebida..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="categories">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filteredItems.map((item) => (
            <article className="menu-card" key={item.id}>
              <div className="menu-thumb">
                <span>{item.emoji}</span>
                {item.oldPrice && <b>Oferta</b>}
              </div>

              <div className="menu-body">
                <small>{item.category}</small>
                <h3>{item.name}</h3>
                <p>{item.description}</p>

                <div className="price-block">
                  <div>
                    {item.oldPrice && <del>{money.format(item.oldPrice)}</del>}
                    <strong>{money.format(item.price)}</strong>
                  </div>

                  <button
                    onClick={() => addToCart(item)}
                    aria-label={`Adicionar ${item.name}`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="empty-state">
            <h3>Nenhum item encontrado</h3>
            <p>Tente outro termo de busca ou escolha uma categoria diferente.</p>
          </div>
        )}
      </section>

      <section className="cta-band">
        <div className="container cta-band-inner">
          <div>
            <span className="eyebrow light">Delivery</span>
            <h2>Peça sem complicação.</h2>
            <p>Monte o carrinho aqui e envie o pedido direto no WhatsApp.</p>
          </div>

          <a
            href="https://wa.me/5582996451844"
            target="_blank"
            rel="noreferrer"
            className="band-button"
          >
            Falar com a equipe
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <strong>Tempero da Vovó Marly</strong>
            <span>Sabor de casa, feito com amor pra você.</span>
          </div>

          <div className="footer-contact">
            <a href="https://wa.me/5582996451844" target="_blank" rel="noreferrer">
              WhatsApp: (82) 9 9645-1844
            </a>
            <span>Delivery e retirada</span>
          </div>
        </div>
      </footer>

      {cartOpen && (
        <>
          <button
            className="overlay"
            onClick={() => setCartOpen(false)}
            aria-label="Fechar carrinho"
          />

          <aside className="cart-panel">
            <div className="cart-header">
              <div>
                <span>Seu pedido</span>
                <h2>Carrinho</h2>
              </div>

              <button onClick={() => setCartOpen(false)} aria-label="Fechar">
                <X size={22} />
              </button>
            </div>

            <div className="cart-content">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingCart size={42} />
                  <h3>Seu carrinho está vazio</h3>
                  <p>Adicione itens do cardápio para começar.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-emoji">{item.emoji}</div>

                    <div className="cart-item-body">
                      <strong>{item.name}</strong>
                      <span>{money.format(item.price)}</span>

                      <div className="quantity">
                        <button onClick={() => changeQuantity(item.id, -1)}>
                          <Minus size={14} />
                        </button>
                        <b>{item.quantity}</b>
                        <button onClick={() => changeQuantity(item.id, 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <strong className="cart-total">
                      {money.format(item.quantity * item.price)}
                    </strong>
                  </div>
                ))
              )}
            </div>

            <div className="cart-footer">
              <div className="subtotal-row">
                <span>Subtotal</span>
                <strong>{money.format(subtotal)}</strong>
              </div>

              <p>Entrega e pagamento serão combinados no atendimento.</p>

              {cart.length > 0 ? (
                <a
                  href={checkoutHref}
                  target="_blank"
                  rel="noreferrer"
                  className="checkout-link"
                >
                  Enviar pedido no WhatsApp
                </a>
              ) : (
                <button className="checkout-link disabled" disabled>
                  Enviar pedido no WhatsApp
                </button>
              )}
            </div>
          </aside>
        </>
      )}

      {cartCount > 0 && !cartOpen && (
        <button className="mobile-cart" onClick={() => setCartOpen(true)}>
          <span>
            <ShoppingCart size={18} />
            {cartCount} {cartCount === 1 ? "item" : "itens"}
          </span>
          <strong>{money.format(subtotal)}</strong>
        </button>
      )}
    </main>
  );
}
