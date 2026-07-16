(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,98183,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var a={assign:function(){return l},searchParamsToUrlQuery:function(){return n},urlQueryToSearchParams:function(){return i}};for(var o in a)Object.defineProperty(r,o,{enumerable:!0,get:a[o]});function n(e){let t={};for(let[r,a]of e.entries()){let e=t[r];void 0===e?t[r]=a:Array.isArray(e)?e.push(a):t[r]=[e,a]}return t}function s(e){return"string"==typeof e?e:("number"!=typeof e||isNaN(e))&&"boolean"!=typeof e?"":String(e)}function i(e){let t=new URLSearchParams;for(let[r,a]of Object.entries(e))if(Array.isArray(a))for(let e of a)t.append(r,s(e));else t.set(r,s(a));return t}function l(e,...t){for(let r of t){for(let t of r.keys())e.delete(t);for(let[t,a]of r.entries())e.append(t,a)}return e}},18967,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var a={DecodeError:function(){return g},MiddlewareNotFoundError:function(){return k},MissingStaticPage:function(){return v},NormalizeError:function(){return x},PageNotFoundError:function(){return b},SP:function(){return h},ST:function(){return y},WEB_VITALS:function(){return n},execOnce:function(){return s},getDisplayName:function(){return d},getLocationOrigin:function(){return c},getURL:function(){return u},isAbsoluteUrl:function(){return l},isResSent:function(){return f},loadGetInitialProps:function(){return m},normalizeRepeatedSlashes:function(){return p},stringifyError:function(){return w}};for(var o in a)Object.defineProperty(r,o,{enumerable:!0,get:a[o]});let n=["CLS","FCP","FID","INP","LCP","TTFB"];function s(e){let t,r=!1;return(...a)=>(r||(r=!0,t=e(...a)),t)}let i=/^[a-zA-Z][a-zA-Z\d+\-.]*?:/,l=e=>i.test(e);function c(){let{protocol:e,hostname:t,port:r}=window.location;return`${e}//${t}${r?":"+r:""}`}function u(){let{href:e}=window.location,t=c();return e.substring(t.length)}function d(e){return"string"==typeof e?e:e.displayName||e.name||"Unknown"}function f(e){return e.finished||e.headersSent}function p(e){let t=e.split("?");return t[0].replace(/\\/g,"/").replace(/\/\/+/g,"/")+(t[1]?`?${t.slice(1).join("?")}`:"")}async function m(e,t){let r=t.res||t.ctx&&t.ctx.res;if(!e.getInitialProps)return t.ctx&&t.Component?{pageProps:await m(t.Component,t.ctx)}:{};let a=await e.getInitialProps(t);if(r&&f(r))return a;if(!a)throw Object.defineProperty(Error(`"${d(e)}.getInitialProps()" should resolve to an object. But found "${a}" instead.`),"__NEXT_ERROR_CODE",{value:"E1025",enumerable:!1,configurable:!0});return a}let h="u">typeof performance,y=h&&["mark","measure","getEntriesByName"].every(e=>"function"==typeof performance[e]);class g extends Error{}class x extends Error{}class b extends Error{constructor(e){super(),this.code="ENOENT",this.name="PageNotFoundError",this.message=`Cannot find module for page: ${e}`}}class v extends Error{constructor(e,t){super(),this.message=`Failed to load static file for page: ${e} ${t}`}}class k extends Error{constructor(){super(),this.code="ENOENT",this.message="Cannot find the middleware module"}}function w(e){return JSON.stringify({message:e.message,stack:e.stack})}},33525,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"warnOnce",{enumerable:!0,get:function(){return a}});let a=e=>{}},96661,e=>{"use strict";e.s(["mergeClasses",0,(...e)=>e.filter((e,t,r)=>!!e&&""!==e.trim()&&r.indexOf(e)===t).join(" ").trim()])},71987,88973,e=>{"use strict";e.s(["default",0,{xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"}],71987),e.s(["hasA11yProp",0,e=>{for(let t in e)if(t.startsWith("aria-")||"role"===t||"title"===t)return!0;return!1}],88973)},5014,e=>{"use strict";var t=e.i(71645),r=e.i(71987),a=e.i(88973),o=e.i(96661);let n=(0,t.createContext)({}),s=(0,t.forwardRef)(({color:e,size:s,strokeWidth:i,absoluteStrokeWidth:l,className:c="",children:u,iconNode:d,...f},p)=>{let{size:m=24,strokeWidth:h=2,absoluteStrokeWidth:y=!1,color:g="currentColor",className:x=""}=(0,t.useContext)(n)??{},b=l??y?24*Number(i??h)/Number(s??m):i??h;return(0,t.createElement)("svg",{ref:p,...r.default,width:s??m??r.default.width,height:s??m??r.default.height,stroke:e??g,strokeWidth:b,className:(0,o.mergeClasses)("lucide",x,c),...!u&&!(0,a.hasA11yProp)(f)&&{"aria-hidden":"true"},...f},[...d.map(([e,r])=>(0,t.createElement)(e,r)),...Array.isArray(u)?u:[u]])});e.s(["default",0,s],5014)},56420,e=>{"use strict";var t=e.i(71645),r=e.i(96661);let a=e=>{let t=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,r)=>r?r.toUpperCase():t.toLowerCase());return t.charAt(0).toUpperCase()+t.slice(1)};var o=e.i(5014);e.s(["default",0,(e,n)=>{let s=(0,t.forwardRef)(({className:s,...i},l)=>(0,t.createElement)(o.default,{ref:l,iconNode:n,className:(0,r.mergeClasses)(`lucide-${a(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,s),...i}));return s.displayName=a(e),s}],56420)},9165,e=>{"use strict";let t=e.i(47167).default.env.NEXT_PUBLIC_API_URL||"/api/v1";async function r(e,a={}){let o=`${t}${e.startsWith("/")?e:`/${e}`}`,n={};{let e=localStorage.getItem("token");e&&(n={Authorization:`Bearer ${e}`})}let s={"Content-Type":"application/json",...n,...a.headers},i={...a,headers:s};try{let e=await fetch(o,i),t=await e.json();if(!e.ok)throw Error(t.message||"Something went wrong.");return t.data}catch(t){if(console.error(`API Error [${e}]:`,t),t instanceof Error)throw t;throw Error(String(t))}}e.s(["api",0,{get:(e,t)=>r(e,{method:"GET",...t}),post:(e,t,a)=>r(e,{method:"POST",body:JSON.stringify(t),...a}),patch:(e,t,a)=>r(e,{method:"PATCH",body:JSON.stringify(t),...a}),delete:(e,t)=>r(e,{method:"DELETE",...t})}])},5766,e=>{"use strict";let t,r;var a,o=e.i(71645);let n={data:""},s=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,i=/\/\*[^]*?\*\/|  +/g,l=/\n+/g,c=(e,t)=>{let r="",a="",o="";for(let n in e){let s=e[n];"@"==n[0]?"i"==n[1]?r=n+" "+s+";":a+="f"==n[1]?c(s,n):n+"{"+c(s,"k"==n[1]?"":t)+"}":"object"==typeof s?a+=c(s,t?t.replace(/([^,])+/g,e=>n.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,t=>/&/.test(t)?t.replace(/&/g,e):e?e+" "+t:t)):n):null!=s&&(n="-"==n[1]?n:n.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=c.p?c.p(n,s):n+":"+s+";")}return r+(t&&o?t+"{"+o+"}":o)+a},u={},d=e=>{if("object"==typeof e){let t="";for(let r in e)t+=r+d(e[r]);return t}return e};function f(e){let t,r,a=this||{},o=e.call?e(a.p):e;return((e,t,r,a,o)=>{var n;let f=d(e),p=u[f]||(u[f]=(e=>{let t=0,r=11;for(;t<e.length;)r=101*r+e.charCodeAt(t++)>>>0;return"go"+r})(f));if(!u[p]){let t=f!==e?e:(e=>{let t,r,a=[{}];for(;t=s.exec(e.replace(i,""));)t[4]?a.shift():t[3]?(r=t[3].replace(l," ").trim(),a.unshift(a[0][r]=a[0][r]||{})):a[0][t[1]]=t[2].replace(l," ").trim();return a[0]})(e);u[p]=c(o?{["@keyframes "+p]:t}:t,r?"":"."+p)}let m=r&&u.g;return r&&(u.g=u[p]),n=u[p],m?t.data=t.data.replace(m,n):-1===t.data.indexOf(n)&&(t.data=a?n+t.data:t.data+n),p})(o.unshift?o.raw?(t=[].slice.call(arguments,1),r=a.p,o.reduce((e,a,o)=>{let n=t[o];if(n&&n.call){let e=n(r),t=e&&e.props&&e.props.className||/^go/.test(e)&&e;n=t?"."+t:e&&"object"==typeof e?e.props?"":c(e,""):!1===e?"":e}return e+a+(null==n?"":n)},"")):o.reduce((e,t)=>Object.assign(e,t&&t.call?t(a.p):t),{}):o,(e=>{if("object"==typeof window){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||n})(a.target),a.g,a.o,a.k)}f.bind({g:1});let p,m,h,y=f.bind({k:1});function g(e,t){let r=this||{};return function(){let a=arguments;function o(n,s){let i=Object.assign({},n),l=i.className||o.className;r.p=Object.assign({theme:m&&m()},i),r.o=/go\d/.test(l),i.className=f.apply(r,a)+(l?" "+l:""),t&&(i.ref=s);let c=e;return e[0]&&(c=i.as||e,delete i.as),h&&c[0]&&h(i),p(c,i)}return t?t(o):o}}var x=(e,t)=>"function"==typeof e?e(t):e,b=(t=0,()=>(++t).toString()),v=()=>{if(void 0===r&&"u">typeof window){let e=matchMedia("(prefers-reduced-motion: reduce)");r=!e||e.matches}return r},k="default",w=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(e=>e.id===t.toast.id?{...e,...t.toast}:e)};case 2:let{toast:a}=t;return w(e,{type:+!!e.toasts.find(e=>e.id===a.id),toast:a});case 3:let{toastId:o}=t;return{...e,toasts:e.toasts.map(e=>e.id===o||void 0===o?{...e,dismissed:!0,visible:!1}:e)};case 4:return void 0===t.toastId?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(e=>e.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let n=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(e=>({...e,pauseDuration:e.pauseDuration+n}))}}},j=[],E={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},N={},C=(e,t=k)=>{N[t]=w(N[t]||E,e),j.forEach(([e,r])=>{e===t&&r(N[t])})},P=e=>Object.keys(N).forEach(t=>C(e,t)),S=(e=k)=>t=>{C(t,e)},O={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},_=(e={},t=k)=>{let[r,a]=(0,o.useState)(N[t]||E),n=(0,o.useRef)(N[t]);(0,o.useEffect)(()=>(n.current!==N[t]&&a(N[t]),j.push([t,a]),()=>{let e=j.findIndex(([e])=>e===t);e>-1&&j.splice(e,1)}),[t]);let s=r.toasts.map(t=>{var r,a,o;return{...e,...e[t.type],...t,removeDelay:t.removeDelay||(null==(r=e[t.type])?void 0:r.removeDelay)||(null==e?void 0:e.removeDelay),duration:t.duration||(null==(a=e[t.type])?void 0:a.duration)||(null==e?void 0:e.duration)||O[t.type],style:{...e.style,...null==(o=e[t.type])?void 0:o.style,...t.style}}});return{...r,toasts:s}},A=e=>(t,r)=>{let a,o=((e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(null==r?void 0:r.id)||b()}))(t,e,r);return S(o.toasterId||(a=o.id,Object.keys(N).find(e=>N[e].toasts.some(e=>e.id===a))))({type:2,toast:o}),o.id},M=(e,t)=>A("blank")(e,t);M.error=A("error"),M.success=A("success"),M.loading=A("loading"),M.custom=A("custom"),M.dismiss=(e,t)=>{let r={type:3,toastId:e};t?S(t)(r):P(r)},M.dismissAll=e=>M.dismiss(void 0,e),M.remove=(e,t)=>{let r={type:4,toastId:e};t?S(t)(r):P(r)},M.removeAll=e=>M.remove(void 0,e),M.promise=(e,t,r)=>{let a=M.loading(t.loading,{...r,...null==r?void 0:r.loading});return"function"==typeof e&&(e=e()),e.then(e=>{let o=t.success?x(t.success,e):void 0;return o?M.success(o,{id:a,...r,...null==r?void 0:r.success}):M.dismiss(a),e}).catch(e=>{let o=t.error?x(t.error,e):void 0;o?M.error(o,{id:a,...r,...null==r?void 0:r.error}):M.dismiss(a)}),e};var T=1e3,$=(e,t="default")=>{let{toasts:r,pausedAt:a}=_(e,t),n=(0,o.useRef)(new Map).current,s=(0,o.useCallback)((e,t=T)=>{if(n.has(e))return;let r=setTimeout(()=>{n.delete(e),i({type:4,toastId:e})},t);n.set(e,r)},[]);(0,o.useEffect)(()=>{if(a)return;let e=Date.now(),o=r.map(r=>{if(r.duration===1/0)return;let a=(r.duration||0)+r.pauseDuration-(e-r.createdAt);if(a<0){r.visible&&M.dismiss(r.id);return}return setTimeout(()=>M.dismiss(r.id,t),a)});return()=>{o.forEach(e=>e&&clearTimeout(e))}},[r,a,t]);let i=(0,o.useCallback)(S(t),[t]),l=(0,o.useCallback)(()=>{i({type:5,time:Date.now()})},[i]),c=(0,o.useCallback)((e,t)=>{i({type:1,toast:{id:e,height:t}})},[i]),u=(0,o.useCallback)(()=>{a&&i({type:6,time:Date.now()})},[a,i]),d=(0,o.useCallback)((e,t)=>{let{reverseOrder:a=!1,gutter:o=8,defaultPosition:n}=t||{},s=r.filter(t=>(t.position||n)===(e.position||n)&&t.height),i=s.findIndex(t=>t.id===e.id),l=s.filter((e,t)=>t<i&&e.visible).length;return s.filter(e=>e.visible).slice(...a?[l+1]:[0,l]).reduce((e,t)=>e+(t.height||0)+o,0)},[r]);return(0,o.useEffect)(()=>{r.forEach(e=>{if(e.dismissed)s(e.id,e.removeDelay);else{let t=n.get(e.id);t&&(clearTimeout(t),n.delete(e.id))}})},[r,s]),{toasts:r,handlers:{updateHeight:c,startPause:l,endPause:u,calculateOffset:d}}},I=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,L=y`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,R=y`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,z=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${I} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${L} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${R} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,U=y`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,D=g("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${U} 1s linear infinite;
`,B=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,F=y`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,W=g("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${B} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${F} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,K=g("div")`
  position: absolute;
`,H=g("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,V=y`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,q=g("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${V} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,X=({toast:e})=>{let{icon:t,type:r,iconTheme:a}=e;return void 0!==t?"string"==typeof t?o.createElement(q,null,t):t:"blank"===r?null:o.createElement(H,null,o.createElement(D,{...a}),"loading"!==r&&o.createElement(K,null,"error"===r?o.createElement(z,{...a}):o.createElement(W,{...a})))},Z=g("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,J=g("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Q=o.memo(({toast:e,position:t,style:r,children:a})=>{let n=e.height?((e,t)=>{let r=e.includes("top")?1:-1,[a,o]=v()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*r}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*r}%,-1px) scale(.6); opacity:0;}
`];return{animation:t?`${y(a)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${y(o)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(e.position||t||"top-center",e.visible):{opacity:0},s=o.createElement(X,{toast:e}),i=o.createElement(J,{...e.ariaProps},x(e.message,e));return o.createElement(Z,{className:e.className,style:{...n,...r,...e.style}},"function"==typeof a?a({icon:s,message:i}):o.createElement(o.Fragment,null,s,i))});a=o.createElement,c.p=void 0,p=a,m=void 0,h=void 0;var G=({id:e,className:t,style:r,onHeightUpdate:a,children:n})=>{let s=o.useCallback(t=>{if(t){let r=()=>{a(e,t.getBoundingClientRect().height)};r(),new MutationObserver(r).observe(t,{subtree:!0,childList:!0,characterData:!0})}},[e,a]);return o.createElement("div",{ref:s,className:t,style:r},n)},Y=f`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;e.s(["CheckmarkIcon",0,W,"ErrorIcon",0,z,"LoaderIcon",0,D,"ToastBar",0,Q,"ToastIcon",0,X,"Toaster",0,({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:a,children:n,toasterId:s,containerStyle:i,containerClassName:l})=>{let{toasts:c,handlers:u}=$(r,s);return o.createElement("div",{"data-rht-toaster":s||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...i},className:l,onMouseEnter:u.startPause,onMouseLeave:u.endPause},c.map(r=>{let s,i,l=r.position||t,c=u.calculateOffset(r,{reverseOrder:e,gutter:a,defaultPosition:t}),d=(s=l.includes("top"),i=l.includes("center")?{justifyContent:"center"}:l.includes("right")?{justifyContent:"flex-end"}:{},{left:0,right:0,display:"flex",position:"absolute",transition:v()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${c*(s?1:-1)}px)`,...s?{top:0}:{bottom:0},...i});return o.createElement(G,{id:r.id,key:r.id,onHeightUpdate:u.updateHeight,className:r.visible?Y:"",style:d},"custom"===r.type?x(r.message,r):n?n(r):o.createElement(Q,{toast:r,position:l}))}))},"default",0,M,"resolveValue",0,x,"toast",0,M,"useToaster",0,$,"useToasterStore",0,_],5766)},18566,(e,t,r)=>{t.exports=e.r(76562)},90464,e=>{"use strict";var t=e.i(43476),r=e.i(71645),a=e.i(18566),o=e.i(9165);let n=(0,r.createContext)(null),s=["/bookmarks","/profile"],i=["/dashboard","/admin"];e.s(["AuthProvider",0,function({children:e}){let[l,c]=(0,r.useState)(null),[u,d]=(0,r.useState)(null),[f,p]=(0,r.useState)(!0),m=(0,a.useRouter)(),h=(0,a.usePathname)(),y=(0,r.useCallback)(()=>{localStorage.removeItem("token"),localStorage.removeItem("refreshToken"),d(null),c(null),m.push("/")},[m]);(0,r.useEffect)(()=>{!async function(){let e=localStorage.getItem("token");if(e){d(e);try{let e=await o.api.get("/auth/me");c(e)}catch(e){console.error("Token validation failed, logging out",e),y()}}p(!1)}()},[y]),(0,r.useEffect)(()=>{f||(!l&&s.some(e=>h.startsWith(e))&&m.push(`/auth?redirect=${encodeURIComponent(h)}`),i.some(e=>h.startsWith(e))&&(!l||"admin"!==l.role&&"super_admin"!==l.role)&&m.push("/"))},[l,h,f,m]);let g=async(e,t)=>{localStorage.setItem("token",e),localStorage.setItem("refreshToken",t),d(e);try{let e=await o.api.get("/auth/me");c(e)}catch(e){console.error("Load user profile failed",e),y()}};return(0,t.jsx)(n.Provider,{value:{user:l,token:u,isLoading:f,login:g,logout:y},children:e})},"useAuth",0,function(){let e=(0,r.useContext)(n);if(!e)throw Error("useAuth must be used within an AuthProvider");return e}])},95057,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var a={formatUrl:function(){return i},formatWithValidation:function(){return c},urlObjectKeys:function(){return l}};for(var o in a)Object.defineProperty(r,o,{enumerable:!0,get:a[o]});let n=e.r(90809)._(e.r(98183)),s=/https?|ftp|gopher|file/;function i(e){let{auth:t,hostname:r}=e,a=e.protocol||"",o=e.pathname||"",i=e.hash||"",l=e.query||"",c=!1;t=t?encodeURIComponent(t).replace(/%3A/i,":")+"@":"",e.host?c=t+e.host:r&&(c=t+(~r.indexOf(":")?`[${r}]`:r),e.port&&(c+=":"+e.port)),l&&"object"==typeof l&&(l=String(n.urlQueryToSearchParams(l)));let u=e.search||l&&`?${l}`||"";return a&&!a.endsWith(":")&&(a+=":"),e.slashes||(!a||s.test(a))&&!1!==c?(c="//"+(c||""),o&&"/"!==o[0]&&(o="/"+o)):c||(c=""),i&&"#"!==i[0]&&(i="#"+i),u&&"?"!==u[0]&&(u="?"+u),o=o.replace(/[?#]/g,encodeURIComponent),u=u.replace("#","%23"),`${a}${c}${o}${u}${i}`}let l=["auth","hash","host","hostname","href","path","pathname","port","protocol","query","search","slashes"];function c(e){return i(e)}},18581,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"useMergedRef",{enumerable:!0,get:function(){return o}});let a=e.r(71645);function o(e,t){let r=(0,a.useRef)(null),o=(0,a.useRef)(null);return(0,a.useCallback)(a=>{if(null===a){let e=r.current;e&&(r.current=null,e());let t=o.current;t&&(o.current=null,t())}else e&&(r.current=n(e,a)),t&&(o.current=n(t,a))},[e,t])}function n(e,t){if("function"!=typeof e)return e.current=t,()=>{e.current=null};{let r=e(t);return"function"==typeof r?r:()=>e(null)}}("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},73668,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"isLocalURL",{enumerable:!0,get:function(){return n}});let a=e.r(18967),o=e.r(52817);function n(e){if(!(0,a.isAbsoluteUrl)(e))return!0;try{let t=(0,a.getLocationOrigin)(),r=new URL(e,t);return r.origin===t&&(0,o.hasBasePath)(r.pathname)}catch(e){return!1}}},84508,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0}),Object.defineProperty(r,"errorOnce",{enumerable:!0,get:function(){return a}});let a=e=>{}},22016,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var a={default:function(){return g},useLinkStatus:function(){return b}};for(var o in a)Object.defineProperty(r,o,{enumerable:!0,get:a[o]});let n=e.r(90809),s=e.r(43476),i=n._(e.r(71645)),l=e.r(95057),c=e.r(8372),u=e.r(18581),d=e.r(18967),f=e.r(5550);e.r(33525);let p=e.r(88540),m=e.r(91949),h=e.r(73668),y=e.r(9396);function g(t){var r,a;let o,n,g,[b,v]=(0,i.useOptimistic)(m.IDLE_LINK_STATUS),k=(0,i.useRef)(null),{href:w,as:j,children:E,prefetch:N=null,passHref:C,replace:P,shallow:S,scroll:O,onClick:_,onMouseEnter:A,onTouchStart:M,legacyBehavior:T=!1,onNavigate:$,transitionTypes:I,ref:L,unstable_dynamicOnHover:R,...z}=t;o=E,T&&("string"==typeof o||"number"==typeof o)&&(o=(0,s.jsx)("a",{children:o}));let U=i.default.useContext(c.AppRouterContext),D=!1!==N,B=!1!==N?null===(a=N)||"auto"===a?y.FetchStrategy.PPR:y.FetchStrategy.Full:y.FetchStrategy.PPR,F="string"==typeof(r=j||w)?r:(0,l.formatUrl)(r);if(T){if(o?.$$typeof===Symbol.for("react.lazy"))throw Object.defineProperty(Error("`<Link legacyBehavior>` received a direct child that is either a Server Component, or JSX that was loaded with React.lazy(). This is not supported. Either remove legacyBehavior, or make the direct child a Client Component that renders the Link's `<a>` tag."),"__NEXT_ERROR_CODE",{value:"E863",enumerable:!1,configurable:!0});n=i.default.Children.only(o)}let W=T?n&&"object"==typeof n&&n.ref:L,K=i.default.useCallback(e=>(null!==U&&(k.current=(0,m.mountLinkInstance)(e,F,U,B,D,v)),()=>{k.current&&((0,m.unmountLinkForCurrentNavigation)(k.current),k.current=null),(0,m.unmountPrefetchableInstance)(e)}),[D,F,U,B,v]),H={ref:(0,u.useMergedRef)(K,W),onClick(t){T||"function"!=typeof _||_(t),T&&n.props&&"function"==typeof n.props.onClick&&n.props.onClick(t),!U||t.defaultPrevented||function(t,r,a,o,n,s,l){if("u">typeof window){let c,{nodeName:u}=t.currentTarget;if("A"===u.toUpperCase()&&((c=t.currentTarget.getAttribute("target"))&&"_self"!==c||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey||t.nativeEvent&&2===t.nativeEvent.which)||t.currentTarget.hasAttribute("download"))return;if(!(0,h.isLocalURL)(r)){o&&(t.preventDefault(),location.replace(r));return}if(t.preventDefault(),s){let e=!1;if(s({preventDefault:()=>{e=!0}}),e)return}let{dispatchNavigateAction:d}=e.r(99781);i.default.startTransition(()=>{d(r,o?"replace":"push",!1===n?p.ScrollBehavior.NoScroll:p.ScrollBehavior.Default,a.current,l)})}}(t,F,k,P,O,$,I)},onMouseEnter(e){T||"function"!=typeof A||A(e),T&&n.props&&"function"==typeof n.props.onMouseEnter&&n.props.onMouseEnter(e),U&&D&&(0,m.onNavigationIntent)(e.currentTarget,!0===R)},onTouchStart:function(e){T||"function"!=typeof M||M(e),T&&n.props&&"function"==typeof n.props.onTouchStart&&n.props.onTouchStart(e),U&&D&&(0,m.onNavigationIntent)(e.currentTarget,!0===R)}};return(0,d.isAbsoluteUrl)(F)?H.href=F:T&&!C&&("a"!==n.type||"href"in n.props)||(H.href=(0,f.addBasePath)(F)),g=T?i.default.cloneElement(n,H):(0,s.jsx)("a",{...z,...H,children:o}),(0,s.jsx)(x.Provider,{value:b,children:g})}e.r(84508);let x=(0,i.createContext)(m.IDLE_LINK_STATUS),b=()=>(0,i.useContext)(x);("function"==typeof r.default||"object"==typeof r.default&&null!==r.default)&&void 0===r.default.__esModule&&(Object.defineProperty(r.default,"__esModule",{value:!0}),Object.assign(r.default,r),t.exports=r.default)},56423,e=>{"use strict";let t=(0,e.i(56420).default)("book-open",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);e.s(["BookOpen",0,t],56423)},63676,e=>{"use strict";let t=(0,e.i(56420).default)("x",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);e.s(["X",0,t],63676)},9584,e=>{"use strict";let t=(0,e.i(56420).default)("database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);e.s(["Database",0,t],9584)},96315,e=>{"use strict";let t=(0,e.i(56420).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);e.s(["Mail",0,t],96315)},1279,e=>{"use strict";let t=(0,e.i(56420).default)("user",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);e.s(["User",0,t],1279)},28276,e=>{"use strict";let t=(0,e.i(56420).default)("compass",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z",key:"9ktpf1"}]]);e.s(["Compass",0,t],28276)},28623,e=>{"use strict";let t=(0,e.i(56420).default)("sparkles",[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]]);e.s(["Sparkles",0,t],28623)},45678,e=>{"use strict";var t=e.i(43476),r=e.i(71645),a=e.i(22016),o=e.i(18566),n=e.i(90464),s=e.i(56420);let i=(0,s.default)("menu",[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]]);var l=e.i(63676);let c=(0,s.default)("sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]),u=(0,s.default)("moon",[["path",{d:"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",key:"kfwtm"}]]);var d=e.i(28623),f=e.i(56423),p=e.i(28276);let m=(0,s.default)("info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]);var h=e.i(96315);let y=(0,s.default)("log-out",[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]]);var g=e.i(1279);let x=(0,s.default)("shield",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]]);var b=e.i(9584);let v=(0,s.default)("network",[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1",key:"4q2zg0"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1",key:"8cvhb9"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1",key:"1egb70"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3",key:"1jsf9p"}],["path",{d:"M12 12V8",key:"2874zd"}]]);e.s(["default",0,function(){let e=(0,o.usePathname)(),{user:s,logout:k}=(0,n.useAuth)(),[w,j]=(0,r.useState)(!1),[E,N]=(0,r.useState)(!0),[C,P]=(0,r.useState)(!1);(0,r.useEffect)(()=>{let e=()=>{P(window.scrollY>20)};return window.addEventListener("scroll",e),()=>window.removeEventListener("scroll",e)},[]),(0,r.useEffect)(()=>{let e=window.document.documentElement;E?e.classList.add("dark"):e.classList.remove("dark")},[E]);let S=[{name:"Explore",href:"/",icon:p.Compass},{name:"Architecture",href:"/architecture",icon:v},{name:"AI Search",href:"/ai-search",icon:d.Sparkles},{name:"Knowledge Base",href:"/knowledge",icon:b.Database},{name:"Resources",href:"/resources",icon:f.BookOpen},{name:"About",href:"/about",icon:m},{name:"Contact",href:"/contact",icon:h.Mail}];return s&&("admin"===s.role||"super_admin"===s.role)&&S.push({name:"Admin Portal",href:"/admin",icon:x}),(0,t.jsxs)("nav",{className:`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${C?"border-b border-border bg-background/80 backdrop-blur-md py-4":"bg-transparent py-6"}`,children:[(0,t.jsx)("div",{className:"mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",children:(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsx)(a.default,{href:"/",className:"flex items-center space-x-2",children:(0,t.jsx)("span",{className:"bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold tracking-tight text-transparent",children:"Startup Navigator"})}),(0,t.jsxs)("div",{className:"hidden md:flex items-center space-x-6",children:[S.map(r=>{let o=r.icon,n="/"===r.href?"/"===e:e.startsWith(r.href);return(0,t.jsxs)(a.default,{href:r.href,className:`flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-primary ${n?"text-primary font-semibold":"text-muted-foreground"}`,children:[(0,t.jsx)(o,{className:"h-4 w-4"}),(0,t.jsx)("span",{children:r.name})]},r.name)}),(0,t.jsx)("span",{className:"h-5 w-px bg-border"}),s?(0,t.jsxs)("div",{className:"flex items-center space-x-4",children:[(0,t.jsxs)("span",{className:"text-xs text-muted-foreground flex items-center space-x-1.5 bg-muted px-2.5 py-1.5 rounded-lg border border-border",children:[(0,t.jsx)(g.User,{className:"h-3.5 w-3.5"}),(0,t.jsx)("span",{children:s.name})]}),(0,t.jsxs)("button",{onClick:k,className:"text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors flex items-center space-x-1",children:[(0,t.jsx)(y,{className:"h-3.5 w-3.5"}),(0,t.jsx)("span",{children:"Sign Out"})]})]}):(0,t.jsxs)("div",{className:"flex items-center space-x-3",children:[(0,t.jsx)(a.default,{href:"/auth?redirect=/",className:"rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold hover:bg-muted transition-colors text-foreground",children:"Sign In"}),(0,t.jsx)(a.default,{href:"/auth?redirect=/",className:"rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity",children:"Sign Up"})]}),(0,t.jsx)("button",{onClick:()=>N(!E),className:"rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors","aria-label":"Toggle Theme",children:E?(0,t.jsx)(c,{className:"h-5 w-5"}):(0,t.jsx)(u,{className:"h-5 w-5"})})]}),(0,t.jsxs)("div",{className:"flex md:hidden items-center space-x-4",children:[(0,t.jsx)("button",{onClick:()=>N(!E),className:"rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",children:E?(0,t.jsx)(c,{className:"h-5 w-5"}):(0,t.jsx)(u,{className:"h-5 w-5"})}),(0,t.jsx)("button",{onClick:()=>j(!w),className:"text-foreground focus:outline-none p-1",children:w?(0,t.jsx)(l.X,{className:"h-6 w-6"}):(0,t.jsx)(i,{className:"h-6 w-6"})})]})]})}),w&&(0,t.jsxs)("div",{className:"md:hidden border-b border-border bg-background px-4 pt-2 pb-4 space-y-2",children:[S.map(r=>{let o=r.icon,n="/"===r.href?"/"===e:e.startsWith(r.href);return(0,t.jsxs)(a.default,{href:r.href,onClick:()=>j(!1),className:`flex items-center space-x-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-muted ${n?"bg-muted text-primary font-semibold":"text-muted-foreground"}`,children:[(0,t.jsx)(o,{className:"h-5 w-5"}),(0,t.jsx)("span",{children:r.name})]},r.name)}),(0,t.jsx)("div",{className:"border-t border-border pt-4 mt-2",children:s?(0,t.jsxs)("div",{className:"flex flex-col space-y-3 px-3",children:[(0,t.jsxs)("span",{className:"text-xs text-muted-foreground",children:["Logged in as ",s.name]}),(0,t.jsxs)("button",{onClick:()=>{k(),j(!1)},className:"flex items-center space-x-2 text-sm text-destructive font-semibold",children:[(0,t.jsx)(y,{className:"h-4 w-4"}),(0,t.jsx)("span",{children:"Sign Out"})]})]}):(0,t.jsxs)("div",{className:"flex items-center space-x-3 px-3",children:[(0,t.jsx)(a.default,{href:"/auth?redirect=/",onClick:()=>j(!1),className:"w-full text-center rounded-lg border border-border py-2 text-sm font-semibold hover:bg-muted text-foreground",children:"Sign In"}),(0,t.jsx)(a.default,{href:"/auth?redirect=/",onClick:()=>j(!1),className:"w-full text-center rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground",children:"Sign Up"})]})})]})]})}],45678)}]);