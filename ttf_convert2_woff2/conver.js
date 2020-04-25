const fs = require("fs");
const { join } = require("path");

const ttf2woff2 = require("ttf2woff2");
const opentype = require("opentype.js");

function camelCase(words) {
  var pattern = /[A-Z]|\s+[A-z]|\s+[0-9]/g;
  words = words.replace(/_|-/g, " ");
  return lcFirst(words.replace(pattern, (match) => match.trim().toUpperCase()));
}
function ucFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function lcFirst(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function studlyCase(selectedWords) {
  return ucFirst(camelCase(selectedWords));
}

//获取字体列表
const getFonts = (fontsPath) => {
  return fs.readdirSync(fontsPath).map((font) => {
    return {
      font,
      fontPath: fontsPath,
    };
  });
};

//ttf conver 2 woff2
const convert = ({ font, fontPath }) => {
  console.log(`convert ${font} ...`);
  return ttf2woff2(fs.readFileSync(join(fontPath, font)));
};

const finishWork = (fontsPath) => {
  //清单
  let fontList = {};
  //遍历所有字体
  getFonts(fontsPath).forEach((fontInfo) => {
    let ttf_orign = join(fontInfo.fontPath, fontInfo.font);

    let opentypeFontInfo = opentype.loadSync(ttf_orign).names;

    let fontFamilyName = opentypeFontInfo.fontFamily.en;
    let fontSubfamilyEn = opentypeFontInfo.fontSubfamily.en;
    let fontTTFName = studlyCase(fontFamilyName) + "_" + fontSubfamilyEn;

    // //生成目录
    let outPath = join(fontInfo.fontPath, "../assets/fonts", fontTTFName);
    if (!fs.existsSync(outPath)) {
      fs.mkdirSync(outPath, { recursive: true });
    }

    //生成woff2并写入文件
    fs.writeFileSync(
      join(outPath, `./${fontTTFName}.woff2`),
      convert(fontInfo)
    );
    //吧字体也复制放在一起
    fs.copyFileSync(
      join(fontInfo.fontPath, fontInfo.font),
      join(outPath, `${fontTTFName}.ttf`)
    );

    fontList[fontTTFName] = {
      ttf: `fonts/${fontTTFName}/${fontTTFName}.ttf`,
      woff2: `fonts/${fontTTFName}/${fontTTFName}.woff2`,
      nameing_table: opentypeFontInfo,
    };
  });

  //写入字体清单
  fs.writeFileSync(
    join(__dirname, "../assets/fontlist.json"),
    JSON.stringify(fontList)
  );
};

finishWork(join(__dirname, "../ukij_fonts"));
