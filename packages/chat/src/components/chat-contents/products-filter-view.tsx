import { useStorecraft } from "@storecraft/sdk-react-hooks";
import { withDiv } from "../common.types";
import { useCallback, useEffect, useState } from "react";
import { BsFilterRight } from "react-icons/bs";

export const selection_to_vql = (selections: FilterSelectionsType) => {
  return Object.entries(selections)
    .filter(
      ([_, values]) => values?.length
    ).map(
      ([name, values]) => {
        return values.map(
          value => `tag:${name}_${value}`
        ).join(' | ')
      }
    )
    .map(
      vql => `(${vql})`
    ).join(' & ')
}

export type FiltersViewProps = withDiv<
  {
    chat: {
      /**
       * @description Handle of the collection. if not provided, 
       * it will list all products tags
       */
      handle?: string,

      onSelection: (selections: FilterSelectionsType, vql_string: string) => void
    }
  }
>;

export type FilterGroupType = [name: string, values: string[]]
export type FilterSelectionsType = Record<string, string[]>

export const FiltersView = (
  props: FiltersViewProps
) => {

  const { sdk } = useStorecraft();
  const [groups, setGroups] = useState<FilterGroupType[]>([]);
  const [selections, setSelections] = useState<FilterSelectionsType>({});

  useEffect(
    () => {
      async function fetch_all_tags() {
        let tags: string[] = [];

        if (props.chat.handle) {
          tags = await sdk.collections.list_all_products_tags(
            props.chat.handle
          );
        } else {
          tags = await sdk.products.list_all_tags();
        }

        setGroups(
          Object.entries(
            tags.reduce(
              (acc, tag) => {
                const [group, value] = tag.split('_');
                if(!acc[group]) acc[group] = [];
                acc[group].push(value);
                return acc;
              }, {} as { [key: string]: string[] }
            ) ?? {}
          ).filter(
            ([_, values]) => values.length > 1
          )
        )
      }
      fetch_all_tags();
    }, [props.chat.handle, sdk]
  );

  const onSelection = useCallback(
    (tag_name: string, tag_value: string) => {
      
      const new_selections = {
        ...selections,
        [tag_name]: selections[tag_name] ? 
          selections[tag_name].includes(tag_value) ? 
            selections[tag_name].filter(
              v => v !== tag_value
            ) : 
            [...selections[tag_name], tag_value] : 
          [tag_value]
      }
      setSelections(new_selections);
      props.chat.onSelection?.(
        new_selections, selection_to_vql(new_selections)
      );

    }, [selections, props.chat.onSelection]
  );

  return (
    <div className='w-full h-fit flex flex-col gap-3'>
      {
        groups.map(
          ([name, values], ix) => (
            <FilterGroupView 
              key={ix} 
              chat={
                {
                  filter_name: name, 
                  filter_values: values,
                  selected: selections[name],
                  onSelection,
                }
              } 
            />
          )
        )
      }
    </div>
  )
}


type FilterViewProps = withDiv<
  {
    chat: {
      selected: string[],
      filter_name: string,
      filter_values: string[],
      onSelection: (tag_name: string, tag_value: string) => void
    }
  }
>;

const FilterGroupView = (
  props: FilterViewProps
) => {

  return (
    <div 
      className='w-full h-fit flex flex-row flex-wrap 
        gap-2 items-baseline'>
      <BsFilterRight className='translate-y-0.5' />
      <div children={props.chat.filter_name} 
        className='tracking-wider underline decoration-0 
          decoration-dashed font-thin font-inter' />
      {
        props.chat.filter_values.map(
          (value, ix) => (
            <div 
              key={ix} 
              children={value} 
              onClick={
                () => props.chat.onSelection(
                  props.chat.filter_name, value
                )
              }
              className={
                'px-2 rounded-full cursor-pointer \
                border chat-border-overlay hover:scale-110 \
                font-mono text-sm transition-transform ' + 
                (
                  props.chat.selected?.includes(value) ? 
                    'chat-bg-overlay' : 
                    ''
                )
              } />
          )
        )
      }
    </div>
  )
}