import { useEffect, useState } from "react";
import clsx from "clsx";
import styles from "./tags.module.scss";
import DownIcon from "../../assets/down.svg?react";
import RightIcon from "../../assets/right.svg?react";
import { Input } from "@src/components/ui/input";
import { Button } from "@src/components/ui/button";
import { nanoid } from "nanoid";
import { STR_SEPARATOR } from "@src/constant";
import { TagNode } from "@src/store/type";
import { useUiStore } from "@src/store/ui";

type TagsPreviewProps = {
  className?: string;
  style?: React.CSSProperties;
};

const PlusCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const Pencil = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
    <path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
      fill="currentColor"
    />
    <path
      d="M20.71 7.04a1.003 1.003 0 0 0 0-1.42L18.37 3.29a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"
      fill="currentColor"
    />
  </svg>
);

const Trash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
    <path d="M3 6h18" stroke="currentColor" strokeWidth="2" />
    <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M6 6l1 14h10l1-14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M10 10v8M14 10v8" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export function TagsPreview({ className, style }: TagsPreviewProps) {
  const [editingTag, setEditingTag] = useState<{
    newName: string;
    nodeId: string;
    parentId: string;
  }>({
    newName: "",
    nodeId: "",
    parentId: "",
  });
  const { renameCategory, removeCategory, addCategory, categories, addUser } =
    useUiStore();
  const [tagsList, setTagsList] = useState<Record<string, TagNode>>(categories);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(Object.keys(categories))
  );
  useEffect(() => {
    console.log("categories", categories);
  }, []);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const createUser = async () => {
    await addUser("Akshay Rathi");
  };

  const markTagForEditing = (node: TagNode, parentId: string) => {
    setEditingTag({ newName: node.name, nodeId: node.id, parentId });
  };

  const renamingTag = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setEditingTag((prev) => ({ ...prev, newName }));
  };

  const updateTagName = async () => {
    const ids = editingTag.parentId.split(STR_SEPARATOR).filter(Boolean);
    const newName = editingTag.newName;
    if (ids.length === 0) return;
    const targetId = ids[ids.length - 1];

    setTagsList((prev) => {
      const next: Record<string, TagNode> = { ...prev };
      let cursor: Record<string, TagNode> = next;

      for (let i = 0; i < ids.length - 1; i++) {
        const partId = ids[i];
        const node = cursor[partId];
        if (!node) return prev;
        cursor[partId] = { ...node, children: { ...(node.children ?? {}) } };
        cursor = cursor[partId].children!;
      }

      const existing = cursor[targetId];
      if (!existing) return prev;
      cursor[targetId] = { ...existing, name: newName };
      return next;
    });

    // persist outside state updater
    await renameCategory(targetId, newName);
    setEditingTag({ newName: "", nodeId: "", parentId: "" });
  };

  const handleAddChild = async (parentId: string) => {
    const ids = parentId.split(STR_SEPARATOR).filter(Boolean);
    const newId = nanoid();
    const newName = "New Tag";
    const parent = ids.length ? ids[ids.length - 1] : undefined;

    setTagsList((prev) => {
      const next: Record<string, TagNode> = { ...prev };
      let cursor: Record<string, TagNode> = next;

      if (ids.length === 0) {
        // Add a new root-level tag
        cursor[newId] = { id: newId, name: newName };
        return next;
      }
      let id = "";
      for (let i = 0; i < ids.length; i++) {
        id = ids[i];
        const existing = cursor[id];
        if (!existing) {
          // Invalid path, no-op
          return prev;
        }

        // Clone the node and its children record (or create one)
        const clonedNode: TagNode = { ...existing };
        const clonedChildren: Record<string, TagNode> = {
          ...(existing.children ?? {}),
        };
        clonedNode.children = clonedChildren;
        cursor[id] = clonedNode;

        const isLast = i === ids.length - 1;
        if (isLast) {
          clonedChildren[newId] = {
            id: newId,
            name: newName,
            parentId: id,
          };
        } else {
          // Dive into the children map for the next segment
          cursor = clonedChildren;
        }
      }
      return next;
    });

    // persist outside state updater
    await addCategory(newName, newId, parent);
  };

  const handleDeleteTag = async (path: string) => {
    const ids = path.split(STR_SEPARATOR).filter(Boolean);
    if (ids.length === 0) return;
    const targetId = ids[ids.length - 1];
    setTagsList((prev) => {
      const next = { ...prev }; // clone root
      let cursor = next;

      // clone each ancestor and descend into its cloned children
      for (let i = 0; i < ids.length - 1; i++) {
        const id = ids[i];
        const node = cursor[id];
        if (!node) return prev;
        cursor[id] = { ...node, children: { ...(node.children ?? {}) } };
        cursor = cursor[id].children!;
      }

      delete cursor[targetId]; // safe delete on cloned branch
      return next; // new root ref triggers re-render
    });
    // persist outside state updater
    await removeCategory(targetId);
  };

  function renderNodes(
    nodes: Record<string, TagNode>,
    parentId?: string,
    depth: number = 0
  ) {
    return (
      <ul className={styles.list} role="tree" aria-label="Tags">
        {Object.values(nodes).map((node) => {
          const hasChildren =
            !!node.children && Object.keys(node.children).length > 0;
          const open = expandedIds.has(node.id);
          const parId = (parentId ?? "") + STR_SEPARATOR + node.id;
          return (
            <li
              key={node.id}
              className={styles.row}
              role="treeitem"
              aria-expanded={hasChildren ? open : undefined}
            >
              <div
                className={styles.rowInner}
                style={{ paddingLeft: depth * 24 }}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    className={styles.chevronBtn}
                    onClick={() => toggleExpand(node.id)}
                    aria-label={open ? "Collapse" : "Expand"}
                  >
                    {open ? (
                      <DownIcon width={24} height={24} />
                    ) : (
                      <RightIcon width={24} height={24} />
                    )}
                  </button>
                ) : (
                  <span className={styles.chevronPlaceholder} />
                )}

                {editingTag?.nodeId === node.id ? (
                  <Input
                    value={editingTag.newName}
                    onChange={renamingTag}
                    onBlur={updateTagName}
                  />
                ) : (
                  <span className={styles.label}>{node.name}</span>
                )}

                <span className={styles.actions}>
                  <Button
                    variant="primary"
                    onClick={() => handleAddChild?.(parId)}
                    leftIcon={<PlusCircle />}
                  />
                  <Button
                    variant="primary"
                    onClick={() => markTagForEditing(node, parId)}
                    leftIcon={<Pencil />}
                  />
                  <Button
                    type="button"
                    className={`${styles.iconBtn} ${styles.danger}`}
                    aria-label="Delete tag"
                    onClick={() => handleDeleteTag(parId)}
                    leftIcon={<Trash />}
                  />
                </span>
              </div>

              {hasChildren && open
                ? renderNodes(node.children!, parId, depth + 1)
                : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={clsx(styles.container, className)} style={style}>
      <Button onClick={() => handleAddChild("")}>Add Root Tag</Button>
      <Button onClick={createUser}>Create User</Button>
      {Object.keys(tagsList).length > 0 ? (
        renderNodes(tagsList)
      ) : (
        <div className={styles.empty}>No tags found</div>
      )}
    </div>
  );
}
