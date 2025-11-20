import { create } from "zustand";
import { TagNode, User } from "./type";
import {
  getUsers,
  getSelectedUser,
  setSelectedUserId,
  createUser,
} from "@src/lib/users";
import {
  fetchCategoryTree,
  createCategory,
  updateCategoryName,
  deleteCategorySubtree,
} from "@src/lib/categories";

type UiState = {
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  users: {
    list: Array<User>;
    selectedId: string | null;
  };
  categories: Record<string, TagNode>;
  recentlySelectedDate: number | null;
  // lifecycle
  initApp: () => Promise<void>;
  // users
  refreshUsers: () => Promise<void>;
  selectUser: (userId: string) => Promise<void>;
  addUser: (displayName: string) => Promise<string>;
  // categories
  refreshCategories: (userId?: string | null) => Promise<void>;
  addCategory: (
    name: string,
    categoryId: string,
    parentId?: string
  ) => Promise<string | undefined>;
  renameCategory: (categoryId: string, newName: string) => Promise<void>;
  removeCategory: (categoryId: string) => Promise<void>;
  setRecentlySelectedDate: (date: number) => void;
};

export const useUiStore = create<UiState>()((set, get) => ({
  setSidebarCollapsed: (collapsed: boolean) => {
    set({ isSidebarCollapsed: collapsed });
  },
  isSidebarCollapsed: false,
  users: { list: [], selectedId: null },
  recentlySelectedDate: null,
  categories: {},
  setRecentlySelectedDate: (date: number) => {
    set({ recentlySelectedDate: date });
  },
  // bootstrap all data from DB
  initApp: async () => {
    const selectedId = (await getSelectedUser()) || null;
    const usersRaw = await getUsers();

    const users: Array<User> = usersRaw.map((u) => ({
      ...u,
      active: selectedId ? u.id === selectedId : false,
    }));
    console.log("selectedId", selectedId);
    const categories = selectedId
      ? await fetchCategoryTree(selectedId)
      : ({} as Record<string, TagNode>);
    set({ users: { list: users, selectedId }, categories });
  },
  refreshUsers: async () => {
    const selectedId = get().users.selectedId;
    const usersRaw = await getUsers();

    const users: Array<User> = usersRaw.map((u) => ({
      ...u,
      active: selectedId ? u.id === selectedId : false,
    }));
    set({ users: { list: users, selectedId: selectedId ?? null } });
  },
  selectUser: async (userId: string) => {
    const usersRaw = await getUsers();
    const exists = usersRaw.some((u) => u.id === userId);
    if (!exists) {
      return;
    }
    await setSelectedUserId(userId);
    const users: Array<User> = usersRaw.map((u) => ({
      ...u,
      active: u.id === userId,
    }));
    const categories = await fetchCategoryTree(userId);
    set({ users: { list: users, selectedId: userId }, categories });
  },
  addUser: async (displayName: string) => {
    const id = await createUser(displayName);
    await setSelectedUserId(id);
    await get().refreshUsers();

    return id;
  },
  refreshCategories: async (userId?: string | null) => {
    const uid = userId ?? get().users.selectedId;
    if (!uid) return;
    const categories = await fetchCategoryTree(uid);
    set({ categories });
  },
  addCategory: async (name: string, categoryId: string, parentId?: string) => {
    const uid = get().users.selectedId;

    console.log("addCategory", uid, name, categoryId, parentId);

    if (!uid) return;
    const id = await createCategory(uid, name, categoryId, parentId);
    await get().refreshCategories(uid);
    return id;
  },
  renameCategory: async (categoryId: string, newName: string) => {
    const uid = get().users.selectedId;
    if (!uid) return;
    await updateCategoryName(uid, categoryId, newName);
    await get().refreshCategories(uid);
  },
  removeCategory: async (categoryId: string) => {
    const uid = get().users.selectedId;
    if (!uid) return;
    await deleteCategorySubtree(uid, categoryId);
    await get().refreshCategories(uid);
  },
}));
