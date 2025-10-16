import { createFormControl, createFormGroup } from "solid-forms";
import { Show, createEffect, on } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import type { API } from "stoat.js";

import { useClient } from "@revolt/client";
import { CONFIGURATION } from "@revolt/common";
import { CircularProgress, Column, Form2, Row } from "@revolt/ui";

import { ServerSettingsProps } from "../ServerSettings";

/**
 * Server overview
 */
export default function ServerOverview(props: ServerSettingsProps) {
  const { t } = useLingui();
  const client = useClient();

  /* eslint-disable solid/reactivity */
  const editGroup = createFormGroup({
    name: createFormControl(props.server.name),
    description: createFormControl(props.server.description || ""),
    icon: createFormControl<string | File[] | null>(
      props.server.animatedIconURL,
    ),
    banner: createFormControl<string | File[] | null>(props.server.bannerURL),
  });
  /* eslint-enable solid/reactivity */

  // update fields (if they are not dirty) ourselves:
  createEffect(
    on(
      () => props.server.name,
      (name) =>
        !editGroup.controls.name.isDirty &&
        editGroup.controls.name.setValue(name),
      { defer: true },
    ),
  );

  createEffect(
    on(
      () => props.server.description,
      (description) =>
        description &&
        !editGroup.controls.description.isDirty &&
        editGroup.controls.description.setValue(description),
      { defer: true },
    ),
  );

  createEffect(
    on(
      () => props.server.animatedIconURL,
      (icon) =>
        !editGroup.controls.icon.isDirty &&
        editGroup.controls.icon.setValue(icon ?? null),
      { defer: true },
    ),
  );

  createEffect(
    on(
      () => props.server.bannerURL,
      (banner) =>
        !editGroup.controls.banner.isDirty &&
        editGroup.controls.banner.setValue(banner ?? null),
      { defer: true },
    ),
  );

  function onReset() {
    editGroup.controls.name.setValue(props.server.name);
    editGroup.controls.description.setValue(props.server.description || "");
    editGroup.controls.icon.setValue(props.server.animatedIconURL ?? null);
    editGroup.controls.banner.setValue(props.server.bannerURL ?? null);
  }

  async function onSubmit() {
    const changes: API.DataEditServer = {
      remove: [],
    };

    if (editGroup.controls.name.isDirty) {
      changes.name = editGroup.controls.name.value.trim();
    }

    if (editGroup.controls.description.isDirty) {
      const description = editGroup.controls.description.value.trim();

      if (description) {
        changes.description = description;
      } else {
        changes.remove!.push("Description");
      }
    }

    if (editGroup.controls.icon.isDirty) {
      if (!editGroup.controls.icon.value) {
        changes.remove!.push("Icon");
      } else if (Array.isArray(editGroup.controls.icon.value)) {
        changes.icon = await client().uploadFile(
          "icons",
          editGroup.controls.icon.value[0],
          CONFIGURATION.DEFAULT_MEDIA_URL,
        );
      }
    }

    if (editGroup.controls.banner.isDirty) {
      if (!editGroup.controls.banner.value) {
        changes.remove!.push("Banner");
      } else if (Array.isArray(editGroup.controls.banner.value)) {
        changes.banner = await client().uploadFile(
          "banners",
          editGroup.controls.banner.value[0],
          CONFIGURATION.DEFAULT_MEDIA_URL,
        );
      }
    }

    await props.server.edit(changes);
  }

  return (
    <Column gap="xl">
      <form onSubmit={Form2.submitHandler(editGroup, onSubmit, onReset)}>
        <Column>
          <Form2.FileInput
            control={editGroup.controls.icon}
            accept="image/*"
            label={t`Server Icon`}
            imageJustify={false}
          />
          <Form2.FileInput
            control={editGroup.controls.banner}
            accept="image/*"
            label={t`Server Banner`}
            imageAspect="232/100"
            imageRounded={false}
            imageJustify={false}
          />
          <Form2.TextField
            name="name"
            control={editGroup.controls.name}
            label={t`Server Name`}
          />
          <Form2.TextField
            autosize
            min-rows={2}
            name="description"
            control={editGroup.controls.description}
            label={t`Server Description`}
            placeholder={t`This server is about...`}
          />
          <Row>
            <Form2.Reset group={editGroup} onReset={onReset} />
            <Form2.Submit group={editGroup}>
              <Trans>Save</Trans>
            </Form2.Submit>
            <Show when={editGroup.isPending}>
              <CircularProgress />
            </Show>
          </Row>
        </Column>
      </form>
    </Column>
  );
}
