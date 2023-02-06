(function() {
    'use strict';
    const MODULE_TYPES = {
        SZ_MH: 1, // 首字+描红
        SZ_MH_KH: 2, // 首字+描红+空行
        SZ_3MH: 3, // 首字+三描红
        GZ_MH: 4, // 隔字描红
        ZH_MH: 5, // 整行描红
        KH: 6, // 空行
        BS_GZ_MH: 7, // 笔顺+隔字描红
        BS_ZH_MH: 8, // 笔顺+整行描红
    };
    const FOND_RENDER_TYPE = {
        SOLID: '1', //实心
        HOLLOW: '0', //空心
    }

    class Config {
        static ModuleType = MODULE_TYPES.SZ_MH;
        static FontName = "楷体";
        static Title = "田字格生成器";
        static Content = "白日依山尽黄河入海流";
        static ZgType = "1";
        static ZgColor = "1";
        static FontTransparent = "1";
        static FontColor = `rgba(224, 6, 6)`;
        static FontSolid = FOND_RENDER_TYPE.SOLID;

        static GetFontColor() {
            return `rgba(${Config.FontColor}, ${Config.FontTransparent})`;
        }

        static GetTransparentFontColor() {
            return `rgba(${Config.FontColor}, 0)`;
        }

        static GetNonTransparentFontColor() {
            return `rgba(${Config.FontColor}, 1)`;
        }

        static saveToStorage() {
            window.localStorage.setItem("ModuleType", Config.ModuleType);
            window.localStorage.setItem("FontName", Config.FontName);
            window.localStorage.setItem("Title", Config.Title);
            window.localStorage.setItem("Content", Config.Content);
            window.localStorage.setItem("ZgType", Config.ZgType);
            window.localStorage.setItem("ZgColor", Config.ZgColor);
            window.localStorage.setItem("FontTransparent", Config.FontTransparent);
            window.localStorage.setItem("FontColor", Config.FontColor);
            window.localStorage.setItem("FontSolid", Config.FontSolid);
        }

        static loadFromStorage() {
            Config.ModuleType = window.localStorage.getItem("ModuleType") || Config.ModuleType;
            Config.FontName = window.localStorage.getItem("FontName") || Config.FontName;
            Config.Title = window.localStorage.getItem("Title") || Config.Title;
            Config.Content = window.localStorage.getItem("Content") || Config.Content;
            Config.ZgType = window.localStorage.getItem("ZgType") || Config.ZgType;
            Config.ZgColor = window.localStorage.getItem("ZgColor") || Config.ZgColor;
            Config.FontTransparent = window.localStorage.getItem("FontTransparent") || Config.FontTransparent;
            Config.FontColor = window.localStorage.getItem("FontColor") || Config.FontColor;
            Config.FontSolid = window.localStorage.getItem("FontSolid") || Config.FontSolid;
        }
    }

    class SettingPage {
        divSetting;

        divOverlay;
        divContent;
        mySlider;

        constructor() {
            this.divSetting = document.getElementById("setting");
            this.btnSetting = this.divSetting.querySelector("#btnSetting");
            this.divOverlay = this.divSetting.querySelector("#overlay");
            this.divContent = this.divSetting.querySelector("#content");

            this.divOverlay.style.display = "block";

            this.btnSetting.onclick = this.onShowOverlay.bind(this);
            this.divOverlay.onclick = this.onHideOverlay.bind(this);

            this.mySlider = new Slider("#mhColor", {
                // initial options object
                tooltip: 'show',
                min: 0,
                max: 1,
                step: 0.1,
                value: 0.3,
                formatter: function(value) {
                    if (value == 0) {
                        return "无" + value
                    } else if (value == 0.2) {
                        return "浅" + value
                    } else if (value == 0.5) {
                        return "适中" + value
                    } else if (value == 0.9) {
                        return "深" + value
                    } else if (value == 1) {
                        return "很深" + value
                    } else {
                        return "深度" + value;
                    }
                }
            });
            this.mySlider.on("change", function(event) {
                this.onSettingConfirmed(false);
            }.bind(this));

            $('input[type=radio]').on("change", function(event) {
                this.onSettingConfirmed(false);
            }.bind(this));

            document.getElementById("btnConfirm").onclick = this.onSettingConfirmed.bind(this);
        }

        onShowOverlay(event) {
            this.divOverlay.style.display = "block";
            this.btnSetting.style.display = "none";
        }

        onHideOverlay(event) {
            if (!this.divContent.contains(event.target)) {
                this.divOverlay.style.display = "none";
                this.btnSetting.style.display = "block";
            }
        }

        onSettingConfirmed(hide = true) {
            this.onUpdateConfig();
            Config.saveToStorage();

            window.main.printPage.onSettingConfirmed();
            if (hide) {
                this.divOverlay.style.display = "none";
                this.btnSetting.style.display = "block";
            }
        }


        getOptionElementValue(eleName) {
            let elements = document.getElementsByName(eleName);
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].checked == true) {
                    return elements[i].value;
                }
            }
        }

        onUpdateConfig() {
            Config.ModuleType = Number(this.getOptionElementValue("modelType"));
            Config.FontName = document.getElementById("fontType").value;
            Config.Content = document.getElementById("inputContent").value;
            Config.Title = document.getElementById("inputTitle").value;
            Config.ZgType = (this.getOptionElementValue("zgType"));
            Config.ZgColor = (this.getOptionElementValue("zgColor"));
            Config.FontColor = (this.getOptionElementValue("fontColor"));
            Config.FontSolid = (this.getOptionElementValue("fontSolid"));
            Config.FontTransparent = this.mySlider.getValue();
        }
    }

    class PrintPage {
        btnSetting;
        constructor() {

        }

        isChinese(temp) {
            var re = /[^\u4E00-\u9FA5]/;
            if (re.test(temp)) return false;
            return true;
        }

        async onSettingConfirmed() {
            let inputContent = Config.Content;
            let ulPrintContent = document.getElementById("printContent");
            ulPrintContent.innerHTML = '';
            let h3Title = document.createElement('h3');
            // style="text-align:center;"
            // h3Title.setAttribute('style', "text-align:center;");
            h3Title.style.cssText = `text-align:center;font-family:${Config.FontName}`;
            h3Title.textContent = Config.Title;
            ulPrintContent.append(h3Title);

            let validCharCount = 0; // 统计有效字符数
            for (let i = 0; i < inputContent.length; i++) {
                let curChar = inputContent[i];
                if (!this.isChinese(curChar)) {
                    continue;
                }
                validCharCount++;
                let strokes = await this.addTeachLine(ulPrintContent, curChar, false, `${validCharCount} `);
                this.addHanziLine(ulPrintContent, curChar, false, strokes);

                // 首字描红+空行的话，本页剩下的行全部透明
                if (Config.ModuleType == MODULE_TYPES.SZ_MH_KH) {
                    //加空行
                    await this.addTeachLine(ulPrintContent, curChar, true);
                    this.addHanziLine(ulPrintContent, curChar, true);
                }

                // 分页处理：默认一字一行，一页十行
                let validCharLineSetPerPage = 10;
                if (Config.ModuleType == MODULE_TYPES.BS_GZ_MH || Config.ModuleType == MODULE_TYPES.BS_ZH_MH) {
                    // 有笔顺描红的话，每6个字后，强制分页
                    validCharLineSetPerPage = 6;
                }

                // 分页：如果是最后一个字之后的话，不再输出分页
                if (validCharCount > 0 && (validCharCount % validCharLineSetPerPage) == 0 && i != inputContent.length - 1) {
                    let pageBreaker = document.createElement('li');
                    pageBreaker.className = 'page-breaker';
                    ulPrintContent.append(pageBreaker);
                    // 填充空白标题头，保证每页的大小一致
                    let h3Title = document.createElement('h3');
                    h3Title.style.cssText = `text-align:center;font-family:${Config.FontName}`;
                    h3Title.textContent = ' ';
                    ulPrintContent.append(h3Title);
                }
            }
            if (Config.ModuleType != MODULE_TYPES.BS_GZ_MH && Config.ModuleType != MODULE_TYPES.BS_ZH_MH) {
                // 不输出笔顺的情况下，补足空白行
                if (validCharCount < 10 ) { // 行数不够10行，空白行凑齐
                    for (let i = 0; i < 10 - validCharCount; i++) {
                        let curChar = '一'; //没用的占位字符，保证字体设置生效
                        await this.addTeachLine(ulPrintContent, curChar, true);
                        this.addHanziLine(ulPrintContent, curChar, true);
                    }
                }
            }
        }

        renderFanningStrokes(target, strokes, isForceTransparentColor=false) {
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.width = '25';
            svg.style.height = '25';
            // svg.style.border = '1px solid #EEE'
            // svg.style.marginRight = '3px'
            target.appendChild(svg);
            var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            // set the transform property on the g element so the character renders at 75x75
            var transformData = HanziWriter.getScalingTransform(25, 25);
            group.setAttributeNS(null, 'transform', transformData.transform);
            svg.appendChild(group);

            strokes.forEach(function(strokePath) {
                var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttributeNS(null, 'd', strokePath);
                path.setAttribute('stroke-width', "0");
                // style the character paths
                path.style = 'fill:rgb(152,15,41);stroke:rgb(152,15,41);';
                if (isForceTransparentColor) {
                    path.style = 'fill:rgb(152,15,41, 0);stroke:rgb(152,15,41, 0);';
                }
                group.appendChild(path);
            }.bind(this));
        }
        /**
         * 在练习行显示笔顺
         * @param {*} target 练习行dom
         * @param {*} strokes 笔顺数组
         * @param {*} strokeColor 笔顺颜色
         * @param {*} isSolidStroke 笔顺虚实标记
         */
        renderHzStrokes(target, strokes, strokeColor='#555', isSolidStroke=FOND_RENDER_TYPE.SOLID) {
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.style.width = '75px';
            svg.style.height = '75px';
            svg.style.border = 'transparent'
            // svg.style.marginRight = '5px'
            svg.style.marginLeft = '10px';
            svg.style.marginTop = '10px';
            target.appendChild(svg);
            var group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

            // set the transform property on the g element so the character renders at 75x75
            var transformData = HanziWriter.getScalingTransform(58, 58);
            group.setAttributeNS(null, 'transform', transformData.transform);
            svg.appendChild(group);

            strokes.forEach(function (strokePath) {
                var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttributeNS(null, 'd', strokePath);
                path.setAttribute('stroke-width', "0");
                if (isSolidStroke === FOND_RENDER_TYPE.SOLID) {
                    path.setAttribute('fill', strokeColor);
                } else {
                    // 空心字效果
                    path.setAttribute('fill', 'transparent');
                    path.setAttribute('stroke', strokeColor);
                    path.setAttribute('stroke-width', '30');
                }
                group.appendChild(path);
            }.bind(this));
        }

        /**
         * 添加教学行： 汉字+拼音+笔顺
         * @param {*} ulPrintContent 添加到哪个dom上
         * @param {*} curChar 汉字
         * @param {*} isForceTransparentColor 是否透明，默认不透明，如果透明的话，就是空白行
         * @returns 汉字笔顺
         */
        async addTeachLine(ulPrintContent, curChar, isForceTransparentColor=false, preffix='') {
            let liTeach = document.createElement('li');
            liTeach.className = 'teach-line';
            // liTeach.style.cssText = "background: url(img/xb" + Config.ZgColor + ".svg) left center repeat-x;";
            if (preffix.length > 0) {
                let liTeachPreffix = document.createElement('span');
                liTeachPreffix.className = 'teach-line';
                liTeachPreffix.textContent = `${preffix}`;
                liTeach.appendChild(liTeachPreffix); // 前缀
            }

            let liTeachHz = document.createElement('span');
            liTeachHz.className = 'teach-line-hz';
            liTeachHz.textContent = curChar;

            let liTeachPy = document.createElement('span');
            liTeachPy.className = 'teach-line-py';
            liTeachPy.textContent = pinyinUtil.getPinyin(curChar, ' ', true, false);
            if (isForceTransparentColor) { // 如果指定了字体颜色，则用指定颜色
                // liTeachPy.style.setProperty("color", Config.GetTransparentFontColor());
                liTeachPy.style.setProperty("-webkit-text-stroke", `2px ${Config.GetTransparentFontColor()}`);
                liTeachHz.style.setProperty("-webkit-text-stroke", `2px ${Config.GetTransparentFontColor()}`);
                liTeachPy.style.setProperty("color", 'transparent');
                liTeachHz.style.setProperty("color", 'transparent');
            }
            liTeach.appendChild(liTeachHz); // 汉字
            liTeach.appendChild(liTeachPy); // 拼音

            let strokes = []; // 笔顺数组
            try {
                let charData = await HanziWriter.loadCharacterData(curChar);
                strokes = charData.strokes;
                for (let i = 0; i < charData.strokes.length; i++) {
                    // 获取笔顺
                    let liTeachBs = document.createElement('span');
                    liTeachBs.className = 'teach-line-bs';
                    if (isForceTransparentColor) { // 如果指定了字体颜色，则用指定颜色
                        // liTeachPy.style.setProperty("color", Config.GetTransparentFont());
                        liTeachBs.style.setProperty("-webkit-text-stroke", `2px ${Config.GetTransparentFontColor()}`);
                        liTeachBs.style.setProperty("color", 'transparent');
                    }
                    liTeach.appendChild(liTeachBs); // 笔顺
                    let strokesPortion = charData.strokes.slice(0, i + 1);
                    this.renderFanningStrokes(liTeachBs, strokesPortion, isForceTransparentColor);
                }
            } catch (err) {
                console.log(err);
            }

            // HanziWriter.loadCharacterData(curChar).then(function(charData) {
            //     for (let i = 0; i < charData.strokes.length; i++) {
            //         // 获取笔顺
            //         let liTeachBs = document.createElement('span');
            //         liTeachBs.className = 'teach-line-bs';
            //         if (isForceTransparentColor) { // 如果指定了字体颜色，则用指定颜色
            //             // liTeachPy.style.setProperty("color", Config.GetTransparentFont());
            //             liTeachBs.style.setProperty("-webkit-text-stroke", `2px ${Config.GetTransparentFontColor()}`);
            //             liTeachBs.style.setProperty("color", 'transparent');
            //         }
            //         liTeach.appendChild(liTeachBs); // 笔顺
            //         let strokesPortion = charData.strokes.slice(0, i + 1);
            //         this.renderFanningStrokes(liTeachBs, strokesPortion, isForceTransparentColor);
            //     }
            // }.bind(this)).catch(err => {
            //     console.log(err);
            // });

            ulPrintContent.append(liTeach)

            return strokes;
        }

        /**
         * 添加练习行
         * @param {*} ulPrintContent 练习行dom
         * @param {*} curChar 汉字
         * @param {*} isForceTransparentColor 是否透明，默认不透明，如果透明的话，就是空白行
         * @param {*} strokes 汉字的笔顺，默认为空，表示不显示笔顺
         */
        addHanziLine(ulPrintContent, curChar, isForceTransparentColor=false, strokes=[]) {
            let hzLine = document.createElement("li");
            let fontColor = Config.GetFontColor();
            let fontSolid = Config.FontSolid;
            hzLine.className = 'hz-line';
            let strokesDone = false;
            let total_hz_perline = 12; //一行12个字
            if (Config.ModuleType == MODULE_TYPES.BS_GZ_MH || Config.ModuleType == MODULE_TYPES.BS_ZH_MH) {
                // 如果有笔顺练习的话，汉字个数需要除去笔顺的个数
                total_hz_perline = total_hz_perline - strokes.length + total_hz_perline + 1;
            }
            for (let n = 0; n < total_hz_perline; ++n) { 
                let hzSpan = document.createElement("span");
                if (Config.ModuleType == MODULE_TYPES.SZ_3MH) {
                    //首字+三描红：从第四个字开始设置字体为全透明
                    // hzSpan.innerText = doubleWidthSpace;
                    if (n == 0) {
                        fontSolid = FOND_RENDER_TYPE.SOLID;
                        fontColor = Config.GetNonTransparentFontColor();
                    } else if (n < 4){
                        fontSolid = Config.FontSolid;
                        fontColor = Config.GetFontColor();
                    } else {
                        fontColor = Config.GetTransparentFontColor();
                    }
                } else if (Config.ModuleType == MODULE_TYPES.GZ_MH) {
                    //隔字描红:设置偶数字体为全透明
                    // hzSpan.innerText = n % 2 == 0 ? curChar : doubleWidthSpace;
                    fontColor = n % 2 == 0 ? Config.GetFontColor() : Config.GetTransparentFontColor();
                } else if (Config.ModuleType == MODULE_TYPES.KH) {
                    // 空行
                    fontColor = Config.GetTransparentFontColor();
                } else if (Config.ModuleType == MODULE_TYPES.SZ_MH || Config.ModuleType == MODULE_TYPES.SZ_MH_KH) {
                    // 1 - 首字+描红: 首字实心，全黑
                    // 2 - 首字+描红+空行
                    if (n == 0) {
                        fontSolid = FOND_RENDER_TYPE.SOLID;
                        fontColor = Config.GetNonTransparentFontColor();
                    } else {
                        fontSolid = Config.FontSolid;
                        fontColor = Config.GetFontColor();
                    }
                } else {
                    // 其他
                    fontColor = Config.GetFontColor();
                }
                if (isForceTransparentColor) {
                    fontColor = Config.GetTransparentFontColor();
                }
                if (Config.ModuleType == MODULE_TYPES.BS_GZ_MH || Config.ModuleType == MODULE_TYPES.BS_ZH_MH) {
                    // this.renderHzStrokes(hzSpan, strokes);
                    if (!strokesDone) {
                        // 输出笔顺部分
                        for (let i = 0; i < strokes.length; i++) {
                            // 获取笔顺
                            let bsSpan = document.createElement('span');
                            bsSpan.style.cssText = "background: url(img/bg" + Config.ZgType + Config.ZgColor + ".svg); ";
                            if (fontSolid == FOND_RENDER_TYPE.HOLLOW) {
                                // 空心字
                                // -webkit-text-stroke: 2px #C73A14;
                                bsSpan.style.setProperty("-webkit-text-stroke", `2px ${fontColor}`);
                                bsSpan.style.setProperty("color", 'transparent');
                            } else {
                                // 实心字
                                bsSpan.style.setProperty("color", fontColor);
                            }
                            bsSpan.style.setProperty("font-family", Config.FontName);

                            if (isForceTransparentColor) { // 如果指定了字体颜色，则用指定颜色
                                bsSpan.style.setProperty("-webkit-text-stroke", `2px ${Config.GetTransparentFontColor()}`);
                                bsSpan.style.setProperty("color", 'transparent');
                            }
                            hzLine.appendChild(bsSpan); // 笔顺
                            let strokesPortion = strokes.slice(0, i + 1);
                            this.renderHzStrokes(bsSpan, strokesPortion, fontColor, fontSolid);
                        }
                        strokesDone = true;
                    } else {
                        if (Config.ModuleType == MODULE_TYPES.BS_GZ_MH) {
                            fontColor = n % 2 == 0 ? Config.GetFontColor() : Config.GetTransparentFontColor();
                        }
                        hzSpan.innerText = curChar;
                        hzSpan.style.cssText = "background: url(img/bg" + Config.ZgType + Config.ZgColor + ".svg); ";
                        if (fontSolid == FOND_RENDER_TYPE.HOLLOW) {
                            // 空心字
                            // -webkit-text-stroke: 2px #C73A14;
                            hzSpan.style.setProperty("-webkit-text-stroke", `2px ${fontColor}`);
                            hzSpan.style.setProperty("color", 'transparent');
                        } else {
                            // 实心字
                            hzSpan.style.setProperty("color", fontColor);
                        }
                        hzSpan.style.setProperty("font-family", Config.FontName);
                        hzLine.appendChild(hzSpan)
                    }
                } else {
                    hzSpan.innerText = curChar;
                    hzSpan.style.cssText = "background: url(img/bg" + Config.ZgType + Config.ZgColor + ".svg); ";
                    if (fontSolid == FOND_RENDER_TYPE.HOLLOW) {
                        // 空心字
                        // -webkit-text-stroke: 2px #C73A14;
                        hzSpan.style.setProperty("-webkit-text-stroke", `2px ${fontColor}`);
                        hzSpan.style.setProperty("color", 'transparent');
                    } else {
                        // 实心字
                        hzSpan.style.setProperty("color", fontColor);
                    }
                    hzSpan.style.setProperty("font-family", Config.FontName);

                    hzLine.appendChild(hzSpan)
                }
            }
            ulPrintContent.appendChild(hzLine)
        }
    }

    class Main {
        settingPage;
        printPage;

        constructor() {
            this.printPage = new PrintPage();
            this.settingPage = new SettingPage();
        }

        setOptionChecked(optionName, value) {
            let ops = document.getElementsByName(optionName);
            ops.forEach(item => {
                if (item.value == value) {
                    item.setAttribute("checked", "");
                } else {
                    item.removeAttribute("checked");
                }
            });
        }
    }

    window.onload = (event) => {
        Config.loadFromStorage();
        window.main = new Main();
        window.main.setOptionChecked("zgType", Config.ZgType || 1);
        window.main.setOptionChecked("zgColor", Config.ZgColor || 1);
        window.main.setOptionChecked("fontColor", Config.FontColor || "#FFB8B8");

        window.main.setOptionChecked("mhColor", Config.FontTransparent || "0.3");
        window.main.setOptionChecked("fontSolid", Config.FontSolid || FOND_RENDER_TYPE.SOLID);
        window.main.settingPage.onUpdateConfig();
        window.main.printPage.onSettingConfirmed();

        // slider = $("#mhColor").slider()
    };
}());