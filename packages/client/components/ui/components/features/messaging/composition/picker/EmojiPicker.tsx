import { Match, Show, Switch, createMemo, useContext } from "solid-js";

import { VirtualContainer } from "@minht11/solid-virtual-container";
import { Emoji, Server } from "revolt.js";
import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { UnicodeEmoji } from "@revolt/markdown/emoji";
import { schema } from "@revolt/markdown/prosemirror";
import { useState } from "@revolt/state";
import { Avatar, Ripple } from "@revolt/ui/components/design";
import { Row } from "@revolt/ui/components/layout";

import emojiMapping from "../../../../../emojiMapping.json";

import {
  CompositionMediaPickerContext,
  compositionContent,
} from "./CompositionMediaPicker";

type Item =
  | {
      /**
       * Server header
       */
      t: 0;
      server: Server;
    }
  | {
      /**
       * Spacing element
       */
      t: 1;
    }
  | {
      /**
       * Custom emoji
       */
      t: 2;
      emoji: Emoji;
    }
  | {
      /**
       * Title header
       */
      t: 3;
      title: string;
    }
  | {
      /**
       * Unicode emoji
       */
      t: 4;
      name: string;
      text: string;
    };

const COLUMNS = 10;

export function EmojiPicker() {
  const client = useClient();
  const state = useState();

  let serverScrollTargetElement!: HTMLDivElement;
  let emojiScrollTargetElement!: HTMLDivElement;

  const items = createMemo(() => {
    const items: Item[] = [];

    for (const server of state.ordering.orderedServers(client())) {
      const emojis = server.emojis;
      if (emojis.length === 0) continue;

      items.push({
        t: 0,
        server,
      });

      while (items.length % COLUMNS) {
        items.push({ t: 1 });
      }

      for (const emoji of emojis) {
        items.push({ t: 2, emoji });
      }

      while (items.length % COLUMNS) {
        items.push({ t: 1 });
      }
    }

    items.push({
      t: 3,
      title: "Fluent",
    });

    while (items.length % COLUMNS) {
      items.push({ t: 1 });
    }

    for (const emoji of Object.entries(emojiMapping)) {
      items.push({
        t: 4,
        name: emoji[0],
        text: emoji[1],
      });
    }

    return items;
  });

  return (
    <Row class={compositionContent()}>
      <div
        ref={serverScrollTargetElement}
        use:invisibleScrollable={{
          class: scrollContainer({ component: "serverRail" }),
        }}
      >
        <VirtualContainer
          items={[1, 2, 3]}
          scrollTarget={serverScrollTargetElement}
          itemSize={{ height: 40 }}
        >
          {ServerItem}
        </VirtualContainer>
      </div>
      <div
        ref={emojiScrollTargetElement}
        use:scrollable={{
          class: scrollContainer({ component: "emoji" }),
          showOnHover: true,
        }}
      >
        <VirtualContainer
          items={items()}
          scrollTarget={emojiScrollTargetElement}
          itemSize={{ height: 40, width: 40 }}
          crossAxisCount={(measurements) =>
            Math.floor(
              measurements.container.cross / measurements.itemSize.cross,
            )
          }
        >
          {EmojiItem}
        </VirtualContainer>
      </div>
    </Row>
  );
}

const scrollContainer = cva({
  base: {},
  variants: {
    component: {
      serverRail: {
        display: "none",
        // flexShrink: 0,
        // width: "40px",
      },
      emoji: {
        flexGrow: 1,
      },
    },
  },
});

const ServerItem = (props: {
  style: unknown;
  tabIndex: number;
  item: number;
}) => (
  <ServerOption
    style={props.style as never}
    tabIndex={props.tabIndex}
    role="listitem"
  >
    {props.item}
  </ServerOption>
);

const ServerOption = styled("div", {
  base: {
    width: "100%",
  },
});

const EmojiItem = (props: { style: unknown; tabIndex: number; item: Item }) => {
  const { onTextReplacement } = useContext(CompositionMediaPickerContext);

  return (
    <EmojiOption
      style={props.style as never}
      type={props.item.t}
      tabIndex={props.tabIndex}
      role="listitem"
      onClick={() => {
        if (props.item.t === 2) {
          onTextReplacement(
            schema.nodes.rfm_custom_emoji.createAndFill({
              id: props.item.emoji.id,
              src: props.item.emoji.url,
            })!,
          );
        }

        if (props.item.t === 4) {
          onTextReplacement(schema.text(props.item.text));
        }
      }}
    >
      <Switch>
        <Match when={props.item.t === 0}>
          <ServerHeader server={(props.item as Item & { t: 0 }).server} />
        </Match>
        <Match when={props.item.t === 2}>
          <Ripple />
          <Show keyed when={(props.item as Item & { t: 2 }).emoji.id}>
            <img src={(props.item as Item & { t: 2 }).emoji.url} />
          </Show>
        </Match>
        <Match when={props.item.t === 3}>
          <span>{(props.item as Item & { t: 3 }).title}</span>
        </Match>
        <Match when={props.item.t === 4}>
          <Ripple />
          <Show keyed when={(props.item as Item & { t: 4 }).text}>
            <UnicodeEmoji emoji={(props.item as Item & { t: 4 }).text} />
          </Show>
        </Match>
      </Switch>
    </EmojiOption>
  );
};

const EmojiOption = styled("div", {
  base: {},
  variants: {
    type: {
      0: {},
      1: {},
      2: {},
      3: {},
      4: {},
    },
  },
  compoundVariants: [
    {
      type: [0, 3],
      css: {
        display: "flex",
        alignItems: "center",
        paddingInline: "var(--gap-md)",
        width: `calc(40px * ${COLUMNS}) !important`,
      },
    },
    {
      type: [2, 4],
      css: {
        width: "100%",
        cursor: "pointer",
        position: "relative",
        padding: "var(--gap-sm)",
        borderRadius: "var(--borderRadius-sm)",

        "--emoji-size": "100%",

        "& img": {
          width: "100%",
          height: "100%",
          objectFit: "contain",
        },
      },
    },
  ],
});

function ServerHeader(props: { server: Server }) {
  return (
    <Row align>
      <Avatar
        size={24}
        src={props.server.animatedIconURL}
        fallback={props.server.name}
      />
      <span>{props.server.name}</span>
    </Row>
  );
}
