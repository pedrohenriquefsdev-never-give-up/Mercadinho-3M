"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, Boxes, ClipboardList, LogOut, Pencil, Plus, Save, Settings, Trash2, Utensils, X } from "lucide-react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Category, Order, Product, StoreSettings } from "@/lib/types";

const STORE_ID = "tempero-da-vovo-marly";
const money = new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" });

const emptyProduct = {
  name:"",description:"",categoryId:"",categoryName:"",price:0,promotionalPrice:null as number|null,
  imageUrl:"",active:true,featured:false,dailySpecial:false,order:0
};

export default function AdminPage(){
  const [authLoading,setAuthLoading]=useState(true);
  const [user,setUser]=useState<User|null>(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loginError,setLoginError]=useState("");
  const [attempts,setAttempts]=useState(0);
  const [lockedUntil,setLockedUntil]=useState<number|null>(null);

  const [tab,setTab]=useState<"dashboard"|"orders"|"products"|"categories"|"daily"|"settings">("dashboard");
  const [products,setProducts]=useState<Product[]>([]);
  const [categories,setCategories]=useState<Category[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [settings,setSettings]=useState<StoreSettings>({
    name:"Tempero da Vovó Marly",whatsapp:"5582996451844",active:true,deliveryEnabled:true,pickupEnabled:true,minimumOrder:0,deliveryFee:0
  });

  const [productModal,setProductModal]=useState(false);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [productForm,setProductForm]=useState(emptyProduct);
  const [newCategory,setNewCategory]=useState("");

  useEffect(()=>onAuthStateChanged(auth,async current=>{
    setAuthLoading(true);setUser(current);
    if(!current){setIsAdmin(false);setAuthLoading(false);return;}
    try{
      const snap=await getDoc(doc(db,"users",current.uid));
      const data=snap.data();
      const allowed=!!data&&data.active===true&&data.role==="admin"&&data.storeId===STORE_ID;
      setIsAdmin(allowed);
      if(allowed) await loadAll();
    }catch{setIsAdmin(false)}finally{setAuthLoading(false)}
  }),[]);

  async function loadAll(){
    const [ps,cs,os,ss]=await Promise.all([
      getDocs(query(collection(db,"products"),where("storeId","==",STORE_ID))),
      getDocs(query(collection(db,"categories"),where("storeId","==",STORE_ID))),
      getDocs(query(collection(db,"orders"),where("storeId","==",STORE_ID))),
      getDoc(doc(db,"stores",STORE_ID))
    ]);
    setProducts(ps.docs.map(d=>({id:d.id,...d.data()} as Product)).sort((a,b)=>(a.order||0)-(b.order||0)));
    setCategories(cs.docs.map(d=>({id:d.id,...d.data()} as Category)).sort((a,b)=>(a.order||0)-(b.order||0)));
    setOrders(os.docs.map(d=>({id:d.id,...d.data()} as Order)));
    if(ss.exists()) setSettings(ss.data() as StoreSettings);
  }

  async function login(e:FormEvent){
    e.preventDefault();setLoginError("");
    if(lockedUntil&&Date.now()<lockedUntil){setLoginError(`Muitas tentativas. Aguarde ${Math.ceil((lockedUntil-Date.now())/1000)}s.`);return;}
    try{await signInWithEmailAndPassword(auth,email.trim(),password);setAttempts(0);setLockedUntil(null)}
    catch{const next=attempts+1;setLoginError("E-mail ou senha inválidos.");setAttempts(next);if(next>=5){setLockedUntil(Date.now()+60000);setAttempts(0)}}
  }

  function newProduct(){setEditingId(null);setProductForm({...emptyProduct,order:products.length+1});setProductModal(true)}
  function editProduct(p:Product){setEditingId(p.id);setProductForm({
    name:p.name,description:p.description||"",categoryId:p.categoryId||"",categoryName:p.categoryName||"",
    price:Number(p.price||0),promotionalPrice:p.promotionalPrice??null,imageUrl:p.imageUrl||"",active:p.active!==false,
    featured:!!p.featured,dailySpecial:!!p.dailySpecial,order:Number(p.order||0)
  });setProductModal(true)}

  async function saveProduct(e:FormEvent){
    e.preventDefault();
    const cat=categories.find(c=>c.id===productForm.categoryId);
    const payload={storeId:STORE_ID,...productForm,categoryName:cat?.name||"Sem categoria",price:Number(productForm.price),promotionalPrice:productForm.promotionalPrice?Number(productForm.promotionalPrice):null,order:Number(productForm.order||0)};
    if(editingId) await updateDoc(doc(db,"products",editingId),payload); else await addDoc(collection(db,"products"),payload);
    setProductModal(false);await loadAll();
  }

  async function removeProduct(id:string){if(confirm("Excluir este produto?")){await deleteDoc(doc(db,"products",id));await loadAll()}}
  async function toggleDaily(p:Product){await updateDoc(doc(db,"products",p.id),{dailySpecial:!p.dailySpecial});await loadAll()}
  async function addCategory(){const name=newCategory.trim();if(!name)return;await addDoc(collection(db,"categories"),{storeId:STORE_ID,name,active:true,order:categories.length+1});setNewCategory("");await loadAll()}
  async function removeCategory(id:string){if(confirm("Excluir esta categoria?")){await deleteDoc(doc(db,"categories",id));await loadAll()}}
  async function saveSettings(e:FormEvent){e.preventDefault();await setDoc(doc(db,"stores",STORE_ID),settings,{merge:true});alert("Configurações salvas.")}
  async function updateOrderStatus(id:string,status:string){await updateDoc(doc(db,"orders",id),{status});await loadAll()}

  const activeProducts=products.filter(p=>p.active).length;
  const dailyCount=products.filter(p=>p.dailySpecial).length;
  const openOrders=orders.filter(o=>!["concluido","cancelado"].includes(o.status)).length;
  const sales=orders.filter(o=>o.status==="concluido").reduce((s,o)=>s+Number(o.total||0),0);

  if(authLoading)return <div className="adminLoading">Carregando painel...</div>;

  if(!user||!isAdmin)return <main className="loginPage"><div className="loginCard">
    <img src="/brand/logo-round.png" alt="Tempero da Vovó Marly"/><span>ÁREA RESTRITA</span><h1>Entrar no painel</h1><p>Acesso exclusivo da administração.</p>
    <form onSubmit={login}><label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{loginError&&<div className="loginError">{loginError}</div>}<button>Entrar</button></form>
    <a href="/">← Voltar ao cardápio</a>
  </div></main>;

  return <main className="adminShell">
    <aside className="adminSidebar">
      <div className="adminBrand"><img src="/brand/logo-round.png" alt=""/><div><strong>Vovó Marly</strong><span>Administração</span></div></div>
      <nav>
        <button className={tab==="dashboard"?"active":""} onClick={()=>setTab("dashboard")}><BarChart3 size={18}/> Dashboard</button>
        <button className={tab==="orders"?"active":""} onClick={()=>setTab("orders")}><ClipboardList size={18}/> Pedidos</button>
        <button className={tab==="products"?"active":""} onClick={()=>setTab("products")}><Boxes size={18}/> Produtos</button>
        <button className={tab==="categories"?"active":""} onClick={()=>setTab("categories")}><BookOpen size={18}/> Categorias</button>
        <button className={tab==="daily"?"active":""} onClick={()=>setTab("daily")}><Utensils size={18}/> Cardápio do dia</button>
        <button className={tab==="settings"?"active":""} onClick={()=>setTab("settings")}><Settings size={18}/> Configurações</button>
      </nav>
      <button className="logoutButton" onClick={()=>signOut(auth)}><LogOut size={18}/> Sair</button>
    </aside>

    <section className="adminContent">
      <header className="adminHeader"><div><span>Tempero da Vovó Marly</span><h1>{tab==="dashboard"?"Dashboard":tab==="orders"?"Pedidos":tab==="products"?"Produtos":tab==="categories"?"Categorias":tab==="daily"?"Cardápio do dia":"Configurações"}</h1></div><a href="/" target="_blank">Ver site</a></header>

      {tab==="dashboard"&&<>
        <div className="statsGrid">
          <article><span>Pedidos em aberto</span><strong>{openOrders}</strong></article>
          <article><span>Produtos ativos</span><strong>{activeProducts}</strong></article>
          <article><span>Cardápio do dia</span><strong>{dailyCount}</strong></article>
          <article><span>Vendas concluídas</span><strong>{money.format(sales)}</strong></article>
        </div>
        <div className="adminPanel"><div className="panelHead"><div><span>Resumo</span><h2>Últimos pedidos</h2></div></div>
          <div className="compactList">{orders.slice(0,6).map(o=><div key={o.id}><strong>#{o.id.slice(0,6).toUpperCase()} — {o.customerName}</strong><span>{o.status}</span><b>{money.format(o.total)}</b></div>)}{!orders.length&&<p className="emptyMessage">Nenhum pedido registrado ainda.</p>}</div>
        </div>
      </>}

      {tab==="orders"&&<div className="adminPanel"><div className="panelHead"><div><span>Operação</span><h2>Pedidos</h2></div></div>
        <div className="ordersList">{orders.map(o=><article className="orderCard" key={o.id}>
          <div className="orderTop"><div><small>#{o.id.slice(0,6).toUpperCase()}</small><strong>{o.customerName}</strong><span>{o.customerPhone}</span></div><b>{money.format(o.total)}</b></div>
          <div className="orderItems">{o.items?.map((i,idx)=><span key={idx}>{i.quantity}x {i.name}</span>)}</div>
          <div className="orderMeta"><span>{o.deliveryType==="entrega"?"Entrega":"Retirada"}</span><span>{o.paymentMethod?.toUpperCase()}</span></div>
          <select value={o.status} onChange={e=>updateOrderStatus(o.id,e.target.value)}>
            <option value="novo">Novo</option><option value="confirmado">Confirmado</option><option value="preparando">Preparando</option><option value="saiu_entrega">Saiu para entrega</option><option value="concluido">Concluído</option><option value="cancelado">Cancelado</option>
          </select>
        </article>)}{!orders.length&&<p className="emptyMessage">Nenhum pedido registrado ainda.</p>}</div>
      </div>}

      {tab==="products"&&<div className="adminPanel"><div className="panelHead"><div><span>Catálogo</span><h2>Produtos</h2></div><button onClick={newProduct}><Plus size={17}/> Novo produto</button></div>
        <div className="productTable">{products.map(p=><div className="productRow" key={p.id}><div className="productThumb">{p.imageUrl?<img src={p.imageUrl} alt=""/>:"🍽️"}</div><div className="productMain"><strong>{p.name}</strong><span>{p.categoryName}</span></div><div className="productFlags"><span className={p.active?"statusOn":"statusOff"}>{p.active?"Ativo":"Inativo"}</span>{p.dailySpecial&&<span className="statusDaily">Hoje</span>}</div><b>{money.format(p.promotionalPrice||p.price)}</b><div className="rowActions"><button onClick={()=>editProduct(p)}><Pencil size={16}/></button><button onClick={()=>removeProduct(p.id)}><Trash2 size={16}/></button></div></div>)}{!products.length&&<p className="emptyMessage">Nenhum produto cadastrado.</p>}</div>
      </div>}

      {tab==="categories"&&<div className="adminPanel"><div className="panelHead"><div><span>Organização</span><h2>Categorias</h2></div></div><div className="categoryCreate"><input value={newCategory} onChange={e=>setNewCategory(e.target.value)} placeholder="Nova categoria"/><button onClick={addCategory}><Plus size={17}/> Adicionar</button></div><div className="categoryList">{categories.map(c=><div key={c.id}><strong>{c.name}</strong><span>Ordem {c.order}</span><button onClick={()=>removeCategory(c.id)}><Trash2 size={16}/></button></div>)}</div></div>}

      {tab==="daily"&&<div className="adminPanel"><div className="panelHead"><div><span>Disponibilidade</span><h2>Cardápio do dia</h2></div></div><p className="panelIntro">Marque os produtos que devem aparecer em destaque hoje.</p><div className="dailyAdminGrid">{products.map(p=><label key={p.id} className={p.dailySpecial?"dailyToggle selected":"dailyToggle"}><input type="checkbox" checked={p.dailySpecial} onChange={()=>toggleDaily(p)}/><div className="dailyToggleVisual">{p.imageUrl?<img src={p.imageUrl} alt=""/>:"🍽️"}</div><div><strong>{p.name}</strong><span>{p.categoryName}</span></div></label>)}</div></div>}

      {tab==="settings"&&<div className="adminPanel"><div className="panelHead"><div><span>Estabelecimento</span><h2>Configurações</h2></div></div><form onSubmit={saveSettings} className="settingsForm">
        <label>Nome<input value={settings.name||""} onChange={e=>setSettings({...settings,name:e.target.value})}/></label>
        <label>WhatsApp<input value={settings.whatsapp||""} onChange={e=>setSettings({...settings,whatsapp:e.target.value})}/></label>
        <div className="formGrid2"><label>Pedido mínimo<input type="number" step="0.01" value={settings.minimumOrder??0} onChange={e=>setSettings({...settings,minimumOrder:Number(e.target.value)})}/></label><label>Taxa de entrega<input type="number" step="0.01" value={settings.deliveryFee??0} onChange={e=>setSettings({...settings,deliveryFee:Number(e.target.value)})}/></label></div>
        <div className="checkRow"><label><input type="checkbox" checked={settings.deliveryEnabled} onChange={e=>setSettings({...settings,deliveryEnabled:e.target.checked})}/> Delivery</label><label><input type="checkbox" checked={settings.pickupEnabled} onChange={e=>setSettings({...settings,pickupEnabled:e.target.checked})}/> Retirada</label><label><input type="checkbox" checked={settings.active} onChange={e=>setSettings({...settings,active:e.target.checked})}/> Loja ativa</label></div>
        <button className="saveButton"><Save size={17}/> Salvar</button>
      </form></div>}
    </section>

    {productModal&&<><button className="modalBackdrop" onClick={()=>setProductModal(false)}/><div className="productModal"><div className="modalHead"><div><span>PRODUTO</span><h2>{editingId?"Editar produto":"Novo produto"}</h2></div><button onClick={()=>setProductModal(false)}><X size={20}/></button></div><form onSubmit={saveProduct}>
      <label>Nome<input value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})} required/></label>
      <label>Descrição<textarea rows={3} value={productForm.description} onChange={e=>setProductForm({...productForm,description:e.target.value})}/></label>
      <label>Categoria<select value={productForm.categoryId} onChange={e=>setProductForm({...productForm,categoryId:e.target.value})}><option value="">Sem categoria</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <div className="formGrid2"><label>Preço<input type="number" step="0.01" value={productForm.price} onChange={e=>setProductForm({...productForm,price:Number(e.target.value)})} required/></label><label>Preço promocional<input type="number" step="0.01" value={productForm.promotionalPrice??""} onChange={e=>setProductForm({...productForm,promotionalPrice:e.target.value?Number(e.target.value):null})}/></label></div>
      <label>URL da imagem<input type="url" value={productForm.imageUrl} onChange={e=>setProductForm({...productForm,imageUrl:e.target.value})} placeholder="https://..."/></label>{productForm.imageUrl&&<img className="imagePreview" src={productForm.imageUrl} alt="Prévia"/>}
      <label>Ordem<input type="number" value={productForm.order} onChange={e=>setProductForm({...productForm,order:Number(e.target.value)})}/></label>
      <div className="checkRow"><label><input type="checkbox" checked={productForm.active} onChange={e=>setProductForm({...productForm,active:e.target.checked})}/> Ativo</label><label><input type="checkbox" checked={productForm.featured} onChange={e=>setProductForm({...productForm,featured:e.target.checked})}/> Destaque</label><label><input type="checkbox" checked={productForm.dailySpecial} onChange={e=>setProductForm({...productForm,dailySpecial:e.target.checked})}/> Cardápio do dia</label></div>
      <button className="saveButton"><Save size={17}/> Salvar produto</button>
    </form></div></>}
  </main>
}
