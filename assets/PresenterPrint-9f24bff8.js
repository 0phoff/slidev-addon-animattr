import{d as m,i as _,a as p,u as h,b as u,c as d,e as f,f as n,g as t,t as s,h as a,F as v,r as g,n as x,j as y,o as r,k as b,l as k,m as N,p as w,q as P,_ as S}from"./index-77d6ffad.js";import{N as V}from"./NoteDisplay-0809a541.js";const j={class:"m-4"},L={class:"mb-10"},T={class:"text-4xl font-bold mt-2"},B={class:"opacity-50"},C={class:"text-lg"},D={class:"font-bold flex gap-2"},H={class:"opacity-50"},z=t("div",{class:"flex-auto"},null,-1),F={key:0,class:"border-gray-400/50 mb-8"},M=m({__name:"PresenterPrint",setup(q){_(p),h(`
@page {
  size: A4;
  margin-top: 1.5cm;
  margin-bottom: 1cm;
}
* {
  -webkit-print-color-adjust: exact;
}
html,
html body,
html #app,
html #page-root {
  height: auto;
  overflow: auto !important;
}
`),u({title:`Notes - ${d.title}`});const l=f(()=>y.slice(0,-1).map(o=>{var i;return(i=o.meta)==null?void 0:i.slide}).filter(o=>o!==void 0&&o.noteHTML!==""));return(o,i)=>(r(),n("div",{id:"page-root",style:x(a(P))},[t("div",j,[t("div",L,[t("h1",T,s(a(d).title),1),t("div",B,s(new Date().toLocaleString()),1)]),(r(!0),n(v,null,g(a(l),(e,c)=>(r(),n("div",{key:c,class:"flex flex-col gap-4 break-inside-avoid-page"},[t("div",null,[t("h2",C,[t("div",D,[t("div",H,s(e==null?void 0:e.no)+"/"+s(a(b)),1),k(" "+s(e==null?void 0:e.title)+" ",1),z])]),N(V,{"note-html":e.noteHTML,class:"max-w-full"},null,8,["note-html"])]),c<a(l).length-1?(r(),n("hr",F)):w("v-if",!0)]))),128))])],4))}}),R=S(M,[["__file","/home/runner/work/slidev-addon-animattr/slidev-addon-animattr/node_modules/.pnpm/@slidev+client@0.40.16_postcss@8.4.23_react-dom@16.14.0_react@16.14.0_vite@4.3.3/node_modules/@slidev/client/internals/PresenterPrint.vue"]]);export{R as default};
