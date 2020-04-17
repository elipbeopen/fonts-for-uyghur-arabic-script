const fs = require("fs");
const { join } = require("path");

const ttf2woff2 = require("ttf2woff2");

//获取字体列表
const getFonts = (fontsPath) => {
  return fs.readdirSync(fontsPath).map((font) => {
    return {
      font,
      fontName: font.split(".").shift().replace(/\s+/g, "").trim(),
      fontPath: fontsPath,
    };
  });
};

//ttf conver 2 woff2
const convert = ({ font, fontName, fontPath }) => {
  console.log(`convert ${fontName} ...`);
  return ttf2woff2(fs.readFileSync(join(fontPath, font)));
};

const finishWork = (fontsPath) => {
  //清单
  let fontList = {};
  //遍历所有字体
  getFonts(fontsPath).forEach((fontInfo) => {
    // //生成目录
    let outPath = join(fontInfo.fontPath, "../assets/fonts", fontInfo.fontName);
    if (!fs.existsSync(outPath)) {
      fs.mkdirSync(outPath, { recursive: true });
    }

    //生成woff2并写入文件
    fs.writeFileSync(
      join(outPath, `./${fontInfo.fontName}.woff2`),
      convert(fontInfo)
    );
    //吧字体也复制放在一起
    fs.copyFileSync(
      join(fontInfo.fontPath, fontInfo.font),
      join(outPath, `${fontInfo.fontName}.ttf`)
    );

    fontList[fontInfo.fontName] = {
      ttf: `./fonts/${fontInfo.fontName}/${fontInfo.fontName}.ttf`,
      woff2: `./fonts/${fontInfo.fontName}/${fontInfo.fontName}.woff2`,
    };
  });

  //写入字体清单
  fs.writeFileSync(
    join(__dirname, "../assets/fontlist.json"),
    JSON.stringify(fontList)
  );
};

finishWork(join(__dirname, "../ukij_fonts"));
