"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bike, Clock3, MapPin, MessageCircle, Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { addDoc, collection, getDoc, getDocs, doc, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product, StoreSettings } from "@/lib/types";
import { fallbackProducts } from "@/data/fallback";

type CartItem = Product & { quantity: number };

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const STORE_ID = "tempero-da-vovo-marly";

export default function Home() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [settings, setSettings] = useState<StoreSettings>({
    name: "Tempero da Vovó Marly",
    whatsapp: "5582996451844",
    active: true,
    deliveryEnabled: true,
    pickupEnabled: true,
    minimumOrder: 0,
    deliveryFee: 0,
    businessHours: {
      sunday: { enabled: false, open: "08:00", close: "14:00" },
      monday: { enabled: true, open: "08:00", close: "20:00" },
      tuesday: { enabled: true, open: "08:00", close: "20:00" },
      wednesday: { enabled: true, open: "08:00", close: "20:00" },
      thursday: { enabled: true, open: "08:00", close: "20:00" },
      friday: { enabled: true, open: "08:00", close: "20:00" },
      saturday: { enabled: true, open: "08:00", close: "16:00" }
    }
  });
  const [queryText, setQueryText] = useState("");
  const [category, setCategory] = useState("Todos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [form, setForm] = useState({
    name: "", phone: "", deliveryType: "retirada",
    address: "", neighborhood: "", reference: "",
    paymentMethod: "pix", changeFor: ""
  });

  useEffect(() => {
    async function load() {
      try {
        const [productSnap, storeSnap] = await Promise.all([
          getDocs(query(collection(db, "products"), where("storeId", "==", STORE_ID), where("active", "==", true))),
          getDoc(doc(db, "stores", STORE_ID))
        ]);
        const remote = productSnap.docs.map((d) => ({ id:d.id, ...d.data() })) as Product[];
        if (remote.length) setProducts(remote.sort((a,b)=>(a.order||0)-(b.order||0)));
        if (storeSnap.exists()) setSettings(storeSnap.data() as StoreSettings);
      } catch (error) {
        console.error(error);
      }
    }
    load();

    const saved = localStorage.getItem("vovo-marly-cart");
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("vovo-marly-cart", JSON.stringify(cart));
  }, [cart]);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(products.map(p=>p.categoryName).filter(Boolean)))], [products]);
  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return products.filter(p => (category==="Todos" || p.categoryName===category) && (!q || `${p.name} ${p.description} ${p.categoryName}`.toLowerCase().includes(q)));
  }, [products, queryText, category]);

  const daily = products.filter(p=>p.dailySpecial).slice(0,3);
  const count = cart.reduce((s,i)=>s+i.quantity,0);
  const subtotal = cart.reduce((s,i)=>s+(i.promotionalPrice || i.price)*i.quantity,0);
  const deliveryFee = form.deliveryType === "entrega" ? Number(settings.deliveryFee || 0) : 0;
  const total = subtotal + deliveryFee;

  const todayStatus = useMemo(() => {
    const hours = settings.businessHours;
    if (!settings.active) return { text: "Fechado no momento", acceptingOrders: false };
    if (!hours) return { text: "Consulte nosso horário", acceptingOrders: true };

    const keys = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"] as const;
    const now = new Date();
    const today = hours[keys[now.getDay()]];

    if (!today?.enabled) {
      return { text: "Fechado hoje", acceptingOrders: false };
    }

    const [openH, openM] = today.open.split(":").map(Number);
    const [closeH, closeM] = today.close.split(":").map(Number);
    const current = now.getHours() * 60 + now.getMinutes();
    const open = openH * 60 + openM;
    const close = closeH * 60 + closeM;

    if (current < open) return { text: `Abre hoje às ${today.open}`, acceptingOrders: false };
    if (current >= close) return { text: `Fechado • encerrou às ${today.close}`, acceptingOrders: false };
    return { text: `Aberto hoje até ${today.close}`, acceptingOrders: true };
  }, [settings.active, settings.businessHours]);

  function add(item: Product) {
    setCart(current => {
      const found = current.find(x=>x.id===item.id);
      return found ? current.map(x=>x.id===item.id ? {...x,quantity:x.quantity+1}:x) : [...current,{...item,quantity:1}];
    });
  }

  function changeQty(id:string, delta:number) {
    setCart(current => current.map(x=>x.id===id?{...x,quantity:x.quantity+delta}:x).filter(x=>x.quantity>0));
  }

  async function submitOrder(event: FormEvent) {
    event.preventDefault();
    if (!cart.length || checkoutBusy) return;
    if (settings.minimumOrder && subtotal < settings.minimumOrder) {
      alert(`O pedido mínimo é ${money.format(settings.minimumOrder)}.`);
      return;
    }

    setCheckoutBusy(true);
    try {
      const items = cart.map(item => {
        const unitPrice = Number(item.promotionalPrice || item.price);
        return { productId:item.id, name:item.name, quantity:item.quantity, unitPrice, subtotal:unitPrice*item.quantity };
      });

      const orderPayload = {
        storeId: STORE_ID,
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        deliveryType: form.deliveryType,
        address: form.deliveryType==="entrega" ? form.address.trim() : "",
        neighborhood: form.deliveryType==="entrega" ? form.neighborhood.trim() : "",
        reference: form.deliveryType==="entrega" ? form.reference.trim() : "",
        paymentMethod: form.paymentMethod,
        changeFor: form.paymentMethod==="dinheiro" && form.changeFor ? Number(form.changeFor) : null,
        items,
        subtotal,
        deliveryFee,
        total,
        status: "novo",
        createdAt: serverTimestamp()
      };

      const ref = await addDoc(collection(db, "orders"), orderPayload);
      const shortId = ref.id.slice(0,6).toUpperCase();

      const lines = [
        `Olá! Fiz o pedido #${shortId} no site do ${settings.name || "Tempero da Vovó Marly"}.`,
        "",
        ...items.map(i=>`• ${i.quantity}x ${i.name} — ${money.format(i.subtotal)}`),
        "",
        `Subtotal: ${money.format(subtotal)}`,
        deliveryFee ? `Entrega: ${money.format(deliveryFee)}` : "",
        `Total: ${money.format(total)}`,
        "",
        `Cliente: ${form.name}`,
        `Telefone: ${form.phone}`,
        `Tipo: ${form.deliveryType==="entrega" ? "Entrega" : "Retirada"}`,
        form.deliveryType==="entrega" ? `Endereço: ${form.address}, ${form.neighborhood}` : "",
        `Pagamento: ${form.paymentMethod.toUpperCase()}`
      ].filter(Boolean);

      setCart([]);
      localStorage.removeItem("vovo-marly-cart");
      const phone = (settings.whatsapp || "5582996451844").replace(/\D/g,"");
      window.location.href = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
    } catch (error) {
      console.error(error);
      alert("Não foi possível registrar o pedido. Tente novamente.");
    } finally {
      setCheckoutBusy(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <div className="container nav">
          <a className="brand" href="#">
            <img src="/brand/logo-round.png" alt="Tempero da Vovó Marly"/>
            <div><strong>Tempero da Vovó Marly</strong><span>Sabor de casa, carinho de vó.</span></div>
          </a>
          <div className="navActions">
            <a className="waButton" href={`https://wa.me/${(settings.whatsapp||"5582996451844").replace(/\D/g,"")}`} target="_blank"><MessageCircle size={18}/> WhatsApp</a>
            <button className="cartButton" onClick={()=>setCartOpen(true)}><ShoppingBag size={18}/> Carrinho {count>0&&<b>{count}</b>}</button>
          </div>
        </div>
      </header>

      <section className="heroSection">
        <div className="container heroGrid">
          <div className="heroCopy">
            <span className="eyebrow">Cardápio online</span>
            <h1>Comida boa, caseira e feita com carinho.</h1>
            <p>Escolha seu prato, monte seu pedido e fale com a equipe em poucos cliques.</p>
            <div className="heroInfo">
              <span className={todayStatus.acceptingOrders ? "" : "closedBadge"}><Clock3 size={16}/> {todayStatus.text}</span>
              <span><Bike size={16}/> Delivery e retirada</span>
              <span><MapPin size={16}/> Atendimento local</span>
            </div>
            <div className="heroButtons">
              <a href="#cardapio" className="btnPrimary">Ver cardápio</a>
              <a href={`https://wa.me/${(settings.whatsapp||"5582996451844").replace(/\D/g,"")}`} target="_blank" className="btnSecondary">Pedir no WhatsApp</a>
            </div>
          </div>

          <div className="heroSide">
            <div className="brandCard">
              <div className="woodTop"></div>
              <img src="/brand/logo-round.png" alt="Tempero da Vovó Marly"/>
              <strong>Tempero da Vovó Marly</strong>
              <span>Sabor de casa, carinho de vó.</span>
              <div className="priceSeal"><small>ALMOÇO</small><span>a partir de</span><b>R$ 16,00</b></div>
            </div>
            <div className="posterCard"><img src="/brand/poster-dia.jpg" alt="Cardápio do dia"/></div>
          </div>
        </div>
      </section>

      {daily.length>0 && <section className="container dailySection">
        <div className="sectionHead"><div><span className="eyebrow">Hoje tem</span><h2>Cardápio do dia</h2></div><p>Seleção disponível hoje.</p></div>
        <div className="dailyGrid">
          {daily.map(item=><article key={item.id} className="dailyCard">
            <div className="dailyVisual">{item.imageUrl?<img src={item.imageUrl} alt={item.name}/>:<span>{item.emoji||"🍽️"}</span>}</div>
            <div><strong>{item.name}</strong><p>{item.description}</p><div><b>{money.format(item.promotionalPrice||item.price)}</b><button onClick={()=>add(item)}>Adicionar</button></div></div>
          </article>)}
        </div>
      </section>}

      <section className="container menuSection" id="cardapio">
        <div className="sectionHead"><div><span className="eyebrow">Peça do seu jeito</span><h2>Escolha o que vai para a mesa.</h2></div><p>{filtered.length} opções disponíveis</p></div>
        <div className="searchBar"><Search size={20}/><input value={queryText} onChange={e=>setQueryText(e.target.value)} placeholder="Buscar prato, acompanhamento, sobremesa..."/></div>
        <div className="categories">{categories.map(name=><button key={name} onClick={()=>setCategory(name)} className={category===name?"active":""}>{name}</button>)}</div>
        <div className="menuGrid">
          {filtered.map(item=><article className="foodCard" key={item.id}>
            <div className="foodVisual">{item.imageUrl?<img src={item.imageUrl} alt={item.name}/>:<span>{item.emoji||"🍽️"}</span>}{item.featured&&<b>Destaque</b>}</div>
            <div className="foodBody"><small>{item.categoryName}</small><h3>{item.name}</h3><p>{item.description}</p>
              <div className="foodBottom"><div>{item.promotionalPrice?<del>{money.format(item.price)}</del>:null}<strong>{money.format(item.promotionalPrice||item.price)}</strong></div><button onClick={()=>add(item)}><Plus size={18}/></button></div>
            </div>
          </article>)}
        </div>
      </section>

      <footer className="footer"><div className="container footerInner"><div className="footerBrand"><img src="/brand/logo-round.png" alt=""/><div><strong>Tempero da Vovó Marly</strong><span>Delivery: (82) 9 9645-1844</span></div></div><span>Sabor de casa, carinho de vó.</span></div></footer>

      {cartOpen&&<>
        <button className="overlay" onClick={()=>setCartOpen(false)} aria-label="Fechar carrinho"/>
        <aside className="cartPanel">
          <div className="cartHead"><div><small>SEU PEDIDO</small><h2>Carrinho</h2></div><button onClick={()=>setCartOpen(false)}><X size={22}/></button></div>
          <div className="cartContent">
            {cart.length===0?<div className="cartEmpty"><ShoppingBag size={40}/><h3>Seu carrinho está vazio</h3><p>Adicione seus pratos favoritos.</p></div>:cart.map(item=><div className="cartItem" key={item.id}>
              <div className="cartEmoji">{item.imageUrl?<img src={item.imageUrl} alt=""/>:(item.emoji||"🍽️")}</div>
              <div className="cartInfo"><strong>{item.name}</strong><span>{money.format(item.promotionalPrice||item.price)}</span><div className="counter"><button onClick={()=>changeQty(item.id,-1)}><Minus size={14}/></button><b>{item.quantity}</b><button onClick={()=>changeQty(item.id,1)}><Plus size={14}/></button></div></div>
              <strong className="cartTotal">{money.format((item.promotionalPrice||item.price)*item.quantity)}</strong>
            </div>)}
          </div>
          <div className="cartFooter"><div className="subtotal"><span>Subtotal</span><strong>{money.format(subtotal)}</strong></div><p>{todayStatus.acceptingOrders ? "Entrega e pagamento são definidos na próxima etapa." : "O estabelecimento está fechado no momento. Você ainda pode consultar o cardápio."}</p><button disabled={!cart.length || !todayStatus.acceptingOrders} onClick={()=>{setCartOpen(false);setCheckoutOpen(true)}}>{todayStatus.acceptingOrders ? "Continuar pedido" : "Pedidos fechados agora"}</button></div>
        </aside>
      </>}

      {checkoutOpen&&<>
        <button className="overlay" onClick={()=>setCheckoutOpen(false)} aria-label="Fechar checkout"/>
        <aside className="checkoutPanel">
          <div className="cartHead"><div><small>FINALIZAÇÃO</small><h2>Seu pedido</h2></div><button onClick={()=>setCheckoutOpen(false)}><X size={22}/></button></div>
          <form className="checkoutForm" onSubmit={submitOrder}>
            <label>Nome<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
            <label>WhatsApp<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="(82) 99999-9999"/></label>
            <label>Receber como?
              <select value={form.deliveryType} onChange={e=>setForm({...form,deliveryType:e.target.value})}>
                {settings.pickupEnabled&&<option value="retirada">Retirada</option>}
                {settings.deliveryEnabled&&<option value="entrega">Entrega</option>}
              </select>
            </label>

            {form.deliveryType==="entrega"&&<>
              <label>Endereço<input required value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
              <label>Bairro<input required value={form.neighborhood} onChange={e=>setForm({...form,neighborhood:e.target.value})}/></label>
              <label>Referência<input value={form.reference} onChange={e=>setForm({...form,reference:e.target.value})}/></label>
            </>}

            <label>Pagamento
              <select value={form.paymentMethod} onChange={e=>setForm({...form,paymentMethod:e.target.value})}>
                <option value="pix">PIX</option><option value="dinheiro">Dinheiro</option><option value="cartao">Cartão na entrega</option>
              </select>
            </label>
            {form.paymentMethod==="dinheiro"&&<label>Troco para<input type="number" step="0.01" value={form.changeFor} onChange={e=>setForm({...form,changeFor:e.target.value})}/></label>}

            <div className="checkoutSummary">
              <div><span>Subtotal</span><b>{money.format(subtotal)}</b></div>
              <div><span>Entrega</span><b>{money.format(deliveryFee)}</b></div>
              <div className="totalLine"><span>Total</span><strong>{money.format(total)}</strong></div>
            </div>

            <button className="finishButton" disabled={checkoutBusy}>{checkoutBusy?"Registrando...":"Confirmar pedido"}</button>
          </form>
        </aside>
      </>}
    </main>
  );
}
