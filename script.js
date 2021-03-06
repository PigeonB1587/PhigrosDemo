"use strict";
const _i = ['Pagoda simulator demo', [1, 2, 1], 1611795955, 1651419173];
const urls = {
	zip: ["zip.min.js", "zip.min.js"],
	browser: ["js/Browser.js", "js/Browser.js"],
	bitmap: ["js/createImageBitmap.js", "js/createImageBitmap.js"],
	blur: ["stackblur-canvas.js", "stackblur-canvas.js"],
	md5: ["md5-js.js", "md5-js.js"],
}
document.oncontextmenu = e => e.preventDefault(); //qwq
for (const i of document.getElementById("view-nav").children) {
	i.addEventListener("click", function() {
		for (const j of this.parentElement.children) j.classList.remove("active");
		const doc = document.getElementById("view-doc");
		const msg = document.getElementById("view-msg");
		this.classList.add("active");
		if (i.id == "msg") {
			doc.src = "";
			doc.classList.add("hide");
			msg.classList.remove("hide");
		} else {
			if (doc.getAttribute("src") != `docs/${i.id}.html`) doc.src = `docs/${i.id}.html`;
			msg.classList.add("hide");
			doc.classList.remove("hide");
		}
	});
}
document.getElementById("cover-dark").addEventListener("click", () => {
	document.getElementById("cover-dark").classList.add("fade");
	document.getElementById("cover-view").classList.add("fade");
});
document.getElementById("qwq").addEventListener("click", () => {
	document.getElementById("cover-dark").classList.remove("fade");
	document.getElementById("cover-view").classList.remove("fade");
	document.getElementById("res").click();
});
document.getElementById("msg-out").addEventListener("click", () => {
	document.getElementById("cover-dark").classList.remove("fade");
	document.getElementById("cover-view").classList.remove("fade");
	document.getElementById("msg").click();
});
const message = {
	out: document.getElementById("msg-out"),
	view: document.getElementById("view-msg"),
	lastMessage: "",
	isError: false,
	get num() {
		return this.view.querySelectorAll(".msgbox").length;
	},
	msgbox(msg, options = {}) {
		const msgbox = document.createElement("div");
		msgbox.innerText = msg;
		msgbox.classList.add("msgbox");
		Object.assign(msgbox.style, options);
		const btn = document.createElement("a");
		btn.innerText = "??????";
		btn.style.float = "right";
		btn.onclick = () => {
			msgbox.remove();
			if (this.isError) this.sendError(this.lastMessage);
			else this.sendMessage(this.lastMessage);
		}
		msgbox.appendChild(btn);
		this.view.appendChild(msgbox);
	},
	sendMessage(msg) {
		const num = this.num;
		this.out.className = num ? "warning" : "accept";
		this.out.innerText = msg + (num ? `?????????${num}???????????????????????????` : "");
		this.lastMessage = msg;
		this.isError = false;
	},
	sendWarning(msg) {
		this.msgbox(msg, { backgroundColor: "#fffbe5", color: "#5c3c00" })
		if (this.isError) this.sendError(this.lastMessage);
		else this.sendMessage(this.lastMessage);
	},
	sendError(msg) {
		this.msgbox(msg, { backgroundColor: "#fee", color: "#e10000" });
		const num = this.num;
		this.out.className = "error";
		this.out.innerText = msg; // + (num ? `?????????${num}???????????????????????????` : "");
		this.lastMessage = msg;
		this.isError = true;
	},
	throwError(msg) {
		this.sendError(msg);
		throw new Error(msg);
	}
}
//
const upload = document.getElementById("upload");
const uploads = document.getElementById("uploads");
const mask = document.getElementById("mask");
const select = document.getElementById("select");
const selectbg = document.getElementById("select-bg");
const btnPlay = document.getElementById("btn-play");
const btnPause = document.getElementById("btn-pause");
const selectbgm = document.getElementById("select-bgm");
const selectchart = document.getElementById("select-chart");
const selectscaleratio = document.getElementById("select-scale-ratio"); //????????????note??????
const selectaspectratio = document.getElementById("select-aspect-ratio");
const selectglobalalpha = document.getElementById("select-global-alpha");
const selectflip = document.getElementById("select-flip");
const selectspeed = document.getElementById("select-speed");
const config = {
	speed: 1,
	setSpeed(num) {
		this.speed = 2 ** (num / 12);
	}
};
selectspeed.addEventListener("change", evt => {
	const dict = { Slowest: -9, Slower: -4, "": 0, Faster: 3, Fastest: 5 };
	config.setSpeed(dict[evt.target.value]);
});
const scfg = function() {
	let arr = [];
	if (qwq[5]) arr.push("Reversed");
	switch (selectflip.value) {
		case "bl":
			arr.push("FlipX");
			break;
		case "tr":
			arr.push("FlipY");
			break;
		case "tl":
			arr.push("FlipX&Y");
			break;
		default:
	}
	if (selectspeed.value) arr.push(selectspeed.value);
	if (isPaused) arr.push("Paused");
	if (arr.length == 0) return "";
	return `(${arr.join("+")})`;
}
const inputName = document.getElementById("input-name");
const inputLevel = document.getElementById("input-level");
const inputDesigner = document.getElementById("input-designer");
const inputIllustrator = document.getElementById("input-illustrator");
const inputOffset = document.getElementById("input-offset");
const showPoint = document.getElementById("showPoint");
const lineColor = document.getElementById("lineColor");
const autoplay = document.getElementById("autoplay");
const hyperMode = document.getElementById("hyperMode");
const showTransition = document.getElementById("showTransition");
const bgs = {};
const bgsBlur = {};
const bgms = {};
const charts = {};
const chartLineData = []; //line.csv
const chartInfoData = []; //info.csv
const AspectRatio = 16 / 9; //???????????????
const Deg = Math.PI / 180; //???????????????
let wlen, hlen, wlen2, hlen2, noteScale, lineScale; //???????????????
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); //????????????(alpha:false?????????????????????)
const canvasos = document.createElement("canvas"); //???????????????????????????
const ctxos = canvasos.getContext("2d");
const Renderer = { //????????????
	chart: null,
	chart2: null, //qwq
	bgImage: null,
	bgImageBlur: null,
	bgMusic: null,
	lines: [],
	notes: [],
	taps: [],
	drags: [],
	flicks: [],
	holds: [],
	reverseholds: [],
	tapholds: []
};
//????????????
const full = {
	toggle(elem) {
		if (!this.enabled) return false;
		if (this.element) {
			if (document.exitFullscreen) return document.exitFullscreen();
			if (document.cancelFullScreen) return document.cancelFullScreen();
			if (document.webkitCancelFullScreen) return document.webkitCancelFullScreen();
			if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
			if (document.msExitFullscreen) return document.msExitFullscreen();
		} else {
			if (!(elem instanceof HTMLElement)) elem = document.body;
			if (elem.requestFullscreen) return elem.requestFullscreen();
			if (elem.webkitRequestFullscreen) return elem.webkitRequestFullscreen();
			if (elem.mozRequestFullScreen) return elem.mozRequestFullScreen();
			if (elem.msRequestFullscreen) return elem.msRequestFullscreen();
		}
	},
	check(elem) {
		if (!(elem instanceof HTMLElement)) elem = document.body;
		return this.element == elem;
	},
	get element() {
		return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
	},
	get enabled() {
		return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled);
	}
};
async function checkSupport() {
	window.addEventListener('error', e => message.sendError(e.message));
	window.addEventListener('unhandledrejection', e => message.sendError(e.reason));
	//???????????????
	message.sendMessage("??????StackBlur??????...");
	if (typeof StackBlur != "object") await loadJS(urls.blur).catch(() => message.throwError("StackBlur????????????????????????????????????"));
	message.sendMessage("??????md5??????...");
	if (typeof md5 != "function") await loadJS(urls.md5).catch(() => message.throwError("md5????????????????????????????????????"));
	message.sendMessage("??????Browser??????...");
	if (typeof Browser != "function") await loadJS(urls.browser).catch(() => message.throwError("Browser????????????????????????????????????"));
	message.sendMessage("??????zip??????...");
	if (typeof zip != "object") await loadJS(urls.zip).catch(() => message.throwError("zip????????????????????????????????????"));
	message.sendMessage("????????????????????????...");
	const info = new Browser;
	if (info.browser == "XiaoMi") message.sendWarning("?????????????????????????????????????????????????????????????????????");
	if (info.os == "iOS" && parseFloat(info.osVersion) < 14.5) message.sendWarning("?????????iOS????????????14.5????????????????????????????????????");
	if (info.os == "Mac OS" && parseFloat(info.osVersion) < 14.1) message.sendWarning("?????????MacOS????????????14.1????????????????????????????????????");
	if (info.os == "iOS" && parseFloat(info.osVersion) == 15.4) message.sendWarning("iOS15.4???????????????");
	if (typeof createImageBitmap != "function") await loadJS(urls.bitmap).catch(() => message.throwError("????????????????????????ImageBitmap"));
	message.sendMessage("??????????????????...");
	const oggCompatible = !!(new Audio).canPlayType("audio/ogg");
	if (!oggCompatible) await loadJS("/lib/oggmented-bundle.js").catch(() => message.throwError("oggmented??????????????????????????????????????????"));
	if (!oggCompatible && typeof oggmented != "object") message.throwError("oggmented???????????????????????????????????????????????????");
	const AudioContext = window.AudioContext || window.webkitAudioContext;
	if (!AudioContext) message.throwError("????????????????????????AudioContext");
	const actx = oggCompatible ? new AudioContext() : new oggmented.OggmentedAudioContext(); //??????Safari
	const gain = actx.createGain();
	const playSound = (res, loop, isOut, offset, playbackrate) => {
		const bufferSource = actx.createBufferSource();
		bufferSource.buffer = res;
		bufferSource.loop = loop; //????????????
		bufferSource.connect(gain);
		bufferSource.playbackRate.value = Number(playbackrate || 1);
		if (isOut) gain.connect(actx.destination);
		bufferSource.start(0, offset);
		return () => bufferSource.stop();
	}
	Object.assign(window, { actx, stopPlaying, playSound });
	message.sendMessage("????????????...");
	if (!full.enabled) message.sendWarning("??????????????????????????????????????????????????????????????????????????????");

	function loadJS(qwq) {
		const a = (function*(arg) { yield* arg; })(qwq instanceof Array ? qwq : arguments);
		const load = url => new Promise((resolve, reject) => {
			if (!url) return reject();
			const script = document.createElement('script');
			script.onload = () => resolve(script);
			script.onerror = () => load(a.next().value).catch(() => reject());
			script.src = url;
			script.crossOrigin = "anonymous";
			document.head.appendChild(script);
		});
		return load(a.next().value);
	}
}
//qwq
selectbg.onchange = () => {
	Renderer.bgImage = bgs[selectbg.value];
	Renderer.bgImageBlur = bgsBlur[selectbg.value];
	resizeCanvas();
}
//????????????????????????
selectchart.addEventListener("change", adjustInfo);

