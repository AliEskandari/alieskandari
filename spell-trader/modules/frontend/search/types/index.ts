import { Filter as FormFilter } from "./Form/Filter";
import { Param as TextFilterParam } from "./Form/Filter/Text/Param";
import { Param as OperatorFilterParam } from "./Form/Filter/Operator/Param";
import { Param as SelectFilterParam } from "./Form/Filter/Select/Param";
import { Params as SearchParams } from "./Params";
import { Param as FilterParam } from "./Form/Filter/Param";
import { Sort as ParamsSort } from "./Params/Sort";
import { Key as FilterKey } from "./Form/Filter/Key";
import { Select as SelectFilter } from "./Form/Filter/Select";
import { Operator as OperatorFilter } from "./Form/Filter/Operator";
import { Text as TextFilter } from "./Form/Filter/Text";
namespace Search {
  export namespace Form {
    export namespace Filter {
      export type Key = FilterKey;
      export type Param = FilterParam;
      export type Select<K> = SelectFilter<K>;
      export type Operator<K> = OperatorFilter<K>;
      export type Text<K> = TextFilter<K>;
      export namespace Text {
        export type Param = TextFilterParam;
      }
      export namespace Operator {
        export type Param = OperatorFilterParam;
      }
      export namespace Select {
        export type Param = SelectFilterParam;
      }
    }
    export type Filter<K = FilterKey> = FormFilter<K>;
  }
  export type Params = SearchParams;
  export namespace Params {
    export type Sort<T> = ParamsSort<T>;
  }
}

export default Search;
