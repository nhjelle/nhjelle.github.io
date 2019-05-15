(function(e){function t(t){for(var o,a,l=t[0],s=t[1],c=t[2],u=0,p=[];u<l.length;u++)a=l[u],r[a]&&p.push(r[a][0]),r[a]=0;for(o in s)Object.prototype.hasOwnProperty.call(s,o)&&(e[o]=s[o]);h&&h(t);while(p.length)p.shift()();return i.push.apply(i,c||[]),n()}function n(){for(var e,t=0;t<i.length;t++){for(var n=i[t],o=!0,l=1;l<n.length;l++){var s=n[l];0!==r[s]&&(o=!1)}o&&(i.splice(t--,1),e=a(a.s=n[0]))}return e}var o={},r={app:0},i=[];function a(t){if(o[t])return o[t].exports;var n=o[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=e,a.c=o,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)a.d(n,o,function(t){return e[t]}.bind(null,o));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="/";var l=window["webpackJsonp"]=window["webpackJsonp"]||[],s=l.push.bind(l);l.push=t,l=l.slice();for(var c=0;c<l.length;c++)t(l[c]);var h=s;i.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"034f":function(e,t,n){"use strict";var o=n("64a9"),r=n.n(o);r.a},"56d7":function(e,t,n){"use strict";n.r(t);n("cadf"),n("551c"),n("f751"),n("097d");var o=n("2b0e"),r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("Chess")],1)},i=[],a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div")},l=[],s=(n("28a5"),n("ef09")),c={name:"Chess",props:{},data:function(){return{cells:[]}},created:function(){this.createEmptyBoard(),this.placeInitialPieces()},methods:{createEmptyBoard:function(){for(var e=0;e<8;e++){this.cells.push([]);for(var t=0;t<8;t++)this.cells[e][t]={color:e+t%2==0?"white":"black",piece:null}}},placeInitialPieces:function(){for(var e=0;e<s.length;e++)for(var t=0;t<s[e].length;t++){var n=s[e][t].split("-");this.cells[e][t]={color:n[0],type:n[1],isThreatened:!1,hasMoved:!1}}},getPawnMoves:function(e,t,n,o){var r=[];return"white"===e?(!1===o&&r.push({row:t-2,col:n}),t>0&&null===this.cells[t-1][n].piece&&r.push({row:t-1,col:n}),t>0&&n>0&&this.validateMove(e,t-1,n-1)&&r.push({row:t-1,col:n-1}),t>0&&n<this.cells.length-1&&this.validateMove(e,t-1,n+1)&&r.push({row:t-1,col:n+1})):(!1===o&&r.push({row:t+2,col:n}),t<this.cells.length-1&&null===this.cells[t+1][n].piece&&r.push({row:t+1,col:n}),t<this.cells.length-1&&n<this.cells.length-1&&this.validateMove(e,t+1,n+1)&&r.push({row:t+1,col:n+1}),t<this.cells.length-1&&n>0&&this.validateMove(e,t+1,n-1)&&r.push({row:t+1,col:n-1})),r},getRookMoves:function(e,t,n){for(var o=[],r=t-1;r>=0;r--){if(!this.validateMove(e,r,n))break;o.push({row:r,col:n})}for(var i=t+1;t<this.cells.length;i++){if(!this.validateMove(e,i,n))break;o.push({row:i,col:n})}for(var a=n-1;a>=0;a--){if(!this.validateMove(e,t,a))break;o.push({row:t,col:a})}for(var l=n+1;t<this.cells.length;l++){if(!this.validateMove(e,t,l))break;o.push({row:t,col:l})}return o},getKnightMoves:function(e,t,n){for(var o=[],r=[[-2,1],[-2,-1],[-1,-2],[-1,2],[1,-2],[1,2],[1,-2],[1,2]],i=0,a=r;i<a.length;i++){var l=a[i],s=t+l[0],c=n+l[1];s>=0&&s<this.cells.length&&c>=0&&c<this.cells.length&&this.validateMove(e,s,c)&&o.push({row:s,col:c})}return o},getBishopMoves:function(e,t,n){var o=[];return o},getQueenMoves:function(e,t,n){return this.getRookMoves(e,t,n).concat(this.getBishopMoves(e,t,n))},getKingMoves:function(e,t,n,o){console.log(e+t+n+o)},validateMove:function(e,t,n){var o=this.cells[t][n];return null==o||o.color!==e},getLegalMovesForPiece:function(e,t,n,o,r){var i=[];switch(e){case"pawn":i=this.getPawnMoves(t,n,o,r);break;case"rook":i=this.getRookMoves(t,n,o);break;case"knight":i=this.getKnightMoves(t,n,o);break;case"bishop":i=this.getBishopMoves(t,n,o);break;case"queen":i=this.getQueenMoves(t,n,o);break;case"king":i=this.getKingMoves(t,n,o);break}return i}}},h=c,u=n("2877"),p=Object(u["a"])(h,a,l,!1,null,"d95b6f6e",null),f=p.exports,v={name:"app",components:{Chess:f}},w=v,b=(n("034f"),Object(u["a"])(w,r,i,!1,null,null,null)),g=b.exports;o["a"].config.productionTip=!1,new o["a"]({render:function(e){return e(g)}}).$mount("#app")},"64a9":function(e,t,n){},ef09:function(e){e.exports=[["black-rook","black-knight","black-bishop","black-queen","black-king","black-bishop","black-knight","black-rook"],["black-pawn","black-pawn","black-pawn","black-pawn","black-pawn","black-pawn","black-pawn","black-pawn"],[],[],[],[],["white-pawn","white-pawn","white-pawn","white-pawn","white-pawn","white-pawn","white-pawn","white-pawn"],["white-rook","white-knight","white-bishop","white-queen","white-king","white-bishop","white-knight","white-rook"]]}});
//# sourceMappingURL=app.b7dad6ac.js.map