function adjustInfo() {
	for (const i of chartInfoData) {
		if (selectchart.value == i.Chart) {
			if (bgms[i.Music]) selectbgm.value = i.Music;
			if (bgs[i.Image]) selectbg.value = i.Image;
			if (!!Number(i.AspectRatio)) selectaspectratio.value = i.AspectRatio;
			if (!!Number(i.ScaleRatio)) selectscaleratio.value = i.ScaleRatio;
			if (!!Number(i.GlobalAlpha)) selectglobalalpha.value = i.GlobalAlpha;
			inputName.value = i.Name;
			inputLevel.value = i.Level;
			inputIllustrator.value = i.Illustrator;
			inputDesigner.value = i.Designer;
		}
	}
}
window.addEventListener("resize", resizeCanvas);
document.addEventListener("fullscreenchange", resizeCanvas);
selectscaleratio.addEventListener("change", resizeCanvas);
selectaspectratio.addEventListener("change", resizeCanvas);
//??????????????????
function resizeCanvas() {
	const width = document.documentElement.clientWidth;
	const height = document.documentElement.clientHeight;
	const defaultWidth = Math.min(854, width * 0.8);
	const defaultHeight = defaultWidth / (selectaspectratio.value || 16 / 9);
	const realWidth = Math.floor(full.check(canvas) ? width : defaultWidth);
	const realHeight = Math.floor(full.check(canvas) ? height : defaultHeight);
	canvas.style.cssText += `;width:${realWidth}px;height:${realHeight}px`;
	canvas.width = realWidth * devicePixelRatio;
	canvas.height = realHeight * devicePixelRatio;
	canvasos.width = Math.min(realWidth, realHeight * AspectRatio) * devicePixelRatio;
	canvasos.height = realHeight * devicePixelRatio;
	wlen = canvasos.width / 2;
	hlen = canvasos.height / 2;
	wlen2 = canvasos.width / 18;
	hlen2 = canvasos.height * 0.6; //??????note??????
	noteScale = canvasos.width / (selectscaleratio.value || 8e3); //note???????????????
	lineScale = canvasos.width > canvasos.height * 0.75 ? canvasos.height / 18.75 : canvasos.width / 14.0625; //????????????????????????
}
//qwq[water,demo,democlick]
const qwq = [true, false, 3, 0, 0, 0];
document.getElementById("demo").classList.add("hide");
eval(atob("IWZ1bmN0aW9uKCl7Y29uc3QgdD1uZXcgRGF0ZTtpZigxIT10LmdldERhdGUoKXx8MyE9dC5nZXRNb250aCgpKXJldHVybjtjb25zdCBuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpO24udHlwZT0idGV4dC9qYXZhc2NyaXB0IixuLnNyYz0iLi9yLW1pbi5qcyIsZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoImhlYWQiKVswXS5hcHBlbmRDaGlsZChuKX0oKTs"));
document.querySelector(".title").addEventListener("click", function() {
	if (qwq[1]) /*qwq[0] = !qwq[0]*/;
	else if (!--qwq[2]) document.getElementById("demo").classList.remove("hide");
});
document.getElementById("demo").addEventListener("click", function() {
	document.getElementById("demo").classList.add("hide");
	uploads.classList.add("disabled");
	const xhr = new XMLHttpRequest();
	xhr.open("get", "./src/demo.png", true); //??????gitee???404
	xhr.responseType = 'blob';
	xhr.send();
	xhr.onprogress = progress => { //????????????????????????
		message.sendMessage(`???????????????${Math.floor(progress.loaded / 5079057 * 100)}%`);
	};
	xhr.onload = () => {
		document.getElementById("filename").value = "demo.zip";
		loadFile(xhr.response);
	};
});
const mouse = {}; //??????????????????(?????????????????????)
const touch = {}; //??????????????????
const keyboard = {}; //??????????????????
const taps = []; //????????????tap(??????????????????bug)
const specialClick = {
	time: [0, 0, 0, 0],
	func: [() => {
		btnPause.click();
	}, () => {
		btnPlay.click();
		btnPlay.click();
	}, () => void 0, () => {
		full.toggle(canvas);
	}],
	click(id) {
		const now = performance.now();
		if (now - this.time[id] < 300) this.func[id]();
		this.time[id] = now;
	}
}
class Click {
	constructor(offsetX, offsetY) {
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.isMoving = false;
		this.time = 0;
	}
	static activate(offsetX, offsetY) {
		taps.push(new Click(offsetX, offsetY));
		if (offsetX < lineScale * 1.5 && offsetY < lineScale * 1.5) specialClick.click(0);
		if (offsetX > canvasos.width - lineScale * 1.5 && offsetY < lineScale * 1.5) specialClick.click(1);
		if (offsetX < lineScale * 1.5 && offsetY > canvasos.height - lineScale * 1.5) specialClick.click(2);
		if (offsetX > canvasos.width - lineScale * 1.5 && offsetY > canvasos.height - lineScale * 1.5) specialClick.click(3);
		if (qwqEnd.second > 0) qwq[3] = qwq[3] > 0 ? -qwqEnd.second : qwqEnd.second;
		return new Click(offsetX, offsetY);
	}
	move(offsetX, offsetY) {
		this.offsetX = Number(offsetX);
		this.offsetY = Number(offsetY);
		this.isMoving = true;
		this.time = 0;
	}
	animate() {
		if (!this.time++) {
			if (this.isMoving) clickEvents0.push(ClickEvent0.getClickMove(this.offsetX, this.offsetY));
			else clickEvents0.push(ClickEvent0.getClickTap(this.offsetX, this.offsetY));
		} else clickEvents0.push(ClickEvent0.getClickHold(this.offsetX, this.offsetY));
	}
}
class Judgement {
	constructor(offsetX, offsetY, type) {
		if (autoplay.checked) {
			this.offsetX = Number(offsetX);
			this.offsetY = Number(offsetY);
		} else switch (selectflip.value) {
			case "br":
				this.offsetX = Number(offsetX);
				this.offsetY = Number(offsetY);
				break;
			case "bl":
				this.offsetX = canvasos.width - Number(offsetX);
				this.offsetY = Number(offsetY);
				break;
			case "tr":
				this.offsetX = Number(offsetX);
				this.offsetY = canvas.height - Number(offsetY);
				break;
			case "tl":
				this.offsetX = canvasos.width - Number(offsetX);
				this.offsetY = canvas.height - Number(offsetY);
				break;
			default:
				throw new Error("Flip Error");
		}
		this.type = Number(type) || 0; //1-Tap,2-Hold,3-Move
		this.catched = false;
	}
	isInArea(x, y, cosr, sinr, hw) {
		return isNaN(this.offsetX + this.offsetY) ? true : Math.abs((this.offsetX - x) * cosr + (this.offsetY - y) * sinr) <= hw;
	}
}
class Judgements extends Array {
	addJudgement(notes, realTime) {
		this.length = 0;
		if (autoplay.checked) {
			for (const i of notes) {
				const deltaTime = i.realTime - realTime;
				if (i.scored) continue;
				if (i.type == 1) {
					if (deltaTime < 0.0) this.push(new Judgement(i.offsetX, i.offsetY, 1));
				} else if (i.type == 2) {
					if (deltaTime < 0.2) this.push(new Judgement(i.offsetX, i.offsetY, 2));
				} else if (i.type == 3) {
					if (i.status3) this.push(new Judgement(i.offsetX, i.offsetY, 2));
					else if (deltaTime < 0.0) this.push(new Judgement(i.offsetX, i.offsetY, 1));
				} else if (i.type == 4) {
					if (deltaTime < 0.2) this.push(new Judgement(i.offsetX, i.offsetY, 3));
				}
			}
		} else if (!isPaused) {
			for (const j in mouse) {
				const i = mouse[j];
				if (i instanceof Click) {
					if (i.time) this.push(new Judgement(i.offsetX, i.offsetY, 2));
					else if (i.isMoving) this.push(new Judgement(i.offsetX, i.offsetY, 3));
					//else this.push(new Judgement(i.offsetX, i.offsetY, 1));
				}
			}
			for (const j in touch) {
				const i = touch[j];
				if (i instanceof Click) {
					if (i.time) this.push(new Judgement(i.offsetX, i.offsetY, 2));
					else if (i.isMoving) this.push(new Judgement(i.offsetX, i.offsetY, 3));
					//else this.push(new Judgement(i.offsetX, i.offsetY, 1));
				}
			}
			for (const j in keyboard) {
				const i = keyboard[j];
				if (i instanceof Click) {
					if (i.time) this.push(new Judgement(i.offsetX, i.offsetY, 2));
					else /*if (i.isMoving)*/ this.push(new Judgement(i.offsetX, i.offsetY, 3));
					//else this.push(new Judgement(i.offsetX, i.offsetY, 1));
				}
			}
			for (const i of taps) {
				if (i instanceof Click) this.push(new Judgement(i.offsetX, i.offsetY, 1));
			}
		}
	};
	judgeNote(notes, realTime, width) {
		for (const i of notes) {
			const deltaTime = i.realTime - realTime;
			if (i.scored) continue;
			if ((deltaTime < -(hyperMode.checked ? 0.12 : 0.16) && i.frameCount > (hyperMode.checked ? 3 : 4)) && !i.status2) {
				//console.log("Miss", i.name);
				i.status = 2;
				stat.addCombo(2, i.type);
				i.scored = true;
			} else if (i.type == 1) {
				for (let j = 0; j < this.length; j++) {
					if (this[j].type == 1 && this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && deltaTime < 0.2 && (deltaTime > -(hyperMode.checked ? 0.12 : 0.16) || i.frameCount < (hyperMode.checked ? 3 : 4))) {
						if (deltaTime > (hyperMode.checked ? 0.12 : 0.16)) {
							if (!this[j].catched) {
								i.status = 6; //console.log("Bad", i.name);
								i.badtime = performance.now();
							}
						} else if (deltaTime > 0.08) {
							i.status = 7; //console.log("Good(Early)", i.name);
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, 0);
							clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
							clickEvents2.push(ClickEvent2.getClickEarly(i.projectX, i.projectY));
						} else if (deltaTime > 0.04) {
							i.status = 5; //console.log("Perfect(Early)", i.name);
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, 0);
							clickEvents1.push(hyperMode.checked ? ClickEvent1.getClickGreat(i.projectX, i.projectY) : ClickEvent1.getClickPerfect(i.projectX, i.projectY));
							clickEvents2.push(ClickEvent2.getClickEarly(i.projectX, i.projectY));
						} else if (deltaTime > -0.04 || i.frameCount < 1) {
							i.status = 4; //console.log("Perfect(Max)", i.name);
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, 0);
							clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
						} else if (deltaTime > -0.08 || i.frameCount < 2) {
							i.status = 1; //console.log("Perfect(Late)", i.name);
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, 0);
							clickEvents1.push(hyperMode.checked ? ClickEvent1.getClickGreat(i.projectX, i.projectY) : ClickEvent1.getClickPerfect(i.projectX, i.projectY));
							clickEvents2.push(ClickEvent2.getClickLate(i.projectX, i.projectY));
						} else {
							i.status = 3; //console.log("Good(Late)", i.name);
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, 0);
							clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
							clickEvents2.push(ClickEvent2.getClickLate(i.projectX, i.projectY));
						}
						if (i.status) {
							stat.addCombo(i.status, 1);
							i.scored = true;
							this.splice(j, 1);
							break;
						}
					}
				}
			} else if (i.type == 2) {
				if (i.status == 4 && deltaTime < 0) {
					if (document.getElementById("hitSong").checked) playSound(res["HitSong1"], false, true, 0);
					clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
					stat.addCombo(4, 2);
					i.scored = true;
				} else if (!i.status) {
					for (let j = 0; j < this.length; j++) {
						if (this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && deltaTime < (hyperMode.checked ? 0.12 : 0.16) && (deltaTime > -(hyperMode.checked ? 0.12 : 0.16) || i.frameCount < (hyperMode.checked ? 3 : 4))) {
							//console.log("Perfect", i.name);
							this[j].catched = true;
							i.status = 4;
							break;
						}
					}
				}
			} else if (i.type == 3) {
				if (i.status3) {
					if ((performance.now() - i.status3) * i.holdTime >= 1.6e4 * i.realHoldTime) { //???????????????bpm?????????????????????
						if (i.status2 % 4 == 0) clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
						else if (i.status2 % 4 == 1) clickEvents1.push(hyperMode.checked ? ClickEvent1.getClickGreat(i.projectX, i.projectY) : ClickEvent1.getClickPerfect(i.projectX, i.projectY));
						else if (i.status2 % 4 == 3) clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
						i.status3 = performance.now();
					}
					if (deltaTime + i.realHoldTime < 0.2) {
						if (!i.status) {
							stat.addCombo(i.status = i.status2, 3);
						}
						if (deltaTime + i.realHoldTime < 0) i.scored = true;
						continue;
					}
				}
				i.status4 = true;
				for (let j = 0; j < this.length; j++) {
					if (!i.status3) {
						if (this[j].type == 1 && this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && deltaTime < (hyperMode.checked ? 0.12 : 0.16) && (deltaTime > -(hyperMode.checked ? 0.12 : 0.16) || i.frameCount < (hyperMode.checked ? 3 : 4))) {
							if (document.getElementById("hitSong").checked) playSound(res["HitSong0"], false, true, 0);
							if (deltaTime > 0.16) {
								i.status2 = 7; //console.log("Good(Early)", i.name);
								clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
								clickEvents2.push(ClickEvent2.getClickEarly(i.projectX, i.projectY));
								i.status3 = performance.now();
							} else if (deltaTime > 0.04) {
								i.status2 = 5; //console.log("Perfect(Early)", i.name);
								clickEvents1.push(hyperMode.checked ? ClickEvent1.getClickGreat(i.projectX, i.projectY) : ClickEvent1.getClickPerfect(i.projectX, i.projectY));
								clickEvents2.push(ClickEvent2.getClickEarly(i.projectX, i.projectY));
								i.status3 = performance.now();
							} else if (deltaTime > -0.04 || i.frameCount < 1) {
								i.status2 = 4; //console.log("Perfect(Max)", i.name);
								clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
								i.status3 = performance.now();
							} else if (deltaTime > -0.16 || i.frameCount < 2) {
								i.status2 = 1; //console.log("Perfect(Late)", i.name);
								clickEvents1.push(hyperMode.checked ? ClickEvent1.getClickGreat(i.projectX, i.projectY) : ClickEvent1.getClickPerfect(i.projectX, i.projectY));
								clickEvents2.push(ClickEvent2.getClickLate(i.projectX, i.projectY));
								i.status3 = performance.now();
							} else {
								i.status2 = 3; //console.log("Good(Late)", i.name);
								clickEvents1.push(ClickEvent1.getClickGood(i.projectX, i.projectY));
								clickEvents2.push(ClickEvent2.getClickLate(i.projectX, i.projectY));
								i.status3 = performance.now();
							}
							this.splice(j, 1);
							i.status4 = false;
							i.status5 = deltaTime;
							break;
						}
					} else if (this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width)) i.status4 = false;
				}
				if (!isPaused && i.status3 && i.status4) {
					i.status = 2; //console.log("Miss", i.name);
					stat.addCombo(2, 3);
					i.scored = true;
				}
			} else if (i.type == 4) {
				if (i.status == 4 && deltaTime < 0) {
					if (document.getElementById("hitSong").checked) playSound(res["HitSong2"], false, true, 0);
					clickEvents1.push(ClickEvent1.getClickPerfect(i.projectX, i.projectY));
					stat.addCombo(4, 4);
					i.scored = true;
				} else if (!i.status) {
					for (let j = 0; j < this.length; j++) {
						if (this[j].isInArea(i.offsetX, i.offsetY, i.cosr, i.sinr, width) && deltaTime < (hyperMode.checked ? 0.14 : 0.16) && (deltaTime > -(hyperMode.checked ? 0.14 : 0.16) || i.frameCount < (hyperMode.checked ? 3 : 4))) {
							//console.log("Perfect", i.name);
							this[j].catched = true;
							if (this[j].type == 3) {
								i.status = 4;
								break;
							}
						}
					}
				}
			}
		}
	}
}
const judgements = new Judgements();
class ClickEvents extends Array {
	defilter(func) {
		var i = this.length;
		while (i--) {
			if (func(this[i])) this.splice(i, 1);
		}
		return this;
	}
}
const clickEvents0 = new ClickEvents(); //??????????????????
const clickEvents1 = new ClickEvents(); //??????????????????
const clickEvents2 = new ClickEvents(); //??????????????????
class ClickEvent0 {
	constructor(offsetX, offsetY, n1, n2) {
		switch (selectflip.value) {
			case "br":
				this.offsetX = Number(offsetX);
				this.offsetY = Number(offsetY);
				break;
			case "bl":
				this.offsetX = canvasos.width - Number(offsetX);
				this.offsetY = Number(offsetY);
				break;
			case "tr":
				this.offsetX = Number(offsetX);
				this.offsetY = canvas.height - Number(offsetY);
				break;
			case "tl":
				this.offsetX = canvasos.width - Number(offsetX);
				this.offsetY = canvas.height - Number(offsetY);
				break;
			default:
				throw new Error("Flip Error");
		}
		this.color = String(n1);
		this.text = String(n2);
		this.time = 0;
	}
	static getClickTap(offsetX, offsetY) {
		//console.log("Tap", offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, "cyan", "");
	}
	static getClickHold(offsetX, offsetY) {
		//console.log("Hold", offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, "lime", "");
	}
	static getClickMove(offsetX, offsetY) {
		//console.log("Move", offsetX, offsetY);
		return new ClickEvent0(offsetX, offsetY, "violet", "");
	}
}
class ClickEvent1 {
	constructor(offsetX, offsetY, n1, n2, n3) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.time = performance.now();
		this.duration = 500;
		this.images = res["Clicks"][n1]; //?????????????????????
		this.color = String(n3);
		this.rand = Array(Number(n2) || 0).fill().map(() => [Math.random() * 80 + 185, Math.random() * 2 * Math.PI]);
	}
	static getClickPerfect(offsetX, offsetY) {
		return new ClickEvent1(offsetX, offsetY, "rgba(255,236,160,0.8823529)", 4, "#ffeca0");
	}
	static getClickGreat(offsetX, offsetY) {
		return new ClickEvent1(offsetX, offsetY, "rgba(168,255,177,0.9016907)", 4, "#a8ffb1");
	}
	static getClickGood(offsetX, offsetY) {
		return new ClickEvent1(offsetX, offsetY, "rgba(180,225,255,0.9215686)", 3, "#b4e1ff");
	}
}
class ClickEvent2 {
	constructor(offsetX, offsetY, n1, n2) {
		this.offsetX = Number(offsetX) || 0;
		this.offsetY = Number(offsetY) || 0;
		this.time = performance.now();
		this.duration = 250;
		this.color = String(n1);
		this.text = String(n2);
	}
	static getClickEarly(offsetX, offsetY) {
		//console.log("Tap", offsetX, offsetY);
		return new ClickEvent2(offsetX, offsetY, "#03aaf9", "Early");
	}
	static getClickLate(offsetX, offsetY) {
		//console.log("Hold", offsetX, offsetY);
		return new ClickEvent2(offsetX, offsetY, "#ff4612", "Late");
	}
}
//??????PC??????
const isMouseDown = {};
canvas.addEventListener("mousedown", function(evt) {
	evt.preventDefault();
	const idx = evt.button;
	const dx = (evt.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
	const dy = (evt.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
	mouse[idx] = Click.activate(dx, dy);
	isMouseDown[idx] = true;
});
canvas.addEventListener("mousemove", function(evt) {
	evt.preventDefault();
	for (const idx in isMouseDown) {
		if (isMouseDown[idx]) {
			const dx = (evt.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
			const dy = (evt.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
			mouse[idx].move(dx, dy);
		}
	}
});
canvas.addEventListener("mouseup", function(evt) {
	evt.preventDefault();
	const idx = evt.button;
	delete mouse[idx];
	delete isMouseDown[idx];
});
canvas.addEventListener("mouseout", function(evt) {
	evt.preventDefault();
	for (const idx in isMouseDown) {
		if (isMouseDown[idx]) {
			delete mouse[idx];
			delete isMouseDown[idx];
		}
	}
});
//????????????(??????????)
window.addEventListener("keydown", function(evt) {
	if (document.activeElement.classList.value == "input") return;
	if (btnPlay.value != "??????") return;
	evt.preventDefault();
	if (evt.key == "Shift") btnPause.click();
	else if (keyboard[evt.code] instanceof Click);
	else keyboard[evt.code] = Click.activate(NaN, NaN);
}, false);
window.addEventListener("keyup", function(evt) {
	if (document.activeElement.classList.value == "input") return;
	if (btnPlay.value != "??????") return;
	evt.preventDefault();
	if (evt.key == "Shift");
	else if (keyboard[evt.code] instanceof Click) delete keyboard[evt.code];
}, false);
window.addEventListener("blur", () => {
	for (const i in keyboard) delete keyboard[i]; //??????????????????????????????
});
//??????????????????
const passive = {
	passive: false
}; //????????????????????????warning
canvas.addEventListener("touchstart", function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier; //?????????????????????bug(????????????????????????)
		const dx = (i.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
		const dy = (i.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
		touch[idx] = Click.activate(dx, dy);
	}
}, passive);
canvas.addEventListener("touchmove", function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		const dx = (i.pageX - getOffsetLeft(this)) / this.offsetWidth * this.width - (this.width - canvasos.width) / 2;
		const dy = (i.pageY - getOffsetTop(this)) / this.offsetHeight * this.height;
		touch[idx].move(dx, dy);
	}
}, passive);
canvas.addEventListener("touchend", function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		delete touch[idx];
	}
});
canvas.addEventListener("touchcancel", function(evt) {
	evt.preventDefault();
	for (const i of evt.changedTouches) {
		const idx = i.identifier;
		delete touch[idx];
	}
});
//????????????????????????????????????class
function getOffsetLeft(element) {
	if (!(element instanceof HTMLElement)) return NaN;
	if (full.check(element)) return document.documentElement.scrollLeft;
	let elem = element;
	let a = 0;
	while (elem instanceof HTMLElement) {
		a += elem.offsetLeft;
		elem = elem.offsetParent;
	}
	return a;
}

