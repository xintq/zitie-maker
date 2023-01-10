(function() {
    'use strict';

    class Config {
        static ModuleType = 1;
        static FontName = "楷体";
        static Title = "田字格生成器";
        static Content = "白日依山尽黄河入海流";
        static ZgType = "1";
        static ZgColor = "1";
        static FontTransparent = "1";
        static FontColor = `rgba(224, 6, 6)`;
        static FontSolid = 1;

        static GetFontColor() {
            return `rgba(${Config.FontColor}, ${Config.FontTransparent})`;
        }

        static GetTransparentFont() {
            return `rgba(${Config.FontColor}, 0)`;
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
                value: 0.5,
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

        onSettingConfirmed() {
            let inputContent = Config.Content;
            let ulPrintContent = document.getElementById("printContent");
            ulPrintContent.innerHTML = '';
            let h3Title = document.createElement('h3');
            // style="text-align:center;"
            // h3Title.setAttribute('style', "text-align:center;");
            h3Title.style.cssText = "text-align:center;"
            h3Title.textContent = Config.Title;
            ulPrintContent.append(h3Title);

            for (let i = 0; i < inputContent.length; i++) {
                let curChar = inputContent[i];
                if (!this.isChinese(curChar)) {
                    continue;
                }
                this.addTeachLine(ulPrintContent, curChar);
                this.addHanziLine(ulPrintContent, curChar);
            }
            if (inputContent.length < 10) {
                for (let i = 0; i < 10 - inputContent.length; i++) {
                    let curChar = '一'; //没用的占位字符，保证字体设置生效
                    this.addTeachLine(ulPrintContent, curChar, true);
                    this.addHanziLine(ulPrintContent, curChar, true);
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

        addTeachLine(ulPrintContent, curChar, isForceTransparentColor=false) {
            let liTeach = document.createElement('li');
            liTeach.className = 'teach-line';
            // liTeach.style.cssText = "background: url(img/xb" + Config.ZgColor + ".svg) left center repeat-x;";

            let liTeachHz = document.createElement('span');
            liTeachHz.className = 'teach-line-hz';
            liTeachHz.textContent = curChar;

            let liTeachPy = document.createElement('span');
            liTeachPy.className = 'teach-line-py';
            liTeachPy.textContent = pinyinUtil.getPinyin(curChar, ' ', true, false);
            if (isForceTransparentColor) { // 如果指定了字体颜色，则用指定颜色
                // liTeachPy.style.setProperty("color", Config.GetTransparentFont());
                liTeachPy.style.setProperty("-webkit-text-stroke", `2px ${Config.GetTransparentFont()}`);
                liTeachHz.style.setProperty("-webkit-text-stroke", `2px ${Config.GetTransparentFont()}`);
                liTeachPy.style.setProperty("color", 'transparent');
                liTeachHz.style.setProperty("color", 'transparent');
            }
            liTeach.appendChild(liTeachHz);
            liTeach.appendChild(liTeachPy);


            HanziWriter.loadCharacterData(curChar).then(function(charData) {
                // console.log(charData);
                for (var i = 0; i < charData.strokes.length; i++) {
                    let liTeachBs = document.createElement('span');
                    liTeachBs.className = 'teach-line-bs';
                    if (isForceTransparentColor) { // 如果指定了字体颜色，则用指定颜色
                        // liTeachPy.style.setProperty("color", Config.GetTransparentFont());
                        liTeachBs.style.setProperty("-webkit-text-stroke", `2px ${Config.GetTransparentFont()}`);
                        liTeachBs.style.setProperty("color", 'transparent');
                    }
                    liTeach.appendChild(liTeachBs);
                    var strokesPortion = charData.strokes.slice(0, i + 1);
                    this.renderFanningStrokes(liTeachBs, strokesPortion, isForceTransparentColor);
                }
            }.bind(this));

            ulPrintContent.append(liTeach)
        }

        addHanziLine(ulPrintContent, curChar, isForceTransparentColor=false) {
            let hzLine = document.createElement("li");
            const doubleWidthSpace = '　'; //全角空格，保证字体设置生效
            let fontColor = Config.GetFontColor();
            hzLine.className = 'hz-line';
            for (let n = 0; n < 12; ++n) { //一行12个字
                let hzSpan = document.createElement("span");
                if (Config.ModuleType == 3 && n > 2) {
                    //一字三描红：从第四个字开始设置字体为全透明
                    // hzSpan.innerText = doubleWidthSpace;
                    fontColor = Config.GetTransparentFont();
                } else if (Config.ModuleType == 4) {
                    //隔字描红:设置偶数字体为全透明
                    // hzSpan.innerText = n % 2 == 0 ? curChar : doubleWidthSpace;
                    fontColor = n % 2 == 0 ? Config.GetFontColor() : Config.GetTransparentFont();
                } else if (Config.ModuleType == 6) {
                    // 空行
                    fontColor = Config.GetTransparentFont();
                } else {
                    // 正常输入
                    fontColor = Config.GetFontColor();
                }
                if (isForceTransparentColor) {
                    fontColor = Config.GetTransparentFont();
                }
                hzSpan.innerText = curChar;
                hzSpan.style.cssText = "background: url(img/bg" + Config.ZgType + Config.ZgColor + ".svg); ";
                if (Config.FontSolid == 0) {
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
        window.main.setOptionChecked("fontSolid", Config.FontSolid || "1");
        window.main.settingPage.onUpdateConfig();
        window.main.printPage.onSettingConfirmed();

        // slider = $("#mhColor").slider()
    };
}());