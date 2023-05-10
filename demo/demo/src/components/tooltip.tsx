import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface toolTipProps {
  children: React.ReactNode;
  tooltiptext: string;
}
export function ToolTip({ children, tooltiptext }: toolTipProps) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tooltip" sideOffset={10}>
            {tooltiptext}
            <Tooltip.Arrow className="TooltipArrow" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
