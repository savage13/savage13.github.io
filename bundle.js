var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function r(t){return"function"==typeof t}function l(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function i(e,n,o){e.$$.on_destroy.push(function(e,...n){if(null==e)return t;const o=e.subscribe(...n);return o.unsubscribe?()=>o.unsubscribe():o}(n,o))}function a(t,e){t.appendChild(e)}function s(t,e,n){t.insertBefore(e,n||null)}function c(t){t.parentNode.removeChild(t)}function u(t){return document.createElement(t)}function f(t){return document.createTextNode(t)}function d(){return f(" ")}function p(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}let h;function m(t){h=t}function g(){if(!h)throw new Error("Function called outside component initialization");return h}function v(t){g().$$.on_mount.push(t)}function $(){const t=g();return(e,n)=>{const o=t.$$.callbacks[e];if(o){const r=function(t,e){const n=document.createEvent("CustomEvent");return n.initCustomEvent(t,!1,!1,e),n}(e,n);o.slice().forEach((e=>{e.call(t,r)}))}}}const y=[],k=[],w=[],b=[],H=Promise.resolve();let x=!1;function _(t){w.push(t)}let M=!1;const T=new Set;function Z(){if(!M){M=!0;do{for(let t=0;t<y.length;t+=1){const e=y[t];m(e),E(e.$$)}for(m(null),y.length=0;k.length;)k.pop()();for(let t=0;t<w.length;t+=1){const e=w[t];T.has(e)||(T.add(e),e())}w.length=0}while(y.length);for(;b.length;)b.pop()();x=!1,M=!1,T.clear()}}function E(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(_)}}const S=new Set;let L;function C(t,e){t&&t.i&&(S.delete(t),t.i(e))}function A(t,e,n,o){if(t&&t.o){if(S.has(t))return;S.add(t),L.c.push((()=>{S.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}}const D="undefined"!=typeof window?window:"undefined"!=typeof globalThis?globalThis:global;function N(t,e){A(t,1,1,(()=>{e.delete(t.key)}))}function z(t){t&&t.c()}function B(t,n,l){const{fragment:i,on_mount:a,on_destroy:s,after_update:c}=t.$$;i&&i.m(n,l),_((()=>{const n=a.map(e).filter(r);s?s.push(...n):o(n),t.$$.on_mount=[]})),c.forEach(_)}function I(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function P(t,e){-1===t.$$.dirty[0]&&(y.push(t),x||(x=!0,H.then(Z)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function U(e,r,l,i,a,s,u=[-1]){const f=h;m(e);const d=r.props||{},p=e.$$={fragment:null,ctx:null,props:s,update:t,not_equal:a,bound:n(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(f?f.$$.context:[]),callbacks:n(),dirty:u,skip_bound:!1};let g=!1;if(p.ctx=l?l(e,d,((t,n,...o)=>{const r=o.length?o[0]:n;return p.ctx&&a(p.ctx[t],p.ctx[t]=r)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](r),g&&P(e,t)),n})):[],p.update(),g=!0,o(p.before_update),p.fragment=!!i&&i(p.ctx),r.target){if(r.hydrate){const t=function(t){return Array.from(t.childNodes)}(r.target);p.fragment&&p.fragment.l(t),t.forEach(c)}else p.fragment&&p.fragment.c();r.intro&&C(e.$$.fragment),B(e,r.target,r.anchor),Z()}m(f)}class O{$destroy(){I(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const X=[];function q(e,n=t){let o;const r=[];function i(t){if(l(e,t)&&(e=t,o)){const t=!X.length;for(let t=0;t<r.length;t+=1){const n=r[t];n[1](),X.push(n,e)}if(t){for(let t=0;t<X.length;t+=2)X[t][0](X[t+1]);X.length=0}}}return{set:i,update:function(t){i(t(e))},subscribe:function(l,a=t){const s=[l,a];return r.push(s),1===r.length&&(o=n(i)||t),l(e),()=>{const t=r.indexOf(s);-1!==t&&r.splice(t,1),0===r.length&&(o(),o=null)}}}}const W=q(!1),F=q(!1);function R(t,e,n){let o,r;i(t,W,(t=>n(2,o=t))),i(t,F,(t=>n(3,r=t)));const l=$();let a={},s="";return v((()=>{o&&l("ready"),r||(F.set(!0),function(t,e,n){let o=t.length;function r(){o=--o,o<1&&n()}e()?n():t.forEach((({type:t,url:e,options:n={async:!0,defer:!0}})=>{const o="script"===t,l=document.createElement(o?"script":"link");o?(l.src=e,l.async=n.async,l.defer=n.defer):(l.rel="stylesheet",l.href=e),l.onload=r,document.body.appendChild(l)}))}([{type:"style",url:"https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"},{type:"script",url:"https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"}],(()=>!1),(()=>(a=window.L,s=a.map,W.set(!0),!0))))})),t.$$.update=()=>{4&t.$$.dirty&&o&&l("ready")},[]}class K extends O{constructor(t){super(),U(this,t,R,null,l,{})}}const{window:V}=D;function j(e){let n,o,r,l,i,a;return r=new K({}),r.$on("ready",e[1]),{c(){n=u("div"),o=d(),z(r.$$.fragment),p(n,"class","map svelte-1fktu84"),p(n,"id",e[0])},m(t,c){var u,f,d,p;s(t,n,c),s(t,o,c),B(r,t,c),l=!0,i||(u=V,f="resize",d=e[2],u.addEventListener(f,d,p),a=()=>u.removeEventListener(f,d,p),i=!0)},p:t,i(t){l||(C(r.$$.fragment,t),l=!0)},o(t){A(r.$$.fragment,t),l=!1},d(t){t&&c(n),t&&c(o),I(r,t),i=!1,a()}}}function Y(t,e,n){let o={},r="";const l=$();let{options:i}=e;let a,s,{zoom:c=13,maxZoom:u=19,minZoom:f=1,mapID:d="map",attributionControl:p=!0,center:h=[0,0],markers:m,circles:g,recenter:v=!1,scrollWheelZoom:y=!0,tilelayers:k=[{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}],controls:w={zoomControl:!0,position:"topleft",scale:!1}}=i,b=[],H=[],x={iconUrl:"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",iconRetinaUrl:"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",shadowUrl:"https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],tooltipAnchor:[1,-34],shadowSize:[41,41]};function _(t,e){t.bindPopup(e.text,{closeOnClick:!1,autoClose:!1,...e}).addTo(r),e.isOpen&&t.openPopup()}function M(t,e){t.bindTooltip(e.text,{...e}).addTo(r),e.isOpen&&t.openTooltip()}let T=[],Z={};const E=t=>{t.markers.map(((t,e)=>{t.icon&&(a=o.icon(t.icon)),T[e]=new o.marker([t.lat,t.lng],{icon:a}).addTo(r),t.popup&&_(T[e],t.popup),t.tooltip&&M(T[e],t.tooltip)}))};let S=!1;return t.$$set=t=>{"options"in t&&n(3,i=t.options)},[d,function(){setTimeout((()=>{o=window.L,function(){r=o.map(d,{attributionControl:p,zoomControl:w.zoomControl,minZoom:f,maxZoom:u}).setView(h,c),T=o.marker([0,0]),k&&k.map((t=>{o.tileLayer(t.url,{...t}).addTo(r)}));y||r.scrollWheelZoom.disable();let t=o.control;w.zoomControl||t().remove();w.scale&&t.scale({position:w.position}).addTo(r);w.zoomControl&&w.position&&(r.removeControl(r.zoomControl),t.zoom({position:w.position}).addTo(r));m&&m.map((t=>{b.push([t.lat,t.lng]),a=t.icon?o.icon(t.icon):o.icon(x);let e=new o.marker([t.lat,t.lng],{icon:a});t.popup&&_(e,t.popup),t.tooltip&&M(e,t.tooltip),e.addTo(r)}));g&&g.map((t=>{H.push([t.lat,t.lng]);let e=new o.circle([t.lat,t.lng],{...t});t.popup&&_(e,t.popup),t.tooltip&&M(e,t.tooltip),e.addTo(r)}));v&&(1==b.length?(r.panTo(o.latLng(b[0][0],b[0][1])),r.setZoom(c)):(s=new o.LatLngBounds(b),r.fitBounds(s)));let e=new(o.Control.extend({_container:null,options:{position:"bottomleft"},onAdd(t){var e=o.DomUtil.create("div","pos");return this._latlng=e,e},updateHTML(t,e){var n=`${t.toFixed(5)}, ${e.toFixed(5)}`;this._latlng.innerHTML=n}}));r.addControl(e),r.addEventListener("mousemove",(function(t){e.updateHTML(t.latlng.lat,t.latlng.lng)})),r.on("click",(function(t){console.log("CLICK MAP");new o.marker(t.latlng).addTo(r).bindPopup(`${t.latlng.lat.toFixed(5)}, ${t.latlng.lng.toFixed(5)}`).openPopup()}))}(),l("ready")}),1)},function(){r&&r.invalidateSize()},i,function(t,e){return r.on(t,e)},E,t=>{S||(E(t),S=!0),"circles"in t&&t.circles.map(((t,e)=>{t.key in Z?Z[t.key].setRadius(t.r):(Z[t.key]=new o.circle([t.lat,t.lng],t.r,t.options),Z[t.key].addTo(r))})),"markers"in t&&t.markers.map(((t,e)=>{T[e].setLatLng(t).update(),T[e].addTo(r)}))},(t=5)=>{r.setZoom(t)}]}class G extends O{constructor(t){super(),U(this,t,Y,j,l,{options:3,on:4,addMarker:5,updateMarkers:6,setZoom:7},[-1,-1])}get on(){return this.$$.ctx[4]}get addMarker(){return this.$$.ctx[5]}get updateMarkers(){return this.$$.ctx[6]}get setZoom(){return this.$$.ctx[7]}}function J(e){let n,o,r,l,i;return{c(){n=u("main"),o=u("div"),r=u("canvas"),p(r,"class","blarg"),p(r,"id",l="canvas"+e[0].SID),p(r,"width","100"),p(r,"height",e[1]),p(o,"class","chart2div svelte-98iwyc"),p(o,"id",i="cdiv"+e[0].SID)},m(t,e){s(t,n,e),a(n,o),a(o,r)},p(t,e){1&e[0]&&l!==(l="canvas"+t[0].SID)&&p(r,"id",l),2&e[0]&&p(r,"height",t[1]),1&e[0]&&i!==(i="cdiv"+t[0].SID)&&p(o,"id",i)},i:t,o:t,d(t){t&&c(n)}}}function Q(t){}function tt(t,e,n,o,r,l){!function(t,e,n,o,r,l,i){t.save(),t.strokeStyle=l,t.lineWidth=i,t.beginPath(),t.moveTo(e,o),t.lineTo(n,r),t.stroke(),t.restore()}(t,e,e,n,o,r,l)}function et(t,e){var n=t/e,o=Math.pow(10,Math.floor(Math.log10(n))),r=n/o;return r>5?10*o:r>2?5*o:r>1?2*o:o}function nt(t,e,n){let o,{data:r}=e,{height:l=100}=e,i=0,a=0;var s=0,c=0;let u=0,f=0,d=15,p=0,h=0,m=0,g=0,y={x:0,y:0,on:!1},k={hover:!1,color:"rgba(255,0,0,0.7)",width:4,color_hover:"rgba(255,0,0,0.5)",width_hover:8,t:r.tp,phase:"p"},w={hover:!1,color:"rgba(0,0,255,0.7)",width:4,color_hover:"rgba(0,0,255,0.5)",width_hover:8,t:r.ts,phase:"s"};const b=$();let H;function x(t){y.x=t.offsetX,y.y=t.offsetY,y.on=!0,t.preventDefault()}function _(t){y.on=!1,t.preventDefault()}function M(t){if(0===t.buttons&&(y.on=!1),!1===y.on){var e=t.offsetX;let n=!1;[k,w].forEach((t=>{var o=function(t){return m/(f-u)*(t-u)+d}(t.t),r=t.hover;Math.abs(e-o)<4?t.hover=!0:t.hover=!1,t.hover!==r&&(n=!0)})),n&&L()}else{t.preventDefault();let e=!1;if([k,w].forEach((o=>{o.hover&&(!function(t,e){t.t=e,n(0,r["t"+t.phase]=e,r),b("update",{tp:r.tp,ts:r.ts,sid:r.SID})}(o,Z(t.offsetX)),e=!0)})),e)L();else{var o=Z(t.offsetX),l=Z(y.x);y.x=t.offsetX,y.y=t.offsetY;var i=l-o;E(u+i,f+i)}}}function T(t){!function(t){let e=t.offsetX;if(e<d||e>d+m)return!0;t.preventDefault();var n=Z(t.offsetX),o=.025,r=1-o;(t.deltaY<0||!0===t.shiftKey)&&(r=1+o);var l=(f-u)*r;l>c-s&&(l=c-s);E(n-l*(n-u)/(f-u),n+l*(f-n)/(f-u))}(t)}function Z(t){return u+(t-d)/(m/(f-u))}function E(t,e){t<s&&e>c?(u=s,f=c):t>=s&&e<=c?(u=t,f=e):t<s&&e<c?(u=s,f=u+(e-t)):t>s&&e>c&&(f=c,u=f-(e-t)),f-u<10*r.dt&&(f=u+10*r.dt),L()}function S(){var t=document.querySelector("#cdiv"+r.SID);H.width=t.clientWidth,p=H.width,h=H.height,m=p-30,g=h-30,L()}function L(){o.save(),o.fillStyle="white",o.clearRect(0,0,p,h),o.restore(),o.style="black";o.beginPath(),o.strokeRect(d,15,m,g);let t=m/(f-u),e=g/(a-i);var n=e=>d+(e-u)*t,l=t=>15+(t-i)*e,s=t=>15+t*g;let c=r.amp;for(var v=0;v<c.length;v++){let t=n(0+v*r.dt),e=l(c[v]);0==v?o.moveTo(t,e):o.lineTo(t,e)}o.stroke(),function(t,e,n,o,r){var l=7,i=5,a=3,s=u,c=f,d=et(c-s,l),p=et(d,l),h=Math.floor(u/d)*d;t.save();for(;h<=c;){h>=s&&h<=c&&(t.textAlign="center",t.textBaseline="top",t.fillText(h,e(h),r(1)+i),t.beginPath(),t.moveTo(e(h),r(1)),t.lineTo(e(h),r(1)+i),t.stroke());for(var m=h+p;m<h+d&&m<c;)m>=s&&m<=c&&(t.beginPath(),t.moveTo(e(m),r(1)),t.lineTo(e(m),r(1)+a),t.stroke()),m+=p;h+=d}t.restore()}(o,n,0,0,s),function(t,e,n,o,l){[[k,r.tp],[w,r.ts]].forEach((n=>{!function(t,e,n,o,r){r.hover&&tt(t,e,n,o,r.color_hover,r.width_hover),tt(t,e,n,o,r.color,r.width)}(t,e(n[1]),l(0),l(1),n[0])}))}(o,n,0,0,s)}return v((async()=>{H=document.querySelector("#canvas"+r.SID);document.querySelector("#cdiv"+r.SID);o=H.getContext("2d"),window.addEventListener("resize",S,!1),H.addEventListener("click",Q),H.addEventListener("wheel",T),H.addEventListener("mousemove",M),H.addEventListener("mousedown",x),H.addEventListener("mouseup",_),p=H.width,h=H.height,m=p-30,g=h-30;let t=r.amp;u=0;for(var e=1;e<t.length;e++)t[e]<i&&(i=t[e]),t[e]>a&&(a=t[e]);f=u+r.npts*r.dt,s=u,c=f,S()})),t.$$set=t=>{"data"in t&&n(0,r=t.data),"height"in t&&n(1,l=t.height)},[r,l]}class ot extends O{constructor(t){super(),U(this,t,nt,J,l,{data:0,height:1},[-1,-1])}}const{Map:rt}=D;function lt(t,e,n){const o=t.slice();return o[12]=e[n],o[13]=e,o[14]=n,o}function it(t){let e;return{c(){e=f("Loading data...")},m(t,n){s(t,e,n)},d(t){t&&c(e)}}}function at(t,e){let n,o,r,l,i,h,m,g,v,$=e[12].SID+"";function y(t){e[6].call(null,t,e[12],e[13],e[14])}let w={height:"125"};return void 0!==e[12]&&(w.data=e[12]),h=new ot({props:w}),k.push((()=>function(t,e,n){const o=t.$$.props[e];void 0!==o&&(t.$$.bound[o]=n,n(t.$$.ctx[o]))}(h,"data",y))),h.$on("update",e[4]),{key:t,first:null,c(){n=u("div"),o=u("div"),r=f($),l=d(),i=u("div"),z(h.$$.fragment),g=d(),p(i,"class","waveform svelte-gr9nzq"),p(n,"class","data svelte-gr9nzq"),this.first=n},m(t,e){s(t,n,e),a(n,o),a(o,r),a(n,l),a(n,i),B(h,i,null),a(n,g),v=!0},p(t,n){e=t,(!v||2&n)&&$!==($=e[12].SID+"")&&function(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}(r,$);const o={};var l;!m&&2&n&&(m=!0,o.data=e[12],l=()=>m=!1,b.push(l)),h.$set(o)},i(t){v||(C(h.$$.fragment,t),v=!0)},o(t){A(h.$$.fragment,t),v=!1},d(t){t&&c(n),I(h)}}}function st(t){let e,n,r,l,i,f,h=[],m=new rt,g={options:t[2]};r=new G({props:g}),t[5](r),r.$on("ready",t[3]);let v=t[1];const $=t=>t[12].SID;for(let e=0;e<v.length;e+=1){let n=lt(t,v,e),o=$(n);m.set(o,h[e]=at(o,n))}let y=null;return v.length||(y=it()),{c(){e=u("main"),n=u("div"),z(r.$$.fragment),l=d(),i=u("div");for(let t=0;t<h.length;t+=1)h[t].c();y&&y.c(),p(n,"class","map svelte-gr9nzq"),p(e,"class","svelte-gr9nzq")},m(t,o){s(t,e,o),a(e,n),B(r,n,null),a(e,l),a(e,i);for(let t=0;t<h.length;t+=1)h[t].m(i,null);y&&y.m(i,null),f=!0},p(t,[e]){if(r.$set({}),18&e){const n=t[1];L={r:0,c:[],p:L},h=function(t,e,n,o,r,l,i,a,s,c,u,f){let d=t.length,p=l.length,h=d;const m={};for(;h--;)m[t[h].key]=h;const g=[],v=new Map,$=new Map;for(h=p;h--;){const t=f(r,l,h),a=n(t);let s=i.get(a);s?o&&s.p(t,e):(s=c(a,t),s.c()),v.set(a,g[h]=s),a in m&&$.set(a,Math.abs(h-m[a]))}const y=new Set,k=new Set;function w(t){C(t,1),t.m(a,u),i.set(t.key,t),u=t.first,p--}for(;d&&p;){const e=g[p-1],n=t[d-1],o=e.key,r=n.key;e===n?(u=e.first,d--,p--):v.has(r)?!i.has(o)||y.has(o)?w(e):k.has(r)?d--:$.get(o)>$.get(r)?(k.add(o),w(e)):(y.add(r),d--):(s(n,i),d--)}for(;d--;){const e=t[d];v.has(e.key)||s(e,i)}for(;p;)w(g[p-1]);return g}(h,e,$,1,t,n,m,i,N,at,null,lt),L.r||o(L.c),L=L.p,n.length?y&&(y.d(1),y=null):y||(y=it(),y.c(),y.m(i,null))}},i(t){if(!f){C(r.$$.fragment,t);for(let t=0;t<v.length;t+=1)C(h[t]);f=!0}},o(t){A(r.$$.fragment,t);for(let t=0;t<h.length;t+=1)A(h[t]);f=!1},d(n){n&&c(e),t[5](null),I(r);for(let t=0;t<h.length;t+=1)h[t].d();y&&y.d()}}}function ct(t,e){return 8*(e-t)}function ut(t,e,n){let o,r=[],l={starttime:"2020-11-08T14:10:00",endtime:"2020-11-08T14:12:00",data:[{net:"IU",sta:"HRV",loc:"00",cha:"BHZ"},{net:"N4",sta:"M63A",loc:"00",cha:"HHZ"},{net:"TA",sta:"M65A",loc:"--",cha:"BHZ"}]},i=[{key:"IU_HRV_00_BHZ",lat:42.5064,lon:-71.5583,file:"IU.HRV.00.BHZ.M.2020.313.141006.sac",r:1e5},{key:"N4_M63A_00_HHZ",lat:41.4038,lon:-72.0464,file:"N4.M63A.00.HHZ.M.2020.313.141006.sac",r:0},{key:"TA_M65A__BHZ",lat:41.562,lon:-70.6466,file:"TA.M65A..BHZ.M.2020.313.141006.sac",r:0},{key:"LD.KSCT.BHZ",lat:41.7261,lon:-73.4843,file:"LD.KSCT..BHZ.M.2020.313.141006.sac",r:0},{key:"LD.UCCT.BHZ",lat:41.7943,lon:-72.2255,file:"LD.UCCT..BHZ.M.2020.313.141006.sac",r:0},{key:"LD.UNH.BHZ",lat:43.0927,lon:-70.865,file:"LD.UNH..BHZ.M.2020.313.141006.sac",r:0},{key:"N4.K62A.HHZ",lat:42.6651,lon:-72.2345,file:"N4.K62A.00.HHZ.M.2020.313.141006.sac",r:0},{key:"N4.L61B.HHZ",lat:42.4498,lon:-72.6802,file:"N4.L61B.00.HHZ.M.2020.313.141006.sac",r:0},{key:"N4.L64A.HHZ",lat:41.9359,lon:-70.8391,file:"N4.L64A.00.HHZ.M.2020.313.141006.sac",r:0},{key:"N4.N62A.HHZ",lat:40.9313,lon:-73.4677,file:"N4.N62A.00.HHZ.M.2020.313.141006.sac",r:0},{key:"NE.BCX.HHZ",lat:42.335,lon:-71.1705,file:"NE.BCX.00.HHZ.M.2020.313.141006.sac",r:0},{key:"NE.WES.HHZ",lat:42.3848,lon:-71.3218,file:"NE.WES.00.HHZ.M.2020.313.141006.sac",r:0},{key:"NE.WSPT.HHZ",lat:41.1712,lon:-73.3278,file:"NE.WSPT.00.HHZ.M.2020.313.141006.sac",r:0}];function a(t){o.updateMarkers({circles:[t]})}function s(t){return i.find((e=>e.key===t))}return[o,r,{mapID:"map",zoom:7,center:[41.5,-71.5]},async function(){let t=i.map((t=>({lat:t.lat,lng:t.lon,icon:{iconUrl:"./marker-icon-2x-red.png",iconSize:[12.5,20.5]},popup:{isOpen:!1,text:t.key}}))),e=i.map((t=>({lat:t.lat,lng:t.lon,r:t.r,key:t.key,options:{fill:!1,color:"red"}})));o.updateMarkers({markers:t,circles:e}),o.on("mousedown",(function(t){console.log("MOUSE MAP MOVE",t.latlng)})),l.data.map((t=>{""!=t.net&&t.net,""!=t.sta&&t.sta,""!=t.loc&&t.loc,""!=t.cha&&t.cha,l.starttime,l.endtime})),l.data.forEach((t=>{let e=`${t.net}_${t.sta}_${t.loc}_${t.cha}.csv`;e=e.replace("--",""),fetch(e).then((t=>t.text())).then((t=>function(t){for(var e=t.split("\n"),n={},o=[],r=0;r<e.length;r++)if("#"==e[r][0]){let t=e[r].split(":");var l=t[0].replace("# ",""),i=t[1].trim();n[l]=i,"sample_count"==l?n.npts=parseInt(i):"sample_rate_hz"==l&&(n.dt=1/parseFloat(i))}else if("Time, Sample"==e[r]);else{let t=parseFloat(e[r].split(",")[1]);o.push(t)}return n.amp=o,n}(t))).then((t=>{t.tp=20,t.ts=40;let e=s(t.SID);void 0!==e&&(e.r=1e3*ct(t.tp,t.ts),a(e)),n(1,r=[...r,t])}))}))},function(t){let e=t.detail.tp,n=t.detail.ts;var o=s(t.detail.sid);void 0!==o&&(o.r=1e3*ct(e,n),a(o))},function(t){k[t?"unshift":"push"]((()=>{o=t,n(0,o)}))},function(t,e,o,l){o[l]=t,n(1,r)}]}return new class extends O{constructor(t){super(),U(this,t,ut,st,l,{})}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map
