/* Regras puras do marketplace demonstrativo. Dados comerciais nunca representam estoque real. */
const CinefitaMarketplace = (() => {
  const storageKey = 'cinefitaCart.v2';
  const sellers = [
    Object.freeze({id:'cinefita',name:'Loja Oficial Cinefita',official:true,pickup:true,shippingCents:1990,reputation:'Loja da operadora · sem avaliações comerciais reais'}),
    Object.freeze({id:'aurora',name:'Sebo Aurora',official:false,pickup:false,shippingCents:1990,reputation:'Parceiro fictício · sem avaliações comerciais reais'}),
    Object.freeze({id:'bairro',name:'Acervo de Bairro',official:false,pickup:false,shippingCents:1990,reputation:'Parceiro fictício · sem avaliações comerciais reais'})
  ];
  const conditions = Object.freeze({'not-informed':'Conservação não informada','used-good':'Usado · bom estado (exemplo)','used-fair':'Usado · marcas de uso (exemplo)','new':'Novo (exemplo)'});
  const services = Object.freeze({'Limpeza e diagnóstico':3990,'Restauração':8990,'Restauração completa':14990});
  function createCatalog(films) {
    const demo=globalThis.CinefitaDemo;
    if(demo&&!sellers.some(s=>s.id==='demo-company'))sellers.push({id:'demo-company',name:demo.profile.name,official:false,pickup:false,shippingCents:1990,reputation:'Empresa demonstrativa · publicação apenas neste navegador'});
    const filmMap=new Map(films.map(f=>[f.image,f]));
    const offers=films.filter(f=>typeof f.price==='number'&&Number.isFinite(f.price)&&f.price>0).map(f=>({id:`cinefita-${f.image}`,filmId:f.image,sellerId:'cinefita',editionId:`edition-${f.image}`,format:f.format,condition:'not-informed',priceCents:Math.round(f.price*100),illustrative:true}));
    const examples=[
      {id:'aurora-frankenstein-vhs',filmId:'frankenstein',sellerId:'aurora',format:'VHS',condition:'used-good',priceCents:7990},
      {id:'bairro-frankenstein-dvd',filmId:'frankenstein',sellerId:'bairro',format:'DVD',condition:'new',priceCents:8990},
      {id:'aurora-psycho-vhs',filmId:'psycho',sellerId:'aurora',format:'VHS',condition:'used-good',priceCents:7490},
      {id:'bairro-mist-bluray',filmId:'mist',sellerId:'bairro',format:'BLU-RAY',condition:'used-fair',priceCents:16990}
    ];
    offers.push(...examples.filter(o=>filmMap.has(o.filmId)&&offers.some(base=>base.filmId===o.filmId)).map(o=>({...o,illustrative:true})));
    offers.push(...(demo?.offers||[]).filter(o=>o.status==='published'&&filmMap.has(o.filmId)));
    for(const o of offers){if(!o.editionId)o.editionId='edition-offer-'+o.id;
      if(globalThis.CinefitaEditions&&!CinefitaEditions.some(e=>e.id===o.editionId))CinefitaEditions.push({id:o.editionId,filmId:o.filmId,format:o.format,distributor:'Não informado',region:'Não informado',audio:'Não informado',subtitles:'Não informado',extras:'Não informado',packaging:'Não informado'});
    }
    offers.forEach(Object.freeze);
    const byId=new Map(offers.map(o=>[o.id,o]));
    const seller = id => sellers.find(s=>s.id===id);
    const matching = (filmId,{seller:sellerId='',condition='',format=''}={}) => offers.filter(o=>o.filmId===filmId&&(!sellerId||o.sellerId===sellerId)&&(!condition||o.condition===condition)&&(!format||o.format===format));
    function item(offerId,qty=1) {
      const o=byId.get(offerId);if(!o||o.stock===0)return null;
      const f=filmMap.get(o.filmId);
      return {...f,offerId:o.id,key:'offer:'+o.id,sellerId:o.sellerId,format:o.format,condition:o.condition,price:o.priceCents/100,priceCents:o.priceCents,qty:Math.min(o.stock??99,99,Math.max(1,Math.floor(Number(qty)||1)))};
    }
    function serviceItem(value,qty=1) {
      if(!value||!Object.hasOwn(services,value.service))return null;
      const title=String(value.title||'');
      if(!['VHS','Cassete','Rolo de filme'].some(f=>title==='Revitalização — '+f))return null;
      return {title,service:value.service,image:'filmstrip',sellerId:'cinefita',key:'service:'+title+'|'+value.service,price:services[value.service]/100,priceCents:services[value.service],qty:Math.min(99,Math.max(1,Math.floor(Number(qty)||1)))};
    }
    function restore(raw,{legacy=false}={}) {
      const items=[];let rejected=0;
      if(!Array.isArray(raw))return {items,rejected:1};
      for(const saved of raw){
        if(!saved||typeof saved!=='object'){rejected++;continue;}
        let next;
        if(saved.offerId)next=item(saved.offerId,saved.qty);
        else if(saved.service)next=serviceItem(saved,saved.qty);
        else if(legacy){const matches=films.filter(f=>f.title===saved.title&&(!saved.image||f.image===saved.image));if(matches.length===1)next=item('cinefita-'+matches[0].image,saved.qty);}
        if(!next){rejected++;continue;}
        const prior=items.find(i=>i.key===next.key);if(prior)prior.qty=Math.min(byId.get(prior.offerId)?.stock??99,99,prior.qty+next.qty);else items.push(next);
      }
      return {items,rejected};
    }
    function select(candidates,options={}) {
      const {format='',seller:sellerId='',condition='',offer='',sort=''}=options;
      const restricted=!!(sellerId||condition||offer==='available');
      const result=candidates.filter(f=>matching(f.image,options).some(o=>offer!=='available'||o.stock!==0)||(!restricted&&!matching(f.image).length&&(!format||f.format===format)));
      if(sort==='price-low'||sort==='price-high')result.sort((a,b)=>{
        const prices=f=>matching(f.image,options).map(o=>o.priceCents);
        const ap=prices(a),bp=prices(b);if(!ap.length||!bp.length)return Number(!ap.length)-Number(!bp.length);
        return (sort==='price-low'?1:-1)*(Math.min(...ap)-Math.min(...bp))||(a.displayTitle||a.title).localeCompare(b.displayTitle||b.title,'pt-BR');
      });
      return result;
    }
    return {offers:Object.freeze(offers),sellers,seller,matching,item,serviceItem,restore,select,get:id=>byId.get(id)};
  }
  function groups(items,delivery={}) {
    const grouped=[];
    for(const it of items){const s=sellers.find(s=>s.id===it.sellerId);if(!s)continue;let g=grouped.find(g=>g.seller.id===s.id);if(!g){g={seller:s,items:[],subtotalCents:0,shippingCents:0,method:delivery[s.id]==='pickup'&&s.pickup?'pickup':'shipping'};grouped.push(g);}g.items.push(it);g.subtotalCents+=Math.round(it.price*100)*it.qty;}
    for(const g of grouped){g.hasProducts=g.items.some(i=>!i.service);if(!g.hasProducts)g.method='pickup';g.shippingCents=g.hasProducts&&g.method==='shipping'?g.seller.shippingCents:0;g.totalCents=g.subtotalCents+g.shippingCents;}
    return grouped;
  }
  function totals(items,delivery={}){const gs=groups(items,delivery);const subtotalCents=gs.reduce((s,g)=>s+g.subtotalCents,0),shippingCents=gs.reduce((s,g)=>s+g.shippingCents,0);return {groups:gs,subtotalCents,shippingCents,totalCents:subtotalCents+shippingCents};}
  return {storageKey,sellers,conditions,createCatalog,groups,totals};
})();
if(typeof module!=='undefined')module.exports=CinefitaMarketplace;