function getOffsetTop(element) {
	if (!(element instanceof HTMLElement)) return NaN;
	if (full.check(element)) return document.documentElement.scrollTop;
	let elem = element;
	let a = 0;
	while (elem instanceof HTMLElement) {
		a += elem.offsetTop;
		elem = elem.offsetParent;
	}
	return a;
}
//??????????????????????????????qwq
const stopPlaying = [];
const res = {}; //????????????
resizeCanvas();
uploads.classList.add("disabled");
select.classList.add("disabled");
//?????????
window.onload = async function() {
	message.sendMessage("???????????????...");
	await checkSupport();
	//????????????
	(async function() {
		let loadedNum = 0;
		await Promise.all((obj => {
			const arr = [];
			for (const i in obj) arr.push([i, obj[i]]);
			return arr;
		})({
			JudgeLine: "src/JudgeLine.png",
			top:"src/top.png",
			ProgressBar: "src/ProgressBar.png",
			SongsNameBar: "src/SongsNameBar.png",
			Pause: "src/Pause.png",
			clickRaw: "src/clickRaw.png",
			clickRaw2: "src/clickRaw2.png",
			Tap: "src/Tap.png",
			Tap2: "src/Tap2.png",
			TapHL: "src/TapHL.png",
			Drag: "src/Drag.png",
			DragHL: "src/DragHL.png",
			HoldHead: "src/HoldHead.png",
			HoldHeadHL: "src/HoldHeadHL.png",
			Hold: "src/Hold.png",
			HoldHL: "src/HoldHL.png",
			HoldEnd: "src/HoldEnd.png",
			Flick: "src/Flick.png",
			FlickHL: "src/FlickHL.png",
			LevelOver1: "src/LevelOver1.png",
			LevelOver3: "src/LevelOver3.png",
			LevelOver4: "src/LevelOver4.png",
			LevelOver5: "src/LevelOver5.png",
			Rank: "src/Rank.png",
			mute: "src/mute.ogg",
			HitSong0: "src/HitSong0.ogg",
			HitSong1: "src/HitSong1.ogg",
			HitSong2: "src/HitSong2.ogg"
		}).map(([name, src], _i, arr) => {
			const xhr = new XMLHttpRequest();
			xhr.open("get", src, true);
			xhr.responseType = 'arraybuffer';
			xhr.send();
			return new Promise(resolve => {
				xhr.onload = async () => {
					if (/\.(mp3|wav|ogg)$/i.test(src)) res[name] = await actx.decodeAudioData(xhr.response);
					else if (/\.(png|jpeg|jpg)$/i.test(src)) res[name] = await createImageBitmap(new Blob([xhr.response]));
					message.sendMessage(`???????????????${Math.floor(++loadedNum / arr.length * 100)}%`);
					resolve();
				};
			});
		}));
		res["JudgeLineMP"] = await createImageBitmap(imgShader(res["JudgeLine"], "#ffffff"));
		res["JudgeLineAP"] = await createImageBitmap(imgShader(res["JudgeLine"], "#ffffff"));
		res["JudgeLineFC"] = await createImageBitmap(imgShader(res["JudgeLine"], "#ffffff"));
		res["TapBad"] = await createImageBitmap(imgShader(res["Tap2"], "#ec1c24"));
		res["Clicks"] = {};
		//res["Clicks"].default = await qwqImage(res["clickRaw"], "white");
		res["Ranks"] = await qwqImage(res["Rank"], "white");
		res["Clicks"]["rgba(255,236,160,0.8823529)"] = await qwqImage(res["clickRaw"], "rgba(255,236,160,0.8823529)"); //#fce491
		res["Clicks"]["rgba(168,255,177,0.9016907)"] = await qwqImage(res["clickRaw"], "rgba(168,255,177,0.9016907)"); //#97f79d
		res["Clicks"]["rgba(180,225,255,0.9215686)"] = await qwqImage(res["clickRaw"], "rgba(180,225,255,0.9215686)"); //#9ed5f3
		message.sendMessage("??????????????????...");
		upload.parentElement.classList.remove("disabled");
	})();
}
async function qwqImage(img, color) {
	const clickqwq = imgShader(img, color);
	const arr = [];
	const min = Math.min(img.width, img.height);
	const max = Math.max(img.width, img.height);
	for (let i = 0; i < parseInt(max / min); i++) arr[i] = await createImageBitmap(clickqwq, 0, i * min, min, min);
	return arr;
}
//????????????
let stopDrawing;
let energy = 0;
const stat = {
	noteRank: [0, 0, 0, 0, 0, 0, 0, 0],
	combos: [0, 0, 0, 0, 0],
	maxcombo: 0,
	combo: 0,
	get good() {
		return this.noteRank[7] + this.noteRank[3];
	},
	get bad() {
		return this.noteRank[6] + this.noteRank[2];
	},
	get great() {
		return this.noteRank[5] + this.noteRank[1];
	},
	get perfect() {
		return this.noteRank[4] + this.great;
	},
	get all() {
		return this.perfect + this.good + this.bad;
	},
	get scoreNum() {
		const a = 1e6 * (this.perfect * 0.9 + this.good * 0.585 + this.maxcombo * 0.1) / this.numOfNotes;
		const b = 1e6 * (this.noteRank[4] + this.great * 0.65 + this.good * 0.35) / this.numOfNotes;
		return hyperMode.checked ? (isFinite(b) ? b : 0) : (isFinite(a) ? a : 0);
	},
	get scoreStr() {
		const a = this.scoreNum.toFixed(0);
		return ("0").repeat(a.length < 7 ? 7 - a.length : 0) + a;
	},
	get accNum() {
	    const perfect = (1/this.numOfNotes)*this.perfect
	    const good = (1/this.numOfNotes)*this.good*0.65
		const a = perfect+good
		const b = (this.noteRank[4] + this.great * 0.65 + this.good * 0.35) / this.all;
		return hyperMode.checked ? (isFinite(b) ? b : 0) : (isFinite(a) ? a : 0);
	},
	get accStr() {
		return (100 * this.accNum).toFixed(2) + "%";
	},
	get lineStatus() {
		if (this.bad) return 0;
		if (this.good) return 3;
		if (this.great && hyperMode.checked) return 2;
		return 1;
	},
	get rankStatus() {
		const a = Math.round(this.scoreNum);
		if (a >= 1e6) return 0;
		if (a >= 9.6e5) return 1;
		if (a >= 9.2e5) return 2;
		if (a >= 8.8e5) return 3;
		if (a >= 8.2e5) return 4;
		if (a >= 7e5) return 5;
		return 6;
	},
	get localData() {
		const l1 = Math.round(this.accNum * 1e4 + 566).toString(22).slice(-3);
		const l2 = Math.round(this.scoreNum + 40672).toString(32).slice(-4);
		const l3 = (Number(inputLevel.value.match(/\d+$/))).toString(36).slice(-1);
		return l1 + l2 + l3;
	},
	getData(isAuto, speed = "") {
		const s1 = this.data[this.id].slice(0, 3);
		const s2 = this.data[this.id].slice(3, 7);
		const l1 = Math.round(this.accNum * 1e4 + 566).toString(22).slice(-3);
		const l2 = Math.round(this.scoreNum + 40672).toString(32).slice(-4);
		const l3 = (Number(inputLevel.value.match(/\d+$/))).toString(36).slice(-1);
		const a = (parseInt(s2, 32) - 40672).toFixed(0);
		const scoreBest = ("0").repeat(a.length < 7 ? 7 - a.length : 0) + a;
		if (!isAuto) this.data[this.id] = (s1 > l1 ? s1 : l1) + (s2 > l2 ? s2 : l2) + l3;
		const arr = [];
		for (const i in this.data) arr.push(i + this.data[i]);
		localStorage.setItem(`phi-${speed}`, arr.sort(() => Math.random() - 0.5).join(""));
		const pbj = {
			newBestColor: s2 < l2 ? "#18ffbf" : "#fff",
			scoreBest:"",
			scoreDelta: (s2 > l2 ? "- " : "+ ") + Math.abs(scoreBest - this.scoreStr),
			textAboveColor: "#65fe43",
			textAboveStr: `  ( Speed ${config.speed.toFixed(2)}x )`,
			textBelowColor: "#fe4365",
		}
		if (config.speed == 1) Object.assign(pbj, { textAboveStr: "" });
		if (isAuto) return Object.assign(pbj, { newBestColor: "#fff", newBestStr: "", scoreDelta: "" });
		if (this.lineStatus == 1) return Object.assign(pbj, { textBelowStr: "", textBelowColor: "#ffc500" });
		if (this.lineStatus == 2) return Object.assign(pbj, { textBelowStr: "", textBelowColor: "#91ff8f" })
		if (this.lineStatus == 3) return Object.assign(pbj, { textBelowStr: "", textBelowColor: "#00bef1" });
		return Object.assign(pbj, { textBelowStr: "" });
	},
	reset(numOfNotes, id, speed = "") {
		const key = `phi-${speed}`;
		this.numOfNotes = Number(numOfNotes) || 0;
		this.combo = 0;
		this.maxcombo = 0;
		this.noteRank = [0, 0, 0, 0, 0, 0, 0, 0]; //4:PM,5:PE,1:PL,7:GE,3:GL,6:BE,2:BL
		this.combos = [0, 0, 0, 0, 0]; //????????????note??????????????????
		this.data = {};
		if (speed == "" && localStorage.getItem("phi")) {
			localStorage.setItem(key, localStorage.getItem("phi"));
			localStorage.removeItem("phi");
		}
		if (localStorage.getItem(key) == null) localStorage.setItem(key, ""); //???????????????
		const str = localStorage.getItem(key);
		for (let i = 0; i < parseInt(str.length / 40); i++) {
			const data = str.slice(i * 40, i * 40 + 40);
			this.data[data.slice(0, 32)] = data.slice(-8);
		}
		if (id) {
			if (!this.data[id]) this.data[id] = this.localData;
			this.id = id;
		}
	},
	addCombo(status, type) {
		this.noteRank[status]++;
		this.combo = status % 4 == 2 ? 0 : this.combo + 1;
		if (this.combo > this.maxcombo) this.maxcombo = this.combo;
		this.combos[0]++;
		this.combos[type]++;
		if (qwq[4]) energy++;
		if (this.lineStatus != 1) energy = 0;
	}
}
//const stat = new Stat();
const comboColor = ["#fff", "#0ac3ff", "#f0ed69", "#a0e9fd", "#fe4365"];
//????????????
upload.onchange = function() {
	const file = this.files[0];
	document.getElementById("filename").value = file ? file.name : "";
	if (!file) {
		message.sendError("?????????????????????");
		return;
	}
	uploads.classList.add("disabled");
	loadFile(file);
}
const time2Str = time => `${parseInt(time / 60)}:${`00${parseInt(time % 60)}`.slice(-2)}`;
const frameTimer = { //??????fps
	tick: 0,
	time: performance.now(),
	fps: "",
	addTick(fr = 10) {
		if (++this.tick >= fr) {
			this.tick = 0;
			this.fps = (1e3 * fr / (-this.time + (this.time = performance.now()))).toFixed(0);
		}
		return this.fps;
	}
}
class Timer {
	constructor() {
		this.reset();
	}
	play() {
		if (!this.isPaused) throw new Error("Time has been playing");
		this.t1 = performance.now();
		this.isPaused = false;
	}
	pause() {
		if (this.isPaused) throw new Error("Time has been paused");
		this.t0 = this.time;
		this.isPaused = true;
	}
	reset() {
		this.t0 = 0;
		this.t1 = 0;
		this.isPaused = true;
	}
	addTime(num) {
		this.t0 += num;
	}
	get time() {
		if (this.isPaused) return this.t0;
		return this.t0 + performance.now() - this.t1;
	}
	get second() {
		return this.time / 1e3;
	}
}
let curTime = 0;
let curTimestamp = 0;
let timeBgm = 0;
let timeChart = 0;
let duration = 0;
let isInEnd = false; //??????????????????
let isOutStart = false; //??????????????????
let isOutEnd = false; //????????????
let isPaused = true; //??????
//????????????
const loadFile = function(file) {
	qwq[1] = true;
	document.getElementById("demo").classList.add("hide");
	const reader = new FileReader();
	reader.readAsArrayBuffer(file);
	reader.onprogress = progress => { //????????????????????????
		const size = file.size;
		message.sendMessage(`???????????????${Math.floor(progress.loaded / size * 100)}%`);
	};
	reader.onload = async function() {
		//??????zip//gildas-lormeau.github.io/zip.js)
		const reader = new zip.ZipReader(new zip.Uint8ArrayReader(new Uint8Array(this.result)));
		reader.getEntries().then(async zipDataRaw => {
			const zipData = [];
			for (const i of zipDataRaw) {
				if (i.filename.replace(/.*\//, "")) zipData.push(i); //???????????????
			}
			console.log(zipData);
			let loadedNum = 0;
			const zipRaw = await Promise.all(zipData.map(i => new Promise(async resolve => {
				if (i.filename == "line.csv") {
					const data = await i.getData(new zip.TextWriter());
					const chartLine = csv2array(data, true);
					chartLineData.push(...chartLine);
					loading(++loadedNum);
					resolve(chartLine);
				} else if (i.filename == "info.csv") {
					const data_2 = await i.getData(new zip.TextWriter());
					const chartInfo = csv2array(data_2, true);
					chartInfoData.push(...chartInfo);
					loading(++loadedNum);
					resolve(chartInfo);
				} else i.getData(new zip.Uint8ArrayWriter()).then(async data => {
					const audioData = await actx.decodeAudioData(data.buffer);
					bgms[i.filename] = audioData;
					selectbgm.appendChild(createOption(i.filename, i.filename));
					loading(++loadedNum);
					resolve(audioData);
				}).catch(async () => {
					const data = await i.getData(new zip.BlobWriter());
					const imageData = await createImageBitmap(data);
					bgs[i.filename] = imageData;
					bgsBlur[i.filename] = await createImageBitmap(imgBlur(imageData));
					selectbg.appendChild(createOption(i.filename, i.filename));
					loading(++loadedNum);
					resolve(imageData);
				}).catch(async () => {
					const data = await i.getData(new zip.TextWriter());
					console.log(JSON.parse(data)); //test
					const jsonData = await chart123(JSON.parse(data));
					charts[i.filename] = jsonData;
					charts[i.filename]["md5"] = md5(data);
					selectchart.appendChild(createOption(i.filename, i.filename));
					loading(++loadedNum);
					resolve(jsonData);
				}).catch(async () => {
					const data = await i.getData(new zip.TextWriter());
					const jsonData = await chart123(chartp23(data, i.filename));
					charts[i.filename] = jsonData;
					charts[i.filename]["md5"] = md5(data);
					selectchart.appendChild(createOption(i.filename, i.filename));
					loading(++loadedNum);
					resolve(jsonData);
				}).catch(error => {
					console.log(error);
					loading(++loadedNum);
					message.sendWarning(`?????????????????????${i.filename}`);
					resolve(undefined);
				});
			})));

			function createOption(innerhtml, value) {
				const option = document.createElement("option");
				const isHidden = /(^|\/)\./.test(innerhtml);
				option.innerHTML = isHidden ? "" : innerhtml;
				option.value = value;
				if (isHidden) option.classList.add("hide");
				return option;
			}

			function loading(num) {
				message.sendMessage(`???????????????${Math.floor(num / zipData.length * 100)}%`);
				if (num == zipData.length) {
					if (selectchart.children.length == 0) {
						message.sendError("????????????????????????????????????"); //test //test
					} else if (selectbgm.children.length == 0) {
						message.sendError("????????????????????????????????????"); //test
					} else {
						select.classList.remove("disabled");
						btnPause.classList.add("disabled");
						adjustInfo();
					}
				}
			}
			console.log(zipRaw);
		}, () => {
			message.sendError("?????????????????????zip??????"); //test
		});
		reader.close();
	}
}
//note?????????
function prerenderChart(chart) {
	const chartOld = JSON.parse(JSON.stringify(chart));
	const chartNew = chartOld;
	//??????events
	for (const LineId in chartNew.judgeLineList) {
		const i = chartNew.judgeLineList[LineId];
		i.bpm *= config.speed;
		i.lineId = LineId;
		i.offsetX = 0;
		i.offsetY = 0;
		i.alpha = 0;
		i.rotation = 0;
		i.positionY = 0; //???????????????
		i.images = [res["JudgeLine"], res["JudgeLineMP"], res["JudgeLineAP"], res["JudgeLineFC"]];
		i.imageH = 0.008;
		i.imageW = 1.042;
		i.imageB = 0;
		i.speedEvents = addRealTime(arrangeSpeedEvent(i.speedEvents), i.bpm);
		i.judgeLineDisappearEvents = addRealTime(arrangeLineEvent(i.judgeLineDisappearEvents), i.bpm);
		i.judgeLineMoveEvents = addRealTime(arrangeLineEvent(i.judgeLineMoveEvents), i.bpm);
		i.judgeLineRotateEvents = addRealTime(arrangeLineEvent(i.judgeLineRotateEvents), i.bpm);
		Renderer.lines.push(i);
		for (const NoteId in i.notesAbove) addNote(i.notesAbove[NoteId], 1.875 / i.bpm, LineId, NoteId, true);
		for (const NoteId in i.notesBelow) addNote(i.notesBelow[NoteId], 1.875 / i.bpm, LineId, NoteId, false);
	}
	const sortNote = (a, b) => a.realTime - b.realTime || a.lineId - b.lineId || a.noteId - b.noteId;
	Renderer.notes.sort(sortNote);
	Renderer.taps.sort(sortNote);
	Renderer.drags.sort(sortNote);
	Renderer.holds.sort(sortNote);
	Renderer.flicks.sort(sortNote);
	Renderer.reverseholds.sort(sortNote).reverse();
	Renderer.tapholds.sort(sortNote);
	//???Renderer??????Note
	function addNote(note, base32, lineId, noteId, isAbove) {
		note.offsetX = 0;
		note.offsetY = 0;
		note.alpha = 0;
		note.rotation = 0;
		note.realTime = note.time * base32;
		note.realHoldTime = note.holdTime * base32;
		note.lineId = lineId;
		note.noteId = noteId;
		note.isAbove = isAbove;
		note.name = `${lineId}${isAbove ? "+" : "-"}${noteId}${" tdhf".split("")[note.type]}`;
		Renderer.notes.push(note);
		if (note.type == 1) Renderer.taps.push(note);
		else if (note.type == 2) Renderer.drags.push(note);
		else if (note.type == 3) Renderer.holds.push(note);
		else if (note.type == 4) Renderer.flicks.push(note);
		if (note.type == 3) Renderer.reverseholds.push(note);
		if (note.type == 1 || note.type == 3) Renderer.tapholds.push(note);
	}
	//??????????????????note
	for (const i of chartNew.judgeLineList) {
		i.notes = [];
		for (const j of i.notesAbove) {
			j.isAbove = true;
			i.notes.push(j);
		}
		for (const j of i.notesBelow) {
			j.isAbove = false;
			i.notes.push(j);
		}
	}
	//????????????
	const timeOfMulti = {};
	for (const i of Renderer.notes) timeOfMulti[i.realTime.toFixed(6)] = timeOfMulti[i.realTime.toFixed(6)] ? 2 : 1;
	for (const i of Renderer.notes) i.isMulti = (timeOfMulti[i.realTime.toFixed(6)] == 2);
	return chartNew;
	//??????realTime
	function addRealTime(events, bpm) {
		for (const i of events) {
			i.startRealTime = i.startTime / bpm * 1.875;
			i.endRealTime = i.endTime / bpm * 1.875;
			i.startDeg = -Deg * i.start;
			i.endDeg = -Deg * i.end;
		}
		return events;
	}
} //?????????????????????
function arrangeLineEvent(events) {
	const oldEvents = JSON.parse(JSON.stringify(events)); //?????????
	const newEvents = [{ //???1-1e6??????
		startTime: 1 - 1e6,
		endTime: 0,
		start: oldEvents[0] ? oldEvents[0].start : 0,
		end: oldEvents[0] ? oldEvents[0].start : 0,
		start2: oldEvents[0] ? oldEvents[0].start2 : 0,
		end2: oldEvents[0] ? oldEvents[0].start2 : 0
	}];
	oldEvents.push({ //???1e9??????
		startTime: 0,
		endTime: 1e9,
		start: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end : 0,
		end: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end : 0,
		start2: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end2 : 0,
		end2: oldEvents[oldEvents.length - 1] ? oldEvents[oldEvents.length - 1].end2 : 0
	});
	for (const i2 of oldEvents) { //?????????????????????
		const i1 = newEvents[newEvents.length - 1];
		if (i2.startTime > i2.endTime) continue;
		if (i1.endTime > i2.endTime);
		else if (i1.endTime == i2.startTime) newEvents.push(i2);
		else if (i1.endTime < i2.startTime) newEvents.push({
			startTime: i1.endTime,
			endTime: i2.startTime,
			start: i1.end,
			end: i1.end,
			start2: i1.end2,
			end2: i1.end2
		}, i2);
		else if (i1.endTime > i2.startTime) newEvents.push({
			startTime: i1.endTime,
			endTime: i2.endTime,
			start: (i2.start * (i2.endTime - i1.endTime) + i2.end * (i1.endTime - i2.startTime)) / (i2.endTime - i2.startTime),
			end: i1.end,
			start2: (i2.start2 * (i2.endTime - i1.endTime) + i2.end2 * (i1.endTime - i2.startTime)) / (i2.endTime - i2.startTime),
			end2: i1.end2
		});
	}
	//???????????????????????????
	const newEvents2 = [newEvents.shift()];
	for (const i2 of newEvents) {
		const i1 = newEvents2[newEvents2.length - 1];
		const d1 = i1.endTime - i1.startTime;
		const d2 = i2.endTime - i2.startTime;
		if (i2.startTime == i2.endTime);
		else if (i1.end == i2.start && i1.end2 == i2.start2 && (i1.end - i1.start) * d2 == (i2.end - i2.start) * d1 && (i1.end2 - i1.start2) * d2 == (i2.end2 - i2.start2) * d1) {
			i1.endTime = i2.endTime;
			i1.end = i2.end;
			i1.end2 = i2.end2;
		} else newEvents2.push(i2);
	}
	return JSON.parse(JSON.stringify(newEvents2));
}
//??????speedEvents
function arrangeSpeedEvent(events) {
	const newEvents = [];
	for (const i2 of events) {
		const i1 = newEvents[newEvents.length - 1];
		if (!i1 || i1.value != i2.value) newEvents.push(i2);
		else i1.endTime = i2.endTime;
	}
	return JSON.parse(JSON.stringify(newEvents));
}
document.addEventListener("visibilitychange", () => document.visibilityState == "hidden" && btnPause.value == "??????" && btnPause.click());
document.addEventListener("pagehide", () => document.visibilityState == "hidden" && btnPause.value == "??????" && btnPause.click()); //??????Safari
const qwqIn = new Timer();
const qwqOut = new Timer();
const qwqEnd = new Timer();
//play
btnPlay.addEventListener("click", async function() {
	btnPause.value = "??????";
	if (this.value == "??????") {
		stopPlaying.push(playSound(res["mute"], true, false, 0)); //???????????????(?????????????????????)
		("lines,notes,taps,drags,flicks,holds,reverseholds,tapholds").split(",").map(i => Renderer[i] = []);
		Renderer.chart = prerenderChart(charts[selectchart.value]); //fuckqwq
		Renderer.chart2 = JSON.parse(JSON.stringify(charts[selectchart.value])); //fuckqwq2
		stat.reset(Renderer.chart.numOfNotes, Renderer.chart.md5, selectspeed.value);
		for (const i of chartLineData) {
			if (selectchart.value == i.Chart) {
				Renderer.chart.judgeLineList[i.LineId].images[0] = bgs[i.Image];
				Renderer.chart.judgeLineList[i.LineId].images[1] = await createImageBitmap(imgShader(bgs[i.Image], "#feffa9"));
				Renderer.chart.judgeLineList[i.LineId].images[2] = await createImageBitmap(imgShader(bgs[i.Image], "#a3ffac"));
				Renderer.chart.judgeLineList[i.LineId].images[3] = await createImageBitmap(imgShader(bgs[i.Image], "#a2eeff"));
				Renderer.chart.judgeLineList[i.LineId].imageH = Number(i.Vert);
				Renderer.chart.judgeLineList[i.LineId].imageW = Number(i.Horz);
				Renderer.chart.judgeLineList[i.LineId].imageB = Number(i.IsDark);
			}
		}
		Renderer.bgImage = bgs[selectbg.value] || res["NoImage"];
		Renderer.bgImageBlur = bgsBlur[selectbg.value] || res["NoImage"];
		Renderer.bgMusic = bgms[selectbgm.value];
		this.value = "??????";
		resizeCanvas();
		duration = Renderer.bgMusic.duration / config.speed;
		isInEnd = false;
		isOutStart = false;
		isOutEnd = false;
		isPaused = false;
		timeBgm = 0;
		if (!showTransition.checked) qwqIn.addTime(3000);
		canvas.classList.remove("fade");
		mask.classList.add("fade");
		btnPause.classList.remove("disabled");
		for (const i of document.querySelectorAll(".disabled-when-playing")) i.classList.add("disabled");
		loop();
		qwqIn.play();
	} else {
		while (stopPlaying.length) stopPlaying.shift()();
		cancelAnimationFrame(stopDrawing);
		resizeCanvas();
		canvas.classList.add("fade");
		mask.classList.remove("fade");
		for (const i of document.querySelectorAll(".disabled-when-playing")) i.classList.remove("disabled");
		btnPause.classList.add("disabled");
		//??????????????????
		fucktemp = false;
		fucktemp2 = false;
		clickEvents0.length = 0;
		clickEvents1.length = 0;
		clickEvents2.length = 0;
		qwqIn.reset();
		qwqOut.reset();
		qwqEnd.reset();
		curTime = 0;
		curTimestamp = 0;
		duration = 0;
		this.value = "??????";
	}
});
btnPause.addEventListener("click", function() {
	if (this.classList.contains("disabled") || btnPlay.value == "Play") return;
	if (this.value == "??????") {
		qwqIn.pause();
		if (showTransition.checked && isOutStart) qwqOut.pause();
		isPaused = true;
		this.value = "??????";
		curTime = timeBgm;
		while (stopPlaying.length) stopPlaying.shift()();
	} else {
		qwqIn.play();
		if (showTransition.checked && isOutStart) qwqOut.play();
		isPaused = false;
		if (isInEnd && !isOutStart) playBgm(Renderer.bgMusic, timeBgm * config.speed);
		this.value = "??????";
	}
});
inputOffset.addEventListener("input", function() {
	if (this.value < -400) this.value = -400;
	if (this.value > 600) this.value = 600;
});
//??????bgm
function playBgm(data, offset) {
	isPaused = false;
	if (!offset) offset = 0;
	curTimestamp = performance.now();
	stopPlaying.push(playSound(data, false, true, offset, config.speed));
}
let fucktemp = false;
let fucktemp2 = false;
//??????
function loop() {
	const now = performance.now();
	//????????????
	if (qwqOut.second < 0.67) {
		calcqwq(now);
		qwqdraw1(now);
	} else if (!fucktemp) qwqdraw2();
	if (fucktemp2) qwqdraw3(fucktemp2);
	ctx.globalAlpha = 1;
	if (document.getElementById("imageBlur").checked) ctx.drawImage(Renderer.bgImageBlur, ...adjustSize(Renderer.bgImageBlur, canvas, 1.1));
	else ctx.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvas, 1.1));
	ctx.fillStyle = "#000";
	ctx.globalAlpha = 0.4;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	ctx.drawImage(canvasos, (canvas.width - canvasos.width) / 2, 0);
	//Copyright
	ctx.font = `${lineScale * 0.3}px NoirPro`;
	ctx.fillStyle = "#ccc";
	ctx.globalAlpha = 0.5;
	ctx.textAlign = "right";
	ctx.textBaseline = "middle";
	// ctx.fillText(`Phigros Simulator Demo v${_i[1].join('.')} - Code by ich\x7ah3473`, (canvas.width + canvasos.width) / 2 - lineScale * 1, canvas.height - lineScale * 18.5);
	stopDrawing = requestAnimationFrame(loop); //??????????????????
}

