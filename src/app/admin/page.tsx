"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BarChart3, BookOpen, Boxes, ClipboardList, ImagePlus, LogOut, Pencil, Plus, Save, Settings, Trash2, UserCog, Utensils, X } from "lucide-react";
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { deleteApp, initializeApp } from "firebase/app";
import { auth, db, firebaseConfig } from "@/lib/firebase";
import { uploadProductImage } from "@/lib/cloudinary";
import type { AdminUser, BusinessHours, Category, Order, Product, StoreSettings } from "@/lib/types";

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

  const [tab,setTab]=useState<"dashboard"|"orders"|"products"|"categories"|"daily"|"settings"|"users">("dashboard");
  const [products,setProducts]=useState<Product[]>([]);
  const [categories,setCategories]=useState<Category[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [adminUsers,setAdminUsers]=useState<AdminUser[]>([]);
  const [currentRole,setCurrentRole]=useState<"admin"|"manager">("manager");
  const [userModal,setUserModal]=useState(false);
  const [newUser,setNewUser]=useState({name:"",email:"",password:"",role:"manager" as "admin"|"manager"});
  const [userBusy,setUserBusy]=useState(false);
  const [userMessage,setUserMessage]=useState("");
  const [settings,setSettings]=useState<StoreSettings>({
    name:"Tempero da Vovó Marly",whatsapp:"5582996451844",active:true,deliveryEnabled:true,pickupEnabled:true,minimumOrder:0,deliveryFee:0,
    businessHours:{
      sunday:{enabled:false,open:"08:00",close:"14:00"},
      monday:{enabled:true,open:"08:00",close:"20:00"},
      tuesday:{enabled:true,open:"08:00",close:"20:00"},
      wednesday:{enabled:true,open:"08:00",close:"20:00"},
      thursday:{enabled:true,open:"08:00",close:"20:00"},
      friday:{enabled:true,open:"08:00",close:"20:00"},
      saturday:{enabled:true,open:"08:00",close:"16:00"}
    }
  });

  const [productModal,setProductModal]=useState(false);
  const [editingId,setEditingId]=useState<string|null>(null);
  const [productForm,setProductForm]=useState(emptyProduct);
  const [newCategory,setNewCategory]=useState("");
  const [imageBusy,setImageBusy]=useState(false);
  const [imageError,setImageError]=useState("");

  useEffect(()=>onAuthStateChanged(auth,async current=>{
    setAuthLoading(true);setUser(current);
    if(!current){setIsAdmin(false);setAuthLoading(false);return;}
    try{
      const snap=await getDoc(doc(db,"users",current.uid));
      const data=snap.data();
      const allowed=!!data&&data.active===true&&(data.role==="admin"||data.role==="manager")&&data.storeId===STORE_ID;
      setCurrentRole(data?.role==="admin"?"admin":"manager");
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

    try{
      const us=await getDocs(query(collection(db,"users"),where("storeId","==",STORE_ID)));
      setAdminUsers(us.docs.map(d=>({id:d.id,...d.data()} as AdminUser)));
    }catch{
      setAdminUsers([]);
    }
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

  const dayLabels: Array<{key:keyof BusinessHours,label:string}> = [
    {key:"monday",label:"Segunda-feira"},
    {key:"tuesday",label:"Terça-feira"},
    {key:"wednesday",label:"Quarta-feira"},
    {key:"thursday",label:"Quinta-feira"},
    {key:"friday",label:"Sexta-feira"},
    {key:"saturday",label:"Sábado"},
    {key:"sunday",label:"Domingo"}
  ];

  function updateBusinessDay(day:keyof BusinessHours, field:"enabled"|"open"|"close", value:boolean|string){
    const current = settings.businessHours || {
      sunday:{enabled:false,open:"08:00",close:"14:00"},
      monday:{enabled:true,open:"08:00",close:"20:00"},
      tuesday:{enabled:true,open:"08:00",close:"20:00"},
      wednesday:{enabled:true,open:"08:00",close:"20:00"},
      thursday:{enabled:true,open:"08:00",close:"20:00"},
      friday:{enabled:true,open:"08:00",close:"20:00"},
      saturday:{enabled:true,open:"08:00",close:"16:00"}
    };

    setSettings({
      ...settings,
      businessHours:{
        ...current,
        [day]:{...current[day],[field]:value}
      }
    });
  }

  async function saveSettings(e:FormEvent){e.preventDefault();await setDoc(doc(db,"stores",STORE_ID),settings,{merge:true});alert("Configurações salvas.")}
  async function updateOrderStatus(id:string,status:string){await updateDoc(doc(db,"orders",id),{status});await loadAll()}


  async function handleImageUpload(file:File|null){
    if(!file)return;
    setImageBusy(true);
    setImageError("");
    try{
      const result=await uploadProductImage(file);
      setProductForm({...productForm,imageUrl:result.secure_url});
    }catch(error){
      setImageError(error instanceof Error?error.message:"Falha ao enviar imagem.");
    }finally{
      setImageBusy(false);
    }
  }

  async function createStaffUser(e:FormEvent){
    e.preventDefault();
    if(currentRole!=="admin")return;
    setUserBusy(true);
    setUserMessage("");

    let secondaryApp:any=null;
    try{
      secondaryApp=initializeApp(firebaseConfig,`staff-${Date.now()}`);
      const secondaryAuth=getAuth(secondaryApp);
      const credential=await createUserWithEmailAndPassword(secondaryAuth,newUser.email.trim(),newUser.password);

      await setDoc(doc(db,"users",credential.user.uid),{
        name:newUser.name.trim(),
        email:newUser.email.trim().toLowerCase(),
        role:newUser.role,
        active:true,
        storeId:STORE_ID
      });

      await signOut(secondaryAuth);
      setNewUser({name:"",email:"",password:"",role:"manager"});
      setUserMessage("Usuário criado com sucesso.");
      await loadAll();
    }catch(error:any){
      const code=String(error?.code||"");
      if(code.includes("email-already-in-use")) setUserMessage("Este e-mail já possui uma conta.");
      else if(code.includes("weak-password")) setUserMessage("Use uma senha com pelo menos 6 caracteres.");
      else if(code.includes("invalid-email")) setUserMessage("Informe um e-mail válido.");
      else setUserMessage("Não foi possível criar o usuário.");
    }finally{
      if(secondaryApp) await deleteApp(secondaryApp);
      setUserBusy(false);
    }
  }

  async function toggleStaffUser(member:AdminUser){
    if(currentRole!=="admin")return;
    await updateDoc(doc(db,"users",member.id),{active:!member.active});
    await loadAll();
  }

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
        {currentRole==="admin"&&<button className={tab==="users"?"active":""} onClick={()=>setTab("users")}><UserCog size={18}/> Usuários</button>}
      </nav>
      <button className="logoutButton" onClick={()=>signOut(auth)}><LogOut size={18}/> Sair</button>
    </aside>

    <section className="adminContent">
      <header className="adminHeader"><div><span>Tempero da Vovó Marly</span><h1>{tab==="dashboard"?"Dashboard":tab==="orders"?"Pedidos":tab==="products"?"Produtos":tab==="categories"?"Categorias":tab==="daily"?"Cardápio do dia":tab==="users"?"Usuários":"Configurações"}</h1></div><a href="/" target="_blank">Ver site</a></header>

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

        <div className="hoursSection">
          <div className="hoursTitle"><span>HORÁRIOS</span><h3>Funcionamento semanal</h3><p>Ajuste cada dia individualmente. Dias desativados aparecem como fechados no site.</p></div>
          <div className="hoursList">
            {dayLabels.map(({key,label})=>{
              const hours=settings.businessHours?.[key] || {enabled:false,open:"08:00",close:"20:00"};
              return <div className="hoursRow" key={key}>
                <label className="dayToggle"><input type="checkbox" checked={hours.enabled} onChange={e=>updateBusinessDay(key,"enabled",e.target.checked)}/><span>{label}</span></label>
                <div className="timeField"><span>Abre</span><input type="time" value={hours.open} disabled={!hours.enabled} onChange={e=>updateBusinessDay(key,"open",e.target.value)}/></div>
                <div className="timeField"><span>Fecha</span><input type="time" value={hours.close} disabled={!hours.enabled} onChange={e=>updateBusinessDay(key,"close",e.target.value)}/></div>
                <b className={hours.enabled?"dayOpen":"dayClosed"}>{hours.enabled?"Aberto":"Fechado"}</b>
              </div>
            })}
          </div>
        </div>

        <button className="saveButton"><Save size={17}/> Salvar configurações</button>
      </form></div>}

      {tab==="users"&&currentRole==="admin"&&<div className="adminPanel">
        <div className="panelHead">
          <div><span>ACESSOS</span><h2>Usuários administrativos</h2></div>
          <button onClick={()=>{setUserMessage("");setUserModal(true)}}><Plus size={17}/> Novo usuário</button>
        </div>
        <p className="panelIntro">Administradores podem criar e desativar acessos. Gerentes cuidam da operação, mas não gerenciam usuários.</p>
        <div className="usersList">
          {adminUsers.map(member=><div className="userRow" key={member.id}>
            <div className="userAvatar">{(member.name||member.email||"?").charAt(0).toUpperCase()}</div>
            <div className="userMain"><strong>{member.name||"Sem nome"}</strong><span>{member.email||"E-mail não informado"}</span></div>
            <span className={member.role==="admin"?"roleAdmin":"roleManager"}>{member.role==="admin"?"Administrador":"Gerente"}</span>
            <span className={member.active?"statusOn":"statusOff"}>{member.active?"Ativo":"Inativo"}</span>
            <button className="userToggleButton" onClick={()=>toggleStaffUser(member)}>{member.active?"Desativar":"Ativar"}</button>
          </div>)}
          {!adminUsers.length&&<p className="emptyMessage">Nenhum outro usuário cadastrado.</p>}
        </div>
      </div>}
    </section>

    {productModal&&<><button className="modalBackdrop" onClick={()=>setProductModal(false)}/><div className="productModal"><div className="modalHead"><div><span>PRODUTO</span><h2>{editingId?"Editar produto":"Novo produto"}</h2></div><button onClick={()=>setProductModal(false)}><X size={20}/></button></div><form onSubmit={saveProduct}>
      <label>Nome<input value={productForm.name} onChange={e=>setProductForm({...productForm,name:e.target.value})} required/></label>
      <label>Descrição<textarea rows={3} value={productForm.description} onChange={e=>setProductForm({...productForm,description:e.target.value})}/></label>
      <label>Categoria<select value={productForm.categoryId} onChange={e=>setProductForm({...productForm,categoryId:e.target.value})}><option value="">Sem categoria</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <div className="formGrid2"><label>Preço<input type="number" step="0.01" value={productForm.price} onChange={e=>setProductForm({...productForm,price:Number(e.target.value)})} required/></label><label>Preço promocional<input type="number" step="0.01" value={productForm.promotionalPrice??""} onChange={e=>setProductForm({...productForm,promotionalPrice:e.target.value?Number(e.target.value):null})}/></label></div>
      <div className="imageUploadField">
        <span>Imagem do produto</span>
        <label className="uploadBox">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>handleImageUpload(e.target.files?.[0]||null)} disabled={imageBusy}/>
          <ImagePlus size={26}/>
          <strong>{imageBusy?"Enviando imagem...":"Escolher imagem"}</strong>
          <small>JPG, PNG ou WEBP • máximo 5 MB</small>
        </label>
        {imageError&&<div className="loginError">{imageError}</div>}
        {productForm.imageUrl&&<div className="imagePreviewWrap"><img className="imagePreview" src={productForm.imageUrl} alt="Prévia"/><button type="button" onClick={()=>setProductForm({...productForm,imageUrl:""})}>Remover imagem</button></div>}
      </div>
      <label>Ordem<input type="number" value={productForm.order} onChange={e=>setProductForm({...productForm,order:Number(e.target.value)})}/></label>
      <div className="checkRow"><label><input type="checkbox" checked={productForm.active} onChange={e=>setProductForm({...productForm,active:e.target.checked})}/> Ativo</label><label><input type="checkbox" checked={productForm.featured} onChange={e=>setProductForm({...productForm,featured:e.target.checked})}/> Destaque</label><label><input type="checkbox" checked={productForm.dailySpecial} onChange={e=>setProductForm({...productForm,dailySpecial:e.target.checked})}/> Cardápio do dia</label></div>
      <button className="saveButton"><Save size={17}/> Salvar produto</button>
    </form></div></>}

    {userModal&&currentRole==="admin"&&<>
      <button className="modalBackdrop" onClick={()=>setUserModal(false)}/>
      <div className="productModal userModal">
        <div className="modalHead"><div><span>ACESSO</span><h2>Novo usuário</h2></div><button onClick={()=>setUserModal(false)}><X size={20}/></button></div>
        <form onSubmit={createStaffUser}>
          <label>Nome<input value={newUser.name} onChange={e=>setNewUser({...newUser,name:e.target.value})} required placeholder="Ex.: Marly Moura"/></label>
          <label>E-mail<input type="email" value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} required/></label>
          <label>Senha inicial<input type="password" minLength={6} value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})} required/><small>Use pelo menos 6 caracteres.</small></label>
          <label>Perfil<select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value as "admin"|"manager"})}><option value="manager">Gerente</option><option value="admin">Administrador</option></select></label>
          {userMessage&&<div className={userMessage.includes("sucesso")?"successMessage":"loginError"}>{userMessage}</div>}
          <button className="saveButton" disabled={userBusy}><UserCog size={17}/>{userBusy?"Criando...":"Criar usuário"}</button>
        </form>
      </div>
    </>}
  </main>
}
