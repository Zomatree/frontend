import { Show } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { Server } from "revolt.js";

import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useState } from "@revolt/state";

import MdBadge from "@material-design-icons/svg/outlined/badge.svg?component-solid";
import MdFace from "@material-design-icons/svg/outlined/face.svg?component-solid";
import MdLogout from "@material-design-icons/svg/outlined/logout.svg?component-solid";
import MdMarkChatRead from "@material-design-icons/svg/outlined/mark_chat_read.svg?component-solid";
import MdPersonAdd from "@material-design-icons/svg/outlined/person_add.svg?component-solid";
import MdReport from "@material-design-icons/svg/outlined/report.svg?component-solid";
import MdSettings from "@material-design-icons/svg/outlined/settings.svg?component-solid";
import MdShield from "@material-design-icons/svg/outlined/shield.svg?component-solid";

import {
  ContextMenu,
  ContextMenuButton,
  ContextMenuDivider,
} from "./ContextMenu";

/**
 * Context menu for servers
 */
export function ServerContextMenu(props: { server: Server }) {
  const state = useState();
  const client = useClient();
  const { openModal } = useModals();

  /**
   * Mark server as read
   */
  function markAsRead() {
    props.server.ack();
  }

  /**
   * Create a new invite
   */
  function createInvite() {
    // Find the first channel we can invite people to
    const channel = props.server.orderedChannels
      .find((category) =>
        category.channels.find((channel) =>
          channel.havePermission("InviteOthers"),
        ),
      )!
      .channels.find((channel) => channel.havePermission("InviteOthers"))!;

    openModal({
      type: "create_invite",
      channel,
    });
  }

  /**
   * Open server settings
   */
  function editIdentity() {
    openModal({
      type: "server_identity",
      member: props.server.member!,
    });
  }

  /**
   * Open server settings
   */
  function openSettings() {
    openModal({
      type: "settings",
      config: "server",
      context: props.server,
    });
  }

  /**
   * Report the server
   */
  function report() {
    openModal({
      type: "report_content",
      target: props.server,
      client: client(),
    });
  }

  /**
   * Leave the server
   */
  function leave() {
    openModal({
      type: "leave_server",
      server: props.server,
    });
  }

  /**
   * Open server in Revolt Admin Panel
   */
  function openAdminPanel() {
    window.open(
      `https://admin.revolt.chat/panel/inspect/server/${props.server.id}`,
      "_blank",
    );
  }

  /**
   * Copy server id to clipboard
   */
  function copyId() {
    navigator.clipboard.writeText(props.server.id);
  }

  /**
   * Determine whether we can invite others to any channels
   */
  const permissionInviteOthers = () =>
    props.server.channels.find((channel) =>
      channel.havePermission("InviteOthers"),
    );

  /**
   * Determine whether we can edit our identity
   */
  const permissionEditIdentity = () =>
    props.server.havePermission("ChangeNickname") ||
    props.server.havePermission("ChangeAvatar");

  /**
   * Determine whether we can access settings
   */
  const permissionServerSettings = () =>
    props.server.owner?.self ||
    props.server.havePermission("AssignRoles") ||
    props.server.havePermission("BanMembers") ||
    props.server.havePermission("KickMembers") ||
    props.server.havePermission("ManageChannel") ||
    props.server.havePermission("ManageCustomisation") ||
    props.server.havePermission("ManageNicknames") ||
    props.server.havePermission("ManagePermissions") ||
    props.server.havePermission("ManageRole") ||
    props.server.havePermission("ManageServer") ||
    props.server.havePermission("ManageWebhooks");

  return (
    <ContextMenu>
      <Show when={props.server.unread}>
        <ContextMenuButton icon={MdMarkChatRead} onClick={markAsRead}>
          <Trans>Mark as read</Trans>
        </ContextMenuButton>
        <ContextMenuDivider />
      </Show>

      <Show when={permissionInviteOthers()}>
        <ContextMenuButton icon={MdPersonAdd} onClick={createInvite}>
          <Trans>Create invite</Trans>
        </ContextMenuButton>
      </Show>
      <Show when={permissionEditIdentity()}>
        <ContextMenuButton icon={MdFace} onClick={editIdentity}>
          <Trans>Edit your identity</Trans>
        </ContextMenuButton>
      </Show>
      <Show when={permissionServerSettings()}>
        <ContextMenuButton icon={MdSettings} onClick={openSettings}>
          <Trans>Open server settings</Trans>
        </ContextMenuButton>
      </Show>
      <Show
        when={
          permissionInviteOthers() ||
          permissionEditIdentity() ||
          permissionServerSettings()
        }
      >
        <ContextMenuDivider />
      </Show>

      <ContextMenuButton icon={MdReport} onClick={report} destructive>
        <Trans>Report server</Trans>
      </ContextMenuButton>
      <Show when={!props.server.owner?.self}>
        <ContextMenuButton icon={MdLogout} onClick={leave} destructive>
          <Trans>Leave server</Trans>
        </ContextMenuButton>
      </Show>

      <Show
        when={
          state.settings.getValue("advanced:admin_panel") &&
          state.settings.getValue("advanced:copy_id")
        }
      >
        <ContextMenuDivider />
      </Show>

      <Show when={state.settings.getValue("advanced:admin_panel")}>
        <ContextMenuButton icon={MdShield} onClick={openAdminPanel}>
          <Trans>Admin Panel</Trans>
        </ContextMenuButton>
      </Show>
      <Show when={state.settings.getValue("advanced:copy_id")}>
        <ContextMenuButton icon={MdBadge} onClick={copyId}>
          <Trans>Copy server ID</Trans>
        </ContextMenuButton>
      </Show>
    </ContextMenu>
  );
}