function calcqwq(now) {
	if (!isInEnd && qwqIn.second >= 3) {
		isInEnd = true;
		playBgm(Renderer.bgMusic);
	}
	if (!isPaused && isInEnd && !isOutStart) timeBgm = (now - curTimestamp) / 1e3 + curTime;
	if (timeBgm >= duration) isOutStart = true;
	if (showTransition.checked && isOutStart && !isOutEnd) {
		isOutEnd = true;
		qwqOut.play();
	}
	timeChart = Math.max(timeBgm - Renderer.chart.offset / config.speed - (Number(inputOffset.value) / 1e3 || 0), 0);
	//???????????????events???Note
	for (const line of Renderer.lines) {
		for (const i of line.judgeLineDisappearEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			const t2 = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
			const t1 = 1 - t2;
			line.alpha = i.start * t1 + i.end * t2;
		}
		for (const i of line.judgeLineMoveEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			const t2 = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
			const t1 = 1 - t2;
			line.offsetX = canvasos.width * (i.start * t1 + i.end * t2);
			line.offsetY = canvasos.height * (1 - i.start2 * t1 - i.end2 * t2);
		}
		for (const i of line.judgeLineRotateEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			const t2 = (timeChart - i.startRealTime) / (i.endRealTime - i.startRealTime);
			const t1 = 1 - t2;
			line.rotation = i.startDeg * t1 + i.endDeg * t2;
			line.cosr = Math.cos(line.rotation);
			line.sinr = Math.sin(line.rotation);
		}
		for (const i of line.speedEvents) {
			if (timeChart < i.startRealTime) break;
			if (timeChart > i.endRealTime) continue;
			line.positionY = (timeChart - i.startRealTime) * i.value * config.speed + i.floorPosition;
		}
		for (const i of line.notesAbove) {
			i.cosr = line.cosr;
			i.sinr = line.sinr;
			setAlpha(i, wlen2 * i.positionX, hlen2 * getY(i));
		}
		for (const i of line.notesBelow) {
			i.cosr = -line.cosr;
			i.sinr = -line.sinr;
			setAlpha(i, -wlen2 * i.positionX, hlen2 * getY(i));
		}

		function getY(i) {
			if (!i.badtime) return realgetY(i);
			if (performance.now() - i.badtime > 500) delete i.badtime;
			if (!i.badY) i.badY = realgetY(i);
			return i.badY;
		}

		function realgetY(i) {
			if (i.type != 3) return (i.floorPosition - line.positionY) * i.speed;
			if (i.realTime < timeChart) return (i.realTime - timeChart) * i.speed * config.speed;
			return i.floorPosition - line.positionY;
		}

		function setAlpha(i, dx, dy) {
			i.projectX = line.offsetX + dx * i.cosr;
			i.offsetX = i.projectX + dy * i.sinr;
			i.projectY = line.offsetY + dx * i.sinr;
			i.offsetY = i.projectY - dy * i.cosr;
			i.visible = Math.abs(i.offsetX - wlen) + Math.abs(i.offsetY - hlen) < wlen * 1.23625 + hlen + hlen2 * i.realHoldTime * i.speed * config.speed;
			if (i.badtime) i.alpha = 1 - range((performance.now() - i.badtime) / 500);
			else if (i.realTime > timeChart) {
				if (dy > -1e-3 * hlen2) i.alpha = (i.type == 3 && i.speed == 0) ? (showPoint.checked ? 0.45 : 0) : qwq[5] ? Math.max(1 + (timeChart - i.realTime) / 1.5, 0) : 1; //?????????1.5s??????
				else i.alpha = showPoint.checked ? 0.45 : 0;
				//i.frameCount = 0;
			} else {
				if (i.type == 3) i.alpha = i.speed == 0 ? (showPoint.checked ? 0.45 : 0) : (i.status % 4 == 2 ? 0.45 : 1);
				else i.alpha = Math.max(1 - (timeChart - i.realTime) / (hyperMode.checked ? 0.12 : 0.16), 0); //?????????0.16s??????
				i.frameCount = isNaN(i.frameCount) ? 0 : i.frameCount + 1;
			}
		}
	}
	if (isInEnd) {
		judgements.addJudgement(Renderer.notes, timeChart);
		judgements.judgeNote(Renderer.drags, timeChart, canvasos.width * 0.117775);
		judgements.judgeNote(Renderer.flicks, timeChart, canvasos.width * 0.117775);
		judgements.judgeNote(Renderer.tapholds, timeChart, canvasos.width * 0.117775); //???????????????????????????
	}
	taps.length = 0; //qwq
	frameTimer.addTick(); //??????fps
	clickEvents0.defilter(i => i.time++ > 0); //??????????????????
	clickEvents1.defilter(i => now >= i.time + i.duration); //??????????????????
	clickEvents2.defilter(i => now >= i.time + i.duration); //??????????????????
	for (const i in mouse) mouse[i] instanceof Click && mouse[i].animate();
	for (const i in touch) touch[i] instanceof Click && touch[i].animate();
	if (qwq[4] && stat.good + stat.bad) {
		stat.reset();
		specialClick.func[1]();
	}
}

