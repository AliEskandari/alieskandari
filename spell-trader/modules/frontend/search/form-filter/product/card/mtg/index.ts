import { OracleText } from "./oracle-text";
import { SetName } from "./set-name";
import { TypeLine } from "./type-line";
import { Cmc } from "./cmc";
import { Power } from "./power";
import { Toughness } from "./toughness";
import { Loyalty } from "./loyalty";
import { CardName } from "./card-name";
import { Color } from "./color";
import Search from "@/modules/frontend/search/types";

export const filters = {
  [CardName.key]: CardName,
  [OracleText.key]: OracleText,
  [SetName.key]: SetName,
  [TypeLine.key]: TypeLine,
  [Cmc.key]: Cmc,
  [Power.key]: Power,
  [Toughness.key]: Toughness,
  [Loyalty.key]: Loyalty,
  [Color.key]: Color,
} as const;

const mtg = {
  ...filters,
  findById: (key: Search.Form.Filter.Key) => {
    return filters[key];
  },
};

export default mtg;
