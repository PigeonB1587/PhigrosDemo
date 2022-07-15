"use strict";
(function() {
	const jct = document.cookie.match(/jct=(.+?)(;|$)/);
	const d = "lch\x7ah3473";
	const w = `Simulator author : <a style="text-decoration:underline"target="_blank"href="//space.bilibili.com/274753872">${d}</a>`;
	//if (!location.search) location.search = Date.now();
	if (typeof _i == "undefined" || _i.length != 4) return;
	if (!(jct && jct[1] == "ok" || document.referrer)) return location.href = "/index.html";
	document.cookie = `jct=ok;path=/;max-age=${2e6}`
	document.title = `${_i[0]} - ${d} `;
	for (const i of document.querySelectorAll(".title")) i.innerHTML = `${_i[0]}&nbsp;v${_i[1].join('.')}`;
	for (const i of document.querySelectorAll(".info")) i.innerHTML = `${w}&nbsp;(${cnymd(_i[2])} )<br><br>Last updated on${cnymd(_i[3])}`;
	for (const i of document.querySelectorAll(".main")) i.style.display = "block";

	function cnymd(time) {
		const d = new Date(time * 1e3);
		return ` ${d.getFullYear()},${d.getMonth() + 1},${d.getDate()}.`;
	}
})();