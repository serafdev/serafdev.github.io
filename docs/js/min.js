!function(){"use strict";const e={};if(location.search){var t=document.createElement("a");t.href=location.href,t.search="",history.replaceState(null,null,t.href)}function n(e){open("https://twitter.com/intent/tweet?url="+encodeURIComponent(e),"_blank")}function o(e){if("A"==e.target.tagName&&e.target.origin==location.origin){var t=document.createElement("link");t.rel="prefetch",t.href=e.target.href,document.head.appendChild(t)}}f("tweet",(function(e){n(e.getAttribute("href"))})),f("share",(function(e){var t,o,r=e.getAttribute("href");event.preventDefault(),navigator.share?navigator.share({url:r}):navigator.clipboard?(navigator.clipboard.writeText(r),t="Article URL copied to clipboard.",(o=document.getElementById("message")).textContent=t,o.setAttribute("open",""),setTimeout((function(){o.removeAttribute("open")}),3e3)):n(r)})),document.documentElement.addEventListener("mouseover",o,{capture:!0,passive:!0}),document.documentElement.addEventListener("touchstart",o,{capture:!0,passive:!0});const r=document.documentElement.getAttribute("ga-id");window.ga=window.ga||function(){r&&(ga.q=ga.q||[]).push(arguments)},ga.l=+new Date,ga("create",r,"auto"),ga("set","transport","beacon");var a,i=setTimeout(onload=function(){clearTimeout(i),ga("send","pageview")},1e3),c=+new Date;function s(e){var t=+new Date;t-c<1e3||(ga("send",{hitType:"event",eventCategory:"page",eventAction:e.type,eventLabel:Math.round((t-c)/1e3)}),c=t)}if(addEventListener("pagehide",s),addEventListener("visibilitychange",s),addEventListener("click",(function(e){var t=e.target.closest("button");t&&ga("send",{hitType:"event",eventCategory:"button",eventAction:t.getAttribute("aria-label")||t.textContent})}),!0),addEventListener("selectionchange",(function(){clearTimeout(a);var e=String(document.getSelection()).trim();e.split(/[\s\n\r]+/).length<3||(a=setTimeout((function(){ga("send",{hitType:"event",eventCategory:"selection",eventAction:e})}),2e3))}),!0),window.ResizeObserver&&document.querySelector("header nav #nav")){var u=document.getElementById("reading-progress"),d=0,l=!1;function g(){l||(requestAnimationFrame(p),l=!0),d=Date.now()}addEventListener("scroll",g);var m=1e3,v=1e4;function p(){l=!1;var e=Math.min(document.scrollingElement.scrollTop/(v-m)*100,100);u.style.transform=`translate(-${100-e}vw, 0)`,Date.now()-d<3e3&&(requestAnimationFrame(p),l=!0)}new ResizeObserver(()=>{v=document.scrollingElement.scrollTop+document.querySelector("#comments,footer").getBoundingClientRect().top,m=window.innerHeight,g()}).observe(document.body)}function f(t,n){e[t]=n}addEventListener("click",t=>{const n=t.target.closest("[on-click]");if(!n)return;t.preventDefault();const o=n.getAttribute("on-click"),r=e[o];if(!r)throw new Error("Unknown handler"+o);r(n)}),document.body.addEventListener("load",e=>{"IMG"==e.target.tagName&&(e.target.style.backgroundImage="none")},"true")}();
//# sourceMappingURL=min.js.map
