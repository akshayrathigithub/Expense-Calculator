import { Button } from "../ui/button";
import CrossIcon from "@src/assets/cross.svg?react";

export const Tag = ({
  name,
  onDelete,
}: {
  name: string;
  onDelete: () => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <div>{name}</div>
      {onDelete && (
        <Button variant="ghost" onClick={onDelete}>
          <CrossIcon />
        </Button>
      )}
    </div>
  );
};
