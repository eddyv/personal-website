import { humanize } from "@/lib/utils/textConverter";
import React from "react";
import type { IconProps } from "react-feather";
import * as Icon from "react-feather";

/**
 * This component is a wrapper around react-feather icons prepared to be used in the markdown files content of the project.
 * @see astro.config.js for the configuration of the auto-import plugin.
 * @see https://www.npmjs.com/package/astro-auto-import?activeTab=readme for more information.
 * @param props
 * @returns
 */
export default function FeatherIcon(props: IconProps) {
  // return <p>{props.name}</p>ç
  const iconName = props.name?.startsWith("_")
    ? props.name.substring(1, props.name.length)
    : humanize(props.name as string);

  const IconI = Icon[iconName];

  // console.log('Icon', props.name, iconName, IconI)

  return <IconI {...props} />;
}
