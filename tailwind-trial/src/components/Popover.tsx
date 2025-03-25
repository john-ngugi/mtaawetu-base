import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { EllipsisVertical } from "lucide-react";

const openInfoBox = () => {
  console.log("Open info box");
  // Open info box code goes here. For example, using a modal or a separate component.
  //...
};

export default function DropDownComponent() {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button>
            <EllipsisVertical size="16" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Layer Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openInfoBox}>Info</DropdownMenuItem>
          <DropdownMenuItem>Report</DropdownMenuItem>
          {/* <DropdownMenuItem>Team</DropdownMenuItem>
    <DropdownMenuItem>Subscription</DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