function qwqdraw1(now) {
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height); //????????????
	ctxos.globalCompositeOperation = "destination-over"; //??????????????????
	if (document.getElementById("showCE2").checked)
		for (const i of clickEvents2) { //??????????????????2
			const tick = (now - i.time) / i.duration;
			ctxos.setTransform(...imgFlip(1, 0, 0, 1, i.offsetX, i.offsetY)); //??????
			if (selectflip.value[0] == "t") ctxos.transform(-1, 0, 0, -1, 0, 0); //qwq
			ctxos.font = `bold ${noteScale*(256+128* (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988))}px Mina`;
			ctxos.textAlign = "center";
			ctxos.textBaseline = "middle";
			ctxos.fillStyle = i.color;
			ctxos.globalAlpha = 1 - tick; //????????????
			ctxos.fillText(i.text, 0, -noteScale * 192);
		}
	if (qwq[4]) ctxos.filter = `hue-rotate(${energy*360/7}deg)`;
	for (const i of clickEvents1) { //??????????????????1
		const tick = (now - i.time) / i.duration;
		ctxos.globalAlpha = 1;
		ctxos.setTransform(...imgFlip(noteScale * 4, 0, 0, noteScale * 4, i.offsetX, i.offsetY)); //??????
		ctxos.drawImage(i.images[parseInt(tick * 30)] || i.images[i.images.length - 1], -306, -292); //?????????0.5???
		ctxos.fillStyle = i.color;
		ctxos.globalAlpha = 1 - tick; //????????????
		// const r3 = 30 * (((0.2078 * tick - 1.6524) * tick + 1.6399) * tick + 0.4988); //????????????
		// for (const j of i.rand) {
		// 	const ds = j[0] * (9 * tick / (8 * tick + 1)); //???????????????
		// 	ctxos.fillRect(ds * Math.cos(j[1]) - r3 / 2, ds * Math.sin(j[1]) - r3 / 2, r3, r3);
		// }
	}
	if (qwq[4]) ctxos.filter = "none";
	if (document.getElementById("feedback").checked) {
		for (const i of clickEvents0) { //??????????????????0
			ctxos.globalAlpha = 0.85;
			ctxos.setTransform(...imgFlip(1, 0, 0, 1, i.offsetX, i.offsetY)); //??????
			ctxos.fillStyle = i.color;
			ctxos.beginPath();
			ctxos.arc(0, 0, lineScale * 0.5, 0, 2 * Math.PI);
			ctxos.fill();
			i.time++;
		}
	}
	if (qwqIn.second >= 3 && qwqOut.second == 0) {
		if (showPoint.checked) { //???????????????
			ctxos.font = `${lineScale}px NoirPro`;
			ctxos.textAlign = "center";
			ctxos.textBaseline = "bottom";
			for (const i of Renderer.notes) {
				if (!i.visible) continue;
				ctxos.setTransform(...imgFlip(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY));
				ctxos.fillStyle = "cyan";
				ctxos.globalAlpha = i.realTime > timeChart ? 1 : 0.5;
				ctxos.fillText(i.name, 0, -lineScale * 0.1);
				ctxos.globalAlpha = 1;
				ctxos.fillStyle = "lime";
				ctxos.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
			}
			for (const i of Renderer.lines) {
				ctxos.setTransform(...imgFlip(i.cosr, i.sinr, -i.sinr, i.cosr, i.offsetX, i.offsetY));
				ctxos.fillStyle = "yellow";
				ctxos.globalAlpha = (i.alpha + 0.5) / 1.5;
				ctxos.fillText(i.lineId, 0, -lineScale * 0.1);
				ctxos.globalAlpha = 1;
				ctxos.fillStyle = "violet";
				ctxos.fillRect(-lineScale * 0.2, -lineScale * 0.2, lineScale * 0.4, lineScale * 0.4);
			}
		}
		//??????note
		for (const i of Renderer.flicks) drawNote(i, timeChart, 4);
		for (const i of Renderer.taps) drawNote(i, timeChart, 1);
		for (const i of Renderer.drags) drawNote(i, timeChart, 2);
		for (const i of Renderer.reverseholds) drawNote(i, timeChart, 3);
	}
	//????????????
	if (qwq[4]) ctxos.filter = `hue-rotate(${energy*360/7}deg)`;
	if (qwqIn.second >= 2.5) drawLine(stat.lineStatus ? 2 : 1); //???????????????(?????????1)
	if (qwq[4]) ctxos.filter = "none";
	ctxos.resetTransform();
	ctxos.fillStyle = "#000"; //????????????
	ctxos.globalAlpha = selectglobalalpha.value == "" ? 0.6 : selectglobalalpha.value; //??????????????????
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	if (qwq[4]) ctxos.filter = `hue-rotate(${energy*360/7}deg)`;
	if (qwqIn.second >= 2.5 && !stat.lineStatus) drawLine(0); //???????????????(?????????0)
	if (qwq[4]) ctxos.filter = "none";
	ctxos.globalAlpha = 1;
	ctxos.resetTransform();
	if (document.getElementById("imageBlur").checked) {
		ctxos.drawImage(Renderer.bgImageBlur, ...adjustSize(Renderer.bgImageBlur, canvasos, 1));
	} else {
		ctxos.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvasos, 1));
	}
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalCompositeOperation = "source-over";
	//???????????????
	ctxos.setTransform(canvasos.width / 1920, 0, 0, canvasos.width / 1920, 0, lineScale * (qwqIn.second < 0.67 ? (tween[2](qwqIn.second * 1.5) - 1) : -tween[2](qwqOut.second * 1.5)) * 1.75);
	ctxos.drawImage(res["ProgressBar"], (qwq[5] ? duration - timeBgm : timeBgm) / duration * 1920 - 1920, 1070);
	//????????????
	ctxos.resetTransform();
	ctxos.fillStyle = "#fff";
	//??????????????????
	if (qwqIn.second < 3) {
		if (qwqIn.second < 0.67) ctxos.globalAlpha = tween[2](qwqIn.second * 1.5);
		else if (qwqIn.second >= 2.5) ctxos.globalAlpha = tween[2](6 - qwqIn.second * 2);
		ctxos.textAlign = "center";
		//??????
		ctxos.textBaseline = "alphabetic";
		ctxos.font = `${lineScale * 1.1}px NoirPro`;
		const dxsnm = ctxos.measureText(inputName.value || inputName.placeholder).width;
		if (dxsnm > canvasos.width - lineScale * 1.5) ctxos.font = `${(lineScale) * 1.1/dxsnm*(canvasos.width-lineScale*1.5)}px NoirPro`;
		ctxos.fillText(inputName.value || inputName.placeholder, wlen, hlen * 0.75);
		//???????????????
		ctxos.textBaseline = "top";
		ctxos.font = `${lineScale * 0.55}px NoirPro`;
		const dxi = ctxos.measureText(`Illustration designed by ${inputIllustrator.value || inputIllustrator.placeholder}`).width;
		if (dxi > canvasos.width - lineScale * 1.5) ctxos.font = `${(lineScale) * 0.55/dxi*(canvasos.width-lineScale*1.5)}px NoirPro`;
		ctxos.fillText(`Illustration designed by ${inputIllustrator.value || inputIllustrator.placeholder}`, wlen, hlen * 1.25 + lineScale * 0.15);
		ctxos.font = `${lineScale * 0.55}px NoirPro`;
		const dxc = ctxos.measureText(`Level designed by ${inputDesigner.value || inputDesigner.placeholder}`).width;
		if (dxc > canvasos.width - lineScale * 1.5) ctxos.font = `${(lineScale) * 0.55/dxc*(canvasos.width-lineScale*1.5)}px NoirPro`;
		ctxos.fillText(`Level designed by ${inputDesigner.value || inputDesigner.placeholder}`, wlen, hlen * 1.25 + lineScale * 1.0);
		//?????????(?????????)
		ctxos.globalAlpha = 1;
		ctxos.setTransform(1, 0, 0, 1, wlen, hlen);
		const imgW = lineScale * 48 * (qwqIn.second < 0.67 ? tween[3](qwqIn.second * 1.5) : 1);
		const imgH = lineScale * 1.15;
		if (qwqIn.second >= 2.5) ctxos.globalAlpha = tween[2](6 - qwqIn.second * 2);
		ctxos.drawImage(lineColor.checked ? res["JudgeLineMP"] : res["JudgeLine"], -imgW / 2, -imgH / 2, imgW, imgH);
	}
	//???????????????combo??????????????????
	ctxos.textAlign = "center";
	ctxos.globalAlpha = 1;
	ctxos.setTransform(1, 0, 0, 1, 0, lineScale * (qwqIn.second < 0.67 ? (tween[2](qwqIn.second * 1.5) - 1) : -tween[2](qwqOut.second * 1.5)) * 1.75);
	ctxos.textBaseline = "alphabetic";
	ctxos.textAlign = "center";
	ctxos.font = `${lineScale * 0.8}px NoirPro`;//????????????
	ctxos.textAlign = "right";
	ctxos.textAlign = "center";
	ctxos.globalAlpha=0.8;
	ctxos.fillText(stat.scoreStr, canvasos.width - lineScale * 16.6, lineScale * 0.80);//????????????
	if (1>0) ctxos.drawImage(res["Pause"], lineScale * 0.6, lineScale * 0.7, lineScale * 0.63, lineScale * 0.7);
	if (stat.combo > -1) {
		ctxos.textAlign = "center";
		ctxos.font = `${lineScale * 0.8}px NoirPro`;
		ctxos.globalAlpha=0.8;
		ctxos.fillText(stat.combo, wlen, lineScale * 1.8);//combo??????
		ctxos.globalAlpha = qwqIn.second < 0.67 ? tween[2](qwqIn.second * 1.5) : (1 - tween[2](qwqOut.second * 1.5));
		ctxos.font = `${lineScale * 0.25}px NoirPro`;
		ctxos.globalAlpha=0.8;
		ctxos.fillText(autoplay.checked ? "Autoplay" : "combo", wlen, lineScale * 2.15);
	}
	//??????????????????
	ctxos.drawImage(res["top"], canvasos.width - canvasos.width / 1.6125, canvasos.height - lineScale * 19.5, lineScale * 8, lineScale * 5);
	//?????????????????????
	ctxos.globalAlpha = 1;
	ctxos.setTransform(1, 0, 0, 1, 0, lineScale * (qwqIn.second < 0.67 ? (1 - tween[2](qwqIn.second * 1.5)) : tween[2](qwqOut.second * 1.5)) * 1.75);
	ctxos.textBaseline = "alphabetic";
	ctxos.textAlign = "right";
	ctxos.font = `${lineScale * 0.63}px NoirPro`;
	ctxos.globalAlpha=0.8;
	ctxos.fillText(stat.accStr, canvasos.width - lineScale * 0.75, canvasos.height - lineScale * 0.66);
	ctxos.font = `${lineScale * 0}px NoirPro`;
	const dxlvl = ctxos.measureText(inputLevel.value || inputLevel.placeholder).width;
	if (dxlvl > wlen - lineScale) ctxos.font = `${(lineScale) * 0.63/dxlvl*(wlen - lineScale )}px NoirPro`;
	ctxos.fillText(inputLevel.value || inputLevel.placeholder, canvasos.width - lineScale * 0.75, canvasos.height - lineScale * 0.66);
	ctxos.textAlign = "left";
	ctxos.font = `${lineScale * 0.63}px Noir Pro Italic`;
	ctxos.globalAlpha=0.8;
	const dxsnm = ctxos.measureText(inputName.value || inputName.placeholder).width;
	if (dxsnm > wlen - lineScale) ctxos.font = `${(lineScale) * 0.63/dxsnm*(wlen - lineScale )}px NoirPro`;
	ctxos.fillText(inputName.value || inputName.placeholder, lineScale * 0.75, canvasos.height - lineScale * 0.66);
	ctxos.resetTransform();
	if (qwq[0]) {
		//???????????????????????????note?????????
		if (qwqIn.second < 0.67) ctxos.globalAlpha = tween[2](qwqIn.second * 1.5);
		else ctxos.globalAlpha = 1 - tween[2](qwqOut.second * 1.5);
		ctxos.textBaseline = "middle";
		ctxos.font = `${lineScale * 0.4}px NoirPro`;
		ctxos.textAlign = "left";
		ctxos.textAlign = "right";
		ctxos.textBaseline = "alphabetic";
		if (showPoint.checked) stat.combos.forEach((val, idx) => {
			ctxos.fillStyle = comboColor[idx];
			ctxos.fillText(val, lineScale * (idx + 1) * 1.1, canvasos.height - lineScale * 0.1);
		});
	}
	//??????????????????undefined/0:??????,1:???,2:?????????
	function drawLine(bool) {
		ctxos.globalAlpha = 1;
		const tw = 1 - tween[2](qwqOut.second * 1.5);
		for (const i of Renderer.lines) {
			if (bool ^ i.imageB && qwqOut.second < 0.67) {
				ctxos.globalAlpha = i.alpha;
				ctxos.setTransform(...imgFlip(i.cosr * tw, i.sinr, -i.sinr * tw, i.cosr, wlen + (i.offsetX - wlen) * tw, i.offsetY)); //hiahiah
				const imgH = i.imageH > 0 ? lineScale * 150.75 * i.imageH : canvasos.height * -i.imageH; // hlen*0.008
				const imgW = imgH * i.images[0].width / i.images[0].height * i.imageW; //* 38.4*25 * i.imageH* i.imageW; //wlen*3
				ctxos.drawImage(i.images[lineColor.checked ? stat.lineStatus : 0], -imgW / 2, -imgH / 2, imgW, imgH);
			}
		}
	}
}

