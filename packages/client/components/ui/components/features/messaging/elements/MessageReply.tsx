import { BiSolidFile } from "solid-icons/bi";
import { Match, Switch } from "solid-js";
import { Show } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { type Message } from "revolt.js";
import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { floatingUserMenusFromMessage } from "@revolt/app/menus/UserContextMenu";
import { useClient } from "@revolt/client";
import { renderSimpleMarkdown } from "@revolt/markdown";
import { Avatar } from "@revolt/ui/components/design";
import { NonBreakingText, OverflowingText } from "@revolt/ui/components/utils";

import { Username } from "../../legacy";

interface Props {
  /**
   * Message that was replied to
   */
  message?: Message;

  /**
   * Whether it was mentioned
   */
  mention?: boolean;

  /**
   * Whether to hide the left side reply indicator
   */
  noDecorations?: boolean;
}

export const Base = styled("div", {
  base: {
    minWidth: 0,
    flexGrow: 1,
    display: "flex",
    userSelect: "none",
    alignItems: "center",
    gap: "var(--gap-sm)",
    color: "var(--md-sys-color-on-surface)",
    "& a:link": {
      textDecoration: "none",
    },
    "&::before": {
      width: "22px",
      height: "12px",
      flexShrink: 0,
      alignSelf: "flex-end",
      borderStartStartRadius: "4px",
      borderInlineStart: "2px solid var(--md-sys-color-outline-variant)",
      borderTop: "2px solid var(--md-sys-color-outline-variant)",
    },
  },
  variants: {
    noDecorations: {
      true: {},
      false: {
        "&::before": {
          content: '""',
          display: "block",
          marginInlineEnd: "6px",
          marginInlineStart: "30px",
        },
      },
    },
  },
  defaultVariants: {
    noDecorations: false,
  },
});

const user = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--gap-sm)",
  },
});

const Attachments = styled("em", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--gap-sm)",
    whiteSpace: "nowrap",
  },
});

/**
 * Link styling
 */
const Link = styled("a", {
  base: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    gap: "var(--gap-md)",
  },
});

/**
 * Message being replied to
 */
export function MessageReply(props: Props) {
  const client = useClient();

  const renderReplyContent = (content: string) => {
    if (content.length > 128) {
      content = content.slice(0, 128) + "...";
    }
    return renderSimpleMarkdown(content);
  };

  return (
    <Base noDecorations={props.noDecorations}>
      <Switch fallback={<Trans>Message not loaded, click to jump</Trans>}>
        <Match when={props.message?.author?.relationship === "Blocked"}>
          <Trans>Blocked User</Trans>
        </Match>
        <Match when={props.message}>
          <div
            class={user()}
            use:floating={floatingUserMenusFromMessage(props.message!)}
          >
            <Avatar src={props.message!.avatarURL} size={14} />
            <NonBreakingText>
              <Username
                colour={props.message!.roleColour!}
                username={(props.mention ? "@" : "") + props.message!.username}
              />
            </NonBreakingText>
          </div>
          <Link href={props.message!.path}>
            <Show when={props.message!.attachments}>
              <Attachments>
                <BiSolidFile size={16} />
                <Switch fallback={<Trans>Sent an attachment</Trans>}>
                  <Match when={props.message!.attachments!.length > 1}>
                    <Trans>Sent multiple attachments</Trans>
                  </Match>
                </Switch>
              </Attachments>
            </Show>
            <Show when={props.message!.content}>
              <OverflowingText>
                {renderReplyContent(props.message!.content!)}
              </OverflowingText>
            </Show>
          </Link>
        </Match>
      </Switch>
    </Base>
  );
}
