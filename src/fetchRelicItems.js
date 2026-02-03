import statTransform from "./lib/statTransform";

const fetchRelicItems = async () => {
  let cmContinue = "";
  const allItemData = [];
  do {
    const response = await fetch('https://wiki.smite2.com/api.php?action=query&cmtitle=Category:Relics&format=json&list=categorymembers&cmlimit=500' + (cmContinue ? `&cmcontinue=${cmContinue}` : ''));
    const jsonResponse = await response.json();
    const batchedItems = Object.values((await (await fetch('https://wiki.smite2.com/api.php?action=query&format=json&prop=revisions&rvprop=content&rvslots=main&titles=' + jsonResponse.query.categorymembers.map((cm) => cm.title).join('|'))).json()).query.pages).map((jsonEntry) => {
      if (jsonEntry.pageid < 0) return undefined;
      const wholeInfobox = jsonEntry.revisions[0].slots.main['*'].match(/{{Item infobox([^{}]+?({{.+?}})?[^{}]+?)+}}/s)[0];
      const tokenizedInfobox = statTransform(wholeInfobox).split('|').slice(1).reduce((prev, curr) => {
        const [key, value] = curr.split(/=(.*)/s)
        return {
          ...prev,
          [key]: value?.trim(),
        };
      }, {});
      return  { image: "File:" + tokenizedInfobox.image, name: tokenizedInfobox.name, cost: Number.parseInt(tokenizedInfobox.cost) }
    }).filter((obj) => !!obj);
    const imageQueryReturn = await (await fetch('https://wiki.smite2.com/api.php?action=query&format=json&prop=imageinfo&redirects&iiprop=url&titles=' + batchedItems.map((god) => god.image).join('|'))).json();

    Object.values(imageQueryReturn.query.pages).forEach((imagePage) => {
      batchedItems.find((val) => val.image === (
        imageQueryReturn.query.redirects?.find((redirect) => redirect.to === imagePage.title)?.from
        || imageQueryReturn.query.normalized?.find((redirect) => redirect.to === imagePage.title)?.from
        || imagePage.title)).image = imagePage.imageinfo[0].url;
    });
    allItemData.push(...batchedItems);
    cmContinue = jsonResponse.continue?.cmcontinue;
  } while (cmContinue);
  return Promise.all(allItemData);
}

export default fetchRelicItems;