function qwqdraw2() {
	fucktemp = true;
	btnPause.click(); //isPaused = true;
	while (stopPlaying.length) stopPlaying.shift()();
	cancelAnimationFrame(stopDrawing);
	btnPause.classList.add("disabled");
	ctxos.globalCompositeOperation = "source-over";
	ctxos.resetTransform();
	ctxos.globalAlpha = 1;
	if (document.getElementById("imageBlur").checked) {
		ctxos.drawImage(Renderer.bgImageBlur, ...adjustSize(Renderer.bgImageBlur, canvasos, 1));
		ctx.drawImage(Renderer.bgImageBlur, ...adjustSize(Renderer.bgImageBlur, canvas, 1));
	} else {
		ctxos.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvasos, 1));
		ctx.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvas, 1));
	}
	ctxos.fillStyle = "#000"; //????????????
	ctxos.globalAlpha = selectglobalalpha.value == "" ? 0.6 : selectglobalalpha.value; //??????????????????
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	const difficulty = ["ez", "hd", "in", "at"].indexOf(inputLevel.value.slice(0, 2).toLocaleLowerCase());
	const xhr = new XMLHttpRequest();
	xhr.open("get", `src/LevelOver${difficulty < 0 ? 2 : difficulty}${hyperMode.checked ? "_v2" : ""}.ogg`, true);
	xhr.responseType = 'arraybuffer';
	xhr.send();
	xhr.onload = async () => {
		const bgm = await actx.decodeAudioData(xhr.response);
		const timeout = setTimeout(() => {
			if (!fucktemp) return;
			stopPlaying.push(playSound(bgm, true, true, 0));
			qwqEnd.reset();
			qwqEnd.play();
			fucktemp2 = stat.getData(autoplay.checked, selectspeed.value);
		}, 1000);
		stopPlaying.push(() => clearTimeout(timeout));
	}
}

function qwqdraw3(statData) {
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = "source-over";
	ctxos.clearRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalAlpha = 1;
	if (document.getElementById("imageBlur").checked) ctxos.drawImage(Renderer.bgImageBlur, ...adjustSize(Renderer.bgImageBlur, canvasos, 1));
	else ctxos.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvasos, 1));
	ctxos.fillStyle = "#000"; //????????????
	ctxos.globalAlpha = selectglobalalpha.value == "" ? 0.6 : selectglobalalpha.value; //??????????????????
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
	ctxos.globalCompositeOperation = "destination-out";
	ctxos.globalAlpha = 1;
	const k = 57295.779507264556703365576736929; //tan75??
	ctxos.setTransform(canvasos.width - canvasos.height / k, 0, -canvasos.height / k, canvasos.height, canvasos.height / k, 0);
	ctxos.fillRect(0, 0, 1, tween[8](range((qwqEnd.second - 0.13) * 0.94)));
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = "destination-over";
	const qwq0 = (canvasos.width - canvasos.height / k) / (16 - 9 / k);
	ctxos.setTransform(qwq0 / 120, 0, 0, qwq0 / 120, wlen - qwq0 * 8, hlen - qwq0 * 4.5); //?
	ctxos.globalAlpha = range((qwqEnd.second - 0.27) / 0.83);
	ctxos.drawImage(res["LevelOver1"], 0, 0);//????????????
	ctxos.globalCompositeOperation = "source-over";
	ctxos.globalAlpha = 1;
	//???????????????
	ctxos.fillStyle = "#fff";
	ctxos.textBaseline = "middle";
	ctxos.textAlign = "left";
	ctxos.font = "0px NoirPro";
	const dxsnm = ctxos.measureText(inputName.value || inputName.placeholder).width;
	if (dxsnm > 1500) ctxos.font = `0px NoirPro`;
	ctxos.fillText(inputName.value || inputName.placeholder, 700 * tween[8](range(qwqEnd.second * 1.25)) - 320, 145);
	ctxos.font = "0px NoirPro";
	const dxlvl = ctxos.measureText(inputLevel.value || inputLevel.placeholder).width;
	if (dxlvl > 750) ctxos.font = `0px NoirPro`;
	ctxos.fillText(inputLevel.value || inputLevel.placeholder, 700 * tween[8](range(qwqEnd.second * 1.25)) - 317, 208);
	ctxos.font = "0px NoirPro";
	//Rank??????
	ctxos.globalAlpha = range((qwqEnd.second - 1.87) * 3.75);
	const qwq2 = 293 + range((qwqEnd.second - 1.87) * 3.75) * 120;
	const qwq3 = 410 - range((qwqEnd.second - 1.87) * 2.14) * 196.8;
	ctxos.drawImage(res["Ranks"][stat.rankStatus], 960 - qwq3 / 2, 745 - qwq3 / 2, qwq3, qwq3);//rank??????
	//????????????
	ctxos.globalAlpha = range((qwqEnd.second - 0.87) * 2.50);
	ctxos.fillStyle = statData.newBestColor;
	ctxos.fillText(statData.newBestStr, 898, 438);
	ctxos.fillStyle = "#fff";
	ctxos.textAlign = "center";
	ctxos.fillText(statData.scoreBest, 1180, 428);
	ctxos.globalAlpha = range((qwqEnd.second - 1.87) * 2.50);
	ctxos.textAlign = "right";
	ctxos.fillText(statData.scoreDelta, 1414, 428);
	ctxos.globalAlpha = range((qwqEnd.second - 0.95) * 1.50);
	ctxos.textAlign = "left";
	ctxos.fillStyle = "#17d1f4";
	ctxos.font = "50px NoirPro";
	ctxos.fillText(stat.accStr, 752, 1000);//acc??????
	ctxos.fillText(stat.maxcombo, 980, 1000);//??????combo??????
	ctxos.fillStyle = statData.textAboveColor;
	ctxos.fillText(statData.textAboveStr, 383 + Math.min(dxlvl, 750), 208);
	ctxos.fillStyle = statData.textBelowColor;
	ctxos.fillText(statData.textBelowStr, 1355, 590);
	ctxos.fillStyle = "#fff";
	ctxos.textAlign = "center";
	ctxos.font = "110px NoirPro";
	ctxos.globalAlpha = range((qwqEnd.second - 1.12) * 2.00);
	ctxos.fillText(stat.scoreStr, 955, 444);//????????????
	ctxos.font = "60px NoirPro";
	ctxos.globalAlpha = range((qwqEnd.second - 0.87) * 2.50);//perfect
	ctxos.fillText(stat.perfect, 425, 590);
	ctxos.globalAlpha = range((qwqEnd.second - 1.07) * 2.50);//good
	ctxos.fillText(stat.good, 870, 590);
	ctxos.globalAlpha = range((qwqEnd.second - 1.27) * 2.50);//bad
	ctxos.fillText(stat.noteRank[6], 1050, 590);
	ctxos.globalAlpha = range((qwqEnd.second - 1.47) * 2.50);//miss
	ctxos.fillText(stat.noteRank[2], 1370, 590);
	ctxos.font = "22px NoirPro";
	const qwq4 = range((qwq[3] > 0 ? qwqEnd.second - qwq[3] : 0.2 - qwqEnd.second - qwq[3]) * 5.00);
	ctxos.globalAlpha = 0.8 * range((qwqEnd.second - 0.87) * 2.50) * qwq4;
	ctxos.fillStyle = "#696";
	ctxos.fill(new Path2D("M841,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z"));
	ctxos.globalAlpha = 0.8 * range((qwqEnd.second - 1.07) * 2.50) * qwq4;
	ctxos.fillStyle = "#669";
	ctxos.fill(new Path2D("M993,718s-10,0-10,10v80s0,10,10,10h100s10,0,10-10v-80s0-10-10-10h-40l-10-20-10,20h-40z"));
	ctxos.fillStyle = "#fff";
	ctxos.globalAlpha = range((qwqEnd.second - 0.97) * 2.50) * qwq4;
	ctxos.fillText("Early: " + stat.noteRank[5], 891, 755);
	ctxos.fillText("Late: " + stat.noteRank[1], 891, 788);
	ctxos.globalAlpha = range((qwqEnd.second - 1.17) * 2.50) * qwq4;
	ctxos.fillText("Early: " + stat.noteRank[7], 1043, 755);
	ctxos.fillText("Late: " + stat.noteRank[3], 1043, 788);
	ctxos.resetTransform();
	ctxos.globalCompositeOperation = "destination-over";
	ctxos.globalAlpha = 1;
	ctxos.fillStyle = "#000";
	ctxos.drawImage(Renderer.bgImage, ...adjustSize(Renderer.bgImage, canvasos, 1));
	ctxos.fillRect(0, 0, canvasos.width, canvasos.height);
}

