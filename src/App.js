import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import './App.css';
import fetchRelicItems from './fetchRelicItems';
import fetchStarterItems from './fetchStarterItems';
import fetchGods from './fetchGods';
import fetchItems from './fetchItems';

const random = (arr) => arr.at(Math.floor(Math.random() * arr.length));

function App() {
  const { data: relicData, isSuccess: isRelicSuccess } = useQuery({ queryKey: ['relics'], queryFn: fetchRelicItems });
  const { data: starterData, isSuccess: isStarterSuccess } = useQuery({ queryKey: ['starters'], queryFn: fetchStarterItems });
  const { data: godsData, isSuccess: isGodsSuccess } = useQuery({ queryKey: ['gods'], queryFn: fetchGods });
  const { data: itemsData, isSuccess: isItemsSuccess } = useQuery({ queryKey: ['items'], queryFn: fetchItems });

  const [godSelected, setGodSelected] = useState({ name: '', image: '', title: '' });
  const [items, setItems] = useState([0, 0, 0, 0, 0, 0].fill({ name: '', image: '' }));
  const [starter, setStarter] = useState({ name: '', image: '' });
  const [relic, setRelic] = useState({ name: '', image: '' });
  const [rerolls, setRerolls] = useState(3);

  const onRandomize = useCallback((category, itemSlot) => {
    if (category && !rerolls) {
      return;
    } else if (category) {
      setRerolls((rerolls) => rerolls - 1);
    } else {
      setRerolls(3);
    }
    if (relicData && (!category || category === "relic")) {
      setRelic(random(relicData.filter((item) => item.cost === 0)));
    }
    
    if (starterData && (!category || category === "starter")) {
      setStarter(random(starterData.filter((item) => item.cost > 1000)));
    }

    if (godsData && (!category || category === "god")) {
      setGodSelected(random(godsData));
    }

    if (itemsData && (!category || category === "items")) {
      if (itemSlot !== undefined) {
        setItems((items) => {
          const newItems = [...items];
          newItems[itemSlot] = random(itemsData);
          return newItems;
        })
      } else {
        setItems([
          random(itemsData), random(itemsData), 
          random(itemsData), random(itemsData), 
          random(itemsData), random(itemsData)
        ]);

      }
    }
  }, [godsData, itemsData, relicData, rerolls, starterData]);

  useEffect(() => {
    if (isRelicSuccess && !relic.name
      && isStarterSuccess && !starter.name
      && isGodsSuccess && !godSelected.name
      && isItemsSuccess && !items[0].name
    ) {
      onRandomize();
    }
  }, [godSelected.name, isGodsSuccess, isItemsSuccess, isRelicSuccess, isStarterSuccess, items, onRandomize, relic.name, starter.name]);

  return (
    <div className="App">
      <nav>
        <h2 className="randomise" style={{ border: false, boxShadow: 'none', textShadow: '0 8px 8px black' }}>Smite 2 Randomizer</h2>
      </nav>
      <div className="content">
      <div className="randomiser">
        <div className="button randomise" onClick={() => onRandomize()}>
          <h2>Randomise</h2>
        </div>
        <div className="build-container">
          <div className="gods-container">
            <h3 className="build-title">God</h3>
            <div className="gods">
              <div className="god">
                <h3 className="god__name">{godSelected.name}</h3>
                <h4 className="god__caption">{godSelected.title}</h4>
                <img loading="lazy" className="god__image rerollable fade-in" src={godSelected.image} type="gods" aria-label={"Image of " + godSelected.name} style={{animationDuration: "0.2s"}} onClick={() => onRandomize('god')}></img>
              </div>
            </div>
          </div>
          <div className="items-container">
            <h3 className="build-title">Items</h3>
            <div className="items">
              {items.map((item, idx) => (
                <div className="item" key={idx}>
                  <div className="item__name">{item.name}</div><img number="0" loading="lazy" className="item__picture rerollable fade-in" onClick={() => onRandomize("items", idx)} src={item.image} aria-label={"Image of " + item.name} type="items" style={{animationDuration: "0.2s"}}></img>
                </div>
              ))}
            </div>
          </div>
          <div className="uniques-container">
            <h3 className="build-title">Starter &amp; Relic</h3>
            <div className="uniques">
              <div className="item">
                <div className="item__name">{starter.name}</div><img loading="lazy" className="item__picture rerollable fade-in" src={starter.image} aria-label={starter.name} type="starters" style={{animationDuration: "0.2s"}} onClick={() => onRandomize("starter")}></img>
              </div>
              <div className="item">
                <div className="item__name">{relic.name}</div><img loading="lazy" className="item__picture rerollable fade-in" src={relic.image} aria-label={relic.name} type="items" style={{animationDuration: "0.2s"}} onClick={() => onRandomize("relic")}></img>
              </div>
            </div>
          </div>
          {/* <div className="actives-container">
            <h3 className="build-title">Actives</h3>
            <div className="actives">

              <div className="item">
                <div className="item__name">Persistent Teleport</div><img loading="lazy" className="item__picture rerollable fade-in" src="https://webcdn.hirezstudios.com/smite/item-icons/persistent-teleport.jpg" aria-label="Image of Persistent Teleport" type="actives" style={{animationDuration: "0.2s"}}></img>
              </div>
              <div className="item">
                <div className="item__name">Greater Magic Shell</div><img loading="lazy" className="item__picture rerollable fade-in" src="https://webcdn.hirezstudios.com/smite/item-icons/greater-magic-shell.jpg" aria-label="Image of Greater Magic Shell" type="actives" style={{animationDuration: "0.2s"}}></img>
              </div>
            </div>
          </div> */}
          <div className="actives-container">Rerolls remaining: {rerolls}</div>
        </div>
      </div>
      
      {/* <div className="stat-filter-wrapper">
        <div className="filter-area">
          <div className="build-stats-wrapper">

            <div className="build-stats">
              <h3>Build Stats</h3>
              <div className="offensive-stats">
                <div id="power" type="integer" className="stat">
                  <p className="stat__name">Power</p>
                  <p className="stat__value" cap-color="3">520</p>
                </div>
                <div id="attackspeed" type="integer" className="stat">
                  <p className="stat__name">Attack Speed</p>
                  <p className="stat__value" cap-color="2">1.43</p>
                </div>
                <div id="lifesteal" type="percent" className="stat">
                  <p className="stat__name">Lifesteal</p>
                  <p className="stat__value" cap-color="3">24%</p>
                </div>
                <div id="penetration" type="integer" className="stat">
                  <p className="stat__name">Penetration</p>
                  <p className="stat__value" cap-color="3">20</p>
                </div>
                <div id="penetration" type="percent" className="stat">
                  <p className="stat__name">Penetration %</p>
                  <p className="stat__value" cap-color="3">20%</p>
                </div>
                <div id="criticalstrikechance" type="percent" className="stat">
                  <p className="stat__name">Crit Chance</p>
                  <p className="stat__value">0</p>
                </div>
              </div>
              <div className="defensive-stats">
                <div id="physicalprotection" type="integer" className="stat">
                  <p className="stat__name">Physical Prot</p>
                  <p className="stat__value" cap-color="3">103</p>
                </div>
                <div id="magicalprotection" type="integer" className="stat">
                  <p className="stat__name">Magical Prot</p>
                  <p className="stat__value" cap-color="3">109.4</p>
                </div>
                <div id="health" type="integer" className="stat">
                  <p className="stat__name">Health</p>
                  <p className="stat__value" cap-color="2">2330</p>
                </div>
                <div id="hp5" type="integer" className="stat">
                  <p className="stat__name">HP5</p>
                  <p className="stat__value" cap-color="3">36.2</p>
                </div>
                <div id="crowdcontrolreduction" type="percent" className="stat">
                  <p className="stat__name">CCR</p>
                  <p className="stat__value" cap-color="3">20%</p>
                </div>
              </div>
              <div className="utility-stats">
                <div id="movementspeed" type="integer" className="stat">
                  <p className="stat__name">Speed</p>
                  <p className="stat__value" cap-color="3">407</p>
                </div>
                <div id="cooldownreduction" type="percent" className="stat">
                  <p className="stat__name">CDR</p>
                  <p className="stat__value" cap-color="2">10%</p>
                </div>
                <div id="mana" type="integer" className="stat">
                  <p className="stat__name">Mana</p>
                  <p className="stat__value" cap-color="2">1365</p>
                </div>
                <div id="mp5" type="integer" className="stat">
                  <p className="stat__name">MP5</p>
                  <p className="stat__value" cap-color="3">74</p>
                </div>
              </div>
            </div>
          </div>
          <div className="select-area" id="filter-gods">
            <div className="select" id="gods-select" tabIndex="0" tag="Name" aria-label="God Select" visible="false">
              <div className="select__text">God Select</div>
              <div className="select__arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div className="select__option-container">
                <div className="select__clear">X</div>
              <div className="select__option" checked={false} order="0" tabIndex="0">Achilles</div><div className="select__option" checked={false} order="1" tabIndex="0">Agni</div><div className="select__option" checked={false} order="2" tabIndex="0">Ah Muzen Cab</div><div className="select__option" checked={false} order="3" tabIndex="0">Ah Puch</div><div className="select__option" checked={false} order="4" tabIndex="0">Amaterasu</div><div className="select__option" checked={false} order="5" tabIndex="0">Anhur</div><div className="select__option" checked={false} order="6" tabIndex="0">Anubis</div><div className="select__option" checked={false} order="7" tabIndex="0">Ao Kuang</div><div className="select__option" checked={false} order="8" tabIndex="0">Aphrodite</div><div className="select__option" checked={false} order="9" tabIndex="0">Apollo</div><div className="select__option" checked={false} order="10" tabIndex="0">Arachne</div><div className="select__option" checked={false} order="11" tabIndex="0">Ares</div><div className="select__option" checked={false} order="12" tabIndex="0">Artemis</div><div className="select__option" checked={false} order="13" tabIndex="0">Artio</div><div className="select__option" checked={false} order="14" tabIndex="0">Athena</div><div className="select__option" checked={false} order="15" tabIndex="0">Atlas</div><div className="select__option" checked={false} order="16" tabIndex="0">Awilix</div><div className="select__option" checked={false} order="17" tabIndex="0">Baba Yaga</div><div className="select__option" checked={false} order="18" tabIndex="0">Bacchus</div><div className="select__option" checked={false} order="19" tabIndex="0">Bakasura</div><div className="select__option" checked={false} order="20" tabIndex="0">Bake Kujira</div><div className="select__option" checked={false} order="21" tabIndex="0">Baron Samedi</div><div className="select__option" checked={false} order="22" tabIndex="0">Bastet</div><div className="select__option" checked={false} order="23" tabIndex="0">Bellona</div><div className="select__option" checked={false} order="24" tabIndex="0">Cabrakan</div><div className="select__option" checked={false} order="25" tabIndex="0">Camazotz</div><div className="select__option" checked={false} order="26" tabIndex="0">Cerberus</div><div className="select__option" checked={false} order="27" tabIndex="0">Cernunnos</div><div className="select__option" checked={false} order="28" tabIndex="0">Chaac</div><div className="select__option" checked={false} order="29" tabIndex="0">Chang'e</div><div className="select__option" checked={false} order="30" tabIndex="0">Charon</div><div className="select__option" checked={false} order="31" tabIndex="0">Charybdis</div><div className="select__option" checked={false} order="32" tabIndex="0">Chernobog</div><div className="select__option" checked={false} order="33" tabIndex="0">Chiron</div><div className="select__option" checked={false} order="34" tabIndex="0">Chronos</div><div className="select__option" checked={false} order="35" tabIndex="0">Cliodhna</div><div className="select__option" checked={false} order="36" tabIndex="0">Cthulhu</div><div className="select__option" checked={false} order="37" tabIndex="0">Cu Chulainn</div><div className="select__option" checked={false} order="38" tabIndex="0">Cupid</div><div className="select__option" checked={false} order="39" tabIndex="0">Da Ji</div><div className="select__option" checked={false} order="40" tabIndex="0">Danzaburou</div><div className="select__option" checked={false} order="41" tabIndex="0">Discordia</div><div className="select__option" checked={false} order="42" tabIndex="0">Erlang Shen</div><div className="select__option" checked={false} order="43" tabIndex="0">Eset</div><div className="select__option" checked={false} order="44" tabIndex="0">Fafnir</div><div className="select__option" checked={false} order="45" tabIndex="0">Fenrir</div><div className="select__option" checked={false} order="46" tabIndex="0">Freya</div><div className="select__option" checked={false} order="47" tabIndex="0">Ganesha</div><div className="select__option" checked={false} order="48" tabIndex="0">Geb</div><div className="select__option" checked={false} order="49" tabIndex="0">Gilgamesh</div><div className="select__option" checked={false} order="50" tabIndex="0">Guan Yu</div><div className="select__option" checked={false} order="51" tabIndex="0">Hachiman</div><div className="select__option" checked={false} order="52" tabIndex="0">Hades</div><div className="select__option" checked={false} order="53" tabIndex="0">He Bo</div><div className="select__option" checked={false} order="54" tabIndex="0">Heimdallr</div><div className="select__option" checked={false} order="55" tabIndex="0">Hel</div><div className="select__option" checked={false} order="56" tabIndex="0">Hera</div><div className="select__option" checked={false} order="57" tabIndex="0">Hercules</div><div className="select__option" checked={false} order="58" tabIndex="0">Horus</div><div className="select__option" checked={false} order="59" tabIndex="0">Hou Yi</div><div className="select__option" checked={false} order="60" tabIndex="0">Hun Batz</div><div className="select__option" checked={false} order="61" tabIndex="0">Ishtar</div><div className="select__option" checked={false} order="62" tabIndex="0">Ix Chel</div><div className="select__option" checked={false} order="63" tabIndex="0">Izanami</div><div className="select__option" checked={false} order="64" tabIndex="0">Janus</div><div className="select__option" checked={false} order="65" tabIndex="0">Jing Wei</div><div className="select__option" checked={false} order="66" tabIndex="0">Jormungandr</div><div className="select__option" checked={false} order="67" tabIndex="0">Kali</div><div className="select__option" checked={false} order="68" tabIndex="0">Khepri</div><div className="select__option" checked={false} order="69" tabIndex="0">King Arthur</div><div className="select__option" checked={false} order="70" tabIndex="0">Kukulkan</div><div className="select__option" checked={false} order="71" tabIndex="0">Kumbhakarna</div><div className="select__option" checked={false} order="72" tabIndex="0">Kuzenbo</div><div className="select__option" checked={false} order="73" tabIndex="0">Lancelot</div><div className="select__option" checked={false} order="74" tabIndex="0">Loki</div><div className="select__option" checked={false} order="75" tabIndex="0">Maman Brigitte</div><div className="select__option" checked={false} order="76" tabIndex="0">Martichoras</div><div className="select__option" checked={false} order="77" tabIndex="0">Maui</div><div className="select__option" checked={false} order="78" tabIndex="0">Medusa</div><div className="select__option" checked={false} order="79" tabIndex="0">Mercury</div><div className="select__option" checked={false} order="80" tabIndex="0">Merlin</div><div className="select__option" checked={false} order="81" tabIndex="0">Morgan Le Fay</div><div className="select__option" checked={false} order="82" tabIndex="0">Mulan</div><div className="select__option" checked={false} order="83" tabIndex="0">Ne Zha</div><div className="select__option" checked={false} order="84" tabIndex="0">Neith</div><div className="select__option" checked={false} order="85" tabIndex="0">Nemesis</div><div className="select__option" checked={false} order="86" tabIndex="0">Nike</div><div className="select__option" checked={false} order="87" tabIndex="0">Nox</div><div className="select__option" checked={false} order="88" tabIndex="0">Nu Wa</div><div className="select__option" checked={false} order="89" tabIndex="0">Nut</div><div className="select__option" checked={false} order="90" tabIndex="0">Odin</div><div className="select__option" checked={false} order="91" tabIndex="0">Olorun</div><div className="select__option" checked={false} order="92" tabIndex="0">Osiris</div><div className="select__option" checked={false} order="93" tabIndex="0">Pele</div><div className="select__option" checked={false} order="94" tabIndex="0">Persephone</div><div className="select__option" checked={false} order="95" tabIndex="0">Poseidon</div><div className="select__option" checked={false} order="96" tabIndex="0">Ra</div><div className="select__option" checked={false} order="97" tabIndex="0">Raijin</div><div className="select__option" checked={false} order="98" tabIndex="0">Rama</div><div className="select__option" checked={false} order="99" tabIndex="0">Ratatoskr</div><div className="select__option" checked={false} order="100" tabIndex="0">Ravana</div><div className="select__option" checked={false} order="101" tabIndex="0">Scylla</div><div className="select__option" checked={false} order="102" tabIndex="0">Serqet</div><div className="select__option" checked={false} order="103" tabIndex="0">Set</div><div className="select__option" checked={false} order="104" tabIndex="0">Shiva</div><div className="select__option" checked={false} order="105" tabIndex="0">Skadi</div><div className="select__option" checked={false} order="106" tabIndex="0">Sobek</div><div className="select__option" checked={false} order="107" tabIndex="0">Sol</div><div className="select__option" checked={false} order="108" tabIndex="0">Sun Wukong</div><div className="select__option" checked={false} order="109" tabIndex="0">Surtr</div><div className="select__option" checked={false} order="110" tabIndex="0">Susano</div><div className="select__option" checked={false} order="111" tabIndex="0">Sylvanus</div><div className="select__option" checked={false} order="112" tabIndex="0">Terra</div><div className="select__option" checked={false} order="113" tabIndex="0">Thanatos</div><div className="select__option" checked={false} order="114" tabIndex="0">The Morrigan</div><div className="select__option" checked={false} order="115" tabIndex="0">Thor</div><div className="select__option" checked={false} order="116" tabIndex="0">Thoth</div><div className="select__option" checked={false} order="117" tabIndex="0">Tiamat</div><div className="select__option" checked={false} order="118" tabIndex="0">Tsukuyomi</div><div className="select__option" checked={false} order="119" tabIndex="0">Tyr</div><div className="select__option" checked={false} order="120" tabIndex="0">Ullr</div><div className="select__option" checked={false} order="121" tabIndex="0">Vamana</div><div className="select__option" checked={false} order="122" tabIndex="0">Vulcan</div><div className="select__option" checked={false} order="123" tabIndex="0">Xbalanque</div><div className="select__option" checked={false} order="124" tabIndex="0">Xing Tian</div><div className="select__option" checked={false} order="125" tabIndex="0">Yemoja</div><div className="select__option" checked={false} order="126" tabIndex="0">Ymir</div><div className="select__option" checked={false} order="127" tabIndex="0">Yu Huang</div><div className="select__option" checked={false} order="128" tabIndex="0">Zeus</div><div className="select__option" checked={false} order="129" tabIndex="0">Zhong Kui</div></div>
            </div>
            <div className="select" id="class-select" tabIndex="0" tag="Roles" aria-label="Class Select" visible="false">
              <div className="select__text">Class Select</div>
              <div className="select__arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div className="select__option-container">
                <div className="select__clear">X</div>
              <div className="select__option" checked={false} order="0" tabIndex="0">Assassin</div><div className="select__option" checked={false} order="1" tabIndex="0">Guardian</div><div className="select__option" checked={false} order="2" tabIndex="0">Hunter</div><div className="select__option" checked={false} order="3" tabIndex="0">Mage</div><div className="select__option" checked={false} order="4" tabIndex="0">Warrior</div></div>
            </div>
            <div className="select" id="type-select" tabIndex="0" tag="Type" aria-label="Type Select" visible="false">
              <div className="select__text">Type Select</div>
              <div className="select__arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div className="select__option-container">
                <div className="select__clear">X</div>
              <div className="select__option" checked={false} order="0" tabIndex="0">Magical</div><div className="select__option" checked={false} order="1" tabIndex="0">Physical</div></div>
            </div>
            <div className="select" id="pantheon-select" tabIndex="0" tag="Pantheon" aria-label="Pantheon Select" visible="false">
              <div className="select__text">Pantheon Select</div>
              <div className="select__arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div className="select__option-container">
                <div className="select__clear">X</div>
              <div className="select__option" checked={false} order="0" tabIndex="0">Arthurian</div><div className="select__option" checked={false} order="1" tabIndex="0">Babylonian</div><div className="select__option" checked={false} order="2" tabIndex="0">Celtic</div><div className="select__option" checked={false} order="3" tabIndex="0">Chinese</div><div className="select__option" checked={false} order="4" tabIndex="0">Egyptian</div><div className="select__option" checked={false} order="5" tabIndex="0">Great Old Ones</div><div className="select__option" checked={false} order="6" tabIndex="0">Greek</div><div className="select__option" checked={false} order="7" tabIndex="0">Hindu</div><div className="select__option" checked={false} order="8" tabIndex="0">Japanese</div><div className="select__option" checked={false} order="9" tabIndex="0">Maya</div><div className="select__option" checked={false} order="10" tabIndex="0">Norse</div><div className="select__option" checked={false} order="11" tabIndex="0">Polynesian</div><div className="select__option" checked={false} order="12" tabIndex="0">Roman</div><div className="select__option" checked={false} order="13" tabIndex="0">Slavic</div><div className="select__option" checked={false} order="14" tabIndex="0">Voodoo</div><div className="select__option" checked={false} order="15" tabIndex="0">Yoruba</div></div>
            </div>
          </div>
          <div className="filter__tiles">
            <div className="boot-area">
              <label className="checkbox-label" id="filter">
                <input type="checkbox" id="guranteed-boots" />Guranteed Boots
                <div className="checkbox-label__checkbox">
                  <div className="checkmark"></div>
                </div>
              </label>
              <label className="checkbox-label" id="filter">
                <input type="checkbox" id="boots-first" checked="" />Boots First
                <div className="checkbox-label__checkbox">
                  <div className="checkmark"></div>
                </div>
              </label>
            </div>
            <div className="queue-area">
              <label className="checkbox-label" id="filter">
                <input type="checkbox" id="assault-blacklist" />Assault Blacklist
                <div className="checkbox-label__checkbox">
                  <div className="checkmark"></div>
                </div>
              </label>
              <label className="checkbox-label" id="filter">
                <input type="checkbox" id="conquest-blacklist" />Conquest Blacklist
                <div className="checkbox-label__checkbox">
                  <div className="checkmark"></div>
                </div>
              </label>
            </div>
            <div className="reroll-area">
              <label className="input-label">Reroll Count
                <input type="number" value="3" id="custom-reroll-counter" min="0" className="number-input" />
              </label>
            </div>
            <div className="wildcard-area">
              <label className="input-label">Wildcard % Chance
                <input type="number" value="0" id="wildcard-chance" min="0" className="number-input" />
              </label>
            </div>
          </div>
          <div className="tags-area" id="tags-form">
            <div className="tags-area__offensive"><span><b>Offensive -</b></span>
              <div className="multi-checkbox" id="offensive" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">All</div>
              </div>
              <div className="multi-checkbox" id="power" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Power</div>
              </div>
              <div className="multi-checkbox" id="attack speed" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Attack Speed</div>
              </div>
              <div className="multi-checkbox" id="lifesteal" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Lifesteal</div>
              </div>
              <div className="multi-checkbox" id="penetration" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Penetration</div>
              </div>
              <div className="multi-checkbox" id="critical strike chance" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Crit Chance</div>
              </div>
            </div>
            <div className="tags-area__defensive"><span><b>Defensive -</b></span>
              <div className="multi-checkbox" id="defensive" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">All</div>
              </div>
              <div className="multi-checkbox" id="physical protection" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Physical Protection</div>
              </div>
              <div className="multi-checkbox" id="magical protection" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Magical Protection</div>
              </div>
              <div className="multi-checkbox" id="health" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Health</div>
              </div>
              <div className="multi-checkbox" id="hp5" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">HP5</div>
              </div>
              <div className="multi-checkbox" id="crowd control reduction" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">CCR</div>
              </div>
            </div>
            <div className="tags-area__utility"><span><b>Utility -</b></span>
              <div className="multi-checkbox" id="utility" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">All</div>
              </div>
              <div className="multi-checkbox" id="aura" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Aura</div>
              </div>
              <div className="multi-checkbox" id="movement speed" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Movement Speed</div>
              </div>
              <div className="multi-checkbox" id="cooldown reduction" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Cooldown Reduction</div>
              </div>
              <div className="multi-checkbox" id="mana" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">Mana</div>
              </div>
              <div className="multi-checkbox" id="mp5" checked="null">
                <div className="multi-checkbox__box">
                  <div className="box__line"></div>
                  <div className="box__line2"></div>
                </div>
                <div className="multi-checkbox__name">MP5</div>
              </div>
            </div>
            <div className="item-counter">
              <b>132</b>
              <p>&nbsp;Items |&nbsp;</p>
              <b style={{color: "rgb(46, 204, 113);"}}>100</b>
              <p>&nbsp;Physical |&nbsp;</p>
              <b style={{color: "rgb(46, 204, 113);"}}>85</b>
              <p>&nbsp;Magical</p>
            </div>
          </div>
          <div className="reset-area">
            <div className="button reset__lists">Reset Lists</div>
            <div className="button reset__checkboxes">Reset Table</div>
            <div className="button reset__misc">Reset Misc</div>
            <div className="button reset__all">Reset All</div>
          </div>
          <h3><i>INSTRUCTONS BELOW</i></h3>
        </div>
      </div>
      <div className="about-area">
        <div className="about-area__wrapper">
          <h3>Instructions</h3>
          <ul>
            <li>
              <b>Rerolling:</b>
              <br/>Click any part of the build to reroll it, number of rerolls is 3 by default (can be changed), you will not be able to reroll an item/god if there are no viable items/gods left<br/>
            </li>
            <li>
              <b>Selection Area:</b>
              <br/>Select a God, Class, Type, or Pantheon, you can select multiple parameters and it will choose from every parameter selected<br/>
            </li>
            <li>
              <b>Boots:</b>
              <br/>Guranteed Boots ensures there are a pair of boots somewehere in the build, if you rerolls the boots it will replace with another, First item puts them in the first slot<br/>
            </li>
            <li><b>Wildcards:</b>
              <br/>Can choose a chance of an item being a "wildcard" letting you build what you want in that slot, you can reroll into wildcards.<br/>
            </li>
            <li><b>Queue Blacklists:</b>
              <br/>Blacklists the items that you can't build in said queues<br/>
            </li>
            <li>
              <b>Filter Table:</b><br/>If you have a filters set to positive, only items from those categories will be chosen,
              filters set to negative will mean items with those tags will be removed, you can combine both positive and negative filters<br/>
            </li>
          </ul>
        </div>
      </div> */}
    </div>
    </div>
  );
}

export default App;
