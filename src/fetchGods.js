import statTransform from "./lib/statTransform";
const chunk = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

const fetchGods = async () => {
  let plContinue = "";
  const allItemData = [];
  let filteredGods = [];
  let batchedGods = [];
  do {
    const gods = await (await fetch('https://wiki.smite2.com/api.php?action=query&format=json&prop=links&titles=Gods&pllimit=500' + (plContinue ? `&plcontinue=${plContinue}` : ''))).json();
    filteredGods.push(...Object.values(gods.query.pages)[0].links.filter(({ title }) => !title.includes('SMITE') && title !== "Gems" && title !== "Items"));
    plContinue = gods.continue?.plcontinue;
  } while (plContinue);
  const chunkedGods = chunk(filteredGods, 50).filter((chunk) => chunk.length);
  for (let i = 0; i < chunkedGods.length; i++) {
    const godChunk = chunkedGods[i];
    console.log(godChunk);
    batchedGods.push(...Object.entries(
      (await (await fetch('https://wiki.smite2.com/api.php?action=query&format=json&prop=revisions&rvprop=content&rvslots=main&titles=' + godChunk.map((p) => p.title).join('|'))).json()).query.pages)
      .map(([pageId, godPage]) => {
        try {
          if (Number.parseInt(pageId) < 0) return undefined;
          const { revisions } = godPage;
          const wholeInfobox = revisions[0].slots.main['*'].match(/{{God infobox([^{}]+?({{.+?}})?[^{}]+?)+}}/s)[0];
          const tokenizedInfobox = statTransform(wholeInfobox).split('|').slice(1).reduce((prev, curr) => {
            const [key, value] = curr.split(/=(.*)/s)
            return {
              ...prev,
              [key]: value.trim(),
            };
          }, {});
          return { image: "File:" + tokenizedInfobox.image, name: tokenizedInfobox.name, title: tokenizedInfobox.title };
        } catch (e) {
          console.error(pageId, godPage, e);
          return undefined;
        }
      }).filter((obj) => !!obj))
  }
  const chunkedBatchedGods = chunk(batchedGods, 50);

  for (let i = 0; i < chunkedBatchedGods.length; i++) {
    const godChunk = chunkedBatchedGods[i];
    const imageQueryReturn = await (await fetch('https://wiki.smite2.com/api.php?action=query&format=json&prop=imageinfo&redirects&iiprop=url&titles=' + godChunk.map((god) => god.image).join('|'))).json();
  
    Object.values(imageQueryReturn.query.pages).forEach((imagePage) => {
      batchedGods.find((val) => val.image === (
        imageQueryReturn.query.redirects?.find((redirect) => redirect.to === imagePage.title)?.from
        || imageQueryReturn.query.normalized?.find((redirect) => redirect.to === imagePage.title)?.from
        || imagePage.title)).image = imagePage.imageinfo[0].url;
    });
    allItemData.push(...batchedGods);
  }

  return allItemData;
}

export default fetchGods;