function range(num) {
	if (num < 0) return 0;
	if (num > 1) return 1;
	return num;
}
//??????Note
function drawNote(note, realTime, type) {
	const HL = note.isMulti && document.getElementById("highLight").checked;
	if (!note.visible) return;
	if (note.type != 3 && note.scored && !note.badtime) return;
	if (note.type == 3 && note.realTime + note.realHoldTime < realTime) return; //qwq
	ctxos.globalAlpha = note.alpha;
	ctxos.setTransform(...imgFlip(noteScale * note.cosr, noteScale * note.sinr, -noteScale * note.sinr, noteScale * note.cosr, note.offsetX, note.offsetY));
	if (type == 3) {
		const baseLength = hlen2 / noteScale * note.speed * config.speed;
		const holdLength = baseLength * note.realHoldTime;
		if (note.realTime > realTime) {
			if (HL) {
				ctxos.drawImage(res["HoldHeadHL"], -res["HoldHeadHL"].width * 0.5, -res["HoldHeadHL"].height * 0.5);
				ctxos.drawImage(res["HoldHL"], -res["HoldHL"].width * 0.5, -holdLength, res["HoldHL"].width, holdLength);
			} else {
				ctxos.drawImage(res["HoldHead"], -res["HoldHead"].width * 0.5, -res["HoldHead"].height * 0.5);
				ctxos.drawImage(res["Hold"], -res["Hold"].width * 0.5, -holdLength, res["Hold"].width, holdLength);
			}
			ctxos.drawImage(res["HoldEnd"], -res["HoldEnd"].width * 0.5, -holdLength - res["HoldEnd"].height);
		} else {
			if (HL) ctxos.drawImage(res["HoldHL"], -res["HoldHL"].width * 0.5, -holdLength, res["HoldHL"].width, holdLength - baseLength * (realTime - note.realTime));
			else ctxos.drawImage(res["Hold"], -res["Hold"].width * 0.5, -holdLength, res["Hold"].width, holdLength - baseLength * (realTime - note.realTime));
			ctxos.drawImage(res["HoldEnd"], -res["HoldEnd"].width * 0.5, -holdLength - res["HoldEnd"].height);
		}
	} else if (note.badtime) {
		if (type == 1) ctxos.drawImage(res["TapBad"], -res["TapBad"].width * 0.5, -res["TapBad"].height * 0.5);
	} else if (HL) {
		if (type == 1) ctxos.drawImage(res["TapHL"], -res["TapHL"].width * 0.5, -res["TapHL"].height * 0.5);
		else if (type == 2) ctxos.drawImage(res["DragHL"], -res["DragHL"].width * 0.5, -res["DragHL"].height * 0.5);
		else if (type == 4) ctxos.drawImage(res["FlickHL"], -res["FlickHL"].width * 0.5, -res["FlickHL"].height * 0.5);
	} else {
		if (type == 1) ctxos.drawImage(res["Tap"], -res["Tap"].width * 0.5, -res["Tap"].height * 0.5);
		else if (type == 2) ctxos.drawImage(res["Drag"], -res["Drag"].width * 0.5, -res["Drag"].height * 0.5);
		else if (type == 4) ctxos.drawImage(res["Flick"], -res["Flick"].width * 0.5, -res["Flick"].height * 0.5);
	}
}
//test
function chart123(chart) {
	const newChart = JSON.parse(JSON.stringify(chart)); //?????????
	switch (newChart.formatVersion) { //?????????????????????beautify??????bug
		case 1: {
			newChart.formatVersion = 3;
			for (const i of newChart.judgeLineList) {
				let y = 0;
				for (const j of i.speedEvents) {
					if (j.startTime < 0) j.startTime = 0;
					j.floorPosition = y;
					y += (j.endTime - j.startTime) * j.value / i.bpm * 1.875;
				}
				for (const j of i.judgeLineDisappearEvents) {
					j.start2 = 0;
					j.end2 = 0;
				}
				for (const j of i.judgeLineMoveEvents) {
					j.start2 = j.start % 1e3 / 520;
					j.end2 = j.end % 1e3 / 520;
					j.start = parseInt(j.start / 1e3) / 880;
					j.end = parseInt(j.end / 1e3) / 880;
				}
				for (const j of i.judgeLineRotateEvents) {
					j.start2 = 0;
					j.end2 = 0;
				}
			}
		}
		case 3: {}
		case 3473:
			break;
		default:
			throw `Unsupported formatVersion: ${newChart.formatVersion}`;
	}
	return newChart;
}

