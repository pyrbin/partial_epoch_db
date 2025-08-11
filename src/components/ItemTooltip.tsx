import { Item } from "@/types/item";
import Image from "next/image";
import { isObject } from "node:util";

interface ItemTooltipProps {
  item: Item;
  onClick?: (item: Item) => void;
}

export default function ItemTooltip({ item, onClick }: ItemTooltipProps) {
  const handleClick = () => {
    onClick?.(item);
  };

  const strWithDefault = (
    value: string | null | undefined,
    defaultValue: string,
  ): string => {
    if (value === null || value === undefined || value === "") {
      return defaultValue;
    }
    return value;
  };

  let rarity_class = `text-rarity-poor`;
  let rarity_border = `border-rarity-poor`;
  switch (item.rarity.toLowerCase()) {
    case "poor":
      rarity_class = `text-rarity-poor`;
      rarity_border = `border-rarity-poor`;
      break;
    case "common":
      rarity_class = `text-rarity-common`;
      rarity_border = `border-rarity-common`;
      break;
    case "uncommon":
      rarity_class = `text-rarity-uncommon`;
      rarity_border = `border-rarity-uncommon`;
      break;
    case "rare":
      rarity_class = `text-rarity-rare`;
      rarity_border = `border-rarity-rare`;
      break;
    case "epic":
      rarity_class = `text-rarity-epic`;
      rarity_border = `border-rarity-epic`;
      break;
    case "legendary":
      rarity_class = `text-rarity-legendary`;
      rarity_border = `border-rarity-legendary`;
      break;
    case "artifact":
      rarity_class = `text-rarity-artifact`;
      rarity_border = `border-rarity-artifact`;
      break;
  }

  return (
    <div
      className={`${rarity_border} font-wow border-1 p-4 text-sm rounded-lg border-gray-500 w-[350px] h-[400px] overflow-auto flex flex-col`}
      onClick={handleClick}
      style={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge
      }}
    >
      <div className="flex flex-row justify-between mb-2">
        <h3
          className={
            rarity_class + " flex items-center text-base justify-center"
          }
        >
          {item.name === "<unknown>" ? `<unknown_${item.id}>` : item.name}
        </h3>
        <Image
          src={strWithDefault(
            item.inventory_icon,
            "https://wotlk.evowow.com/static/images/wow/icons/large/inv_misc_questionmark.jpg",
          )}
          width={40}
          height={40}
          alt={item.name}
          className="rounded-lg max-h-[40px]"
        />
      </div>
      <span>{item.bonding}</span>
      <div className="flex flex-row justify-between">
        <span>
          {isObject(item.class)
            ? "Custom"
            : (item.class as string) === "Weapon"
              ? strWithDefault(item.hands, item.class as string)
              : (item.class as string)}
        </span>
        <span>{item.subclass}</span>
      </div>
      <span>{item.added_damage}</span>
      <div className="flex flex-row justify-between">
        <span>{item.damage}</span>
        <span>{item.speed}</span>
      </div>
      <span>{item.dps}</span>
      <span>{item.armor}</span>
      <span className="flex flex-col">
        {item.stats.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </span>
      <span className="mt-1 text-tooltip-requirement">
        {"Requires level: " +
          (item.required_level > 0 ? item.required_level : "N/A")}
      </span>
      <span className="flex flex-col">
        {item.requires.map((requirement) => (
          <span className="text-tooltip-requirement" key={requirement}>
            {requirement}
          </span>
        ))}
      </span>
      <span className="flex flex-col text-tooltip-spell mt-1">
        {item.spells.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </span>
      <span className="flex flex-col mt-1">
        <span className="text-tooltip-set mb-0.25">{item.set?.name}</span>
        {item.set?.spells.map((spell) => (
          <span
            className="text-tooltip-muted mt-0.25"
            key={spell[0]}
          >{`(${spell[0]}) Set: ${spell[1]}`}</span>
        ))}
      </span>
    </div>
  );
}
