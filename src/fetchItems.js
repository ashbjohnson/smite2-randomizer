import statTransform from "./lib/statTransform";
const chunk = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

const fetchItems = async () => {
  let cmContinue = "";
  const allItemData = [];
  let batchedItems = [];
  let items = [];
  do {
    const response = await fetch('https://wiki.smite2.com/api.php?action=query&cmtitle=Category:Tier_3_items&format=json&list=categorymembers&cmlimit=500' + (cmContinue ? `&cmcontinue=${cmContinue}` : ''));
    const jsonResponse = await response.json();
    items.push(...jsonResponse.query.categorymembers);
    cmContinue = jsonResponse.continue?.cmcontinue;
  } while (cmContinue);
  const chunkedItems = chunk(items, 50).filter((chunk) => chunk.length);
  for (let i = 0; i < chunkedItems.length; i++) {
    const itemChunk = chunkedItems[i];
    batchedItems.push(...Object.values((await (await fetch('https://wiki.smite2.com/api.php?action=query&format=json&prop=revisions&rvprop=content&rvslots=main&titles=' + itemChunk.map((cm) => cm.title).join('|'))).json()).query.pages).map((jsonEntry) => {
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
    }).filter((obj) => !!obj));
  }

  const chunkedBatchedItems = chunk(batchedItems, 50);
  for (let i = 0; i < chunkedBatchedItems.length; i++) {
    const itemChunk = chunkedBatchedItems[i];
    const imageQueryReturn = await (await fetch('https://wiki.smite2.com/api.php?action=query&format=json&prop=imageinfo&redirects&iiprop=url&titles=' + itemChunk.map((item) => item.image).join('|'))).json();
  
    Object.values(imageQueryReturn.query.pages).forEach((imagePage) => {
      batchedItems.find((val) => val.image === (
        imageQueryReturn.query.redirects?.find((redirect) => redirect.to === imagePage.title)?.from
        || imageQueryReturn.query.normalized?.find((redirect) => redirect.to === imagePage.title)?.from
        || imagePage.title)).image = imagePage.imageinfo[0].url;
    });
    allItemData.push(...batchedItems);
  }

  return allItemData;
}

export default fetchItems;