
import * as React from "react";
function Collapsible({
  ...props
}) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}
function CollapsibleTrigger({
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
function CollapsibleContent({
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