function chartp23(pec, filename) {
	class Chart {
		constructor() {
			this.formatVersion = 3;
			this.offset = 0;
			this.numOfNotes = 0;
			this.judgeLineList = [];
		}
		pushLine(judgeLine) {
			this.judgeLineList.push(judgeLine);
			this.numOfNotes += judgeLine.numOfNotes;
			return judgeLine;
		}
	}
	class JudgeLine {
		constructor(bpm) {
			this.numOfNotes = 0;
			this.numOfNotesAbove = 0;
			this.numOfNotesBelow = 0;
			this.bpm = 120;
			this.bpm = bpm;
			("speedEvents,notesAbove,notesBelow,judgeLineDisappearEvents,judgeLineMoveEvents,judgeLineRotateEvents,judgeLineDisappearEventsPec,judgeLineMoveEventsPec,judgeLineRotateEventsPec").split(",").map(i => this[i] = []);
		}
		pushNote(note, pos, isFake) {
			switch (pos) {
				case undefined:
				case 1:
					this.notesAbove.push(note);
					break;
				case 2:
					this.notesBelow.push(note);
					break;
				default:
					this.notesBelow.push(note);
					console.warn("Warning: Illeagal Note Side: " + pos);
			}
			if (!isFake) {
				this.numOfNotes++;
				this.numOfNotesAbove++;
			}
		}
		pushEvent(type, startTime, endTime, n1, n2, n3, n4) {
			const evt = {
				startTime: startTime,
				endTime: endTime,
			}
			if (typeof startTime == 'number' && typeof endTime == 'number' && startTime > endTime) {
				console.warn("Warning: startTime " + startTime + " is larger than endTime " + endTime);
				//return;
			}
			switch (type) {
				case 0:
					evt.value = n1;
					this.speedEvents.push(evt);
					break;
				case 1:
					evt.start = n1;
					evt.end = n2;
					evt.start2 = 0;
					evt.end2 = 0;
					this.judgeLineDisappearEvents.push(evt);
					break;
				case 2:
					evt.start = n1;
					evt.end = n2;
					evt.start2 = n3;
					evt.end2 = n4;
					this.judgeLineMoveEvents.push(evt);
					break;
				case 3:
					evt.start = n1;
					evt.end = n2;
					evt.start2 = 0;
					evt.end2 = 0;
					this.judgeLineRotateEvents.push(evt);
					break;
				case -1:
					evt.value = n1;
					evt.motionType = 1;
					this.judgeLineDisappearEventsPec.push(evt);
					break;
				case -2:
					evt.value = n1;
					evt.value2 = n2;
					evt.motionType = n3;
					this.judgeLineMoveEventsPec.push(evt);
					break;
				case -3:
					evt.value = n1;
					evt.motionType = n2;
					this.judgeLineRotateEventsPec.push(evt);
					break;
				default:
					throw `Unexpected Event Type: ${type}`;
			}
		}
	}
	class Note {
		constructor(type, time, x, holdTime, speed) {
			this.type = type;
			this.time = time;
			this.positionX = x;
			this.holdTime = type == 3 ? holdTime : 0;
			this.speed = isNaN(speed) ? 1 : speed; //???????????????0????????????Number(speed)||1
			//this.floorPosition = time % 1e9 / 104 * 1.2;
		}
	}
	//test start
	const rawChart = pec.match(/[^\n\r ]+/g).map(i => isNaN(i) ? String(i) : Number(i));
	const qwqChart = new Chart();
	const raw = {};
	("bp,n1,n2,n3,n4,cv,cp,cd,ca,cm,cr,cf").split(",").map(i => raw[i] = []);
	const rawarr = [];
	let fuckarr = [1, 1]; //n?????????#???&
	let rawstr = "";
	if (!isNaN(rawChart[0])) qwqChart.offset = (rawChart.shift() / 1e3 - 0.175); //v18x????????????
	for (let i = 0; i < rawChart.length; i++) {
		let p = rawChart[i];
		if (!isNaN(p)) rawarr.push(p);
		else if (p == "#" && rawstr[0] == "n") fuckarr[0] = rawChart[++i];
		else if (p == "&" && rawstr[0] == "n") fuckarr[1] = rawChart[++i];
		else if (raw[p]) pushCommand(p);
		else throw `Unknown Command: ${p}`;
	}
	pushCommand(""); //????????????????????????(bug)
	//??????bpm??????
	if (!raw.bp[0]) raw.bp.push([0, 120]);
	const baseBpm = raw.bp[0][1];
	if (raw.bp[0][0]) raw.bp.unshift([0, baseBpm]);
	const bpmEvents = []; //??????bpm????????????
	let fuckBpm = 0;
	raw.bp.sort((a, b) => a[0] - b[0]).forEach((i, idx, arr) => {
		if (arr[idx + 1] && arr[idx + 1][0] <= 0) return; //????????????
		const start = i[0] < 0 ? 0 : i[0];
		const end = arr[idx + 1] ? arr[idx + 1][0] : 1e9;
		const bpm = i[1];
		bpmEvents.push({
			startTime: start,
			endTime: end,
			bpm: bpm,
			value: fuckBpm
		});
		fuckBpm += (end - start) / bpm;
	});

	function pushCommand(next) {
		if (raw[rawstr]) {
			if (rawstr[0] == "n") {
				rawarr.push(...fuckarr);
				fuckarr = [1, 1];
			}
			raw[rawstr].push(JSON.parse(JSON.stringify(rawarr)));
		}
		rawarr.length = 0;
		rawstr = next;
	}
	//???pec???????????????pgr??????
	function calcTime(timePec) {
		let timePhi = 0;
		for (const i of bpmEvents) {
			if (timePec < i.startTime) break;
			if (timePec > i.endTime) continue;
			timePhi = Math.round(((timePec - i.startTime) / i.bpm + i.value) * baseBpm * 32);
		}
		return timePhi;
	}
	//??????note??????????????????
	let linesPec = [];
	for (const i of raw.n1) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushNote(new Note(1, calcTime(i[1]) + (i[4] ? 1e9 : 0), i[2] * 9 / 1024, 0, i[5]), i[3], i[4]);
		if (i[3] != 1 && i[3] != 2) message.sendWarning(`?????????????????????:${i[3]}(????????????2)\n??????:"n1 ${i.slice(0, 5).join(" ")}"\n??????${filename}`);
		if (i[4]) message.sendWarning(`?????????FakeNote(????????????????????????)\n??????:"n1 ${i.slice(0, 5).join(" ")}"\n??????${filename}`);
		if (i[6] != 1) message.sendWarning(`???????????????Note(????????????????????????)\n??????:"n1 ${i.slice(0, 5).join(" ")} # ${i[5]} & ${i[6]}"\n??????${filename}`);
	} //102.4
	for (const i of raw.n2) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushNote(new Note(3, calcTime(i[1]) + (i[5] ? 1e9 : 0), i[3] * 9 / 1024, calcTime(i[2]) - calcTime(i[1]), i[6]), i[4], i[5]);
		if (i[4] != 1 && i[4] != 2) message.sendWarning(`?????????????????????:${i[4]}(????????????2)\n??????:"n2 ${i.slice(0, 5).join(" ")} # ${i[6]} & ${i[7]}"\n??????${filename}`);
		if (i[5]) message.sendWarning(`?????????FakeNote(????????????????????????)\n??????:"n2 ${i.slice(0, 6).join(" ")}"\n??????${filename}`);
		if (i[7] != 1) message.sendWarning(`???????????????Note(????????????????????????)\n??????:"n2 ${i.slice(0, 5).join(" ")} # ${i[6]} & ${i[7]}"\n??????${filename}`);
	}
	for (const i of raw.n3) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushNote(new Note(4, calcTime(i[1]) + (i[4] ? 1e9 : 0), i[2] * 9 / 1024, 0, i[5]), i[3], i[4]);
		if (i[3] != 1 && i[3] != 2) message.sendWarning(`?????????????????????:${i[3]}(????????????2)\n??????:"n3 ${i.slice(0, 5).join(" ")} # ${i[5]} & ${i[6]}"\n??????${filename}`);
		if (i[4]) message.sendWarning(`?????????FakeNote(????????????????????????)\n??????:"n3 ${i.slice(0, 5).join(" ")}"\n??????${filename}`);
		if (i[6] != 1) message.sendWarning(`???????????????Note(????????????????????????)\n??????:"n3 ${i.slice(0, 5).join(" ")} # ${i[5]} & ${i[6]}"\n??????${filename}`);
	}
	for (const i of raw.n4) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushNote(new Note(2, calcTime(i[1]) + (i[4] ? 1e9 : 0), i[2] * 9 / 1024, 0, i[5]), i[3], i[4]);
		if (i[3] != 1 && i[3] != 2) message.sendWarning(`?????????????????????:${i[3]}(????????????2)\n??????:"n4 ${i.slice(0, 5).join(" ")} # ${i[5]} & ${i[6]}"\n??????${filename}`);
		if (i[4]) message.sendWarning(`?????????FakeNote(????????????????????????)\n??????:"n4 ${i.slice(0, 5).join(" ")}"\n??????${filename}`);
		if (i[6] != 1) message.sendWarning(`???????????????Note(????????????????????????)\n??????:"n4 ${i.slice(0, 5).join(" ")} # ${i[5]} & ${i[6]}"\n??????${filename}`);
	}
	//??????
	for (const i of raw.cv) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(0, calcTime(i[1]), null, i[2] / 7.0); //6.0??
	}
	//????????????
	for (const i of raw.ca) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-1, calcTime(i[1]), calcTime(i[1]), i[2] > 0 ? i[2] / 255 : 0); //????????????alpha?????????
		if (i[2] < 0) message.sendWarning(`???????????????Alpha:${i[2]}(????????????0)\n??????:"ca ${i.join(" ")}"\n??????${filename}`);
	}
	for (const i of raw.cf) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		if (i[1] > i[2]) {
			message.sendWarning(`???????????????????????????????????????(??????????????????)\n??????:"cf ${i.join(" ")}"\n??????${filename}`);
			continue;
		}
		linesPec[i[0]].pushEvent(-1, calcTime(i[1]), calcTime(i[2]), i[3] > 0 ? i[3] / 255 : 0);
		if (i[3] < 0) message.sendWarning(`???????????????Alpha:${i[3]}(????????????0)\n??????:"cf ${i.join(" ")}"\n??????${filename}`);
	}
	//??????
	for (const i of raw.cp) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-2, calcTime(i[1]), calcTime(i[1]), i[2] / 2048, i[3] / 1400, 1);
	}
	for (const i of raw.cm) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		if (i[1] > i[2]) {
			message.sendWarning(`???????????????????????????????????????(??????????????????)\n??????:"cm ${i.join(" ")}"\n??????${filename}`);
			continue;
		}
		linesPec[i[0]].pushEvent(-2, calcTime(i[1]), calcTime(i[2]), i[3] / 2048, i[4] / 1400, i[5]);
		if (i[5] && !tween[i[5]] && i[5] != 1) message.sendWarning(`?????????????????????:${i[5]}(????????????1)\n??????:"cm ${i.join(" ")}"\n??????${filename}`);
	}
	//??????
	for (const i of raw.cd) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		linesPec[i[0]].pushEvent(-3, calcTime(i[1]), calcTime(i[1]), -i[2], 1); //??
	}
	for (const i of raw.cr) {
		if (!linesPec[i[0]]) linesPec[i[0]] = new JudgeLine(baseBpm);
		if (i[1] > i[2]) {
			message.sendWarning(`???????????????????????????????????????(??????????????????)\n??????:"cr ${i.join(" ")}"\n??????${filename}`);
			continue;
		}
		linesPec[i[0]].pushEvent(-3, calcTime(i[1]), calcTime(i[2]), -i[3], i[4]);
		if (i[4] && !tween[i[4]] && i[4] != 1) message.sendWarning(`?????????????????????:${i[4]}(????????????1)\n??????:"cr ${i.join(" ")}"\n??????${filename}`);
	}
	for (const i of linesPec) {
		if (i) {
			i.notesAbove.sort((a, b) => a.time - b.time); //????????????123??????
			i.notesBelow.sort((a, b) => a.time - b.time); //????????????123??????
			let s = i.speedEvents;
			let ldp = i.judgeLineDisappearEventsPec;
			let lmp = i.judgeLineMoveEventsPec;
			let lrp = i.judgeLineRotateEventsPec;
			const srt = (a, b) => (a.startTime - b.startTime) + (a.endTime - b.endTime); //??????????????????????????????
			s.sort(srt); //????????????123??????
			ldp.sort(srt); //????????????123??????
			lmp.sort(srt); //????????????123??????
			lrp.sort(srt); //????????????123??????
			//cv???floorPosition????????????
			let y = 0;
			for (let j = 0; j < s.length; j++) {
				s[j].endTime = j < s.length - 1 ? s[j + 1].startTime : 1e9;
				if (s[j].startTime < 0) s[j].startTime = 0;
				s[j].floorPosition = y;
				y += (s[j].endTime - s[j].startTime) * s[j].value / i.bpm * 1.875;
			}
			for (const j of i.notesAbove) {
				let qwqwq = 0;
				let qwqwq2 = 0;
				let qwqwq3 = 0;
				for (const k of i.speedEvents) {
					if (j.time % 1e9 > k.endTime) continue;
					if (j.time % 1e9 < k.startTime) break;
					qwqwq = k.floorPosition;
					qwqwq2 = k.value;
					qwqwq3 = j.time % 1e9 - k.startTime;
				}
				j.floorPosition = qwqwq + qwqwq2 * qwqwq3 / i.bpm * 1.875;
				if (j.type == 3) j.speed *= qwqwq2;
			}
			for (const j of i.notesBelow) {
				let qwqwq = 0;
				let qwqwq2 = 0;
				let qwqwq3 = 0;
				for (const k of i.speedEvents) {
					if (j.time % 1e9 > k.endTime) continue;
					if (j.time % 1e9 < k.startTime) break;
					qwqwq = k.floorPosition;
					qwqwq2 = k.value;
					qwqwq3 = j.time % 1e9 - k.startTime;
				}
				j.floorPosition = qwqwq + qwqwq2 * qwqwq3 / i.bpm * 1.875;
				if (j.type == 3) j.speed *= qwqwq2;
			}
			//??????motionType
			let ldpTime = 0;
			let ldpValue = 0;
			for (const j of ldp) {
				i.pushEvent(1, ldpTime, j.startTime, ldpValue, ldpValue);
				if (tween[j.motionType]) {
					for (let k = parseInt(j.startTime); k < parseInt(j.endTime); k++) {
						let ptt1 = (k - j.startTime) / (j.endTime - j.startTime);
						let ptt2 = (k + 1 - j.startTime) / (j.endTime - j.startTime);
						let pt1 = j.value - ldpValue;
						i.pushEvent(1, k, k + 1, ldpValue + tween[j.motionType](ptt1) * pt1, ldpValue + tween[j.motionType](ptt2) * pt1);
					}
				} else if (j.motionType) i.pushEvent(1, j.startTime, j.endTime, ldpValue, j.value);
				ldpTime = j.endTime;
				ldpValue = j.value;
			}
			i.pushEvent(1, ldpTime, 1e9, ldpValue, ldpValue);
			//
			let lmpTime = 0;
			let lmpValue = 0;
			let lmpValue2 = 0;
			for (const j of lmp) {
				i.pushEvent(2, lmpTime, j.startTime, lmpValue, lmpValue, lmpValue2, lmpValue2);
				if (tween[j.motionType]) {
					for (let k = parseInt(j.startTime); k < parseInt(j.endTime); k++) {
						let ptt1 = (k - j.startTime) / (j.endTime - j.startTime);
						let ptt2 = (k + 1 - j.startTime) / (j.endTime - j.startTime);
						let pt1 = j.value - lmpValue;
						let pt2 = j.value2 - lmpValue2;
						i.pushEvent(2, k, k + 1, lmpValue + tween[j.motionType](ptt1) * pt1, lmpValue + tween[j.motionType](ptt2) * pt1, lmpValue2 + tween[j.motionType](ptt1) * pt2, lmpValue2 + tween[j.motionType](ptt2) * pt2);
					}
				} else if (j.motionType) i.pushEvent(2, j.startTime, j.endTime, lmpValue, j.value, lmpValue2, j.value2);
				lmpTime = j.endTime;
				lmpValue = j.value;
				lmpValue2 = j.value2;
			}
			i.pushEvent(2, lmpTime, 1e9, lmpValue, lmpValue, lmpValue2, lmpValue2);
			//
			let lrpTime = 0;
			let lrpValue = 0;
			for (const j of lrp) {
				i.pushEvent(3, lrpTime, j.startTime, lrpValue, lrpValue);
				if (tween[j.motionType]) {
					for (let k = parseInt(j.startTime); k < parseInt(j.endTime); k++) {
						let ptt1 = (k - j.startTime) / (j.endTime - j.startTime);
						let ptt2 = (k + 1 - j.startTime) / (j.endTime - j.startTime);
						let pt1 = j.value - lrpValue;
						i.pushEvent(3, k, k + 1, lrpValue + tween[j.motionType](ptt1) * pt1, lrpValue + tween[j.motionType](ptt2) * pt1);
					}
				} else if (j.motionType) i.pushEvent(3, j.startTime, j.endTime, lrpValue, j.value);
				lrpTime = j.endTime;
				lrpValue = j.value;
			}
			i.pushEvent(3, lrpTime, 1e9, lrpValue, lrpValue);
			qwqChart.pushLine(i);
		}
	}
	return JSON.parse(JSON.stringify(qwqChart));
}
const tween = [null, null,
	pos => Math.sin(pos * Math.PI / 2), //2
	pos => 1 - Math.cos(pos * Math.PI / 2), //3
	pos => 1 - (pos - 1) ** 2, //4
	pos => pos ** 2, //5
	pos => (1 - Math.cos(pos * Math.PI)) / 2, //6
	pos => ((pos *= 2) < 1 ? pos ** 2 : -((pos - 2) ** 2 - 2)) / 2, //7
	pos => 1 + (pos - 1) ** 3, //8
	pos => pos ** 3, //9
	pos => 1 - (pos - 1) ** 4, //10
	pos => pos ** 4, //11
	pos => ((pos *= 2) < 1 ? pos ** 3 : ((pos - 2) ** 3 + 2)) / 2, //12
	pos => ((pos *= 2) < 1 ? pos ** 4 : -((pos - 2) ** 4 - 2)) / 2, //13
	pos => 1 + (pos - 1) ** 5, //14
	pos => pos ** 5, //15
	pos => 1 - 2 ** (-10 * pos), //16
	pos => 2 ** (10 * (pos - 1)), //17
	pos => Math.sqrt(1 - (pos - 1) ** 2), //18
	pos => 1 - Math.sqrt(1 - pos ** 2), //19
	pos => (2.70158 * pos - 1) * (pos - 1) ** 2 + 1, //20
	pos => (2.70158 * pos - 1.70158) * pos ** 2, //21
	pos => ((pos *= 2) < 1 ? (1 - Math.sqrt(1 - pos ** 2)) : (Math.sqrt(1 - (pos - 2) ** 2) + 1)) / 2, //22
	pos => pos < 0.5 ? (14.379638 * pos - 5.189819) * pos ** 2 : (14.379638 * pos - 9.189819) * (pos - 1) ** 2 + 1, //23
	pos => 1 - 2 ** (-10 * pos) * Math.cos(pos * Math.PI / .15), //24
	pos => 2 ** (10 * (pos - 1)) * Math.cos((pos - 1) * Math.PI / .15), //25
	pos => ((pos *= 11) < 4 ? pos ** 2 : pos < 8 ? (pos - 6) ** 2 + 12 : pos < 10 ? (pos - 9) ** 2 + 15 : (pos - 10.5) ** 2 + 15.75) / 16, //26
	pos => 1 - tween[26](1 - pos), //27
	pos => (pos *= 2) < 1 ? tween[26](pos) / 2 : tween[27](pos - 1) / 2 + .5, //28
	pos => pos < 0.5 ? 2 ** (20 * pos - 11) * Math.sin((160 * pos + 1) * Math.PI / 18) : 1 - 2 ** (9 - 20 * pos) * Math.sin((160 * pos + 1) * Math.PI / 18) //29
];
//??????json
function chartify(json) {
	let newChart = {};
	newChart.formatVersion = 3;
	newChart.offset = json.offset;
	newChart.numOfNotes = json.numOfNotes;
	newChart.judgeLineList = [];
	for (const i of json.judgeLineList) {
		let newLine = {};
		newLine.numOfNotes = i.numOfNotes;
		newLine.numOfNotesAbove = i.numOfNotesAbove;
		newLine.numOfNotesBelow = i.numOfNotesBelow;
		newLine.bpm = i.bpm;
		("speedEvents,notesAbove,notesBelow,judgeLineDisappearEvents,judgeLineMoveEvents,judgeLineRotateEvents").split(",").map(i => newLine[i] = []);
		for (const j of i.speedEvents) {
			if (j.startTime == j.endTime) continue;
			let newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.value = Number(j.value.toFixed(6));
			newEvent.floorPosition = Number(j.floorPosition.toFixed(6));
			newLine.speedEvents.push(newEvent);
		}
		for (const j of i.notesAbove) {
			let newNote = {};
			newNote.type = j.type;
			newNote.time = j.time;
			newNote.positionX = Number(j.positionX.toFixed(6));
			newNote.holdTime = j.holdTime;
			newNote.speed = Number(j.speed.toFixed(6));
			newNote.floorPosition = Number(j.floorPosition.toFixed(6));
			newLine.notesAbove.push(newNote);
		}
		for (const j of i.notesBelow) {
			let newNote = {};
			newNote.type = j.type;
			newNote.time = j.time;
			newNote.positionX = Number(j.positionX.toFixed(6));
			newNote.holdTime = j.holdTime;
			newNote.speed = Number(j.speed.toFixed(6));
			newNote.floorPosition = Number(j.floorPosition.toFixed(6));
			newLine.notesBelow.push(newNote);
		}
		for (const j of i.judgeLineDisappearEvents) {
			if (j.startTime == j.endTime) continue;
			let newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.start = Number(j.start.toFixed(6));
			newEvent.end = Number(j.end.toFixed(6));
			newEvent.start2 = Number(j.start2.toFixed(6));
			newEvent.end2 = Number(j.end2.toFixed(6));
			newLine.judgeLineDisappearEvents.push(newEvent);
		}
		for (const j of i.judgeLineMoveEvents) {
			if (j.startTime == j.endTime) continue;
			let newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.start = Number(j.start.toFixed(6));
			newEvent.end = Number(j.end.toFixed(6));
			newEvent.start2 = Number(j.start2.toFixed(6));
			newEvent.end2 = Number(j.end2.toFixed(6));
			newLine.judgeLineMoveEvents.push(newEvent);
		}
		for (const j of i.judgeLineRotateEvents) {
			if (j.startTime == j.endTime) continue;
			let newEvent = {};
			newEvent.startTime = j.startTime;
			newEvent.endTime = j.endTime;
			newEvent.start = Number(j.start.toFixed(6));
			newEvent.end = Number(j.end.toFixed(6));
			newEvent.start2 = Number(j.start2.toFixed(6));
			newEvent.end2 = Number(j.end2.toFixed(6));
			newLine.judgeLineRotateEvents.push(newEvent);
		}
		newChart.judgeLineList.push(newLine);
	}
	return newChart;
}
//?????????????????????????????????
function adjustSize(source, dest, scale) {
	const [sw, sh, dw, dh] = [source.width, source.height, dest.width, dest.height];
	if (dw * sh > dh * sw) return [dw * (1 - scale) / 2, (dh - dw * sh / sw * scale) / 2, dw * scale, dw * sh / sw * scale];
	return [(dw - dh * sw / sh * scale) / 2, dh * (1 - scale) / 2, dh * sw / sh * scale, dh * scale];
}
//???????????????
function imgShader(img, color) {
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	const imgData = ctx.getImageData(0, 0, img.width, img.height);
	const data = hex2rgba(color);
	for (let i = 0; i < imgData.data.length / 4; i++) {
		imgData.data[i * 4] *= data[0] / 255;
		imgData.data[i * 4 + 1] *= data[1] / 255;
		imgData.data[i * 4 + 2] *= data[2] / 255;
		imgData.data[i * 4 + 3] *= data[3] / 255;
	}
	return imgData;
}
//????????????
function imgFlip(a, b, c, d, e, f) {
	switch (selectflip.value) {
		case "br":
			return [a, b, c, d, e, f];
		case "bl":
			return [a, -b, -c, d, canvasos.width - e, f];
		case "tr":
			return [-a, b, c, -d, e, canvasos.height - f];
		case "tl":
			return [-a, -b, -c, -d, canvasos.width - e, canvasos.height - f];
		default:
			throw new Error("Flip Error");
	}
}

function imgBlur(img) {
	const canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	const ctx = canvas.getContext("2d");
	ctx.drawImage(img, 0, 0);
	return StackBlur.imageDataRGB(ctx.getImageData(0, 0, img.width, img.height), 0, 0, img.width, img.height, Math.ceil(Math.min(img.width, img.height) * 0.1));
}
//????????????color???rgba??????
function hex2rgba(color) {
	const ctx = document.createElement("canvas").getContext("2d");
	ctx.fillStyle = color;
	ctx.fillRect(0, 0, 1, 1);
	return ctx.getImageData(0, 0, 1, 1).data;
}
//rgba??????(0-1)???????????????
function rgba2hex(...rgba) {
	return "#" + rgba.map(i => ("00" + Math.round(Number(i) * 255 || 0).toString(16)).slice(-2)).join("");
}
//??????csv
function csv2array(data, isObject) {
	const strarr = data.replace(/\r/g, "").split("\n");
	const col = [];
	for (const i of strarr) {
		let rowstr = "";
		let isQuot = false;
		let beforeQuot = false;
		const row = [];
		for (const j of i) {
			if (j == '"') {
				if (!isQuot) isQuot = true;
				else if (beforeQuot) {
					rowstr += j;
					beforeQuot = false;
				} else beforeQuot = true;
			} else if (j == ',') {
				if (!isQuot) {
					row.push(rowstr);
					rowstr = "";
				} else if (beforeQuot) {
					row.push(rowstr);
					rowstr = "";
					isQuot = false;
					beforeQuot = false;
				} else rowstr += j;
			} else if (!beforeQuot) rowstr += j;
			else throw "Error 1";
		}
		if (!isQuot) {
			row.push(rowstr);
			rowstr = "";
		} else if (beforeQuot) {
			row.push(rowstr);
			rowstr = "";
			isQuot = false;
			beforeQuot = false;
		} else throw "Error 2";
		col.push(row);
	}
	if (!isObject) return col;
	const qwq = [];
	for (let i = 1; i < col.length; i++) {
		const obj = {};
		for (let j = 0; j < col[0].length; j++) obj[col[0][j]] = col[i][j];
		qwq.push(obj);
	}
	return qwq;
}